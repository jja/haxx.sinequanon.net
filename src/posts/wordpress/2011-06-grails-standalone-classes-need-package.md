---
author: jja
comments: false
date: 2011-06-28 19:58:35+00:00
layout: post
link: http://haxx.sinequanon.net/2011/06/grails-standalone-classes-need-package/
slug: grails-standalone-classes-need-package
title: Grails standalone classes need package
wordpress_id: 300
categories:
- tech
tags:
- grails
---

I was reminded again today that standalone classes in Grails must belong to a
package. That is, a class in `src/groovy` or `src/java` needs to be in a
package. For example:

<!-- more -->

    file: src/groovy/mypackage/MyClass.groovy
    package mypackage
    
    class MyClass { ... }

If the class is without a package (appearing as `src/groovy/MyClass.groovy`),
it will compile correctly but no Grails classes (like your controller or
service) will be able to find it, generating an
`org.codehaus.groovy.control.MultipleCompilationErrorsException` with the
message `unable to resolve class MyClass`.
