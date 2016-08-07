---
author: jja
comments: false
date: 2010-05-15 02:24:30+00:00
layout: post
link: http://haxx.sinequanon.net/2010/05/moinmoin-calls-home/
slug: moinmoin-calls-home
title: Moinmoin calls home
wordpress_id: 258
categories:
- tech
---

While on a ship at sea, I was using Moinmoin wiki to record some local
documentation. We had internet (usually, except when the ship pointed a
certain direction), but it was a bit slow and expensive. So I was annoyed to
discover that Moinmoin was calling home in several places.

<!-- more -->

Mostly it's in the
Help documentation, illustrating how to do external linking via `{{...}}`
embedding. It was still annoying and tended to lock up my web browser while I
was trying to get local help when the internet link was down. Here's the list
of offending underlays I found in 1.8.7:

    HelpOnCreoleSyntax/revisions/00000001
    HelpOnLinking/revisions/00000001
    HelpOnMoinWikiSyntax/revisions/00000001
    MoinMoin/revisions/00000001
    WikiCourse(2f)17(20)External(20)links/revisions/00000001
    WikiSandBox/revisions/00000001

I [reported the situation](http://moinmo.in/MoinMoinBugs/1.8CallsHome),
but the developers don't seem to care about even placing a warning in the
documentation.
