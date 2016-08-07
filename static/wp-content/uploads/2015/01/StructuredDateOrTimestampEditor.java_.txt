/*
 * Copyright 2004-2005 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * modified 2014 by jja@sinequanon.net for java.sql.Timestamp, seconds, ms, ns, epoch
 * (why no love for seconds or Timestamp to begin with?)
 * from grails-web/src/main/groovy/org/codehaus/groovy/grails/web/binding/StructuredDateEditor.java
 */

//package org.codehaus.groovy.grails.web.binding;
package net.sinequanon.grails;

import java.text.DateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Map;

import java.text.SimpleDateFormat;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.util.Assert;
import org.codehaus.groovy.grails.web.binding.StructuredPropertyEditor;

/**
 * Structured editor for editing dates that takes 8 fields that represent the year, month, day,
 * hour, minute, second, millisecond, and nanonsecond, or 1 field for epoch time,
 * and constructs a java.util.Date, java.sql.Date, or java.sql.Timestamp instance.
 *
 * @author John Allison
 * @author Graeme Rocher
 * @since 1.0.4
 */
public class StructuredDateOrTimestampEditor extends CustomDateEditor implements StructuredPropertyEditor {

    protected final boolean myAllowEmpty; // bah - super.allowEmpty is private!

    public StructuredDateOrTimestampEditor() {
        super(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"), true);
        this.myAllowEmpty = true;
    }

    public StructuredDateOrTimestampEditor(String format) {
        super(new SimpleDateFormat(format), true);
        this.myAllowEmpty = true;
    }

    public StructuredDateOrTimestampEditor(DateFormat dateFormat, boolean allowEmpty) {
        super(dateFormat, allowEmpty);
        this.myAllowEmpty = allowEmpty;
    }

    public StructuredDateOrTimestampEditor(
      DateFormat dateFormat, boolean allowEmpty, int exactDateLength
      )
    {
        super(dateFormat, allowEmpty, exactDateLength);
        this.myAllowEmpty = allowEmpty;
    }

    public List<String> getRequiredFields() {
        return Arrays.asList("year");
    }

    public List<String> getOptionalFields() {
        return Arrays.asList("month", "day", "hour", "minute",
            "second", "millisecond", "nanosecond", "epoch");
    }

    @SuppressWarnings("rawtypes")
    public Object assemble(Class type, Map fieldValues) throws IllegalArgumentException {
        String yearString = (String) fieldValues.get("year");
        String monthString = (String) fieldValues.get("month");
        String dayString = (String) fieldValues.get("day");
        String hourString = (String) fieldValues.get("hour");
        String minuteString = (String) fieldValues.get("minute");
        String secondString = (String) fieldValues.get("second");
        String milliSecondString = (String) fieldValues.get("millisecond");
        String nanoSecondString = (String) fieldValues.get("nanosecond");
        String epochString = (String) fieldValues.get("epoch");
        if (StringUtils.isBlank(yearString)
                && StringUtils.isBlank(monthString)
                && StringUtils.isBlank(dayString)
                && StringUtils.isBlank(hourString)
                && StringUtils.isBlank(minuteString)
                && StringUtils.isBlank(secondString)
                && StringUtils.isBlank(milliSecondString)
                && StringUtils.isBlank(nanoSecondString)
                && StringUtils.isBlank(epochString)
                ) {
            if (this.myAllowEmpty) {
                setValue(null);
                return null;
            }
            throw new IllegalArgumentException("Date struct values cannot all be empty");
        }

        try {
            Calendar c = null;
            long epoch = 0;
            if (!StringUtils.isBlank(epochString)) {
                epoch = getLongValue(fieldValues, "epoch", 0);
            } else {
                int year = getIntegerValue(fieldValues, "year", 1970);
                int month = getIntegerValue(fieldValues, "month", 1);
                int day = getIntegerValue(fieldValues, "day", 1);
                int hour = getIntegerValue(fieldValues, "hour", 0);
                int minute = getIntegerValue(fieldValues, "minute", 0);
                int second = getIntegerValue(fieldValues, "second", 0);
                int milliSecond = getIntegerValue(fieldValues, "millisecond", 0);
                c = new GregorianCalendar(year,month - 1,day,hour,minute,second);
                epoch = c.getTimeInMillis() + milliSecond;
            }
            if (type == java.util.Date.class) {
                setValue(new java.util.Date(epoch));
                return(getValue());
            }
            if (type == java.sql.Date.class) {
                setValue(new java.sql.Date(epoch));
                return(getValue());
            }
            if (type == java.sql.Timestamp.class) {
                java.sql.Timestamp ts = new java.sql.Timestamp(epoch);
                if (fieldValues.containsKey("nanosecond") &&
                    !StringUtils.isBlank(nanoSecondString)
                   ) {
                    ts.setNanos( getIntegerValue(fieldValues, "nanosecond", 0) );
                }
                setValue(ts);
                return ts;
            }
            if (c == null) {
                c = new GregorianCalendar();
                c.setTimeInMillis(epoch);
            }
            setValue(c);
            return c;
        }
        catch (NumberFormatException nfe) {
            throw new IllegalArgumentException("Bad number format: " + nfe.getMessage());
        }
    }

    @SuppressWarnings("rawtypes")
    private int getIntegerValue(Map values, String name, int defaultValue) throws NumberFormatException {
        if (values.get(name) != null) {
            return Integer.parseInt((String) values.get(name));
        }
        return defaultValue;
    }

    @SuppressWarnings("rawtypes")
    private long getLongValue(Map values, String name, long defaultValue) throws NumberFormatException {
        if (values.get(name) != null) {
            return Long.parseLong((String) values.get(name));
        }
        return defaultValue;
    }

}
