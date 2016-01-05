var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Observer = require('./observer.js');
var observer = new Observer();
var Grid =  require('./grid');

app.injectObserver =function(observer){
	app.observer = observer;
};


var reinitiate_usedCoordinates = function(req,res,next) {
	var game = observer.gameOfCurrentPlayer(req.cookies.gameId);
	game.reinitiatingUsedCoordinates(req.cookies);
	next();
};

var setPlayerCookie = function(req,res) {
	res.cookie('name',req.body.name);	
	res.cookie('gameId', observer.games[observer.games.length-1].gameID);
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use("/shipPlacingPage.html",reinitiate_usedCoordinates);
app.use(express.static('./public'));


app.post('/player',function(req,res){
	observer.allocatePlayer(req.body.name,new Grid());
	setPlayerCookie(req,res);
	res.redirect('/shipPlacingPage.html');
});

app.post('/placingOfShip',function(req,res){
	var game = observer.gameOfCurrentPlayer(req.cookies.gameId);
	res.send(game.placedShipsPosition(req.body,req.cookies));
});

app.get('/makeReady',function(req,res){
	var game = observer.gameOfCurrentPlayer(req.cookies.gameId);
	res.send(game.arePlayersReady(req.cookies));
});

app.get('/usedSpace',function(req,res){
	var game = observer.gameOfCurrentPlayer(req.cookies.gameId);
	res.send(game.usedCoordinatesOfPlayer(req.cookies));
});

app.post('/attack',function(req,res){
	var attackedPoint = req.body.point;
	var playerName = req.cookies.name;
	var game = observer.gameOfCurrentPlayer(req.cookies.gameId);
	if(game.isHit(attackedPoint,playerName)){
		game.removeHitPoint(attackedPoint,playerName);
		game.checkForAllShipsSunk(playerName)
		game.insert_point_into_hitPoints(attackedPoint,playerName);
	}
	else
		game.insert_point_into_missPoints(attackedPoint,playerName);
	game.changeTurn(playerName);
	res.send('success');
});

app.get('/givingUpdate',function(req,res){
	var update = {};
	var game = observer.gameOfCurrentPlayer(req.cookies.gameId);
	var status = game.playersStatus(req.cookies.name);
	update = {
			ownStatusTable    : {table:'ownStatusTable',stat:status.currentPlayerShips},
			enemyStatusTable  : {table:'enemyStatusTable',stat:status.enemyPlayerShips},
			ownHit            : {table:'own',stat:status.destroyedPoints,color:'red'},
			enemyMiss         : {table:"enemy",stat:status.missPoints,color:"paleturquoise"},
			enemyHit          : {table:"enemy",stat:status.hitPoints,color:"red"},
			isGameOver        : game.is_any_player_died(),
			isTurn            : status.turn
	}
	res.send(update);
});

app.get('/gameOver',function(req,res){
	var game = observer.gameOfCurrentPlayer(req.cookies.gameId);
	var stat = game.gameOver();
		res.send(stat);
});

app.injectObserver(observer);

module.exports = app;