#! /usr/local/bin/node

// express
var express = require('express');
var app = express();

app.use(express.static('client'));

var http = require('http').Server(app);
var port = 3000;

http.listen(port, function() {
    console.log('listening on port ' + port);
});
