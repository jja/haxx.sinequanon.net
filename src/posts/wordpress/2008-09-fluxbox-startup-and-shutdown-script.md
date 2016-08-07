---
author: jja
comments: false
date: 2008-09-11 18:50:29+00:00
layout: post
link: http://haxx.sinequanon.net/2008/09/fluxbox-startup-and-shutdown-script/
slug: fluxbox-startup-and-shutdown-script
title: Fluxbox startup and shutdown script
wordpress_id: 28
categories:
- tech
tags:
- fluxbox
---

The default Fluxbox startup file at `~/.fluxbox/startup` is run by
startfluxbox and has embedded comments describing how to add applications
("apps") to run before Fluxbox starts up. The startup file can be fixed to
also run apps after Fluxbox starts or after Fluxbox finishes. You might run
apps after Fluxbox startup to be sure that Fluxbox applies its window
position/decoration settings or puts the programs in the slit. Running apps
after Fluxbox finishes is useful to cleanup things that were started earlier.
The example startup file given below covers both situations.

<!-- more -->

## Starting apps after Fluxbox starts

The [Fluxbox-wiki](http://fluxbox-wiki.org/index.php/Fluxbox-wiki)
has a description of how to
[edit the startup file](http://fluxbox-wiki.org/index.php/Editing_the_startup_file).
Towards the bottom is a section,
["How do I start an application after fluxbox starts"](http://fluxbox-wiki.org/index.php/Editing_the_startup_file#How_do_I_start_an_application_after_fluxbox_starts)
with an example startup file that has a bug. Remove the word `exec` on the
line `exec fluxbox &`. Also, the `{` and `} &` are unnecessary. (I wanted to
edit the wiki, but there is no way to create an account, much less get
permission to edit.)

## Running apps after Fluxbox finishes

To run apps after Fluxbox has finished, simply add them to the end of the
startup file (after `wait $fbpid`). Do not use the ampersand (`&`) on the end
of the line, as that will potentially leave the apps running after you logout.
You want only short, cleanup-style apps here.

## Example

Here is my startup file that accomplishes all the tasks described.

    #!/bin/sh
    # this file is ~/.fluxbox/startup
    #
    # Lines starting with a '#' are ignored.
    
    # Configurations and setups
    fbsetroot -solid gray
    xset -b
    xmodmap ~/.Xmodmap
    
    # Applications you want to run with fluxbox.
    # MAKE SURE THAT APPS THAT KEEP RUNNING HAVE AN & AT THE END.
    #
    # unclutter -idle 2 &
    # wmnd &
    # wmsmixer -w &
    # idesk &
    
    gnome-screensaver &
    firefox &
    gnome-terminal --geometry=132x38+0+168 &
    
    # start fluxbox in background and save its process ID
    #fluxbox -log ~/.fluxbox/log &
    fluxbox &
    fbpid=$!
    
    # wait for fluxbox to actually get going by sleeping for 1 second (modify as needed)
    sleep 1
    
    # Applications that need to have fluxbox already running
    # MAKE SURE THAT APPS THAT KEEP RUNNING HAVE AN & AT THE END.
    #
    # gkrellm &
    # gdesklets &
    gxmms2 &
    
    # wait for fluxbox to end and save its exit status
    wait $fbpid
    fbstatus=$?
    
    # Applications to perform cleanup after fluxbox has finished
    # DON'T USE & HERE OR THE APP MAY KEEP RUNNING AFTER YOU LOGOUT
    # THESE APPS SHOULD END FAST; YOU WON'T LOGOUT UNTIL THEY'RE DONE
    #
    # make sure music has stopped
    xmms2 stop
    
    # exit with fluxbox's exit status
    exit $fbstatus

(end)
