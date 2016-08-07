---
author: jja
comments: false
date: 2010-12-08 23:59:03+00:00
layout: post
link: http://haxx.sinequanon.net/2010/12/subversion-repository-to-git-subdirectory/
slug: subversion-repository-to-git-subdirectory
title: Subversion repository to git subdirectory
wordpress_id: 232
categories:
- tech
tags:
- git
- svn
---

Here's how I converted, or moved, a Subversion (svn) repository to a
subdirectory in a new git repository, with history (but no branches or tags).

<!-- more -->

Make the svn repo into a git repo (of course, be careful of the linewraps
throughout):

    mkdir tmprepo1
    cd tmprepo1
    git-svn init http://URL/TO/SVN/REPO/trunk --no-metadata
    echo 'SVNUSER = Firstname Lastname <USER@DOMAIN>' > ~/svnusers.txt
    git config svn.authorsfile ~/svnusers.txt
    git-svn fetch
    cd ..
    git clone tmprepo1 tmprepo2

The `svnusers.txt` file gets one line for each user that committed to the svn
repo, where `SVNUSER` is the login of the users committing to the svn repo,
something like:

    jja = John Allison <jja@fakedomain.com>

The `clone` gets rid of the git-svn specific stuff so the new repo is not tied
to the old svn repo.

Move the git version of the old repo into a subdirectory of a new git repo:

Create a new git repo:

    mkdir newrepo
    cd newrepo
    git init
    touch junkfile

and commit the junkfile so the repo has something solid in it for remote and
subtree to work with:

    git add junkfile
    git commit -a -m 'create a temporary junk file so git has a good HEAD on its shoulders'

then add the old repo with remote and subtree (see references if you don't
have git-subtree). _To add the old svn repo to a subdir of an existing git
repo, you just need this part,  followed by a_ "`git push`".

    git remote add -f tmprepo2 ../tmprepo2
    git subtree add --prefix=path/to/new/subdir tmprepo2/master
    git remote rm tmprepo2

and cleanup everything:

    git rm junkfile
    git commit -a -m 'remove temporary junk file'
    cd ..
    rm -rf tmprepo1
    rm -rf tmprepo2
    rm ~/svnusers.txt

At this point the `git log` will look something like:

    commit 73cc6e101ffdc7e6e9489cdffc261e7bd49c8f79
    Author: John Allison <jja@fakedomain.com>
    Date:   Thu Dec 9 11:08:02 2010 -0700
        remove temporary junk file
    commit d9dbcce650d9a1568436baa850e014972ac3b9b2
    Merge: 176f205... 7e3df51...
    Author: John Allison <jja@fakedomain.com>
    Date:   Thu Dec 9 11:07:21 2010 -0700
        Add 'subdir/' from commit '7e3df510ae8e27e3c8244acd7dff3a5df51c275a'
        git-subtree-dir: subdir
        git-subtree-mainline: 176f205c64e68c13a6699e0aff873582608a4262
        git-subtree-split: 7e3df510ae8e27e3c8244acd7dff3a5df51c275a
    commit 176f205c64e68c13a6699e0aff873582608a4262
    Author: John Allison <jja@fakedomain.com>
    Date:   Thu Dec 9 11:02:24 2010 -0700
        create a temporary junk file so git has a good HEAD on its shoulders
    commit 7e3df510ae8e27e3c8244acd7dff3a5df51c275a
    Author: John Allison <jja@fakedomain.com>
    Date:   Wed Nov 24 19:04:58 2010 +0000
        blah blah... all the commits of the old svn repo...

I haven't done much with my new repo yet. Please let me know if you see any
gotchas. HTH!

## References

  * [Cleanly Migrate Your Subversion Repository To a GIT Repository](http://www.jonmaddox.com/2008/03/05/cleanly-migrate-your-subversion-repository-to-a-git-repository/)
  * [How to import a svn repository underneath a git repository?](http://stackoverflow.com/questions/3031602) (watch the syntax, remote add needs another argument as I have above)
  * [git-subtree](https://github.com/apenwarr/git-subtree)git-subtree.sh as `git-subtree` somewhere in your path)

