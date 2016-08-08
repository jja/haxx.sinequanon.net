---
author: jja
comments: false
date: 2009-06-04 23:27:59+00:00
layout: post
link: http://haxx.sinequanon.net/2009/06/security-policy/
slug: security-policy
title: Security policy permissions for Grails in Tomcat
wordpress_id: 200
categories:
- tech
tags:
- grails
- security
- tomcat
---

Here are the permissions I've used for Grails apps deployed to Tomcat running
the Java security manager.

<!-- more -->

The Grails 1.0.x permissions are for a simple CRUD
app. So far the Grails 1.1 permissions are just for a Hello World app. They're
not cut-and-paste: some thought is required to apply to individual server
setups and some duplication is present. The grants go in the
`conf/catalina.policy` file and restarting Tomcat is required. Unfortunately,
it seems impossible to completely isolate these per-webapp since the Groovy
and Grails code presents itself in funny ways.

I'm using Tomcat 6.0.18 and used both JDK 1.6.0_12 and 1.6.0_13 running on
some sort of Linux.

## Common

These permissions are so common, not just for Groovy/Grails, that I gave up
and allow them for all webapps.

    grant {
        // jsp
        permission java.lang.RuntimePermission "defineClassInPackage.java.lang";
        permission java.lang.RuntimePermission "defineClassInPackage.org.apache.jasper.runtime";
        // jsp,struts,groovy,etc
        permission java.lang.RuntimePermission "accessDeclaredMembers";
        permission java.lang.RuntimePermission "accessClassInPackage.org.apache.catalina";
        permission java.lang.RuntimePermission "accessClassInPackage.org.apache.coyote";
        // commons-beanutils, commons-digester, struts, and *every* jira and groovy/grails class
            // sigh, cf. https://www.securecoding.cert.org/confluence/display/java/SEC32-J.+Do+not+grant+ReflectPermission+with+action+suppressAccessChecks
        permission java.lang.reflect.ReflectPermission "suppressAccessChecks";
        // config
        permission java.util.PropertyPermission "catalina.base", "read";
        // logging
        permission java.util.PropertyPermission "log4j.*", "read";
        permission java.util.PropertyPermission "org.apache.commons.logging.*", "read";
        // dbcp,jdbc
        permission java.lang.RuntimePermission "accessClassInPackage.org.apache.tomcat.dbcp.dbcp";
        permission java.lang.RuntimePermission "accessClassInPackage.org.apache.tomcat.dbcp.pool";
        permission java.lang.RuntimePermission "accessClassInPackage.org.apache.tomcat.dbcp.pool.impl";
        permission java.lang.RuntimePermission "accessClassInPackage.sun.jdbc.odbc";
        // we need to read web-app*.dtd at least from servlet-api.jar if not stuff from all the jars
        permission java.io.FilePermission "${catalina.home}${file.separator}lib${file.separator}-", "read";
        permission java.io.FilePermission "${catalina.base}${file.separator}lib${file.separator}-", "read";
    };

## Grails 1.0.x

This is needed if `suppressAccessChecks` is not allowed for everyone as above.

    grant codeBase "file:/groovy/shell" {
       permission  java.lang.reflect.ReflectPermission "suppressAccessChecks";
    };

General grant for Groovy:

    grant codeBase "file:/groovy/script" {
       permission  java.lang.RuntimePermission "setContextClassLoader";
       permission  java.lang.reflect.ReflectPermission "suppressAccessChecks"; // if not allowed for all webapps above
        // database; adjust host/port
        permission java.net.SocketPermission "127.0.0.1:3306", "connect,resolve";
        permission java.net.SocketPermission "localhost", "resolve";
    };

Per-webapp permissions:

    grant codeBase "file:/PATH/TO/webapps/APPNAME/-" {
            // basic grails stuff incl. groovy magic
        permission groovy.security.GroovyCodeSourcePermission "/groovy/script";
        permission groovy.security.GroovyCodeSourcePermission "/groovy/shell";
        permission java.io.FilePermission "./grails-app/-", "read";
        permission java.io.FilePermission "/groovy/script", "read";
        permission java.io.FilePermission "/groovy/shell", "read";
        permission java.lang.RuntimePermission "accessClassInPackage.*";
        permission java.lang.RuntimePermission "createClassLoader";
        permission java.lang.RuntimePermission "defineClassInPackage.*";
        permission java.lang.RuntimePermission "getClassLoader";
        permission java.lang.RuntimePermission "getProtectionDomain";
        permission java.lang.RuntimePermission "setContextClassLoader";
        permission java.lang.RuntimePermission "shutdownHooks";
        permission java.util.PropertyPermission "*", "read,write";
    };

