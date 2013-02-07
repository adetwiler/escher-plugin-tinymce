(function () {
    tinymce.PluginManager.requireLangPack("citation");
    tinymce.create("tinymce.plugins.CitationPlugin", {init:function (a, b) {
        a.addCommand("mceCitation", function () {
            a.windowManager.open({file:b + "/dialog.htm", width:320 + parseInt(a.getLang("citation.delta_width", 0)), height:320 + parseInt(a.getLang("citation.delta_height", 0)), inline:1}, {plugin_url:b,poem_id:document.getElementById('poem_id').value})
        });
        a.addButton("citation", {title:"citation.desc", cmd:"mceCitation", image:b + "/img/icon-citation.png"});
        a.onNodeChange.add(function (d, c, e) {
            var len = c.editor.selection.getContent({format : 'text'}).length;
            var attr = e.getAttribute('data-citation');
            if (len > 0
                || attr != null
            ){
                c.setDisabled('citation',false);
            } else {
                c.setDisabled('citation',true);
            }
        })
    }, createControl:function (b, a) {
        return null
    }, getInfo:function () {
        return{longname:"Citation plugin", author:"Andrew Detwiler", version:"1.0"}
    }});
    tinymce.PluginManager.add("citation", tinymce.plugins.CitationPlugin)
})();