// ==UserScript==
// @name        BibliotecaUniversitaria
// @namespace   inutil
// @include     http://cruzeirodosul.bv3.digitalpages.com.br/users/publications/*
// @version     1
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.0/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js
// @grant       GM_xmlhttpRequest
// ==/UserScript==


//Avoid conflicts7
this.$ = this.jQuery = jQuery.noConflict(true);

(function () {
var css = [
    '#savePNG {',
    '    position: fixed;',
    '    padding: 7px;',
    '    background-color: #e2e0e0;',
    '    border: 2px solid #333;',
    '    border-radius: 6px;',
    '    z-index: 9999;',
    '    font-size: 18px;',
    '    right: 30px;',
    '    bottom: 20px;',
    '    color: #000;',    
    '    width: 650px;',      
    '    text-align: center;',       
    '    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 0, 0, 0.3);',
    '}',
    '#savePNG button {',  
    '    font-size: 18px;', 
    '    border: none;',  
    '    background-color: #008CBA;',  
    '    color: white;', 
    '    width: 100px;',
    '    cursor: pointer;',    
    '}',    
    '#savePNG input {',    
    '    width: 60px;',  
    '    font-size: 18px;',    
    '    text-align: center;',        
    '}',
    'input[type=text] {',
    '     width: 100%;',
    '     padding: 0px;',
    '     margin: 8px 0;',
    '     box-sizing: border-box;',
    '}'     
  ].join('\n');
  if (typeof GM_addStyle != 'undefined') {
    GM_addStyle(css);
  } else if (typeof PRO_addStyle != 'undefined') {
    PRO_addStyle(css);
  } else if (typeof addStyle != 'undefined') {
    addStyle(css);
  } else {
    var node = document.createElement('style');
    node.type = 'text/css';
    node.appendChild(document.createTextNode(css));
    var heads = document.getElementsByTagName('head');
    if (heads.length > 0) {
      heads[0].appendChild(node);
    } else {
      // no head yet, stick it whereever
      document.documentElement.appendChild(node);
    }
  }
}) ();

var html = '<div id="savePNG">' + 
    'Total de Páginas:' + 
    '<span id=total></span> ' + 
    'Processando: ' + 
    '<span id=count></span> ' + 
    '<span>.</span> ' +
    '<button>Capturar</button>' +
    '<br>Limitar a <input type=text id=limite> Página(s)' +
    ' - <a id=countPag> Total de Páginas</a>' +
    '<div style="float:right;font-size: 10px;" >Inútil</div>' +
    '</div>';

$('body').prepend(html);


var zipname;
var zip = new JSZip();

$('#savePNG button').click(function(){
  salvar();
});

$('a#countPag').click(function(){
  alert($('ul.list_box li').length);
});

function addIMG(url, name) {
  var filename = name + '.jpg';
  GM_xmlhttpRequest({
    method: 'GET',
    synchronous: true,
    url: url,
    overrideMimeType: 'image/jpg; charset=x-user-defined',
    onreadystatechange: function(res) {
      // alert("Request state changed to: " + res.readyState);
  },
    onload: function (response) {
      zip.file(filename, response.responseText, {
        binary: true
      });
    }
  });
}

function saveZip(nameFile) {
  zipname = nameFile + '.zip';
  var blob = zip.generate({type: "blob"});
  saveAs(blob, zipname);
}

function proximaPag(){
  $('.btn_nav_right').click();
}

function pegaPag(){
	var cont = 0; 
	if($(".backgroundImg")[0] !== undefined){
        url = $(".backgroundImg")[0].src;
        id = $(".backgroundImg")[0].src.split('/')[10].substring(16,23);
        addIMG(url, id);
        cont++;
    }

    if($(".backgroundImg")[1] !== undefined){
        url = $(".backgroundImg")[1].src;
        id = $(".backgroundImg")[1].src.split('/')[10].substring(16,23);
        addIMG(url, id);
        cont++;
    }
    return cont;
}

	
function salvar(){
	var i = 0;
	//var totPage = $('ul.list_box li').length;
  var totPage = 100;
	var download = window.location.href.split('/')[5];

  if($('#limite').val().length != 0){
    totPage = $('#limite').val();
  }

	$('#total').html(totPage);

	var time = setInterval(function(){

		if(i == 0){
			    i+=pegaPag();
			    $('#count').html(i.toString());
		}
		
		if(i > totPage){
			clearInterval(time);
			alert('Download do arquivo');
			saveZip(download+"-"+totPage);
			return false;
		}

		$.ajax({
			dataType: 'html',
			async: false,
			url: proximaPag()
		}).done(function(data){
			window.setTimeout(function() {
			    i+=pegaPag();
			    $('#count').html(i.toString());
			}, 2000);
		});

	}, 10*1000);

}
