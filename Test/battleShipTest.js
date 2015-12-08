var assert = require('chai').assert;
var expect = require('chai').expect;
var lib = require('../battleShip.js');
var test = {};
exports.test = test; 

describe('Ship',function(){
	var player = new lib.Player('ram');
	it('should initialize ship object',function(){	
		expect(player.ships[0]).to.be.a('object');
	});
	it('returned ship must have only coordinates with null values',function(){
		expect(player.ships[2]).to.have.all.keys({coordinates:[null,null,null]});
	});
});

describe('isAllowed',function(){
	var player = new lib.Player('ram');
	it('should check if the firstpoint is valid for placing ship aligned vertical',function(){
		assert.equal(true,lib.lib.isAllowed(player.ships[0],"vertical","B9",new lib.lib.gridCreater())); 
		assert.equal(false,lib.lib.isAllowed(player.ships[0],"vertical","I9",new lib.lib.gridCreater())); 
	});
	it('should check if the firstpoint is valid for placing ship aligned horizontal',function(){
		assert.equal(true,lib.lib.isAllowed(player.ships[0],"vertical","B9",new lib.lib.gridCreater())); 
		assert.equal(false,lib.lib.isAllowed(player.ships[0],"vertical","I9",new lib.lib.gridCreater())); 
	});
});

describe('gridCreater',function(){
	it('should have initially no used coordinate',function(){
		var grid = new lib.lib.gridCreater();
		expect(grid).to.have.property('usedCoordinates').that.is.an('array').to.be.empty;
	})
})

describe('isUsedSpace',function(){
	var grid = new lib.lib.gridCreater();
	var player = new lib.Player('ram');
	it('should return true if coordinate exists in used coordinates',function(){
		grid.usedCoordinates = ['A1'];
		player.ships[3].coordinates = ['A1','A2','A3'];
		assert.equal(true,grid.isUsedSpace(player.ships[3].coordinates));
	});
	it('should return false if coordinate does not exists in used coordinates',function(){
		grid.usedCoordinates = ['B2'];
		assert.equal(false,grid.isUsedSpace(player.ships[0].coordinates));
	});
});

describe('positionShip',function(){
	var player = new lib.Player('ram');
	var grid = new lib.lib.gridCreater();
	it('should position the ship and return ship with some filled coordinates for vertical',function(){
		var align='vertical';
		firstpoint = 'A4';
		var expected = {coordinates:['A4','B4','C4']}
		lib.positionShip(player.ships[2],align,firstpoint,grid);
		assert.equal(JSON.stringify(expected),JSON.stringify(player.ships[2]));
	});
	it('should position the ship and return ship with some filled coordinates for horizontal',function(){
		var align='horizontal';
		firstpoint = 'A1';
		var expected = {coordinates:['A1','A2','A3']}
		lib.positionShip(player.ships[3],align,firstpoint,grid);
		assert.equal(JSON.stringify(expected),JSON.stringify(player.ships[3]));
	});
	it('should return error if the ship cannot be placed',function(){
		var player = new lib.Player('ram');
		var align='vertical';
		firstpoint = 'I4';
		var boundFunction = lib.positionShip.bind(null,player.ships[3],align,firstpoint,grid);
		assert.throw(boundFunction,Error,'Cannot position ship here.');
	});
	it('should return error if the ship cannot be placed over used space and expect ship to be unchanged',function(){
		var align='vertical';
		firstpoint = 'B4';
		grid.usedCoordinates = ['C4'];
		var boundFunction = lib.positionShip.bind(null,player.ships[2],align,firstpoint,grid);
		assert.throw(boundFunction,Error,'Cannot place over other ship.');
		expect(player.ships[2]).to.have.all.keys({coordinates:[null,null,null]});
	});
});
describe('makesCoordinate',function(){
	var player = new lib.Player('ram');
	it('should check when initilCharCode is undefined and gives new generated coordinates',function(){
		firstpoint = 'A4';
		var initilColumnNumber = firstpoint.slice(1);
		var expected = ['A4','A5','A6'];
		assert.equal(JSON.stringify(expected),JSON.stringify(lib.lib.makesCoordinates(player.ships[3],firstpoint,undefined,initilColumnNumber)));
	});
	it('should check when initilCharCode is defined and gives new generated coordinates',function(){
		firstpoint = 'A4';
		var initilCharCode = firstpoint.charCodeAt(0);
		var initilColumnNumber = firstpoint.slice(1);
		var expected = ['A4','B4','C4'];
		assert.equal(JSON.stringify(expected),JSON.stringify(lib.lib.makesCoordinates(player.ships[2],firstpoint,initilCharCode,initilColumnNumber)));
	});
});

