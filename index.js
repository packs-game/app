var express = require('express');
var path = require('path');
var app = express();
var services = require('../../lib/services');

app.use(express.static(path.join(__dirname , './dist')));
app.get('/services.json', function(req,res){
	res.json(services);
});

app.listen(3001);