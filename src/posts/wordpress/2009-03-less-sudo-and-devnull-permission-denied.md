---
author: jja
comments: false
date: 2009-03-25 21:33:09+00:00
layout: post
link: http://haxx.sinequanon.net/2009/03/less-sudo-and-devnull-permission-denied/
slug: less-sudo-and-devnull-permission-denied
title: 'less, sudo, and /dev/null: Permission denied'
wordpress_id: 150
categories:
- tech
tags:
- /dev/null
- less
- sudo
---

Sigh. The ubiquitous utility **less** does a really bad and hard to understand
thing. For some time now, it behaves not just as a reader but also a writer:
it writes a history file (specified by the environment variable `LESSHISTFILE`
which is `$HOME/.lesshst` by default). If **you** want less to be **writing**
things, fine, but don't force it on **me**! This has caused some annoying
problems that have been really hard to finally trace back to less.

<!-- more -->

To turn off this behavior, set the variable `LESSHISTFILE` (either in the
environment or in your lesskey file) to `'-'`. The docs say you can use
`'/dev/null'` too, but don't-- I'll explain below. Besides writing a file,
less goes a step further and does a chmod on that file to `0600`, which is
actually a reasonable permission set to keep others from seeing your history.
The problem is that `sudo` picks up the `HOME` variable but not
`LESSHISTFILE`, so `sudo less` was writing a `.lesshst` file in my home
directory.

Some time ago, I gakked and disgustedly symlinked .lesshst to /dev/null. But
then when less does the chmod during sudo, it changes the permissions of
/dev/null (which is why LESSHISTFILE set to /dev/null is bad-- less is
supposed to ignore it in that case but still somehow chmods /dev/null). So I
couldn't use /dev/null anymore (and quite a few scripts do so, it's a standard
practice), getting messages like `/dev/null: Permission denied`.

The workaround to this <del>bug</del> 'feature' of less is to set the
`LESSHISTFILE` variable in the `LESSKEY` file (`$HOME/.less`):

    % lesskey -
    #env
    LESSHISTFILE = -
    ^D

then sudo will pick up `$HOME`, less will then read `LESSHISTFILE` from
`$HOME/.less` and not create the stoopid `.lesshst`, so I don't need the symlink
to `/dev/null` anymore.

There are other reports of changing permissions on `/dev/null` that are
generally unexplained. Try to stay away from symlinks to `/dev/null` in your
home directory, especially any that might get chmod applied by a program you
run via sudo. (I still have `.evolution` and `.recently-used` symlinked to
`/dev/null`. I don't think I sudo anything using those...)

## Comments

Jesper commented at 2011-06-01 07:22:06

Interesting, thanks for the analysis. I just stumbled on this problem myself. 

Scenario:

    $ export LESSHISTFILE=/dev/null
    $ sudo -s
    # history|less (or any other invocation of less I guess)
    *poof* /dev/null is 700, thus unusable for non-root users.

I guess the sudo -s carried over the LESSHISTFILE variable to the privileged shell, and less got a bit too eager about permissions on what it believed to be its history file.

