var _ = require('lodash')
var Ship = require('./ship');

var Game = function(gameId){
	this._players=[];
	this.gameID = gameId;
}

Game.prototype.addPlayer =function(player){
	this._players.push(player);
};

Game.prototype.numberOfPlayers = function(){
	return this._players.length;
}

Game.prototype.canStartPlaying = function(){
	var areAllPlayersReady = this._players.every(function(player){
		return player.isReady;
	});	
	return areAllPlayersReady && this._players.length == 2;
};

Game.prototype.currentPlayer = function(cookie){
	var player_who_requested;
	this._players.forEach(function(element){
		if(element.name == cookie.match(/[a-z]|\s/gi).join(''))
			player_who_requested = element;
	});
	return player_who_requested;
};

Game.prototype.enemyPlayer = function(cookie){
	var index = +(!this._players.indexOf(this.currentPlayer(cookie)));
	return this._players[index];
};

Game.prototype.is_any_player_died = function(){
	return this._players.some(function(player){
		return player.isAlive == false ;
	});
};

Game.prototype.isAllowedToBePlaced = function(size,align,firstPoint){
	var rows=['A','B','C','D','E','F','G','H','I','J'];
	var shipsize = size;
	if(align == "vertical"){
		var allowedRows = 10 - (shipsize - 1);
		if(rows.indexOf(firstPoint[0]) < allowedRows)
			return true;
		return false;
	}
	if(align == "horizontal"){
		var allowedColumn = 10 - (shipsize - 1);
		if(firstPoint.slice(1) <= allowedColumn)
			return true;
		return false;
	}
};

Game.prototype.positionShip = function(shipInfo,player){
	if(Game.prototype.isAllowedToBePlaced(shipInfo.shipSize,shipInfo.align,shipInfo.coordinate)){
		if(shipInfo.align=='vertical'){
			var initialCharCode = shipInfo.coordinate.charCodeAt(0);
			var tempCoordinates = makesCoordinates(shipInfo.shipSize,shipInfo.coordinate,initialCharCode);
		}
		else if(shipInfo.align == 'horizontal'){
			var initialColumnNumber = shipInfo.coordinate.slice(1);
			var tempCoordinates = makesCoordinates(shipInfo.shipSize,shipInfo.coordinate,initialCharCode,initialColumnNumber);
		};
		if(player.grid.isUsedSpace(tempCoordinates)){
				throw new Error('Cannot place over other ship.');
		};
		player.ships.push(new Ship(tempCoordinates));
		player.grid.usedCoordinates = player.grid.usedCoordinates.concat(tempCoordinates); 
		if(player.grid.usedCoordinates.length > 17){
			throw new Error('Ships already placed');
		};
		return;                                 
	};
	throw new Error('Cannot position ship here.');
};

Game.prototype.isHit = function(point,name) {
	var enemyPlayer = this.enemyPlayer(name);
	return enemyPlayer.grid.usedCoordinates.indexOf(point) !== -1;
};

Game.prototype.removeHitPoint = function(point,name) {
	var enemyPlayer = this.enemyPlayer(name);
	var hitShip = _.find(enemyPlayer.ships,function(eachShip){
		return eachShip.coordinates.indexOf(point) !== -1;
	});
	enemyPlayer.grid.usedCoordinates = removePointFromArray(enemyPlayer.grid.usedCoordinates,point);
	hitShip.coordinates = removePointFromArray(hitShip.coordinates,point);
	enemyPlayer.grid.destroyed.push(point);
	if(!hitShip.coordinates.length)
		hitShip.isAlive = 0;
}

Game.prototype.checkForAllShipsSunk = function(name) {
	var enemyPlayer = this.enemyPlayer(name);
	enemyPlayer.if_all_ship_sunk();
}

Game.prototype.placedShipsPosition = function(shipInfo,playerInfo) {
	var player = this.currentPlayer(playerInfo.name);
	this.positionShip(shipInfo,player);
	return player.grid.usedCoordinates;
}

Game.prototype.arePlayersReady = function(playerInfo) {
	var player = this.currentPlayer(playerInfo.name);
	if(player.grid.usedCoordinates.length == 17){
		player.isReady = true;
		this._players[0].turn = true;
		return this.canStartPlaying();
	}
	else return 'select more ships'
};

Game.prototype.reinitiatingUsedCoordinates = function(playerInfo) {
	var player = this.currentPlayer(playerInfo.name);
	player.grid.usedCoordinates = [];
}

Game.prototype.usedCoordinatesOfPlayer = function(playerInfo){
	var currentPlayer = this.currentPlayer(playerInfo.name);
	return currentPlayer.grid.usedCoordinates.slice(0);
}

Game.prototype.changeTurn = function(name) {
	var currentPlayer = this.currentPlayer(name);
	var enemyPlayer = this.enemyPlayer(name);
	currentPlayer.turn = false;
	enemyPlayer.turn = true;
}

Game.prototype.insert_point_into_hitPoints = function(attackPoint,name) {
	var player = this.currentPlayer(name);
	player.hits.push(attackPoint);
}

Game.prototype.insert_point_into_missPoints = function(attackPoint,name) {
	var player = this.currentPlayer(name);
	player.misses.push(attackPoint);
}

Game.prototype.playersStatus = function(player) {
	var currentPlayer = this.currentPlayer(player);
	var enemyPlayer = this.enemyPlayer(player);
	return {
		currentPlayerShips:shipsStatus(currentPlayer),
		enemyPlayerShips:shipsStatus(enemyPlayer),
		destroyedPoints:currentPlayer.grid.destroyed,
		missPoints:currentPlayer.misses,
		hitPoints:currentPlayer.hits,
		turn:currentPlayer.turn
	};
}

var shipsStatus = function(player) {
	var status = [];
	player.ships.forEach(function(eachShip){
		status.push(eachShip.isAlive);
	})
	return status;
}

var removePointFromArray = function(array,point) {
	return array.filter(function(eachPoint){
		return eachPoint !== point
	})
}

var makesCoordinates = function(size,firstPoint,initialCharCode,initialColumnNumber){
	var generatedCoordinates = [];
	for (var i = 0; i<size; i++){
		var coordinateToBePushed = initialCharCode != undefined ? (String.fromCharCode(initialCharCode++) + firstPoint.slice(1))
									: (firstPoint[0] + initialColumnNumber++);
		generatedCoordinates.push(coordinateToBePushed);
	};
	return generatedCoordinates;
};

Game.prototype.gameOver = function(){
	var player_who_lost = this._players[0].isAlive? this._players[1]: this._players[0];
	var player_who_won = this._players[0].isAlive? this._players[0]: this._players[1];
	var winnerStatus = shipsStatus(player_who_won);
	var result_of_game = {won:JSON.stringify(player_who_won),lost:JSON.stringify(player_who_lost),status:winnerStatus}
	return result_of_game;
};

module.exports = Game;