describe('PlayerCreator',function(){
	var player = new lib.Player('ram');
	it('should make player object',function(){
		expect(player).to.be.a('object')
	});
	it('player object should have some properties',function(){
		expect(player).to.have.all.keys('name','ships','grid','isReady','turn','hits','misses','isAlive');
	});
	it('player object initially should have "isReady" as false',function(){
		assert.equal(false,player.isReady);
	});
	it('player object initially should have "turn" as false',function(){
		assert.equal(false,player.turn);
	});
	it('player object should have array of ships with length 5',function(){
		expect(player.ships).to.be.a('array');
		assert.equal(5,player.ships.length);
	});
});

describe('CheckingIsHit',function(){
	it('should return true if attackPoint is present in groupOfCoordinates',function(){
		var result = lib.lib.isHit(['A1','A2','A3'],'A1');
		assert.equal(true,result);
	});
	it('should return false if attackPoint is not present in groupOfCoordinates',function(){
		assert.equal(false,lib.lib.isHit(['B1','C1','D1'],'A2'));
	});
	it('should return false if groupOfCoordinates is empty',function(){
		assert.equal(false,lib.lib.isHit([],'F1'));
	});
});

describe('removingHitPointFromExistingCoordinates',function(){
	it('should return a new array by removing hitPoint',function(){
		var result = lib.lib.removingHitPointFromExistingCoordinates(['A1','A2','D1','F3'],'F3');
		assert.deepEqual(['A1','A2','D1'],result);
	});
	it('should return the same array if the hitPoint is not present in existingCoordinates',function(){
		var result = lib.lib.removingHitPointFromExistingCoordinates(['D1','D2','D3','A1','A2'],'F1');
		assert.deepEqual(['D1','D2','D3','A1','A2'],result);
	});
});

describe('CheckAndSwitchIsAlive',function(){
	var player = new lib.Player('ram');
	it('should change isAlive property of ship to 0 when the ship sunks',function(){
		player.ships[0].coordinates.length = 0;
		lib.lib.checkAndSwitchIsAlive(player.ships[0]);
		assert.equal(0,player.ships[0].isAlive);
	});
	it('should not change isAlive property of ship if the ship has coordinates',function(){
		lib.lib.checkAndSwitchIsAlive(player.ships[2]);
		assert.equal(1,player.ships[2].isAlive);
	});
});

describe('List_of_isAlive_of_each_ship',function(){
	var player = new lib.Player('ramu');
	it('should return an array with every ships alive property',function(){
		var result = lib.lib.list_of_isAlive_of_each_ship(player.ships);
		assert.deepEqual([1,1,1,1,1],result);
	});
	it('should return an array which contains 0 when any of the ships sunk',function(){
		player.ships[0].isAlive = 0;
		player.ships[3].isAlive = 0;
		var result = lib.lib.list_of_isAlive_of_each_ship(player.ships);
		assert.deepEqual([0,1,1,0,1],result);
	});
	it('should return array of 0s when all ships sunk',function(){
		player.ships[0].isAlive = 0;
		player.ships[1].isAlive = 0;
		player.ships[2].isAlive = 0;
		player.ships[3].isAlive = 0;
		player.ships[4].isAlive = 0;
		var result = lib.lib.list_of_isAlive_of_each_ship(player.ships);
		assert.deepEqual([0,0,0,0,0],result);
	});
});

