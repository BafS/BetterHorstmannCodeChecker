var urlBase = 'http://cs14.cs.sjsu.edu:8080/';
var url = '';
var btn = document.getElementById('submit');
btn.disabled = true;
var exercie = {};
var codeArea = document.getElementById("code");

function submit() {

	btn.disabled = true;

	exercie.code = editor.getValue();
	// console.log(exercie);

	$.post('/' + codeArea.getAttribute('name'),
		exercie, 
		function(res) {
			btn.disabled = false;
			document.getElementById('result').innerHTML = res;
		}
	);
}

function getExo(url) {
	$.get('/' + url.replace('?', '__'), function(res) {
		btn.disabled = false;
		editor.setValue(res.code);
		codeArea.setAttribute('name', res.name);
		// console.log(res.code);
	});
}

var getUrlInfo = function(href) {
	var l = document.createElement("a");
	l.href = href;
	return l;
};

function getParameterByName(url, name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(url);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

$(document).ready(function() {
	var urlInput = $("#urlInput");
	urlInput.on('change', function(e) {
		url = $(this).val();
		var urlInfo = getUrlInfo(url);

		// console.log(urlInfo.search);
		exercie.repo = getParameterByName(urlInfo.search, 'repo');
		exercie.problem = getParameterByName(urlInfo.search, 'problem');

		if(exercie.repo === null || exercie.problem === null) {
			alert('URL not valid !');
		} else {
			getExo(url);
		}
	});
});

var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
	extraKeys: {"Ctrl-Space": "autocomplete"},
	lineNumbers: false,
	viewportMargin: Infinity,
	matchBrackets: true,
	theme: 'neo',
	// mode: {globalVars: true}
	// mode: {name: "text/x-java"}
	// mode: {name: "text/x-java", globalVars: true}
		// styleActiveLine: true,
	  // lineWrapping: true
});
