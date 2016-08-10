---
author: jja
comments: false
date: 2016-08-10 04:39:32+00:00
layout: post
link: http://haxx.sinequanon.net/2016/2016-08-gh-pages-setup/
slug: gh-pages-setup
title: GitHub pages clone setup
tags:
- git
---

I've moved this blog (perhaps only temporarily) to a
[Metalsmith](http://metalsmith.io/)
generated static site served via my
[GitHub pages repo](https://github.com/jja/haxx.sinequanon.net).
Here are some notes on how to setup git clones
with the `gh-pages` branch in the build directory,
based upon krlmlr's answer at
[stackoverflow](http://stackoverflow.com/questions/26120163/how-to-properly-commit-in-repository-with-github-pages-branch/29616287#29616287).

<!-- more -->

## Initial setup

Clone the site repo:

    $ git clone git@github.com:myuser/myrepo.git
    Cloning into 'myrepo'...
    ... done.
    $ cd myrepo

Sanity check:

    $ git checkout master
    Already on 'master'
    Your branch is up-to-date with 'origin/master'.

Setup the build directory to be the `gh-pages` branch:

    $ rm -rf build
    $ git clone . build
    Cloning into 'build'...
    done.
    $ cd build
    $ git checkout --orphan gh-pages
    Switched to a new branch 'gh-pages'
    $ git reset --hard
    $ git commit --allow-empty -m 'initial build commit'
    [gh-pages (root-commit) 736d806] initial build commit

and add it to the main repo clone:

    $ git push origin -u gh-pages
    Counting objects: 2, done.
    Writing objects: 100% (2/2), 172 bytes | 0 bytes/s, done.
    Total 2 (delta 0), reused 0 (delta 0)
    To /path/to/myrepo/.
    * [new branch]      gh-pages -> gh-pages
    Branch gh-pages set up to track remote branch gh-pages from origin.

The build directory should know only about `gh-pages`.
Delete all other branches, especially `master`:

    $ git branch -d master
    warning: deleting branch 'master' that has been merged to
            'refs/remotes/origin/master', but not yet merged to HEAD.
    Deleted branch master (was 1d70874).
    $ git remote set-head origin gh-pages
    $ git remote set-branches origin gh-pages
    $ cat .git/config
    [core]
	    repositoryformatversion = 0
	    filemode = true
	    bare = false
	    logallrefupdates = true
    [remote "origin"]
	    url = /path/to/myrepo/.
        fetch = +refs/heads/gh-pages:refs/remotes/origin/gh-pages
    [branch "gh-pages"]
	    remote = origin
	    merge = refs/heads/gh-pages

Add initial site build to `gh-pages`:

    $ cd ..
    $ make
    $ cd build
    $ git add .
    $ git commit -m 'initial site build'
    [gh-pages fd4fc2a] initial site build
    76 files changed, 6727 insertions(+)
    create mode 100644 .nojekyll
    ...
    $ git push
    Counting objects: 182, done.
    Delta compression using up to 4 threads.
    Compressing objects: 100% (105/105), done.
    Writing objects: 100% (182/182), 89.41 KiB | 0 bytes/s, done.
    Total 182 (delta 31), reused 0 (delta 0)
    To /path/to/myrepo/.
       736d806..fd4fc2a  gh-pages -> gh-pages

Add `gh-pages` to GitHub:

    $ cd ..     # aka /path/to/myrepo
    $ git push origin -u gh-pages gh-pages
    Counting objects: 184, done.
    Delta compression using up to 4 threads.
    Compressing objects: 100% (75/75), done.
    Writing objects: 100% (184/184), 89.55 KiB | 0 bytes/s, done.
    Total 184 (delta 31), reused 182 (delta 31)
    To git@github.com:jja/haxx.sinequanon.net.git
    * [new branch]      gh-pages -> gh-pages
    Branch gh-pages set up to track remote branch gh-pages from origin.

Setup both (all) branches to push automatically:

    $ git config push.default matching

Sanity check:

    $ cd /path/to/myrepo
    $ git checkout master
    Already on 'master'
    Your branch is up-to-date with 'origin/master'.
    $ git branch
    gh-pages
    * master
    $ cat .git/config
    [core]
	    repositoryformatversion = 0
	    filemode = true
	    bare = false
	    logallrefupdates = true
    [remote "origin"]
	    url = git@github.com:jja/haxx.sinequanon.net.git
	    fetch = +refs/heads/*:refs/remotes/origin/*
    [branch "master"]
	    remote = origin
	    merge = refs/heads/master
    [branch "gh-pages"]
	    remote = origin
	    merge = refs/heads/gh-pages
    [push]
	    default = matching

## Future workflow

Committing in the main directory adds site source changes
to the `master` branch.
Committing in the `build` directory adds the generated
static site pages to the `gh-pages` branch
(from which GitHub will eventually serve the pages).
Pushing from the `build` directory syncs the static site
(`gh-pages`) with the main repo clone.
Pushing from the main directory sends it all to GitHub
for serving (i.e. publishes or installs the site).

All this can be done in either of two sequences.
Committing the build (`gh-pages`) first:

    $ cd /path/to/myrepo
    $ vi ...
    $ make
    $ cd build
    $ git add .
    $ git commit -a
    $ git push
    $ cd ..
    $ git add ...
    $ git commit [-a] [-C `cat .git/refs/heads/gh-pages`]
    $ git push

or committing the source (`master`) first:

    $ cd /path/to/myrepo
    $ vi ...
    $ make
    $ git add ...
    $ git commit ...
    $ cd build
    $ git add .
    $ git commit -a [-C `cat ../.git/refs/heads/master`]
    $ git push
    $ cd ..
    $ git push

I have some `make install` targets for both above workflows
which I'll commit after some testing.

## Coda

I hope that helps.
I don't have a commenting service (yet?) for the static site,
so please email comments or suggestions
(see the [About](/about/) page), or comment in a
[GitHub issue](https://github.com/jja/haxx.sinequanon.net/issues/1).
(Hmmm... not a real solution...)
