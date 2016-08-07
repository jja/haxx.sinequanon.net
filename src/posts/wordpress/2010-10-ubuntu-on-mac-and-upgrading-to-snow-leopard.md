---
author: jja
comments: false
date: 2010-10-02 21:25:26+00:00
layout: post
link: http://haxx.sinequanon.net/2010/10/ubuntu-on-mac-and-upgrading-to-snow-leopard/
slug: ubuntu-on-mac-and-upgrading-to-snow-leopard
title: Ubuntu on Mac and upgrading to Snow Leopard
wordpress_id: 227
categories:
- tech
tags:
- linux
- mac
- ubuntu
---

I'm now running Ubuntu 9.x on a MacBook Pro that was leftover after
colleagues' hardware upgrades. Posts from
[trainque](http://trainque.com/blog/2006/10/21/how-to-dual-boot-ubuntu-osx/)
and
[richb](http://blogs.sun.com/richb/entry/powerbook_dual_boot:_macosx_tiger)
helped, but I ran into a few more quirks.

<!-- more -->

Rich linked to [ubuntuforums](http://ubuntuforums.org/showthread.php?t=89960)
about resizing the disk partitions to make room for Ubuntu. First, one must
disable journaling on the Mac partition. This is so Ubuntu/Linux can play with
the partition. The posts then describe using
[parted](http://www.gnu.org/software/parted/index.shtml)
(GNU partition editor) to resize the partitions. The Ubuntu 9.0.4 install CD
also has gparted---the graphical version---available. It's under
`System > Administrator > Partition Editor`.

Then the rest of the install went smoothly and easily with the Ubuntu wizards.
Afterwards, one can hold the Option key to pick whether to boot to MacOSX or
Ubuntu. Or better yet, install [refit](http://refit.sourceforge.net/) for a
nicer multi-boot.

So now a day later, I find out I can upgrade from MacOS 10.5 to 10.6 (Snow
Leopard). But the install DVD doesn't like my Mac partition, with little
explanation.
[Many](http://forums.macrumors.com/archive/index.php/t-737061.html)
[web](http://forums.mactalk.com.au/46/72170-mega-merge-snow-leopard-installation-experiences-problems.html)
[searches](http://www.insanelymac.com/forum/index.php?showtopic=181955)
[later](http://support.apple.com/kb/TS1600)
[point](http://discussions.apple.com/thread.jspa?threadID=2130966&start=32&tstart=0)
to a couple of possible issues with the partition map.

The 2 solutions for me were to reboot from the Ubuntu CD, resize the Mac
partition to have 200MB empty space after it, and then run gptsync from the
refit shell. Now Snow Leopard is happily installing onto my Mac partition. You
can probably prevent this by setting up your partitions better in the initial
g/parted resizing, but then the Ubuntu install will have to ask you where to
put things instead of using the "largest continuous free space". If you do it
this way, make your Linux swap partition to be 2GB and and leave 200MB emtpy
immediately after your Mac HFS+ partition.
