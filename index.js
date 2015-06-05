var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var Entities = require('html-entities').AllHtmlEntities;
entities = new Entities();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

var urlPost = "http://cs14.cs.sjsu.edu:8080/codecheck/check";

var getNet = function(url, cb) {
	if(url !== null && url.length < 6) return;

	var request = http.get(url, function(resp) {
        var body = '';

        resp.on('data', function(d) {
            body += d;
        });
        resp.on('end', function() {
			cb(body);
        });
	});
};

app.get('/', function (req, res) {
	var baseHtml = fs.readFileSync('base.html', 'utf8');
	res.send(baseHtml);
});

app.get('/:href(*)/', function (req, res) {
	var url = req.params.href.replace('__', '?');

	getNet(url, function(html) {
		var re = /<textarea.*name="([A-Za-z_\-0-9\.]+)".*>([\S\s]+)<\/textarea>/g;
		var regRes = re.exec(html);

		if(regRes === null || regRes.length < 3) {
			console.error("ERR: Can't regex this url\n");
			return;
		}

		var data = {
			'code' : entities.decode(regRes[2]),
			'name' : regRes[1]
		};

		res.send(data);
	});
});

app.post('/:name', function(req, res) {
	var name = req.params.name;
	
	var form = {
		level: 'check'
	};
	form[name] = req.body.code;
	form.repo = req.body.repo;
	form.problem = req.body.problem;

	var headers = {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
	};

	request.post(
		{
			url: urlPost,
			form: form,
			headers: headers
		}, 
		function(err, httpResponse, body) {
			if(err) {
				console.error(err);
			}
			
			var locationUrl = httpResponse.headers.location;
			getNet(locationUrl, function(html) {
				html = html.replace(/="([\w+_\.\-]+)">Download/g, '="' + locationUrl.replace('report.html', '') + '$1" class="dl">DOWNLOAD');
				res.send(html);
			});
		});
});

var server = app.listen(1337, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});

// TODO - Workaround ECONNREFUSED
process.on('uncaughtException', function(err) {
	// console.log(err);
});
