---
author: jja
comments: false
date: 2011-04-05 18:34:34+00:00
layout: post
link: http://haxx.sinequanon.net/2011/04/gorm-nullables-and-unsaved-transient-instance/
slug: gorm-nullables-and-unsaved-transient-instance
title: GORM nullables and unsaved transient instance
wordpress_id: 291
categories:
- tech
tags:
- gorm
- grails
- hibernate
---

I have nullable one-to-many relations in Grails/GORM and started getting
"object references an unsaved transient instance" exceptions from Hibernate.
In the Grails forms, selecting a blank/no-selection value for the field sent
`params.myOtherObject.id==''`. GORM then tries to create a new empty object
and during the `save(flush:true)`, it complains with the exception:

<!-- more -->

    org.hibernate.TransientObjectException: object references an unsaved
    transient instance - save the transient instance before flushing: MyOtherClass

This
[stackoverflow answer](http://stackoverflow.com/questions/4810574/grails-gorm-object-references-an-unsaved-transient-instance/4833693#4833693)
gave me the clue about params and I now remove the nullable field from
`params` when it's blank.

    def myObject = MyClass.get(params.id)
    if (null == params.myOtherObject.id || '' == params.myOtherObject.id) {
            myObject.myOtherObject = null
            params.remove('myOtherObject')
            }
    myObject.properties = params
    if (!myObject.hasErrors() && myObject.save(flush: true)) {
    ...


## Comments

mamram commented at 2011-07-02 10:04:01

thanks, params.remove() was the trick...
