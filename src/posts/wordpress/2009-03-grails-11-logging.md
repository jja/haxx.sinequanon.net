---
author: jja
comments: false
date: 2009-03-26 17:21:48+00:00
layout: post
link: http://haxx.sinequanon.net/2009/03/grails-11-logging/
slug: grails-11-logging
title: Grails 1.1 logging
wordpress_id: 166
categories:
- meta
- tech
tags:
- grails
- logging
---

Grails 1.1 has changed logging setup completely, introducing a
[new DSL closure](http://grails.org/doc/1.1/guide/3.%20Configuration.html#3.1.2%20Logging).
For the most part it's cool, but the syntax looks the same sometimes for both
log level and appender assignments. I've updated my previous posts on
[debug logging](/2008/09/grails-logging/)
and
[stacktrace.log](/2008/09/grails-stacktracelog/).
For the record, included below is the complete log4j closure I'm now using for
a new Grails 1.1 project (or
[download](/wp-content/uploads/2009/03/log4jdsl.txt)
it). Append this to the default `Config.groovy` file.

<!-- more -->

    environments {
        development {
            log4j = {
                // in development mode, let's see all my log messages
                debug 'grails.app'
            }
        }
        production {
            def catalinaBase = System.properties.getProperty('catalina.base')
            if (!catalinaBase) catalinaBase = '.'   // just in case
            def logDirectory = "${catalinaBase}/logs"
            log4j = {
                appenders {
                    // set up a log file in the standard tomcat area; be sure to use .toString() with ${}
                    rollingFile name:'tomcatLog', file:"${logDirectory}/${appName}.log".toString(), maxFileSize:'100KB'
                    'null' name:'stacktrace'
                }
                root {
                    // change the root logger to my tomcatLog file
                    error 'tomcatLog'
                    additivity = true
                }
                // example for sending stacktraces to my tomcatLog file
                //error tomcatLog:'StackTrace'
                // set level for my messages; this uses the root logger (and thus the tomcatLog file)
                info 'grails.app'
            }
        }
    }

The newest bit here is setting the log file to Tomcat's log directory for
production. Without that, Grails/Log4J will try to open files in the place
where tomcat starts up (e.g. / or someplace you probably can't write files).
Also, the arguments to appenders (and layouts) are sent directly to Apache
BeanUtils so must be Java Strings -- use .toString() on your GStrings (a
string with variable interpolation).

(I've also updated several of my other
[Grails](/tag/grails/)
posts for 1.0.4 and 1.1.)

Edit: fixed a syntax error that crept in between testing and posting.

Edit: for Grails 2.x, you can't reference variables more than one level
"above" the appender. It produces several copies of the error:

    Error log4j:ERROR Property missing when configuring log4j: appName

Actually, the log file still works, but to get rid of the error, add a new var
after `logDirectory` :

    def tomcatLogFilename = "${logDirectory}/${appName}/${appName}.log".toString()
then replace `rollingFile` with something like:
    
    rollingFile name:'tomcatLog', file:"${tomcatLogFilename}".toString(), maxFileSize:'1MB', maxBackupIndex:10

## Comments

chris commented at 2009-07-13 04:38:02

Hi,

I have tried exactly the same thing but it does not work. When I deploy on tomcat. tomcat says all is fine etc but I cannot find any logs. Also when I try to access my app through tomcat I get a 404 error.

***

[jja](http://haxx.sinequanon.net/) commented at 2009-07-13 16:01:29

The 404 error is suspicious - perhaps that's not a logging issue, but your basic installation is not working at all. Is it *really* deployed properly in Tomcat? Are you running the manager webapp and does it show your app as running? Is it an issue with communication between Apache httpd (webserver) and Tomcat? And the first question really is: does your app work in grails dev mode? i.e. running from the command line like "grails run-app"

***

Pieter commented at 2009-07-22 07:35:33

Thanks, this helped me get my logs in Tomcat!

***

Justin commented at 2009-08-31 12:22:42

Thanks so much for this.

The 'log4jdsl.txt' got my logging up and running and then I was able to fix my problem in no time.

Not sure why they like to keep us guessing in the dark for hours on end though. It's not exactly how I planned to spend my bank holiday!

***

[Conrad Bruchmann](http://www.bruchmann.it) commented at 2009-11-10 03:46:11

Thank you very much. I had a lot of issues with log4j before. With your description everything runs fine!

Best regards,
Conrad

***

[Paul Alexandrow](http://www.kodama.at) commented at 2010-01-26 03:51:46

Thank you! This saved my day.

***

Edwardo commented at 2010-02-08 14:10:02

Is there a way to set the catalina.base automatically?  I get null when i do getProperty.  I know I can set it in a shell window with export.  Is there another alternative location to place the log files?

***

[jja](http://haxx.sinequanon.net/) commented at 2010-04-26 14:39:56

@Edwardo: catalina.base is originally set in the Tomcat startup script catalina.sh or catalina.bat via a -D argument to the java executable. Sorry for the delay in replying.
