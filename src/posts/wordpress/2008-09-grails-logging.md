---
author: jja
comments: false
date: 2008-09-24 19:39:07+00:00
layout: post
link: http://haxx.sinequanon.net/2008/09/grails-logging/
slug: grails-logging
title: Grails logging
wordpress_id: 72
categories:
- tech
tags:
- grails
- logging
---

To turn on display of debug log messages in Grails 1.0.2, add this to the
bottom of `grails-app/conf/Config.groovy`:

<!-- more -->

    environments {
      development {
        log4j {
          logger {
             grails."app"="debug,stdout"
             //grails="debug,stdout"    // maybe need this too
          }
        }
      }
    }

Info on other versions continues below.

<!-- more -->

With Grails 1.0.3 and 1.0.4, the above will produce an error message like `No
such property: context for class: java.lang.String`

For 1.0.3 and 1.0.4, use this:

    environments {
      development {
        log4j {
          logger {
            grails {
              app="debug"
            }
          }
        }
      }
    }

In your code, simply use `log.debug("my message")`

Thanks to the grails-user mailing list for
[a clue](http://www.nabble.com/1.0.3---No-such-property:-context-for-class:-java.lang.String-td18515263.html)
towards this.

Update: I've been working through all this again for 1.0.4 and 1.1. I added a
commented line for 1.0.2 that I'm now needing to include, although it
unfortunately doubles the output.

Unfortunately, the 1.0.3/4 method does not work in 1.1. After upgrading, you
need to change the extra logging snippet even if you leave the standard
logging section in the old format. For 1.1:

    environments {
      development {
        log4j = {
          debug 'grails.app'
        }
      }
    }

Also note that one could add the grails.app config lines in the middle of the
regular log4j configuration section, but the examples given illustrate how to
have different log levels in different environments, e.g. debug messages in
development mode and only error messages in production.
