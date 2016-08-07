---
author: jja
comments: false
date: 2015-12-22 22:08:00+00:00
layout: post
link: http://haxx.sinequanon.net/2015/12/grails-2-3-11-with-java8/
slug: grails-2-3-11-with-java8
title: Grails 2.3.11 with Java8
wordpress_id: 396
categories:
- tech
tags:
- grails
- java
---

Grails 2.3.11 (or any 2.3.x) does not work with Java8 (`jdk1.8.0_40` or
later). Following are some notes on how to get things working. Edit: this
information was originally documented in late 2015. While these issues may
have since been resolved in later versions of Grails, because of the pain in
upgrading to 2.4/2.5 or starting from scratch in 3.x, you may be stalled in
2.3.11.

<!-- more -->

Grails 2.3.11 includes Spring Loaded 1.2.0 which is incompatible with Java8.
No fix is available until Grails 2.4.5 or even 2.5.1.

  * [spring-loaded #98](https://github.com/spring-projects/spring-loaded/issues/98)
  * [GRAILS-12042](https://jira.grails.org/browse/GRAILS-12042)
  * [grails-core #619](https://github.com/grails/grails-core/issues/619)
  * [grails-core #9136](https://github.com/grails/grails-core/issues/9136)

Download Spring Loaded 1.2.4:

  * [springloaded/1.2.4.RELEASE/](http://repo.spring.io/release/org/springframework/springloaded/1.2.4.RELEASE/)

Remove the old jars and .pom files and place the new files in their
corresponding places under (as always, be careful of cut-n-paste linebreaks):

    $GRAILS_HOME/lib/org.springframework/springloaded/

Rename and edit `ivy-1.2.0.RELEASE.xml` to reflect the new version number.
Unfortunately, that's not enough because something still wants the 1.2.0 jar.
So symlink that name:

    cd $GRAILS_HOME/lib/org.springframework/springloaded/jars
    ln -s springloaded-1.2.4.RELEASE.jar springloaded-1.2.0.RELEASE.jar

You must also update a major security hole in Commons Collections, which is
not fixed in Grails 2.3.x. Download the jar for version 3.2.2 (or higher) from
one of:

  * [commons-collections](http://commons.apache.org/proper/commons-collections/download_collections.cgi)
  * [maven](http://repo1.maven.org/maven2/commons-collections/commons-collections/)

Install under:

    $GRAILS_HOME/lib/commons-collections/commons-collections/

Rename and edit `ivy-3.2.1.xml` to reflect the new version number.
