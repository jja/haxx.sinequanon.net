---
author: jja
comments: false
date: 2015-11-09 23:35:37+00:00
layout: post
link: http://haxx.sinequanon.net/2015/11/tomcat-jsvc-on-centos-7/
slug: tomcat-jsvc-on-centos-7
title: Tomcat Jsvc on CentOS 7
wordpress_id: 382
categories:
- tech
tags:
- centos
- tomcat
---

The default yum packages for tomcat and tomcat-jsvc (version `7.0.54-2.el7_1`)
are broken on CentOS 7 (we're currently on `7.1.1503`). Newer packages available
from Fedora don't help. Here's how to make things work.

<!-- more -->

[Jsvc](https://commons.apache.org/proper/commons-daemon/jsvc.html)
is part of
Apache commons daemon and makes Java apps (in this case Tomcat) behave nicer
on Unix. A JVM app can run as a Unix daemon, and it can start as root to open
files (including binding to privileged network ports like 80) and then
downgrade capabilities to a non-privileged user (like "tomcat"). Unfortunately
the systemd setup is broken
([see bug 9097](https://bugs.centos.org/view.php?id=9097)).
The tomcat package scripts
contain jsvc provisions, but just plain don't work.

Start by replacing file `/usr/lib/systemd/system/tomcat-jsvc.service`:
    
    # Systemd unit file for tomcat
    #
    # To create clones of this service:
    # 1) By default SERVICE_NAME=tomcat. When cloned, the value must be defined
    # before tomcat-sysd is called.
    # 2) Create /etc/sysconfig/${SERVICE_NAME} from /etc/sysconfig/tomcat
    # to override tomcat defaults
    
    [Unit]
    Description=Apache Tomcat Web Application Container JSVC wrapper
    After=syslog.target network.target
    
    [Service]
    Type=forking
    EnvironmentFile=/etc/tomcat/tomcat.conf
    Environment="NAME=" "USE_JSVC=true"
    EnvironmentFile=-/etc/sysconfig/tomcat
    ExecStart=/usr/libexec/tomcat/server start
    ExecStop=/usr/libexec/tomcat/server stop
    
    [Install]
    WantedBy=multi-user.target

and file `/usr/libexec/tomcat/functions`:

    #!/bin/bash
    
    if [ -r /usr/share/java-utils/java-functions ]; then
      . /usr/share/java-utils/java-functions
    else
      echo "Can't read Java functions library, aborting"
      exit 1
    fi
    
    _save_function() {
      local ORIG_FUNC=$(declare -f $1)
      local NEWNAME_FUNC="$2${ORIG_FUNC#$1}"
      eval "$NEWNAME_FUNC"
    }
    
    run_jsvc() {
      JSVC=/usr/bin/jsvc
      if [ -x ${JSVC} ]; then
        TOMCAT_USER="tomcat"
        OUTFILE=${CATALINA_BASE}/logs/catalina${NAME}.out
    
        # pre-create the output file so we can change the owner so jsvc can later reopen it
        /usr/bin/touch ${OUTFILE}
        /usr/bin/chmod 0644 ${OUTFILE}
        if [ "$UID" = "0" ]; then
          /usr/bin/chown ${TOMCAT_USER} ${OUTFILE}
    
          # guess that there's a group of the same name, but ignore errors
          /usr/bin/chgrp ${TOMCAT_USER} ${OUTFILE} >/dev/null 2>&1 || true
        fi
    
        JSVC_OPTS="-pidfile /var/run/jsvc-tomcat${NAME}.pid -user ${TOMCAT_USER} -outfile ${OUTFILE} -errfile &1"
        if [ "$1" = "stop" ]; then
          JSVC_OPTS="${JSVC_OPTS} -nodetach -stop"
        fi
    
        exec "${JSVC}" ${JSVC_OPTS} ${FLAGS} -classpath "${CLASSPATH}" ${OPTIONS} "${MAIN_CLASS}" "${@}"
      else
        echo "Can't find ${JSVC} executable"
      fi
    }
    
    _save_function run run_java
    
    run() {
       if [ "${USE_JSVC}" = "true" ] ; then
        run_jsvc $@
       else
        run_java $@
       fi
    }

In addition, the base tomcat package is missing the library JAR file
`tomcat-dbcp.jar`. You'll have to pull that out of a
[matching version](http://archive.apache.org/dist/tomcat/tomcat-7/v7.0.54/bin/)
of the
[binary distribution](http://archive.apache.org/dist/tomcat/tomcat-7/)
of Tomcat. Place the file `tomcat-dbcp.jar` into directory `/usr/share/java/tomcat`.

You should also:

  1. pre-create (touch) the process ID file `/run/jsvc-tomcat.pid` as user `tomcat:tomcat` with permissions `0644`
  1. mask (hide) the standard tomcat service:

    sudo systemctl stop tomcat.service
    sudo systemctl mask tomcat.service

  1. reload systemd config to see the new setup:

    sudo systemctl daemon-reload

You probably also want to edit **`/etc/logrotate.d/tomcat`**:

    /var/log/tomcat/catalina.out {
        weekly
        rotate 52
        compress
        missingok
        create 0644 tomcat tomcat
        postrotate
            /usr/bin/kill -USR1 `/usr/bin/cat /var/run/jsvc-tomcat.pid`
        endscript
    }

Now you will use systemd to control tomcat:

    sudo systemctl enable tomcat-jsvc
    sudo systemctl start tomcat-jsvc
    sudo systemctl stop tomcat-jsvc

