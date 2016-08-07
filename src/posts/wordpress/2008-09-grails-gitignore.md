---
author: jja
comments: false
date: 2008-09-18 19:14:06+00:00
layout: post
link: http://haxx.sinequanon.net/2008/09/grails-gitignore/
slug: grails-gitignore
title: Grails .gitignore
wordpress_id: 49
categories:
- tech
tags:
- git
- grails
---

I've started playing with [git](http://git.or.cz/) for source code revision
management. Here is my first cut at a .gitignore for a Grails 1.0.3 project.

<!-- more -->

Note that for previous versions you will also need (at least) a line
`/plugins/core`

    # .gitignore for Grails 1.0.3
    
    # web application files that are overwritten by "grails upgrade"
    #  cf. GRAILS_HOME/scripts/Upgrade.groovy, target( upgrade )
    /web-app/WEB-INF
    
    # IDE support files that are overwritten by "grails upgrade"
    #  cf. GRAILS_HOME/scripts/CreateApp.groovy, target( createIDESupportFiles )
    # to be specific, you could replace "/*" below with your project name,
    #  e.g. "foobar.launch" (no slash)
    .classpath
    .project
    .settings
    /*.launch
    /*.tmproj
    
    # logs
    stacktrace.log
    /test/reports
    
    # project release file
    *.war

Edit: took out build.xml since grails won't overwrite it. The eclipse dot
files `.classpath`, `.project`, and `.settings` will also not be overwritten
if they exist, but I'm still ignoring them for now.

Update: I've made a few additions for Grails 1.1:
[gitignore11](/wp-content/uploads/2008/09/gitignore11)

## Comments

[jja](http://haxx.sinequanon.net/) commented at 2009-10-19 12:41:41

For Grails 1.2, add a line for a new build directory:

    /target