These grants may be needed for Hibernate caching, and still might not be
enough. If so, add them to the per-webapp section. Better is to re-configure
the caching to use some other files, else they will be shared by multiple
Grails webapps (which is bad). (Unfortunately that is difficult, especially to
change the directory. Maybe another post will address it.)

            // grails 1.0.x broken hibernate ehcache
        //permission java.io.FilePermission "${catalina.base}${file.separator}temp", "read";
        //permission java.io.FilePermission "${catalina.base}${file.separator}temp${file.separator}org.hibernate.cache.StandardQueryCache.data", "read,write,delete";
        //permission java.io.FilePermission "${catalina.base}${file.separator}temp${file.separator}org.hibernate.cache.StandardQueryCache.index", "read,write,delete";
        //permission java.io.FilePermission "${catalina.base}${file.separator}temp${file.separator}org.hibernate.cache.UpdateTimestampsCache.data", "read,write,delete";
        //permission java.io.FilePermission "${catalina.base}${file.separator}temp${file.separator}org.hibernate.cache.UpdateTimestampsCache.index", "read,write,delete";

## Grails 1.1

General grant needed for Groovy scripts:

    // groovy scripts, e.g. grails
    grant codeBase "file:/groovy/script" {
            // grails 1.1 + jdk 1.6.0_13
        permission java.lang.RuntimePermission "defineClassInPackage.java.io";
        permission java.lang.RuntimePermission "defineClassInPackage.java.lang";
        permission java.lang.RuntimePermission "defineClassInPackage.java.net";
        permission java.lang.RuntimePermission "defineClassInPackage.java.util";
        permission java.lang.reflect.ReflectPermission "suppressAccessChecks";
        permission java.util.PropertyPermission "grails.env", "read";
    };

Per-webapp grants:

    grant codeBase "file:/PATH/TO/webapps/APPNAME/-" {
            // basic grails stuff incl. groovy magic
        permission groovy.security.GroovyCodeSourcePermission "/groovy/script";
        permission java.io.FilePermission "./grails-app/-", "read";
        permission java.io.FilePermission "/groovy/script", "read";
        permission java.lang.RuntimePermission "accessClassInPackage.*";
        permission java.lang.RuntimePermission "createClassLoader";
        permission java.lang.RuntimePermission "defineClassInPackage.*";
        permission java.lang.RuntimePermission "getClassLoader";
        permission java.lang.RuntimePermission "getProtectionDomain";
        permission java.lang.RuntimePermission "setContextClassLoader";
        permission java.lang.RuntimePermission "shutdownHooks";
        permission java.util.PropertyPermission "*", "read,write";
            // grails 1.1
        permission java.io.FilePermission "grails-app/-", "read";
        permission java.lang.RuntimePermission "setIO";
            // grails 1.1: various jars incl ant use /bin/env
        permission java.io.FilePermission "/bin/env", "read,execute";
            // jdk 1.6.0_13 + grails
        permission java.io.FilePermission "./plugins", "read";
    };

Each webapp also needs an additional Groovy script grant:

    grant codeBase "file:/groovy/script" {
            // grails 1.1 needs this for each webapp
        permission java.io.FilePermission "/PATH/TO/webapps/APPNAME/-", "read";
            // grails 1.1 + jdk 1.6.0_13 needs this for each webapp, sigh
        permission java.io.FilePermission "${catalina.base}/work/Catalina/HOSTNAME/APPNAME/-", "read";
    };

## Logging

For any version of Grails, logging needs additional permissions. Some are so
common I add them separately:

    // log4j
    grant codeBase "file:${catalina.home}/lib/log4j-1.2.15.jar" {
        permission java.io.FilePermission "${catalina.base}${file.separator}logs", "read, write";
        permission java.io.FilePermission "${catalina.base}${file.separator}logs${file.separator}-", "read,write,delete";
    };
    
    // logging extra
    grant codeBase "file:${catalina.home}/bin/tomcat-juli.jar" {
            // for date-based filenames
        permission java.util.PropertyPermission "user.timezone", "read,write";
    };

Each per-webapp section needs logging permissions which will vary based on
your logging setup:

        // logs
        permission java.io.FilePermission "${catalina.base}/logs", "read";
        permission java.io.FilePermission "${catalina.base}/logs/APPNAME/-", "read,write,delete";

## Database

The per-webapp grant also generally needs some database permissions. These are
for mysql on localhost:

       permission  java.net.SocketPermission "127.0.0.1:3306", "connect,resolve";
       permission  java.net.SocketPermission "localhost", "resolve";

## References

