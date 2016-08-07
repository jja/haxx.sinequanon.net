---
author: jja
comments: false
date: 2012-01-17 18:50:50+00:00
layout: post
link: http://haxx.sinequanon.net/2012/01/mysql-history-munging/
slug: mysql-history-munging
title: mysql history munging
wordpress_id: 339
categories:
- tech
tags:
- mysql
---

At work, I run the mysql clients on multiple hosts with multiple versions. My
home directory is a network mount and thus my .mysql_history file is shared
between all these hosts. Often the command history gets weirdly munged, with
spaces converted to `\040` -- the character sequence for the octal escape code
for ASCII space. Here's a little workaround/fix:

<!-- more -->

    /bin/sed 's/\040/ /g;' ~/.mysql_history > ~/.mysql_history.space
    
    /bin/mv -f ~/.mysql_history.space ~/.mysql_history

Make that into an alias or script. Just make sure you quit all instances of
the mysql client before running. Then when you restart, the history should get
reloaded correctly.

I haven't bothered to figure out why this is happening, i.e. what the version
problems are or 32/64 bit or readline/editline or the sequence of starting
multiple clients on multiple hosts...

## Comments

[Guilhem Bichot](http://guilhembichot.blogspot.co.uk/) commented at 2012-09-12 02:33:09

Happend to me too. In my case, I have 2 terminals open, one with a 5.1 mysql command line client (linked with readline), one with a 5.6 mysql command line client (linked with  libedit).
So when I close 5.6 client, libedit writes history file with escaping of ' ' to 040, then I open 5.1 client whose readline reads 040 and shows it...
Fix: use new clients.

***

[jja](http://haxx.sinequanon.net/) commented at 2012-09-12 11:25:15

Ahhh... I will look into libedit vs readline on my various clients. Thanks!
