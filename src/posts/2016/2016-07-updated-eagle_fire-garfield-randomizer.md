---
author: jja
comments: false
date: 2016-07-11 23:07:34+00:00
layout: post
link: http://haxx.sinequanon.net/2016/07/updated-eagle_fire-garfield-randomizer/
slug: updated-eagle_fire-garfield-randomizer
title: Updated Eagle_Fire Garfield Randomizer
wordpress_id: 387
categories:
- general
---

The comic strip Garfield is generally rather banal, but if the three panels
are selected randomly from the archive, then the resulting strip can be
surreal.

<!-- more -->

Below is an HTML/JS page to do just that, based on the original
*Eagle_Fire Garfield Randomizer* page.
The original URL of that site is lost--
please comment if you know it. I've udpated the code to use the full Garfield
archive (not including Sundays) and also display the date of each panel.
Enjoy, or perhaps be wildered!

Download, save locally and rename the file to .html. Then open with your web browser.
[garfield.html](/wp-content/uploads/2016/07/garfield.html.txt)

<center>

<style type='text/css'>
    td {
     overflow: hidden;
     text-align: left;
     vertical-align: top;
     max-height: 200px;
     max-width: 180px;
     }
    img {
     position: absolute;
     }
</style>

<table border="1">
    <tr>
    <td width="200" height="180" id="td0"> </td>
    <td width="200" height="180" id="td1"> </td>
    <td width="200" height="180" id="td2"> </td>
    </tr>
    <tr>
    <td><input type="checkbox" id="ck0">Lock <span id="dt0"> </span></td>
    <td><input type="checkbox" id="ck1">Lock <span id="dt1"> </span></td>
    <td><input type="checkbox" id="ck2">Lock <span id="dt2"> </span></td>
    </tr>
</table>

<script>
    function fmt(n) {
     if (n < 10) return "0" + n;
     return n;
     }
    last = new Date(Date.now() - 62 * 86400000);
    last = new Date(last.getFullYear(),last.getMonth(),1);
    last = new Date(last.getTime() - 86400000);
    first = new Date(1978,6,19);
    function load() {
      for (i = 0; i < 3; i++) {
        if (document.getElementById("ck"+i).checked) continue;
        sunday = true
        while (sunday) {
          randt = new Date(Math.floor(
            first.getTime() + Math.random() * (last.getTime() - first.getTime())
            ));
          if (randt.getDay() != 0) sunday = false;
          }
        year = randt.getFullYear();
        month = randt.getMonth() + 1;
        day = randt.getDate();
        panel = Math.floor(Math.random() * 3);
        imgurl = "http://images.ucomics.com/comics/ga/" 
          + year + "/ga" + fmt(year % 100) + fmt(month) + fmt(day) + ".gif";
        tu = document.getElementById("td"+i);
        tu.background = imgurl;
        tu.style.background = "url(" + imgurl + ") " + -200 * panel + "px 0px";
        d = document.getElementById("dt"+i);
        d.textContent = "" + year + "-" + fmt(month) + "-" + fmt(day);
        }
      }
    load();
</script>

<br>

<input type="button" value="Reload" onClick="load()">

</center>