Mark Petrovic has written some nice articles and code about security
profiling/monitoring, which I originally found via the
[Grails-user](http://www.nabble.com/grails---user-f11861.html) mailing list:

  * [OnJava](http://www.onjava.com/pub/a/onjava/2007/01/03/discovering-java-security-requirements.html)
  * [SecMgrTutorial](http://www.petrovic.org/content/SecMgrTutorial/sm.html)
  * [Grails wiki](http://docs.codehaus.org/display/GRAILS/Discovering+a+web+application's+security+requirements)
  * [Blog post](http://www.petrovic.org/blog/2006/11/02/profiling-a-java-applications-security-needs/)

## Download

Download the grants/permissions all together in one file:
[grails-policy.txt](/wp-content/uploads/2009/06/grails-policy.txt)

## Comments

[Security policy permissions for Grails in Tomcat « haxx qua non | MySQL Security](http://mysqlsecurity.com/200906/mysql/security-policy-permissions-for-grails-in-tomcat-%c2%ab-haxx-qua-non/) commented at 2009-06-04 19:02:50

[...] See the original post: Security policy permissions for Grails in Tomcat « haxx qua non [...]

***

Tom commented at 2012-01-11 11:47:53

Hi, 

I am new to Grails. I am trying to run the following java RMI-client code from within my Grails web app: 

(grails/appname/src/java/ClientProgram.java) 

    ... 
    
    import java.rmi.registry.LocateRegistry; 
    import java.rmi.registry.Registry; 
    import java.math.BigDecimal; 
    import compute.Compute; 
    import java.util.Properties; 
    import java.io.FileInputStream; 
    
    public class ClientProgram { 
    ... 
    
            public static void run( String regHost, String precision ) { 
                    setSystemProps(); 
                    if(System.getSecurityManager() ==  null) { 
                            System.setSecurityManager(new SecurityManager()); 
                    } 
                    try { 
                            String name = "Compute"; 
                            Registry registry = LocateRegistry.getRegistry(regHost); 
                            Compute comp = (Compute) registry.lookup(name); 
                            Pi task = new Pi(Integer.parseInt(precision)); 
                            BigDecimal pi = comp.executeTask(task); 
                            System.out.println(pi); 
                    } catch(Exception e) { 
                            System.err.println("ComputePi exception."); 
                            e.printStackTrace(); 
                    } 
            } 
    
    ... 
    } 

See http://pastebin.com/GpQVhvee for the complete class source. 

I get the following error when the code is executed: 

    2012-01-09 19:20:48,794 [http-9876-1] ERROR [/smartmeters].[gsp]  - Servlet.service() for servlet gsp threw exception 
    java.security.AccessControlException: access denied (java.util.PropertyPermission grails.full.stacktrace read) 
            at java.security.AccessControlContext.checkPermission(AccessControlContext.java:374) 
            at java.security.AccessController.checkPermission(AccessController.java:546) 
            at java.lang.SecurityManager.checkPermission(SecurityManager.java:532) 
            at java.lang.SecurityManager.checkPropertyAccess(SecurityManager.java:1285) 
            at java.lang.System.getProperty(System.java:650) 
    ... 

Please see http://pastebin.com/jTzaiWfj for the full error message. 

I believe this error may appear because I have not got the correct policy settings for this code. I need the following rule in the security policy: 

    grant codeBase "file:/opt/grails/grails-1.3.7/appname/src/" { 
            permission java.security.AllPermission; 
    }; 

But I cannot find where the policy file is created or stored. If this was just a normal java application I would pass the security policy file in as a system property as follows: 

    java -Djava.security.policy=policy.file main-class 

But I don't know how to achieve the same effect in Grails. Please can someone tell me how to set the java security policy for my Grails app? 

Thanks, 
Tom

***

[jja](http://haxx.sinequanon.net/) commented at 2012-01-17 12:42:24

It depends on your servlet container where the security policy is stored. For a production Tomcat 6 instance, it's usually in the conf/ directory and named "catalina.policy", and your Tomcat startup uses the same -D arguments to java, e.g. `-Djava.security.manager -Djava.security.policy=${CATALINA_BASE}/conf/catalina.policy`

***

Patrick commented at 2012-05-31 13:47:56

I'm working on a project that's forcing us to grant java.util.PropertyPermission and java.lang.RuntimePermission "accessDeclaredMembers" across all webapps. The trouble is we may not have that option, and our webapp specific grants aren't working.

When you were working on this blog did you experience similar issues?

***

[jja](http://haxx.sinequanon.net/) commented at 2012-06-05 12:06:52

I have access to Tomcat configuration, so I was able to grant everything needed, including `accessDeclaredMembers` globally, and others semi-globally for codeBase `file:/groovy/script`. Sorry, that probably doesn't help you.
