---
author: jja
comments: false
date: 2011-10-24 23:28:50+00:00
layout: post
link: http://haxx.sinequanon.net/2011/10/ckeditor-spellchecker-jsp/
slug: ckeditor-spellchecker-jsp
title: CKEditor spellchecker.jsp
wordpress_id: 331
categories:
- tech
tags:
- aspell
- ckeditor
- jsp
---

Here is a JSP version of the server-side script needed for the CKEditor plugin
for aspell.

<!-- more -->

It was inspired by/based upon a
[post in the forums](http://cksource.com/forums/viewtopic.php?f=5&t=7200).
I've made some
mods to get it to work, be more complete, and be more like the current perl
version, with fixes recommended in the
[main thread](http://cksource.com/forums/viewtopic.php?f=11&t=15893).
It's not fully tested but hopefully it will help somebody.

Note that for best results, you will need
[Apache Commons Lang](http://commons.apache.org/lang/).
You can comment out that code but then
you'll get false-positive misspellings of partial words before and after the
HTML entities.

Install the attached file as

    .../aspell/spellerpages/server-scripts/spellchecker.jsp

Download: [spellchecker.jsp](/wp-content/uploads/2011/10/spellchecker.jsp_.txt)
