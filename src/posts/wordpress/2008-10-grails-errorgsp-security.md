---
author: jja
comments: false
date: 2008-10-01 20:13:59+00:00
layout: post
link: http://haxx.sinequanon.net/2008/10/grails-errorgsp-security/
slug: grails-errorgsp-security
title: Grails error.gsp security
wordpress_id: 91
categories:
- tech
tags:
- grails
- security
---

The default generated error.gsp view in Grails displays the stacktrace for any
exceptions that occur. That's nice for debugging in a development environment
but it is a security issue for production as it is
[information leakage](http://www.owasp.org/index.php/Error_Handling).
We can easily turn this off when not in development, and do something useful
like redirect to the application homepage.

<!-- more -->

## isDevelopmentEnv

The key piece is knowing when we are in the development environment.
This is mentioned briefly
[in the docs](http://grails.org/doc/1.0.3/guide/3.%20Configuration.html#3.2%20Environments)---
follow the [api link](http://grails.org/doc/1.0.3/api/grails/util/GrailsUtil.html)
for full details:

    GrailsUtil.isDevelopmentEnv()

We can use this is in a `g:if` test to wrap the html in the `error.gsp` view:

    <html>
    <g:if test="${GrailsUtil.isDevelopmentEnv()}">
        <head>
            <title>Grails Runtime Exception</title>
    </g:if>
    ...

## Else

If we are in production (or test) mode, then we may want to display a generic,
secure error message and redirect to the application homepage (or any page):

    <head>
    <% flash.message='System error occurred.' %>
    <meta http-equiv="Refresh" content="0;url=<g:createLinkTo dir='/' />">
    </head>
    <body>
    </body>

The `createLinkTo` with a directory of `/` makes a link to the application
homepage. Play around with this tag (or `createLink`), including the
`absolute='true'` attribute (hint: set `grails.serverURL` in
`grails-app/conf/Config.groovy`). We might want to put the generic message and
link in the body section too, just in case the user's browser doesn't
redirect. Warning: don't add in sitemesh layouts or too much code in the
createLinkTo tag. If that code generates an exception, it will throw the user
into an infinite loop.

## Bugs

If an exception occurs in a view that has changed the content type, then the
error view will be labelled with that content type. We need to change it back
to HTML to be sure the error message displays in the browser (or the redirect
happens). In one of my projects, I had a gsp view generating XML. An exception
in the middle of this produced an error message but the browser thought it was
(malformed) XML and wouldn't display it. So we need to reset the content at
the top:

    <% response.contentType = "text/html" %>

## Example

Attached is a complete example, modified from the Grails 1.0.3 generated file
`grails-app/views/error.gsp` (other versions of Grails will look slightly
different in the middle):
[error.gsp](/wp-content/uploads/2008/09/error.txt)

## Updates

In 1.1, `g:if` with the `env` attribute is working, so you can use:

    <g:if env="development">

for the test:
[error_11.gsp](/2008/10/error_11.txt)
(install as `grails-app/views/error.gsp`)

In 1.2, the `createLinkTo` tag has been deprecated in favor of `resource`,
prompting one small change to the error.gsp file:
[error12.gsp](/2009/10/error12.txt)

Grails 2.3.x doesn't like the `g:resource tag` nested inside the quotes of the
meta tag, generating a GrailsTagException with the message "Attribute value
quote wasn't closed". Use a string expression:

    <meta http-equiv="Refresh" content="0;url=${g.resource(dir:'/')}">

There's also now an undocumented `renderException` tag you can try out, though
it just moves some stuff from the default `errors.gsp` into a tag:

    <g:renderException exception="${exception}" />

