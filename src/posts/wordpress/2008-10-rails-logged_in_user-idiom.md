---
author: jja
comments: false
date: 2008-10-07 18:04:21+00:00
layout: post
link: http://haxx.sinequanon.net/2008/10/rails-logged_in_user-idiom/
slug: rails-logged_in_user-idiom
title: Rails logged_in_user idiom
wordpress_id: 113
categories:
- tech
tags:
- rails
---

I recently refactored another developer's code to clean up some massive
amounts of database pings to retrieve the current user object. The main
problem was in the use of the logged_in_user or current_user idiom in Rails.
[Several](http://books.google.com/books?id=2NZG4ASmnZ0C&pg=PA54&lpg=PA54&dq=rails+logged_in_user&source=web&ots=x7Hqg6pZw7&sig=N2itAovNoEyoIwzDO42GmeRLco0&hl=en&sa=X&oi=book_result&resnum=7&ct=result)
[places](http://railscasts.com/episodes/1)
[give](http://almosteffortless.com/2008/01/07/simplifying-and-sharing-code-with-rails-conventions/)
[good](http://www.freezzo.com/2008/08/22/session-current-user-object-bad/)
[examples](http://snippets.dzone.com/posts/show/4922)
but leave out the details that were bugging my project.

<!-- more -->

## user.id

Firstly, don't store the
[user object](http://www.freezzo.com/2008/08/22/session-current-user-object-bad/)
in the session! Just store the user object's ID. In `LoginController#login`, use:

            session[:user_id] = user.id

(full method below).

## caching helper_method

Rather than a before filter on ApplicationController, I used a helper method
logged_in_user:

    class ApplicationController < ActionController::Base
      helper_method :logged_in_user
      private
      def logged_in_user
        return (@logged_in_user=nil) if session[:user_id].nil?
        @logged_in_user ||= User.find_by_id(session[:user_id])
      end
      def reset_logged_in_user
        @logged_in_user=nil
      end
    #...
    end

The method returns the
[instance variable](http://railstips.org/2006/11/18/class-and-instance-variables-in-ruby)
of the same name (`@logged_in_user`). If the variable is not already set, only
then does the method use find_by_id to load the object from the database
(saving an extra database ping over other examples). An
[instance variable](http://railscasts.com/episodes/1)
is scoped to the instance of
ApplicationController, i.e. it exists for the duration of the web request.
Thus it acts as a cache during the request. We can then call logged_in_user
from our views without repeatedly accessing the database:

    <% if logged_in_user %>

and we can access any User methods like this:

    <% if logged_in_user and logged_in_user.may_view_all? %>

## security

For security, be sure your LoginController resets both the user ID in the
session and the logged_in_user instance variable:

    class LoginController < ApplicationController
    #...
      def login
        session[:user_id] = nil
        reset_logged_in_user
        if request.post?
          user = User.authenticate(params[:username], params[:password])
          if user
            session[:user_id] = user.id
            redirect_to(:action => "index")
          else
            flash[:notice] = "Invalid user/password combination"
            params[:password]=nil
          end
        end
      end
      def logout
        session[:user_id] = nil
        reset_logged_in_user
        reset_session
        flash[:notice] = "Logged out"
        redirect_to(:action => "login")
      end
    end

## alternatives

Here are two other ways of writing logged_in_user that show the logic a little
more clearly, if more verbose:

    def logged_in_user
        @logged_in_user = User.find_by_id(session[:user_id]) if
          @logged_in_user.nil? and session[:user_id]
        @logged_in_user
    end
    
    def logged_in_user
        if session[:user_id].nil?
          @logged_in_user=nil
        elsif @logged_in_user.nil?
          @logged_in_user = User.find_by_id(session[:user_id])
        end
        @logged_in_user
    end

## ApplicationHelper

Final tip: make sure you don't put a logged_in_user helper method on
ApplicationHelper--- that's how our app was pinging the database for the user
object tens of times per page view as this method was getting used instead of
ApplicationController's!
