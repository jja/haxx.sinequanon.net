---
author: jja
comments: false
date: 2009-03-27 17:20:26+00:00
layout: post
link: http://haxx.sinequanon.net/2009/03/tomcat-ajp13-connector-issues/
slug: tomcat-ajp13-connector-issues
title: Tomcat AJP/1.3 Connector issues
wordpress_id: 178
categories:
- tech
tags:
- AJP
- tomcat
---

The [documentation](http://tomcat.apache.org/tomcat-6.0-doc/config/ajp.html)
for Tomcat 6.0.18 AJP/1.3 Connectors is incomplete and misleading. It seems to
indicate that there is exactly one class for AJP, but there are actually three
and the one you get may not match the documentation.

<!-- more -->

I tried to use the new `executor` but kept getting exceptions like:

    [DATE] org.apache.catalina.startup.ConnectorCreateRule _setExecutor
    
    WARNING: Connector [org.apache.catalina.connector.Connector@11e1e67] does not
    support external executors. Method setExecutor(java.util.concurrent.Executor)
    not found.

I found nothing useful on the web about this or in Tomcat's bugzilla. I
submitted a report
([Bug 46923](https://issues.apache.org/bugzilla/show_bug.cgi?id=46923))
based on what I describe below. It is supposed to be fixed in 6.0.20 (and is in the
[online trunk](http://svn.apache.org/repos/asf/tomcat/trunk/java/org/apache/catalina/connector/Connector.java)
(but not in the
[6.0.x trunk](http://svn.apache.org/repos/asf/tomcat/tc6.0.x/trunk/java/org/apache/catalina/connector/Connector.java))).
Digging into the source, I found there are three AJP protocol classes
available:

  * `[org.apache.coyote.ajp.AjpAprProtocol](http://tomcat.apache.org/tomcat-6.0-doc/api/org/apache/coyote/ajp/AjpAprProtocol.html)`
  * `[org.apache.coyote.ajp.AjpProtocol](http://tomcat.apache.org/tomcat-6.0-doc/api/org/apache/coyote/ajp/AjpProtocol.html)`
  * `[org.apache.jk.server.JkCoyoteHandler](http://tomcat.apache.org/tomcat-6.0-doc/api/org/apache/jk/server/JkCoyoteHandler.html)`

The default
`[Connector](http://tomcat.apache.org/tomcat-6.0-doc/api/org/apache/catalina/connector/Connector.html)`
class, uses the `protocol` property to pick which class to use (for this
example, that's `AJP/1.3`), but the key is that it also checks if
[APR](http://tomcat.apache.org/tomcat-6.0-doc/apr.html) is initialized. I've
never gotten APR working on my Redhat boxen and so got the exception above. If
APR is not initialized, JkCoyoteHandler is the protocol class used, which does
not implement most of the features listed in the documentation that are
implemented by AjpAprProtocol and AjpProtocol. I don't know why AjpProtocol
isn't used. It seems to work fine. The two classes are virtually identical
(and could be refactored), relying on
`[AjpAprProcessor](http://tomcat.apache.org/tomcat-6.0-doc/api/org/apache/coyote/ajp/AjpAprProcessor.html)`
or
`[AjpProcessor](http://tomcat.apache.org/tomcat-6.0-doc/api/org/apache/coyote/ajp/AjpProcessor.html)`
to do the heavy lifting, which isn't marked experimental or anything.

To use AjpProtocol, specify the full class name for the protocol:

    <Connector port="8009"
        protocol="org.apache.coyote.ajp.AjpProtocol" executor="tomcatThreadPool" ...

To figure out if your APR is working, check your Tomcat logs (e.g.
`catalina.err`, `catalina.DATE.log`) for something like:

    INFO: The APR based Apache Tomcat Native library which allows optimal
    performance in production environments was not found on the
    java.library.path:...

BTW, for HTTP/1.1 you get one of these, depending on APR:

  * `[org.apache.coyote.http11.Http11AprProtocol](http://tomcat.apache.org/tomcat-6.0-doc/api/org/apache/coyote/http11/Http11AprProtocol.html)`
  * `[org.apache.coyote.http11.Http11Protocol](http://tomcat.apache.org/tomcat-6.0-doc/api/org/apache/coyote/http11/Http11Protocol.html)`
You can also specify
`[...Http11NioProtocol](http://tomcat.apache.org/tomcat-6.0-doc/api/org/apache/coyote/http11/Http11NioProtocol.html)`.
All these seem to be decently
[documented](http://tomcat.apache.org/tomcat-6.0-doc/config/http.html).

## Comments

[Clustering Tomcat « Teh Tech Blogz0r by Luke Meyer](http://sosiouxme.wordpress.com/2010/08/13/clustering-tomcat/) commented at 2010-08-13 21:01:02

[...] really know why the APR isn't working properly, but a little searching turned up some obscure facts: if the APR isn't loaded, then for the AJP connector Tomcat makes a default choice of [...]
