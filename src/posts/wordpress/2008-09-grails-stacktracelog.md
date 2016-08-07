---
author: jja
comments: false
date: 2008-09-30 23:58:57+00:00
layout: post
link: http://haxx.sinequanon.net/2008/09/grails-stacktracelog/
slug: grails-stacktracelog
title: Grails stacktrace.log
wordpress_id: 78
categories:
- tech
tags:
- grails
- logging
---

Grails 1.0.x started creating a `stacktrace.log` file in the directory where
the servlet container starts. In a development environment, using
`grails run-app`, that's simple enough--- it appears in the top level of your
application. In a production environment, this becomes a problem. Your
production container (e.g. Tomcat) may start someplace where it can't create
files, like `/`. Thus you get exceptions sent to your container's log files
like:

<!-- more -->

    java.io.FileNotFoundException: stacktrace.log (Permission denied)

Also, messages are appended to `stacktrace.log`-- so it will continue to grow if
you don't do something about it. One option is to change where your container
starts, e.g. have the startup script change to its logs directory. You can
also configure your grails app to change the location of the `stacktrace.log`
file or turn it off completely.

## Changing file location

To change the file location/name, edit your `grails-app/conf/Config.groovy`
file. In Grails 1.0.3, you want to change the line:

    appender.'stacktraceLog.File'="stacktrace.log"

to something like:

    appender.'stacktraceLog.File'="/var/log/myapp/stacktrace.log"

In Grails 1.0, 1.0.1, and 1.0.2, the property is:

    appender.'errors.File'="stacktrace.log"

## Turning off stacktrace.log

To turn off the log file completely, in 1.0.3 change the line:

    StackTrace="error,stacktraceLog"

to:

    StackTrace="error"

In previous versions, the original line is:

    StackTrace="error,errors"

What we are doing is removing the only appender from the StackTrace logger
(automatically created by Grails) so the messages will not be written anywhere
(and the file will not be created). The word `error` that remains indicates
the logging level. We could also change it to `off` to be clear (only doing
that without removing the appender will still result in an attempt to create
the file).

## No stacktrace processing

According to the
[Grails docs](http://grails.org/doc/1.0.3/guide/3.%20Configuration.html#3.1.2%20Logging),
you can also turn this off by setting a command line property:

    grails -Dgrails.full.stacktrace=true run-app

(yes, true) If you don't also turn off the logging property, the
`stacktrace.log` file will still be created but won't be written to. Putting
that line in `Config.groovy` doesn't do anything. It also doesn't help when
creating a war for deployment. You'll have to put that property definition
into your container startup (setting the environment variable `CATALINA_OPTS`
or adding to your `jsvc` command line).

## Console logging

The docs also suggest sending the stacktrace to the console (for Tomcat 5.x
that's `$CATALINA_HOME/logs/catalina.out`), by changing the `stacktraceLog` or
`errors` appender in the above line to `stdout`, like this:

    StackTrace="error,stdout"

But error messages seem to go to the console anyways and so
[will be doubled](http://jira.codehaus.org/browse/GRAILS-1695).

## Environments

You can make these changes for different environments. In `Config.groovy` add
something like this:

    environments {
        production { log4j.logger.StackTrace="error" }
    }

which will turn off the stacktrace logging file for your production
environment, but leave it on for development.

## Upgrades

I didn't notice all this until just now with my new grails projects, because
my original Grails projects were created before these shenanigans started
happening. I've done `grails upgrade` several times since then, but
stacktrace.log configuration
[isn't yet in the upgrade script](http://jira.codehaus.org/browse/GRAILS-1636).

## Grails 1.1 update

Grails 1.1 introduces a new Log4J DSL that completely changes this. I could
not immediately get the above methods working. There are several undocumented
behaviors that both cause and cure this. Assigning a different appender to the
StrackTrace logger sends the stacktraces to that appender but it does not
prevent the creation of a `FileAppender` named `stacktraceLog` and thus the
file `stacktrace.log` is still created.

Reviewing the code (Log4jConfig.groovy), I found that the stacktraceLog
appender is not created if an appender named `stacktrace` already exists, i.e.
it's created at the top of the log4j DSL closure. You can create a different
file or rollingFile appender or whatever you like, just use
`name:'stacktrace'`.

I like to turn off stacktrace logging completely. It's an error, so it's
already going to the root logger anyways. Or I may want to send it to my
appender named something else (like 'tomcatLog', which I use for other loggers
and don't want to call it 'stacktrace'). Use the undocumented NullAppender
which exists in Grails by default. Create an appender of type `'null'` -- with
quotes to avoid referencing the null object:

    log4j = {
      appenders {
        'null' name:'stacktrace'
        ...
      }
    ...
    }

## Comments

Ben commented at 2009-10-29 10:31:31

Hi, Thanks for your tip (Grails 1.1 update) it worked for me!

***

[How to Setup a VPS to Run Grails on Jetty - Anders Zakrisson](http://anders.zakrisson.se/projects/how-to-setup-a-vps-to-run-grails-on-jetty/) commented at 2010-01-05 03:15:36

[...] Jetty on Port 80 Virtual hosts in Jetty Fixing the stacktrace.log Using GNU Screen MySQL Console [...]

***

ew commented at 2012-05-29 09:56:57

this doesnt work 

    log4j = {
        // Example of changing the log pattern for the default console
        // appender:
        //
        appenders {
        //  console name:'stdout', layout:pattern(conversionPattern: '%c{2} %m%n')
            appender.'stacktraceLog.File'="/tmp/logs/cms-stacktrace.log"
        }
    
    15:48:31,044 ERROR [stderr] (MSC service thread 1-4) log4j:ERROR Property missing when configuring log4j: appender
    15:48:31,060 ERROR [stderr] (MSC service thread 1-4) log4j:ERROR WARNING: Exception occured configuring log4j logging: Cannot set property 'stacktraceLog.File' on null object

***

[jja](http://haxx.sinequanon.net/) commented at 2012-06-05 12:10:14

What version of Grails? that syntax came along in 1.1 and still works for me in 1.3.x
