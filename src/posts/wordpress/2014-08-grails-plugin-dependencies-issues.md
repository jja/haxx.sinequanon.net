---
author: jja
comments: false
date: 2014-08-29 20:46:11+00:00
layout: post
link: http://haxx.sinequanon.net/2014/08/grails-plugin-dependencies-issues/
slug: grails-plugin-dependencies-issues
title: grails plugin dependencies issues
wordpress_id: 350
categories:
- tech
tags:
- grails
- plugins
---

We've been banging our heads over some quirks and inconsistencies that we
eventually traced to plugin dependency naming in Grails 2.3.x. My main Grails
app gets its domain classes from a local plugin. That plugin needs the
Hibernate and JodaTime plugins. Spelling the plugin names can be confusing and
caused problems with run-app and run-script.

<!-- more -->

My plugin, called MyDomains, must reference both Hibernate and JodaTime in its
`BuildConfig.groovy` and spell them with dashes:

    dependencies {
      compile 'org.grails.plugins:hibernate4:4.3.5.4'
      compile 'org.joda:joda-time:2.3'
      }

To be complete and helpful for my main app, I added `dependsOn` requirements
to my plugin, and that's where I ran into problems. Following BuildConfig, I
spelled JodaTime with dashes, which turned out poorly:

    def dependsOn = [
      hibernate4: '4.3.5.4 > *',
      // dash-spelled names are WRONG here!
      'joda-time': '1.5',
      ]

Things seemed to work, sometimes. In particular, `grails run-app` usually
worked, although sometimes it required an explict `grails compile` beforehand.
`grails run-script` would only work immediately after a run-app. Often,
however run-script wouldn't work at all, failing even though the error message
seemed to indicate success!

    | Error Error: The following plugins failed to load due to missing dependencies: [myDomains]
    - Plugin: myDomains
       - Dependencies:
           - hibernate4 (Required: 4.3.5.4 > *, Found: 4.3.5.4)
           - joda-time (Required: 1.5, Found: 1.5)

Note that Grails claims to have found exactly the versions that are required,
but claims there are missing dependencies.

[It turns out](http://grails.1312388.n4.nabble.com/The-following-plugins-failed-to-load-due-to-missing-dependencies-but-the-dependency-is-loaded-td3383081.html)
that with `dependsOn`, we have to spell with first-letter-lowercased camelCase:

    def dependsOn = [
      hibernate4: '4.3.5.4 > *',
      jodaTime: '1.5',
      ]

The plugin class name is `JodaTimeGrailsPlugin` so (fully-capitalized)
CamelCase would make sense, but Grails has a tendency to lowercase the first
letter. What's really annoying is the difference in `BuildConfig`.

## It gets deeper

Despite an
[admonition to not use dependsOn](http://stackoverflow.com/questions/12317370/dependencies-of-grails-plugins),
I seem to need it to get my main app properly installing everything. This is
complicated in that my plugin has a third plugin dependency not shown here,
which I'll call "subThree". subThree is local and not published; I reference
it in BuildConfig via (note the dashes):

    grails.plugin.location.'sub-three'='../grails-sub-three-plugin'

That means I
[cannot use the dependencies](http://comments.gmane.org/gmane.comp.lang.groovy.grails.user/135551)
DSL. The whole thing is further complicated in that I'm actually doing the
same thing with JodaTime, in order to use my own patch that updates the
JodaTime JAR and Grails version of that plugin.

## References

  * [grails-user post](http://grails.1312388.n4.nabble.com/The-following-plugins-failed-to-load-due-to-missing-dependencies-but-the-dependency-is-loaded-td3383081.html) about dashes vs. camelCase
  * [SO admonition](http://stackoverflow.com/questions/12317370/dependencies-of-grails-plugins) against dependsOn
  * [grails-user post](http://comments.gmane.org/gmane.comp.lang.groovy.grails.user/135551) about local dependencies

