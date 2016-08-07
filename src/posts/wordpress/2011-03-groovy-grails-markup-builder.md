---
author: jja
comments: false
date: 2011-03-31 18:29:35+00:00
layout: post
link: http://haxx.sinequanon.net/2011/03/groovy-grails-markup-builder/
slug: groovy-grails-markup-builder
title: Groovy (Grails) markup builder for select/option menu
wordpress_id: 285
categories:
- tech
tags:
- grails
- groovy
---

I was trying to use the Groovy XML MarkupBuilder to have Grails output an HTML
fragment for an AJAX call and just couldn't get it to work. I wanted to
generate an HTML select/option menu from a list of lists:

<!-- more -->

    assert results == [[null,null], [17, 'foo'], [42, 'bar'], [69, 'bahz']]

(That list was returned from a Hibernate Criteria Builder with some
specialized projections.)

First I tried to do it simply, following Grails docs:

<!-- more -->

    render {
      select(size:10) {
        results.each {
          if (it[0] && it[1])
            option( value:it[0], it[1] )
          }
        }
      }

I kept getting a blank list. Eventually I figured out that the Grails GSP
select tag was interfering with the markup builder DSL, so I tried using that,
with list access code in a closure in a GString expression:

    render {
      g.select from:results, optionKey:"${{it[0]}}", optionValue:"${{it[1]}}"
      }

Except that both expressions are in the same block and share `it`. So we have
to use different explicit closure parameters:

    render {
      g.select from:results, optionKey:"${{itk -> itk[0]}}", optionValue:"${{itv->itv[1]}}"
      }

but that fails with an error like:

    `No signature of method: java.io.StringWriter.getAt() is applicable for
    argument types: (java.lang.Integer) values: [0] Possible solutions:
    getAt(java.lang.String)`

so I tried making the indices into strings:

    render {
      g.select from:results, optionKey:"${{itk -> itk['0']}}", optionValue:"${{itv->itv['1']}}"
      }

which resulted in the error:

    No such property: 0 for class: java.io.StringWriter

The Grails docs give the example

    optionValue="${{it.title?.toUpperCase()}}"

which makes it seem like real code is available. But the `itk`/`itv` closure
parameters apparently aren't *really* the list values, which would happily
accept the Groovy magic `Object.getAt()` method.
Something like this seemed to work:

    render { builder ->
      builder.select(size:10,onchange:"myJsFunc(this);") {
      results.each {
        if (it[0] && it[1])
          option( value:it[0], it[1] )
        }
      }
    }

If you're in Grails (and not just straight Groovy), really try to use a view
for this!