describe('gameOver',function(){
	var player1 = new lib.Player('ram');
	var player2 = new lib.Player('manu');
	it('should return an object with player1 won and player2 lost when player2 loses the game',function(){
		lib.players[0] = player1;
		lib.players[1] = player2;
		var result = lib.lib.gameOver(player2);
		expect(result).to.equal('{"won":"ram","lost":"manu"}');
	});
	it('should return an object with player2 won and player1 lost when player1 loses the game',function(){
		lib.players[0] = player1;
		lib.players[1] = player2;
		var result = lib.lib.gameOver(player1);
		expect(result).to.equal('{"won":"manu","lost":"ram"}')
	});
	it('should remove players from players array after gameOver',function(){
		lib.players[0] = player1;
		lib.players[1] = player2;
		lib.lib.gameOver(player1);
		expect(lib.players.length).to.equal(0);
	});
});

describe('if_it_is_Hit',function(){
	var player = new lib.Player('ram');
	player.ships[0].coordinates = ['A1','A2','A3','A4','A5'];
	player.ships[1].coordinates = ['D6','D7','D8','D9'];
	player.ships[2].coordinates = ['B5','C5','D5'];
	player.ships[3].coordinates = ['E3','E4','E5'];
	player.ships[4].coordinates = ['H1','H2'];
	player.grid.usedCoordinates = ['A1','A2','A3','A4','A5','D6','D7','D8','D9','B5','C5','D5','E3','E4','E5','H1','H2'];
	it('should return 1 if it is hit',function(){
		var result = lib.lib.if_it_is_Hit('A2',player);
		expect(result).to.equal(1);
	});
	it('should return 0 if it is not hit',function(){
		var result = lib.lib.if_it_is_Hit('J1',player);
		expect(result).to.equal(0);
	});
	it('should remove attackPoint from uesdCoordinates when is is a hit',function(){
		lib.lib.if_it_is_Hit('A1',player);
		var expected = ['A3','A4','A5','D6','D7','D8','D9','B5','C5','D5','E3','E4','E5','H1','H2'];
		assert.deepEqual(player.grid.usedCoordinates,expected);	
	});
	it('should not remove any coordinate from usedCoordinates if it is not a hit',function(){
		lib.lib.if_it_is_Hit('B7',player);
		var expected = ['A3','A4','A5','D6','D7','D8','D9','B5','C5','D5','E3','E4','E5','H1','H2'];
		assert.deepEqual(player.grid.usedCoordinates,expected);	
	});
	it('should push the coordinate to destroyed field if it is a hit',function(){
		lib.lib.if_it_is_Hit('A4',player);
		var result = player.grid.destroyed;
		var expected = ['A2','A1','A4'];
		assert.deepEqual(result,expected);
	});
	it('should not push the coordinate to destroyed field if it is not a hit',function(){
		lib.lib.if_it_is_Hit('J10',player);
		var result = player.grid.destroyed;
		var expected = ['A2','A1','A4'];
		assert.deepEqual(result,expected);
	});
});

