---
author: jja
comments: false
date: 2011-10-24 23:40:56+00:00
layout: post
link: http://haxx.sinequanon.net/2011/10/grails-plugin-ckeditor-with-aspell/
slug: grails-plugin-ckeditor-with-aspell
title: Grails plugin CKEditor with aspell
wordpress_id: 336
categories:
- tech
tags:
- aspell
- ckeditor
- grails
---

Here's an info dump of some things I did to get Linux aspell-based spell
checking working with the Grails CKEditor plugin.

<!-- more -->

File `grails-app/conf/Config.groovy`

    ckeditor {
        config = "/js/ckeditor/ckconfig.gsp" // CKEDITOR.config.customConfig ; note the gsp extension
        }

File `web-app/js/ckeditor/ckconfig.gsp`

    <%@ page contentType="text/javascript" %>
    // http://grails.1312388.n4.nabble.com/ckeditor-custom-plugins-tp2717404p2718562.html
    //CKEDITOR.plugins.addExternal('aspell', '${request.contextPath}/js/ckeditor/plugins/aspell/');
    CKEDITOR.plugins.addExternal('aspell', '${resource(dir:"js/ckeditor/plugins/aspell/")}');
    CKEDITOR.editorConfig = function( config )
    {
        config.removePlugins = 'filebrowser,ofm,flash,save,font';
        config.extraPlugins = 'aspell';
        config.toolbar_zinc =
                [
                    { name: 'document', items : [ 'Bold', 'Italic', 'NumberedList', 'BulletedList', 'Blockquote', 'Subscript', 'Superscript', 'SpecialChar', '-', 'RemoveFormat' ] },
                    { name: 'tools', items : [ 'Source', 'ShowBlocks', '-', 'About', 'Maximize' ] },
                    '/',
                    { name: 'clipboard', items : [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
                    { name: 'editing', items : [ 'Find', 'Replace', '-', 'SelectAll', '-', 'SpellCheck' ] },
                ]
    };

Get aspell.7z, system pacakges aspell and aspell-en (or your language), and
CKEditor plugin aspell. Add the following:

File `web-app/js/ckeditor/plugins/aspell/dialogs/aspell.js`

    oSpeller.spellCheckScript = editor.plugins.aspell.path+'spellerpages/server-scripts/spellchecker.jsp';

File `web-app/js/ckeditor/plugins/aspell/spellerpages/server-scripts/spellchecker.jsp`
is documented in [another post about spellchecker](/2011/10/ckeditor-spellchecker-jsp/)
