---
author: jja
comments: false
date: 2010-05-14 17:07:14+00:00
layout: post
link: http://haxx.sinequanon.net/2010/05/phusion-passenger-calls-home/
slug: phusion-passenger-calls-home
title: Phusion passenger calls home
wordpress_id: 261
categories:
- tech
tags:
- rails
---

While on a ship at sea with slow (sometimes no) internet, I was developing a
Ruby on Rails application for local (onboard/intranet) use. I discovered that
Phusion passenger (modrails) calls home. This error layout file:

<!-- more -->

    /usr/lib/ruby/gems/1.8/gems/passenger-2.2.11/lib/phusion_passenger/templates/error_layout.html.erb

has a stylesheet link to modrails.org

Theoretically this layout will happen only in development, because we all
completely test our code, but you may want to comment the offending line
everywhere you have it installed. At best this is rather annoying on slow
connections or disconnected laptops. At worst, it's some devious tracking of
modrails users.

The image link could be removed with no loss of functionality. To maintain the
"prettiness", it could be loaded as a data URI although older browsers don't
recognize that. In any case, the developers are rather
[uninterested in changing](http://code.google.com/p/phusion-passenger/issues/detail?id=496).
