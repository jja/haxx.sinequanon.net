/*
 * jja.DateTimeTagLib - by John Allison <jja@sinequanon.net>
 * heavily modified from grails plugin jodatime DateTimeTagLib.groovy, which is:
 *
 * Copyright 2010 Rob Fletcher
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package net.sinequanon.grails

import org.codehaus.groovy.grails.web.taglib.exceptions.GrailsTagException

//import java.text.DateFormatSymbols
//import org.springframework.web.servlet.support.RequestContextUtils

import org.joda.time.*
import org.joda.time.format.*


class DateTimeTagLib {

	static namespace = 'jja'

	def dateTimeInputter = { attrs ->
		def fields = [DateTimeFieldType.year(), DateTimeFieldType.monthOfYear(), DateTimeFieldType.dayOfMonth(), DateTimeFieldType.hourOfDay(), DateTimeFieldType.minuteOfHour(), DateTimeFieldType.secondOfMinute(), DateTimeFieldType.millisOfSecond() ]
		def precision = attrs.precision ?: (grailsApplication.config.grails.tags.datePicker.default.precision ?: 'second')
		log.debug "precision = $precision"

		log.debug "fields = $fields"
		switch (precision) {
			case 'year': fields.remove(DateTimeFieldType.monthOfYear())
			case 'month': fields.remove(DateTimeFieldType.dayOfMonth())
			case 'day': fields.remove(DateTimeFieldType.hourOfDay())
			case 'hour': fields.remove(DateTimeFieldType.minuteOfHour())
			case 'minute': fields.remove(DateTimeFieldType.secondOfMinute())
			case 'second': fields.remove(DateTimeFieldType.millisOfSecond())
		}
		log.debug "fields = $fields"

		def defaultValue = attrs.'default'
		if (!defaultValue) {
			defaultValue = new LocalDateTime()
		} else if (defaultValue == 'none') {
			defaultValue = null
		} else if (defaultValue instanceof String) {
			defaultValue = getParser(fields).parseDateTime(defaultValue).toLocalDateTime()
		} else if (!(defaultValue instanceof ReadableInstant) && !(defaultValue instanceof ReadablePartial)) {
			throwTagError("Tag [dateTimeInputter] requires the default datetime to be a parseable String or instanceof Joda Time's ReadableInstant or ReadablePartial")
		}
		log.debug "default = $defaultValue"

		def value = attrs.value
		if (value == 'none') {
			value = null
		} else if (!value) {
			value = defaultValue
		}
		log.debug "value = $value"

		def name = attrs.name
		def id = attrs.id ?: name

        def tabindex = [:]
        if (attrs.tabindex) tabindex = [tabindex:attrs.tabindex]

		//def dfs = new DateFormatSymbols(RequestContextUtils.getLocale(request))

        DateTimeFormatter yearfmt = new DateTimeFormatterBuilder().appendYear(4,4).toFormatter();
        DateTimeFormatter monthfmt = new DateTimeFormatterBuilder().appendMonthOfYear(2).toFormatter();
        DateTimeFormatter dayfmt = new DateTimeFormatterBuilder().appendDayOfMonth(2).toFormatter();
        DateTimeFormatter hourfmt = new DateTimeFormatterBuilder().appendHourOfDay(2).toFormatter();
        DateTimeFormatter minutefmt = new DateTimeFormatterBuilder().appendMinuteOfHour(2).toFormatter();
        DateTimeFormatter secondfmt = new DateTimeFormatterBuilder().appendSecondOfMinute(2).toFormatter();
        DateTimeFormatter millifmt = new DateTimeFormatterBuilder().appendMillisOfSecond(3).toFormatter();

		log.debug "starting rendering"
		out << "<input type=\"hidden\" name=\"$name\" value=\"struct\" />"

        if (value instanceof java.sql.Timestamp) value = value.time

		// create year input
		if (fields.contains(DateTimeFieldType.year())) {
			log.debug "rendering year"
            // XXX title needs i18n localization
            out << textField ( [name:"${name}_year", id:"${id}_year", title:"year", value:value ? yearfmt.print(value) : "", size:"4", maxlength:"4"] << tabindex)
		}

		// create month input
		if (fields.contains(DateTimeFieldType.monthOfYear())) {
			log.debug "rendering month"
            out << "-"
            out << textField ( [name:"${name}_month", id:"${id}_month", title:"month", value:value ? monthfmt.print(value) : "", size:"2", maxlength:"2"] << tabindex )
		}

		// create day input
		if (fields.contains(DateTimeFieldType.dayOfMonth())) {
			log.debug "rendering day"
            out << "-"
            out << textField ( [name:"${name}_day", id:"${id}_day", title:"day", value:value ? dayfmt.print(value) : "", size:"2", maxlength:"2"] << tabindex )
		}

		// create hour input
		if (fields.contains(DateTimeFieldType.hourOfDay())) {
			log.debug "rendering hour"
            out << "&nbsp;"
            out << "&nbsp;"
            out << "&nbsp;"
            out << textField ( [name:"${name}_hour", id:"${id}_hour", title:"hour", value:value ? hourfmt.print(value) : "", size:"2", maxlength:"2"] << tabindex )
		}

		// create minute input
		if (fields.contains(DateTimeFieldType.minuteOfHour())) {
			log.debug "rendering minute"
            out << ":"
            out << textField ( [name:"${name}_minute", id:"${id}_minute", title:"minute", value:value ? minutefmt.print(value) : "", size:"2", maxlength:"2"] << tabindex )
		}

		// create second input
		if (fields.contains(DateTimeFieldType.secondOfMinute())) {
			log.debug "rendering second"
            out << ":"
            out << textField ( [name:"${name}_second", id:"${id}_second", title:"second", value:value ? secondfmt.print(value) : "", size:"2", maxlength:"2"] << tabindex )
		}

		// create millisecond input
		if (fields.contains(DateTimeFieldType.millisOfSecond())) {
			log.debug "rendering millisecond"
            out << ":"
            out << textField ( [name:"${name}_millisecond", id:"${id}_millisecond", title:"millisecond", value:value ? millifmt.print(value) : "", size:"3", maxlength:"3"] << tabindex )
		}

		// do zone select
		if (attrs.useZone == "true") {
			dateTimeZoneSelect([name: "${name}_zone"] << tabindex)
		}

		log.debug "done"
	}

	private DateTimeFormatter getParser(List fields) {
		DateTimeFormatter formatter
		if (fields == [DateTimeFieldType.year()]) {
			formatter = ISODateTimeFormat.year()
		} else if (fields == [DateTimeFieldType.year(), DateTimeFieldType.monthOfYear()]) {
			formatter = ISODateTimeFormat.yearMonth()
		} else if (fields == [DateTimeFieldType.year(), DateTimeFieldType.monthOfYear(), DateTimeFieldType.dayOfMonth()]) {
			formatter = ISODateTimeFormat.yearMonthDay()
		} else if (fields == [DateTimeFieldType.year(), DateTimeFieldType.monthOfYear(), DateTimeFieldType.dayOfMonth(), DateTimeFieldType.hourOfDay()]) {
			formatter = ISODateTimeFormat.dateHour()
		} else if (fields == [DateTimeFieldType.year(), DateTimeFieldType.monthOfYear(), DateTimeFieldType.dayOfMonth(), DateTimeFieldType.hourOfDay(), DateTimeFieldType.minuteOfHour()]) {
			formatter = ISODateTimeFormat.dateHourMinute()
		} else if (fields == [DateTimeFieldType.year(), DateTimeFieldType.monthOfYear(), DateTimeFieldType.dayOfMonth(), DateTimeFieldType.hourOfDay(), DateTimeFieldType.minuteOfHour(), DateTimeFieldType.secondOfMinute()]) {
			formatter = ISODateTimeFormat.dateHourMinuteSecond()
		} else if (fields == [DateTimeFieldType.year(), DateTimeFieldType.monthOfYear(), DateTimeFieldType.dayOfMonth(), DateTimeFieldType.hourOfDay(), DateTimeFieldType.minuteOfHour(), DateTimeFieldType.secondOfMinute(), DateTimeFieldType.millisOfSecond()]) {
			formatter = ISODateTimeFormat.dateHourMinuteSecondMillis()
		} else if (fields == [DateTimeFieldType.hourOfDay()]) {
			formatter = ISODateTimeFormat.hour()
		} else if (fields == [DateTimeFieldType.hourOfDay(), DateTimeFieldType.minuteOfHour()]) {
			formatter = ISODateTimeFormat.hourMinute()
		} else if (fields == [DateTimeFieldType.hourOfDay(), DateTimeFieldType.minuteOfHour(), DateTimeFieldType.secondOfMinute()]) {
			formatter = ISODateTimeFormat.hourMinuteSecond()
		} else if (fields == [DateTimeFieldType.hourOfDay(), DateTimeFieldType.minuteOfHour(), DateTimeFieldType.secondOfMinute(), DateTimeFieldType.millisOfSecond()]) {
			formatter = ISODateTimeFormat.hourMinuteSecondMillis()
		} else {
			throw new GrailsTagException("Invalid combination of date/time fields: $fields")
		}
		return formatter
	}

}