describe('if_ship_is_Hit',function(){
	var player = new lib.Player('ram');
	player.ships[0].coordinates = ['A1','A2','A3','A4','A5'];
	player.ships[1].coordinates = ['D6','D7','D8','D9'];
	player.ships[2].coordinates = ['B5','C5','D5'];
	player.ships[3].coordinates = ['E3','E4','E5'];
	player.ships[4].coordinates = ['H1','H2'];
	it('should remove the attackpoint from coordinates of ship when it is a hit',function(){
		lib.lib.if_ship_is_Hit(player.ships[0],'A1');
		var result = player.ships[0].coordinates;
		assert.deepEqual(result,['A2','A3','A4','A5']);
	});
	it('should not remove any coordinates when it is not a hit',function(){
		lib.lib.if_ship_is_Hit(player.ships[3],'A1');
		var result = player.ships[3].coordinates;
		assert.deepEqual(result,['E3','E4','E5']);
	});
	it('should change isAlive property to false when the ship sunk',function(){
		lib.lib.if_ship_is_Hit(player.ships[4],'H1');
		lib.lib.if_ship_is_Hit(player.ships[4],'H2');
		var result = player.ships[4].isAlive;
		expect(result).to.equal(0);
	});
	it('should not change isAlive property when ship is not sunk',function(){
		lib.lib.if_ship_is_Hit(player.ships[2],'D6');
		var result = player.ships[2].isAlive;
		expect(result).to.equal(1);
	});
});

describe('if_all_ship_sunk',function(){
	var player = new lib.Player('ram');
	it('should not change isAlive of player even one ship is not sunk',function(){
		lib.lib.if_all_ship_sunk(player);
		var result = player.isAlive;
		expect(player.isAlive).to.equal(true);
	});
	it('should change isAlive of player to false when every ship sunks',function(){
		player.ships[0].isAlive = 0;
		player.ships[1].isAlive = 0;
		player.ships[2].isAlive = 0;
		player.ships[3].isAlive = 0;
		player.ships[4].isAlive = 0;
		lib.lib.if_all_ship_sunk(player);
		var result = player.isAlive;
		expect(player.isAlive).to.equal(false);
	});
});

describe('currentPlayer',function(){
	var player1 = new lib.Player('ram');
	var player2 = new lib.Player('manu');
	it('should return the player who has the turn to play',function(){
		lib.players[0] = player1;
		lib.players[1] = player2;
		var result = lib.lib.currentPlayer(lib.players,'ram');
		expect(result).to.equal(player1);
	});
});

describe('enemyPlayer',function(){
	var player1 = new lib.Player('ram');
	var player2 = new lib.Player('manu');
	it('should return the player who is waiting to the turn to play',function(){
		lib.players[0] = player1;
		lib.players[1] = player2;
		var result = lib.lib.enemyPlayer(lib.players,'manu');
		expect(JSON.stringify(result)).to.equal(JSON.stringify(player1));
	});
});

describe('areBothReady',function(){
	var player1 = new lib.Player('ram');
	var player2 = new lib.Player('manu');
	it('should return false when both players are not ready',function(){
		lib.players[0] = player1;
		lib.players[1] = player2;
		var result = lib.lib.areBothReady();
		expect(result).to.equal(false);
	});
	it('should return false when anyone is not ready',function(){
		lib.players[0] = player1;
		lib.players[1] = player2;
		player1.isReady = true;
		var result = lib.lib.areBothReady();
		expect(result).to.equal(false);
	});
	it('should return true when both players are ready',function(){
		lib.players[0] = player1;
		lib.players[1] = player2;
		player1.isReady = true;
		player2.isReady = true;
		var result = lib.lib.areBothReady();
		expect(result).to.equal(true);
	});
});

describe('if_a_player_dies',function(){
	var player1 = new lib.Player('ram');
	var player2 = new lib.Player('manu');
	it('should return false when both players are alive',function(){
		lib.players[0] = player1;
		lib.players[1] = player2;
		var result = lib.lib.if_a_player_dies(lib.players);
		expect(result).to.equal(false);
 	});
 	it('should return true even one player dies',function(){
 		lib.players[0] = player1;
		lib.players[1] = player2;
 		player1.isAlive = false;
 		var result = lib.lib.if_a_player_dies(lib.players);
 		expect(result).to.equal(true);
 	});
 	it('should return true when both player are died',function(){
 		lib.players[0] = player1;
		lib.players[1] = player2;
 		player1.isAlive = false;
 		player2.isAlive = false;
 		var result = lib.lib.if_a_player_dies(lib.players);
 		expect(result).to.equal(true);
 	});
});
