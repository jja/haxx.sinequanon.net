---
author: jja
date: 2016-09-30 23:48:20+00:00
comments: false
layout: post
link: http://haxx.sinequanon.net/2016/09/spring-scheduled/
slug: spring-scheduled
title: Spring ScheduledExecutors in Grails
tags:
- grails
- spring
---

Here's how to setup scheduled (periodic or timed) tasks with Spring3
in Grails using the concurrency executors introduced in Java5.
This replaces the use of a Spring2 `TimerTask` which was deprecated in
Spring3 and removed from Spring4. Grails2 uses Spring3 so
the `TimerTask` should still work, but this method should work
in Grails2 and Grails3. Note that in Grails3 and
[possibly 2.4/2.5](https://github.com/grails/grails-core/issues/2216),
you might be able to use the much simpler Spring
[`@Scheduled`](http://docs.spring.io/spring/docs/3.0.x/spring-framework-reference/html/scheduling.html#scheduling-annotation-support-scheduled)
annotation on a service method.

<!-- more -->

Thanks to the blog at henyo for the inspiration, with
[their post](http://blog.henyo.com/2008/11/simple-periodic-task-scheduling-with.html)
on Spring2 TimerTask usage in Grails1.

In Grails 2.x, add something like this in your
`grails-app/conf/spring/resources.groovy`
(following/updated from henyo):

    myInvoker(org.springframework.scheduling.support.MethodInvokingRunnable) {
        targetObject = ref('myService')
        targetMethod = 'myMethod'
    }

    myScheduler(org.springframework.scheduling.concurrent.ScheduledExecutorTask) {
        // in Config.groovy, set mykey.delay and mykey.period
        // milliseconds, 600000ms = 10min
        delay = grailsApplication.config.mykey.delay ?: 600000
        period = grailsApplication.config.mykey.period ?: 600000
        runnable = ref('myInvoker')
    }

    myFactory(org.springframework.scheduling.concurrent.ScheduledExecutorFactoryBean) {
        scheduledExecutorTasks = [ref('myScheduler')]
    }


Then of course you will need a `myService` class with a `myMethod` method
that takes no arguments.
