---
author: jja
comments: false
date: 2008-09-23 19:10:37+00:00
layout: post
link: http://haxx.sinequanon.net/2008/09/grails-testing/
slug: grails-testing
title: Grails testing
wordpress_id: 58
categories:
- tech
tags:
- grails
- junit
- testing
---

The [Grails](http://grails.org/) [docs](http://grails.org/doc/1.0.x/)
talk about testing and have some example test methods but fail to describe some
simple but necessary mechanics to get it going. The test methods should be in
a class that extends `GroovyTestCase` (that word doesn't appear at all when
searching the Grails website). The class name must end with `Tests` since it
must be in a file with a name ending in `Tests.groovy` under the `test`
directory of your grails project.

<!-- more -->

For example:

    test/unit/FooTests.groovy:
    class FooTests extends GroovyTestCase {
        void testOne() {
            assertTrue(1==1);
        }
    }

[GroovyTestCase](http://groovy.codehaus.org/Unit+Testing)
is described some by the Groovy docs; it extends Junit's `TestCase`.
Note that Grails 1.0.3 includes the Junit 3.8.2 JAR file. To get docs, go to the
[Junit website](http://junit.org/) then to `JUnit Releases` and download and unpack
[version 3.8.1](http://downloads.sourceforge.net/junit/junit3.8.1.zip)
(there is no 3.8.2 there; it must be a Grails fix).

If you must, you can also have Java tests (calling Groovy/Grails objects from
Java is left as an exercise to the reader):

    test/unit/BarTests.java:
    import junit.framework.TestCase;
    public class BarTests extends TestCase {
        public void testTwo() {
            assertTrue(2==2);
        }
    }

Then from the top of your Grails project, just run `grails test-app`

    % grails test-app
    ...
    -------------------------------------------------------
    Running 2 Unit Tests...
    Running test FooTests...
                        testOne...SUCCESS
    Running test BarTests...
                        testTwo...SUCCESS
    Unit Tests Completed in 155ms ...
    -------------------------------------------------------
    ...

with more output in the `test/report/` directory.

btw, you can change the filename pattern with the config option
`grails.testing.patterns` (undocumented but mentioned on the
[mailing list](http://www.nabble.com/Re%3A-%27test-java%27-and-%27test-groovy%27-directories-p14857388.html)).
