tinyMCEPopup.requireLangPack();

var isError = false;

function isURL(s){
    return ! String(s).replace(
        /^https?\:\/\/(www{2})?/i , "").replace(
        /^[\w.\-]+?[\w/:]?/,"").replace(
        /^\w[\w\W]*/g,"" );
}

var CitationDialog = {
    init : function() {
        var f = document.forms[0];
        var s = document.getElementById('selText');
        var sel = tinyMCEPopup.editor.selection;
        var poem_citation_id = 0;
        if ($(sel.getNode()).is('span')) {
            poem_citation_id = $(sel.getNode()).attr('data-citation');
        }
        tinymce.util.XHR.send({
            type: 'POST',
            url: '/ajax/getCitation/'+poem_citation_id+'/',
            content_type : "application/x-www-form-urlencoded",
            success: function( data ) {
                var json = $.parseJSON(data);
                if (json.type == "success") {
                    $('#citationForm').remove();
                    $('#selected').remove();
                    $('#citText').html(json.citation)
                    $('#citation').show();
                    $('#insert').remove();
                } else {
                    $('#citationForm').show();
                    $('#citation').remove();
                    $('#remove').remove();
                    s.innerHTML = sel.getContent({format : 'text'});
                }
                $('#loader').remove();
                $('.content').show();
            }
        });
    },
    insert : function() {
        $('.error').hide();
        var poem_id = tinyMCEPopup.getWindowArg('poem_id');
        var f = document.forms[0];
        var inst = tinyMCEPopup.editor;
        var cit = new Object();

       if (f.title.value == '') {
            alert ('Title is required.');
            return false;
        }
        if (f.author.value == '') {
            alert('Author is required.');
            return false;
        }

        var pURL = document.getElementById('pURL');
        var pBM = document.getElementById('pBM');
        var radioButtonList = document.getElementsByName('option');
        var selVal;
        var invalid = false;

        for (var x = 0; x < radioButtonList.length; x++) {
            if (radioButtonList[x].checked) {
                selVal = radioButtonList[x].value;
                if (radioButtonList[x].value != 'bm'
                    && radioButtonList[x].value != "url"
                    && radioButtonList[x].value != "other"
                ){
                    invalid = true;
                }
            }
        }
        if (invalid) {
            alert("Options is required.");
            return false;
        }

        cit.title = f.title.value;
        cit.author = f.author.value;
        cit.option = selVal;

        if (selVal == "url") {
            var poemURL = document.getElementById('poemURL').value;
            if (poemURL == "") {
                alert("Poem URL is required.");
                return false;
            } else if (!isURL(poemURL)) {
                alert("Poem URL is invalid.");
                return false;
            }
            cit.poem_url = poemURL;
        }
        if (selVal == "bm") {
            var BMTitle = document.getElementById('BMTitle').value;
            var BMpp = document.getElementById('BMpp').value;
            if (BMTitle == "") {
                alert("Book/Magazine Title is required.");
                return false;
            }
            if (BMpp == "") {
                alert("Book/Magazine Page Number(s) is required.");
                return false;
            }
            cit.bm_title = BMTitle;
            cit.bm_pp = BMpp;
        }

        tinymce.util.XHR.send({
            type: 'POST',
            url: '/ajax/cite/'+poem_id+'/',
            content_type : "application/x-www-form-urlencoded",
            data: "json="+tinymce.util.JSON.serialize(cit),
            success: function( data ) {
                var json = $.parseJSON(data);
                if (json.type == 'error') {
                    $('.error').html(json.message);
                    $('.error').show();
                    return false;
                } else {
                    inst.focus();
                    inst.execCommand('mceInsertContent', false, inst.dom.createHTML('span',{class: 'citation','data-citation' : json.citation_id},inst.selection.getContent({format : 'text'})));
                    inst.execCommand('mceInsertContent', false, '&nbsp;');

                    tinyMCEPopup.close();
                    return;
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                var err;
                if (textStatus !== "abort" && errorThrown !== "abort") {
                    try {
                        err = $.parseJSON(jqXHR.responseText);
                        alert(err.Message);
                    } catch(e) {
                        alert("ERROR:\n" + e.responseText);
                    }
                }
            }
        });

        return;
    },

    remove : function() {
        var sel = tinyMCEPopup.editor.selection;
        var poem_citation_id = 0;
        if ($(sel.getNode()).is('span')) {
            poem_citation_id = $(sel.getNode()).attr('data-citation');
        }
        tinymce.util.XHR.send({
            type: 'POST',
            url: '/ajax/removeCitation/'+poem_citation_id+'/',
            content_type : "application/x-www-form-urlencoded",
            success: function( data ) {
                var inst = tinyMCEPopup.editor;
                $(sel.getNode()).removeClass('citation');
                $(sel.getNode()).removeAttr('data-citation');
                tinyMCEPopup.close();
            }
        });

        return;
    },

    checkOpts : function() {
        var pURL = document.getElementById('pURL');
        var pBM = document.getElementById('pBM');
        var radioButtonList = document.getElementsByName('option');

        for (var x = 0; x < radioButtonList.length; x++) {
            if (radioButtonList[x].checked) {
                if (radioButtonList[x].value == 'bm') {
                    pURL.style.display="none";
                    pBM.style.display="block";
                } else if(radioButtonList[x].value == 'url') {
                    pURL.style.display="block";
                    pBM.style.display="none";
                } else {
                    pURL.style.display="none";
                    pBM.style.display="none";
                }
            }
        }
    }
};

tinyMCEPopup.onInit.add(CitationDialog.init, CitationDialog);
