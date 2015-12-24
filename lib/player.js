var lib = require('./battleShip.js').lib;
var Ship = require('./ship');
var Player = function(name,grid){
	this.name = name;
	this.grid = grid;
	this.ships = [];
	this.misses = [];
	this.hits = [];
	this.isAlive = true;
	this.isReady = false;
	this.turn = false;
};

Player.prototype.list_of_isAlive_of_each_ship = function(){
	return this.ships.map(function(element){
		return element.isAlive;
	});
};

Player.prototype.addShips = function(ship) {
	this.ships.push(ship);
}

Player.prototype.if_all_ship_sunk = function(){
	var are_all_ships_sunk = (this.list_of_isAlive_of_each_ship()).every(function(status){
		return status == 0;
	});
	if(are_all_ships_sunk){
		this.isAlive = false;
	}
};

Player.prototype.if_it_is_Hit = function(attackPoint){
	if(lib.isHit(this.grid.usedCoordinates,attackPoint)){
		this.grid.usedCoordinates = lib.removingHitPointFromExistingCoordinates(this.grid.usedCoordinates,attackPoint);
		this.grid.destroyed.push(attackPoint);
		this.ships.forEach(function(ship){
			ship.if_ship_is_Hit(attackPoint);
		});
		this.if_all_ship_sunk();
		return 1;
	};
	return 0;    
};





module.exports = Player;