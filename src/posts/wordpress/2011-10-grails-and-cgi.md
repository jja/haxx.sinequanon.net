---
author: jja
comments: false
date: 2011-10-24 23:10:30+00:00
layout: post
link: http://haxx.sinequanon.net/2011/10/grails-and-cgi/
slug: grails-and-cgi
title: Grails and CGI
wordpress_id: 322
categories:
- tech
tags:
- cgi
- grails
---

Here's how to get CGI working in a Grails app.

<!-- more -->

Install a copy of web.xml:

    grails install-templates

then edit it:

    src/templates/war/web.xml

adding these elements in their appropriate sections. Some other instructions
and the Tomcat encourage you to edit the main Tomcat web.xml, but that won't
help you in development mode with `grails run-app` and also adds CGIs to all
other webapps (if they're privileged).

First the servlet (there are other configurable parameters available):

        <!-- Common Gateway Interface (CGI) processing servlet -->
        <servlet>
            <servlet-name>cgi</servlet-name>
            <servlet-class>org.apache.catalina.servlets.CGIServlet</servlet-class>
            <init-param>
              <param-name>debug</param-name>
              <param-value>0</param-value>
            </init-param>
            <init-param>
              <param-name>cgiPathPrefix</param-name>
              <param-value>WEB-INF/cgi</param-value>
            </init-param>
            <load-on-startup>5</load-on-startup>
        </servlet>

and the servlet-mapping:

        <!-- The mapping for the CGI Gateway servlet -->
        <servlet-mapping>
            <servlet-name>cgi</servlet-name>
            <url-pattern>/cgi-bin/*</url-pattern>
        </servlet-mapping>

Here's the secret part. Edit `scripts/Events.groovy` to make your webapp
privileged:

    eventConfigureTomcat = { tomcat ->
        def ctx=tomcat.host.findChild(serverContextPath)
        ctx.privileged = true
    }

Then put your CGI script in `web-app/WEB-INF/cgi/`

## References

  * [official Tomcat docs](http://tomcat.apache.org/tomcat-6.0-doc/cgi-howto.html)
  * [Grails-user post discussing Tomcat config](http://grails.1312388.n4.nabble.com/tomcat-plugin-where-is-server-xml-and-tomcat-users-xml-td1322273.html)
  * [Tomcat class used in Events.groovy](http://www.docjar.com/docs/api/org/apache/catalina/startup/Tomcat.html)

