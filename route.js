var fs = require('fs');
var querystring = require('querystring');
var lib = require('./battleShip.js');
var method_not_allowed = function(req, res){
	res.statusCode = 405;
	console.log(res.statusCode);
	res.end('Method is not allowed');
};

var currentPlayer = function(players,cookie){
	var player_who_requested;
	players.forEach(function(element){
		if(element.name == cookie){
			player_who_requested = element;
		};
	});
	return player_who_requested;
};

var enemyPlayer = function(players,cookie){
	var index = +(!players.indexOf(currentPlayer(players,cookie)));
	return players[index];
}

var checkAndSubmit = function(req,res){
	var data = '';
	req.on('data', function(chunk){
		data += chunk;
	});
	req.on('end', function(){
		var args = data.split(" ");
		var name = args[0];
		var shipIndex = args[1];
		var startingPoint = args[2];
		var align = args[3];
		var player = currentPlayer(lib.players,req.headers.cookie);
		lib.positionShip(player.ships[shipIndex],align,startingPoint,player.grid);
		res.end(JSON.stringify(player.grid.usedCoordinates));
	});
}


var createPlayer = function(req, res){
	var data = '';
	req.on('data', function(chunk){
		data += chunk;
	});
	req.on('end', function(){
		var entry = querystring.parse(data);
		lib.players.push(new lib.Player(entry.name));
		res.writeHead(200,
			{'Set-Cookie':entry.name});
		res.end(JSON.stringify(entry.name))
	});
};

var serveIndex = function(req, res, next){
	req.url = '/index.html';
	next();
};

var showDetails = function(req,res) {
	res.end(JSON.stringify(lib.players));
}

var serveStaticFile = function(req, res, next){
	var filePath = './public' + req.url;
	fs.readFile(filePath, function(err, data){
		if(data){
			res.statusCode = 200;
			console.log(res.statusCode);
			res.end(data);
		}
		else{
			next();
		}
	});
};

var usedSpace = function(req,res){
	var player=currentPlayer(lib.players,req.headers.cookie);
	res.end(JSON.stringify(player.grid.usedCoordinates))
};


var areBothReady = function(){
	return lib.players.every(function(player){
		return player.isReady;
	});	
};


var routingToGame = function(req,res){
	var player = currentPlayer(lib.players,req.headers.cookie);
	player.isReady=true;
	lib.players[0].turn = true;
	res.end(Number(areBothReady()&&lib.players.length == 2).toString());
};

var checkAttackedPoint = function(req,res) {
	var attackPoint = '';
	var mySelf = currentPlayer(lib.players,req.headers.cookie);
	var enemy = enemyPlayer(lib.players,req.headers.cookie);
	if(mySelf.turn){
		req.on('data',function(chunk){
			attackPoint+=chunk;
		})
		// emitter.emit(lib.isHit(attackPoint,enemy))
		console.log('entered')
		mySelf.turn =false;
		enemy.turn = true;
	}
	res.end()
};

var fileNotFound = function(req, res){
	res.statusCode = 404;
	console.log(req.url);
	res.end('Not Found');
};

exports.post_handlers = [
	{path: '^/player$', handler: createPlayer},
	{path:'^/placingOfShip$',handler:checkAndSubmit},
	{path:'^/attack$',handler:checkAttackedPoint},
	{path: '', handler: method_not_allowed}
];
exports.get_handlers = [

	{path: '^/$', handler: serveIndex},
	{path: '^/show$', handler: showDetails},
	{path: '^/usedSpace$',handler:usedSpace},
	{path:'^/makeReady$',handler:routingToGame},
	{path: '', handler: serveStaticFile},
	{path: '', handler: fileNotFound}
];
