---
author: jja
comments: false
date: 2014-10-13 18:12:50+00:00
layout: post
link: http://haxx.sinequanon.net/2014/10/better-structured-date-editor-for-grails/
slug: better-structured-date-editor-for-grails
title: Better structured date editor for Grails
wordpress_id: 365
categories:
- tech
tags:
- grails
- joda
- spring
---

It's really surprising and annoying that the default structured editor for
dates and times in Grails is so limited. It only allows one to edit (or enter)
time information down to the minute. Seconds and smaller are ignored, even
though the editor specifically returns an epoch time in milliseconds with the
`getTime()` method! The default editor also only works for `java.util.Date`
and `java.sql.Date` -- not the also common `java.sql.Timestamp`.

<!-- more -->

I've created a new editor that works for all 3 types mentioned and allows one
to edit/enter more complete time information, including seconds (yeah!),
millisecond or nanosecond, and also allows the use of an "epoch" time field to
edit a raw integer.

See the editor code at
[StructuredDateOrTimestampEditor.java (GitHub)](https://github.com/jja/grails-jja-extensions-plugin/blob/master/src/java/net/sinequanon/grails/StructuredDateOrTimestampEditor.java)
or [download StructuredDateOrTimestampEditor.java](/wp-content/uploads/2015/01/StructuredDateOrTimestampEditor.java_.txt)

I setup the editor in my own registrar class, e.g.
`src/groovy/mypackage/CustomPropertyEditorRegistrar.groovy`
where I make several editor customizations:

    import org.springframework.beans.PropertyEditorRegistrar;
    import org.springframework.beans.PropertyEditorRegistry;
    import org.springframework.beans.propertyeditors.CustomNumberEditor;
    import java.beans.PropertyEditor;
    import java.text.NumberFormat;
    import java.text.DecimalFormat;
    import java.math.BigDecimal;
    import java.util.Locale;
    import edu.ucar.eol.spring.SqlTimestampPropertyEditor;
    import edu.ucar.eol.grails.StructuredDateOrTimestampEditor;
    public class CustomPropertyEditorRegistrar implements PropertyEditorRegistrar {
      public void registerCustomEditors(PropertyEditorRegistry registry) {
        registry.registerCustomEditor(java.sql.Timestamp.class, new StructuredDateOrTimestampEditor());
        registry.registerCustomEditor(java.util.Date.class, new StructuredDateOrTimestampEditor());
        registry.registerCustomEditor(java.sql.Date.class, new StructuredDateOrTimestampEditor());
      }
    }

and then register the bean with Spring `grails-app/conf/spring/resources.groovy`:

    beans = {
      CustomPropertyEditorRegistrar(mypackage.CustomPropertyEditorRegistrar)
    }

Finally, to make use of it you'll need the proper HTML in your view. I'm also
using Joda time, and modified the Grails plugin's taglib at
[DateTimeTagLib.groovy (GitHub)](https://github.com/jja/grails-jja-extensions-plugin/blob/master/grails-app/taglib/net/sinequanon/grails/DateTimeTagLib.groovy)
or [download DateTimeTagLib.groovy](/wp-content/uploads/2015/01/DateTimeTagLib.groovy.txt)

It has all worked great so far.

Sorry, I don't have any real tests but here are some things you can try in
your `grails shell` :

    sed = new net.sinequanon.grails.StructuredDateOrTimestampEditor("yyyy-MM-dd HH:mm:ss.S")
    ts = sed.assemble(java.sql.Timestamp, [epoch:'1'])
    ===> 1970-01-01 00:00:00.001
    ts = sed.assemble(java.sql.Timestamp, [:])
    ===> null
    ts = sed.assemble(java.sql.Timestamp, [year:'2014', millisecond:'123'])
    ===> 2014-01-01 00:00:00.123
    ts = sed.assemble(java.sql.Timestamp, [year:'2014', nanosecond:'456'])
    ===> 2014-01-01 00:00:00.000000456
    // nanosecond takes precedence over millisecond
    ts = sed.assemble(java.sql.Timestamp, [year:'2014', millisecond:'123', nanosecond:'456'])
    ===> 2014-01-01 00:00:00.000000456
    ts = sed.assemble(java.sql.Timestamp, [year:'2014', epoch:'5', millisecond:'123'])
    ===> 1970-01-01 00:00:00.005
    // epoch is milliseconds and sets the time before nanosecond overwrites the fractional portion
    ts = sed.assemble(java.sql.Timestamp, [year:'2014', epoch:'5', nanosecond:'456'])
    ===> 1970-01-01 00:00:00.000000456

## References

  * [StructuredDateEditor.java](https://github.com/grails/grails-core/blob/2.3.x/grails-web/src/main/groovy/org/codehaus/groovy/grails/web/binding/StructuredDateEditor.java)
  * [StructuredPropertyEditor.java](https://github.com/grails/grails-core/blob/2.3.x/grails-web/src/main/groovy/org/codehaus/groovy/grails/web/binding/StructuredPropertyEditor.java)
  * [FormTagLib.groovy](https://github.com/grails/grails-core/blob/2.3.x/grails-plugin-gsp/src/main/groovy/org/codehaus/groovy/grails/plugins/web/taglib/FormTagLib.groovy)
  * [GrailsDataBinder.java](https://github.com/grails/grails-core/blob/2.3.x/grails-web/src/main/groovy/org/codehaus/groovy/grails/web/binding/GrailsDataBinder.java)
  * [GrailsClassUtils.java](https://github.com/grails/grails-core/blob/2.3.x/grails-core/src/main/groovy/org/codehaus/groovy/grails/commons/GrailsClassUtils.java)
  * [CustomDateEditor.java (Spring)](https://github.com/spring-projects/spring-framework/blob/3.2.x/spring-beans/src/main/java/org/springframework/beans/propertyeditors/CustomDateEditor.java)
  * [DateTimeFormatterBuilder.java (Joda)](https://github.com/JodaOrg/joda-time/blob/v1.6_BRANCH/JodaTime/src/main/java/org/joda/time/format/DateTimeFormatterBuilder.java)
  * [DateTimeFieldType.java (Joda)](https://github.com/JodaOrg/joda-time/blob/v1.6_BRANCH/JodaTime/src/main/java/org/joda/time/DateTimeFieldType.java)
  * [ISODateTimeFormat.java (Joda)](https://github.com/JodaOrg/joda-time/blob/v1.6_BRANCH/JodaTime/src/main/java/org/joda/time/format/ISODateTimeFormat.java)

