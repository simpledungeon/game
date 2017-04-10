var seed = Math.random();
//seed = 0.4208764691450697
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

const MAP_WIDTH = 35; // Start Size
const MAP_HEIGHT = MAP_WIDTH;                              //ALWAYS 100
const MAX_MAP_SIZE = 100;

//type 1
/*const MIN_NUMBER_OF_ROOMS = MAP_WIDTH/5; //10              //TYPE 1: 20 TYPE 2:  50
const MAX_NUMBER_OF_ROOMS = MAP_WIDTH/2; //25..75          //TYPE 1: 50 TYPE 2: 200
const MIN_ROOM_WIDTH = 8; //CANNOT BE LESS THAN 4!         //TYPE 1:  8 TYPE 2:   5
const MAX_ROOM_WIDTH = 15;//25;                                 //TYPE 1: 25 TYPE 2:  15
const MIN_ROOM_HEIGHT = 8; //CANNOT BE LESS THAN 4!        //TYPE 1:  8 TYPE 2:   5
const MAX_ROOM_HEIGHT = 15;//25;                                //TYPE 1: 25 TYPE 2:   5/**/

//type 2
/**/const MIN_NUMBER_OF_ROOMS = 50; //10              //TYPE 1: 20 TYPE 2:  50
const MAX_NUMBER_OF_ROOMS = 200; //25..75          //TYPE 1: 50 TYPE 2: 200
const MIN_ROOM_WIDTH = 5; //CANNOT BE LESS THAN 4!         //TYPE 1:  8 TYPE 2:   5
const MAX_ROOM_WIDTH = 15;                                 //TYPE 1: 25 TYPE 2:  15
const MIN_ROOM_HEIGHT = 5; //CANNOT BE LESS THAN 4!        //TYPE 1:  8 TYPE 2:   5
const MAX_ROOM_HEIGHT = 15;                                //TYPE 1: 25 TYPE 2:   5/**/


const MIN_ONE_PATH_ROOMS = 0;
const MIN_TWO_PATH_ROOMS = 0;
const NUMBER_OF_REPEATS = 100;
const PIXELS_PER_TILE = 60//6000/MAP_WIDTH; //3000/MAP_WIDTH; //800/MAP_WIDTH;//64;
const SPACING = 2;
const BUFFER_SPACE = 6;
const SPAWN_MULTIPLIER = 1;
const SPAWN_MIN = 1;


const EMPTY = 0;
const ROOM = 1;
const WALL = 2;
const PATH = 3;
const ONEDOORROOM = 4;
const TWODOORROOM = 5;
const HERO = 6;
const BASICLOOT = 7;
const GOODLOOT = 8;
const GREATLOOT = 9;
const ENEMY = 10;


function Dungeon(game, map, rooms, paths, hero, loot, spawns, bosses, stairs) {
    this.game = game;
    this.size = this.game.level * 5 + MAP_WIDTH;
    if (this.size > MAX_MAP_SIZE) this.size = MAX_MAP_SIZE;
    this.ctx = game.ctx;
    this.map = map;
    this.rooms = rooms;
    this.paths = paths;
    this.hero = hero;
    this.loot = loot;
    this.spawns = spawns;
    this.bosses = bosses;
    this.stairs = stairs;
    this.style = Math.floor(random() * 4);
    // this.style = 3;
    Entity.call( game, this.x, this.y);
}

Dungeon.prototype.getWidth = function() {
    return this.size * PIXELS_PER_TILE;
}
Dungeon.prototype.getHeight = function() {
    return this.size * PIXELS_PER_TILE;
}
Dungeon.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Dungeon.prototype.draw = function(ctx) {
    displayMap(this.game, this.map, ctx, this.size);
    Entity.prototype.update.call(this);
}

class Room {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.connectedRooms = [];
        this.connections = 0;
        this.playerSpawn = false;
        this.lootSpawn = false;
        this.bossSpawn = false;
    }
};

class Path {
    constructor(sx, sy, ex, ey) {
        this.sx = sx;
        this.sy = sy;
        this.ex = ex;
        this.ey = ey;
        this.room1 = null;
        this.room2 = null;
    }
}

class PlayerSpawn {
    constructor(x, y, room) {
        this.x = x;
        this.y = y;
        this.room = room;
    }
}

class TreasureSpawn {
    constructor(x, y, room, quality) {
        this.x = x;
        this.y = y;
        this.room = room;
        this.quality = quality;
    }
}

class CreatureSpawn {
    constructor(x, y, room) {
        this.x = x;
        this.y = y;
        this.room = room;
    }
}

class BossSpawn {
    constructor(x, y, room) {
        this.x = x;
        this.y = y;
        this.room = room;
    }
}

class StairSpawn {
    constructor(x, y, room) {
        this.x = x;
        this.y = y;
        this.room = room;
        this.boundingRadiusYAdjust = 0;
    }
}

//Checks to see if a room is overlapping any previously existing rooms
function overlap(r, roomlist){
    for (var i = 0, len = roomlist.length; i < len; i++) {
        if (r.x - SPACING < roomlist[i].x+roomlist[i].width && r.x + r.width + SPACING > roomlist[i].x&& r.y - SPACING < roomlist[i].y + roomlist[i].height && r.y + r.height + SPACING > roomlist[i].y) {
            return true;
        }
    }
    return false;
};


function retry(rooms, size) {
//retry adding a room [NUMBER_OF_REPEATS] times, if it is not added after [NUMBER_OF_REPEATS] times, give up.
    for (var i = 0; i < NUMBER_OF_REPEATS; i++) {
        var x = Math.floor(random() * (size - MAX_ROOM_WIDTH - 1) + 1) + BUFFER_SPACE;
        var y = Math.floor(random() * (size - MAX_ROOM_HEIGHT - 1) + 1) + BUFFER_SPACE;
        var w = Math.floor(random() * (MAX_ROOM_WIDTH - MIN_ROOM_WIDTH) + MIN_ROOM_WIDTH);
        var h = Math.floor(random() * (MAX_ROOM_HEIGHT - MIN_ROOM_HEIGHT) + MIN_ROOM_HEIGHT);
        var room = new Room(x,y,w,h);
        //if the room is not overlapping, add it
        if (!overlap(room, rooms)) {
            rooms.push(room);
            i = NUMBER_OF_REPEATS;
            //break just in case...
            break;
        }
    }
    return rooms;
};

//generates x number of rooms, where MIN_NUMBER_OF_ROOMS <= x <= MAX_NUMBER_OF_ROOMS
function generateRooms(size) {
    var rooms = [];
    var num = Math.floor(random() * (MAX_NUMBER_OF_ROOMS - MIN_NUMBER_OF_ROOMS) + MIN_NUMBER_OF_ROOMS);
    for (var i = 0; i < num; i++) {
        var x = Math.floor(random() * (size - MAX_ROOM_WIDTH - 1) + 1) + BUFFER_SPACE;
        var y = Math.floor(random() * (size - MAX_ROOM_HEIGHT - 1) + 1) + BUFFER_SPACE;
        var w = Math.floor(random() * (MAX_ROOM_WIDTH - MIN_ROOM_WIDTH) + MIN_ROOM_WIDTH);
        var h = Math.floor(random() * (MAX_ROOM_HEIGHT - MIN_ROOM_HEIGHT) + MIN_ROOM_HEIGHT);
        var room = new Room(x,y,w,h);
        if (overlap(room, rooms)) {
            rooms = retry(rooms, size);
        } else {
            rooms.push(room)
        }
    }
    return rooms;
};

//Adds the rooms to actual array that represents the map.
function addRooms(map, rooms) {
    for (var i = 0; i < rooms.length; i++) {
        var x = rooms[i].x;
        var y = rooms[i].y;
        var ystart = y;
        while (x < rooms[i].x + rooms[i].width) {
            while (y < rooms[i].y + rooms[i].height) {
                if (x == rooms[i].x || x == rooms[i].x + rooms[i].width - 1) {
                    map[x][y] = WALL;
                } else {
                    if (y == rooms[i].y || y == rooms[i].y + rooms[i].height - 1) {
                        map[x][y] = WALL;
                    } else {
                        if (rooms[i].connections == 1) {
                            map[x][y] = ONEDOORROOM;
                        } else if (rooms[i].connections == 2) {
                            map[x][y] = TWODOORROOM;
                        } else {
                            map[x][y] = ROOM;
                        }
                    }
                }
                y += 1;
            }
            y = ystart;
            x += 1;
        }
    }
};

//Given x and y coordinates, find the room that those coordinates are in. Return null if there is no such room.
function getRoom(x, y, rooms) {
    for (var i = 0; i < rooms.length; i++) {
        if (x > rooms[i].x && x < rooms[i].x + rooms[i].width - 1 && y > rooms[i].y && y < rooms[i].y + rooms[i].height - 1) {
            return rooms[i];
        }
    }
    return null;
}

function getPath(x, y, p) {
    for (var i = 0; i < p.length; i++) {
        if (x == p[i].sx && x == p[i].ex && ((y <= p[i].sy && y >= p[i].ey) || (y >= p[i].sy && y <= p[i].ey))) {
            return p[i];
        } else if (y == p[i].sy && y == p[i].ey && ((x <= p[i].sx && x >= p[i].ex) || (x >= p[i].sx && x <= p[i].ex))) {
            return p[i];
        }
    }
    return null;
}

//Given x and y coordinates, find a path that those coordinates are in. Return null if there is no such path.  DOESNT DETECT PATHS DOESNT WORK
function OLD_getPath(x, y, paths) {
    for (var i = 0; i < paths.length; i++) {
        if (((x <= paths[i].sx && x >= paths[i].ex) || (x >= paths[i].sx && x <= paths[i].ex)) && ((y <= paths[i].sy && y >= paths[i].ey) || (y >= paths[i].sy && y <= paths[i].ey))) {
            return paths[i];
        }
    }
    return null;
}

//returns true if all rooms have at least one path connected to it.
function roomsAreConnected(rooms) {
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].connections == 0) {
            return false;
        }
    }
    return true;
}

//returns true if there is no path or room at the given x and y coordinates. DOESNT DETECT PATHS
function OLDisClear(x, y, rooms, paths) {
    var i;
    for (i = 0; i < rooms.length; i++) {
        if (x > rooms[i].x && x < rooms[i].x + rooms[i].width - 1 && y > rooms[i].y && y < rooms[i].y + rooms[i].height - 1) {
            return false;
        }
    }
    for (var i = 0; i < paths.length; i++) {
        if (((x <= paths[i].sx && x >= paths[i].ex) || (x >= paths[i].sx && x <= paths[i].ex)) && ((y <= paths[i].sy && y >= paths[i].ey) || (y >= paths[i].sy && y <= paths[i].ey))) {
            return false;
        }
    }
    return true;
}

function isClear(x, y, rooms, p) {
    var i;
    for (i = 0; i < rooms.length; i++) {
        if (x > rooms[i].x && x < rooms[i].x + rooms[i].width - 1 && y > rooms[i].y && y < rooms[i].y + rooms[i].height - 1) {
            return false;
        }
    }
    for (i = 0; i < p.length; i++) {
        if (((x >= p[i].sx && x <= p[i].ex) || (x <= p[i].sx && x >= p[i].ex)) && (((y >= p[i].sy && y <= p[i].ey) || (y <= p[i].sy && y >= p[i].ey)))) {
            return false;
        }
    }
    /*for (var i = 0; i < p.length; i++) {
     if (x == p[i].sx && x == p[i].ex && ((y <= p[i].sy && y >= p[i].ey) || (y >= p[i].sy && y <= p[i].ey))) {
    return false;
     } else if (y == p[i].sy && y == p[i].ey && ((x <= p[i].sx && x >= p[i].ex) || (x >= p[i].sx && x <= p[i].ex))) {
     return false;
     }
      }*/
    return true;
}

//returns true if both passed rooms are already connected, directly or through a "multipath" system.
function alreadyConnected(r1, r2) {
    for (var i = 0; i < r1.connectedRooms.length; i++) {
        if (r2.x == r1.connectedRooms[i].x && r2.y == r1.connectedRooms[i].y) {
            return true;
        }
    }
    return false;
}

//given starting and ending x and y coordinates, the room and endPoint to connect, a new path will be created and added to the list of Paths.
function addPath(startx, starty, endx, endy, room, endpoint, rooms, paths) {
    //if the endPoint is a room, add it to the path and update both rooms connection stats
    if (endPoint = getRoom(endx, endy, rooms)) {
        p = new Path(startx, starty, endx, endy, room, endPoint);
        if (!alreadyConnected(room, endPoint, paths)) {
            room.connections++;
            endPoint.connections++;
            room.connectedRooms.push(endPoint);
            endPoint.connectedRooms.push(room);
            //paths = paths.concat(generatePaths(endPoint, rooms))
            paths.push(p);
        }
        //if the endPoint is a path, add it to the path and update the room connection stats
    } else if (endPoint = getPath(endx, endy, paths)) {
        room.connections++;
        p = new Path(startx, starty, endx, endy, room, endPoint);
        paths.push(p);
    }
    return paths;
}

//add a path to the north
function northPath(room, rooms, paths) {
    var startx = room.x + Math.round(room.width/2);
    var starty = room.y + 1;
    var endx = startx;
    var endy = starty - 2;
    var endPoint;
    var p;
    while (endy > 0 && isClear(endx, endy, rooms, paths)) {
        endy--;
    }
    return paths.concat(addPath(startx, starty, endx, endy, room, endPoint, rooms, paths));
}

//add a path to the south
function southPath(room, rooms, paths, size) {
    var startx = room.x + Math.round(room.width/2);
    var starty = room.y + room.height - 1;
    var endx = startx;
    var endy= starty + 1;
    var endPoint;
    var p;
    while (endy < size && isClear(endx, endy, rooms, paths)) {
        endy++;
    }
    return paths.concat(addPath(startx, starty, endx, endy, room, endPoint, rooms, paths));
}

//add a path to the east
function eastPath(room, rooms, paths, size) {
    var startx = room.x + room.width - 1;
    var starty = room.y + Math.round(room.height/2);
    var endx = startx + 1;
    var endy = starty;
    var endPoint;
    var p;
    while (endx < size && isClear(endx, endy, rooms, paths)) {
        endx++;
    }
    return paths.concat(addPath(startx, starty, endx, endy, room, endPoint, rooms, paths));
}

//add a path to the west
function westPath(room, rooms, paths) {
    var startx = room.x + 1;
    var starty = room.y + Math.round(room.height/2);
    var endx = startx - 1;
    var endy = starty;
    var endPoint;
    var p;
    while (endx > 0 && isClear(endx, endy, rooms, paths)) {
        endx--;
    }
    return paths.concat(addPath(startx, starty, endx, endy, room, endPoint, rooms, paths));
}

//generates paths connecting the rooms.
function generatePaths(room, rooms, size) {
    var paths = []
    paths = paths.concat(northPath(room, rooms, paths));
    if (!roomsAreConnected(rooms)) {
        paths = paths.concat(eastPath(room, rooms, paths, size));
    }
    if (!roomsAreConnected(rooms)) {
        paths = paths.concat(southPath(room, rooms, paths, size));
    }
    if (!roomsAreConnected(rooms)) {
        paths = paths.concat(westPath(room, rooms, paths));
    }
    return paths;
}

//adds the paths to the map.
function addPaths(map, paths, size) {
    for (var i = 0; i < paths.length; i++) {
        var lowx = paths[i].sx;
        var highx = paths[i].ex;
        if (lowx > highx) {
            lowx = highx;
            highx = paths[i].sx;
        }
        var lowy = paths[i].sy;
        var highy = paths[i].ey;
        if (lowy > highy) {
            lowy = highy;
            highy = paths[i].sy;
        }
        var ystart = lowy;
        while (lowx <= highx) {
            while (lowy <= highy) {
                if (lowx > 0 && lowy > 0 && lowx < size && lowy < size) {
                    if (map[lowx][lowy] == EMPTY || map[lowx][lowy] == WALL) {
                        map[lowx][lowy] = PATH;
                    }
                    if (map[lowx + 1][lowy] == EMPTY) {
                        map[lowx + 1][lowy] = WALL;
                    }
                    if (map[lowx][lowy + 1] == EMPTY) {
                        map[lowx][lowy + 1] = WALL;
                    }
                    if (map[lowx - 1][lowy] == EMPTY) {
                        map[lowx - 1][lowy] = WALL;
                    }
                    if (map[lowx][lowy - 1] == EMPTY) {
                        map[lowx][lowy - 1] = WALL;
                    }
                }
                lowy += 1;
            }
            lowy = ystart;
            lowx += 1;
        }
    }
}

//draws the tiles for the map
function displayMap(game, map, ctx, size) {
    var xOffset = game.camera.getxOffset();
    var yOffset = game.camera.getyOffset();
    for (var x = 0; x < size + 2 * BUFFER_SPACE; x++) {
        for (var y = 0; y < size + 2 * BUFFER_SPACE; y++) {
            //makes sure we are only drawing if the floor is on canvas
            if (Math.floor(xOffset/PIXELS_PER_TILE) - 1 < x && Math.floor(xOffset/PIXELS_PER_TILE) + 15 > x && Math.floor(yOffset/PIXELS_PER_TILE) - 1 < y && Math.floor(yOffset/PIXELS_PER_TILE) + 11 > y) {
                if (map[x][y] == EMPTY) {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(x * PIXELS_PER_TILE - xOffset, y * PIXELS_PER_TILE - yOffset, PIXELS_PER_TILE, PIXELS_PER_TILE);
                } else if (map[x][y] == WALL) {
                    //ctx.fillStyle = "#00209F";
                    //ctx.fillRect(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE);
                    this.getWall(game, ctx, x, y);
                } /*else if (map[x][y] == PATH) {
                    //ctx.fillStyle = "#C0A080";
                    //ctx.fillRect(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE);
                    this.getFloor(game, ctx, x, y);
                } else if (map[x][y] == ONEDOORROOM) {
                    //ctx.fillStyle = "#DDDD00";
                    //ctx.fillRect(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE);
                    this.getFloor(game, ctx, x, y);
                } else if (map[x][y] == TWODOORROOM) {
                    //ctx.fillStyle = "#00F080";
                    //ctx.fillRect(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE);
                    this.getFloor(game, ctx, x, y);
                } else if (map[x][y] == HERO) {
                    //ctx.fillStyle = "#26DD33";
                    //ctx.fillRect(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE);
                    this.getFloor(game, ctx, x, y);
                } else if (map[x][y] == BASICLOOT) {
                    //ctx.fillStyle = "#444444";
                    //ctx.fillRect(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE);
                    this.getFloor(game, ctx, x, y);
                } else if (map[x][y] == GOODLOOT) {
                    //ctx.fillStyle = "#999999";
                    //ctx.fillRect(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE);
                    this.getFloor(game, ctx, x, y);
                } else if (map[x][y] == GREATLOOT) {
                    //ctx.fillStyle = "#EEEEEE";
                    //ctx.fillRect(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE);
                    this.getFloor(game, ctx, x, y);
                } else if (map[x][y] == ENEMY) {
                    //ctx.fillStyle = "#FF0000";
                    //ctx.fillRect(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE);
                    this.getFloor(game, ctx, x, y);
                } */else {
                    //ctx.fillStyle = "#A0D0F0";
                    //ctx.fillRect(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, PIXELS_PER_TILE, PIXELS_PER_TILE);
                    this.getFloor(game, ctx, x, y);
                }
            }
        }
    }
};
function getWall(game, ctx, x, y) {
    if (game.dungeon.style == 0)
        ctx.drawImage(ASSET_MANAGER.getAsset("./img/tileset.png"), 0, 225, 32, 32, x * PIXELS_PER_TILE - game.camera.getxOffset(), y * PIXELS_PER_TILE - game.camera.getyOffset(), PIXELS_PER_TILE, PIXELS_PER_TILE);
    else if (game.dungeon.style == 1)   
        ctx.drawImage(ASSET_MANAGER.getAsset("./img/tileset.png"), 0, 320, 32, 32, x * PIXELS_PER_TILE - game.camera.getxOffset(), y * PIXELS_PER_TILE - game.camera.getyOffset(), PIXELS_PER_TILE, PIXELS_PER_TILE);
    else if (game.dungeon.style == 2)
        ctx.drawImage(ASSET_MANAGER.getAsset("./img/tileset.png"), 192, 192, 32, 32, x * PIXELS_PER_TILE - game.camera.getxOffset(), y * PIXELS_PER_TILE - game.camera.getyOffset(), PIXELS_PER_TILE, PIXELS_PER_TILE);
    else if (game.dungeon.style == 3)
        ctx.drawImage(ASSET_MANAGER.getAsset("./img/tileset.png"), 128, 192, 32, 32, x * PIXELS_PER_TILE - game.camera.getxOffset(), y * PIXELS_PER_TILE - game.camera.getyOffset(), PIXELS_PER_TILE, PIXELS_PER_TILE);
   
}

function getFloor(game, ctx, x, y) {
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/tileset.png"), 65, 0, 32, 32, x * PIXELS_PER_TILE - game.camera.getxOffset(), y * PIXELS_PER_TILE - game.camera.getyOffset(), PIXELS_PER_TILE, PIXELS_PER_TILE);
}

//creates an empty map
function createMap(width, height) {
    var map= [];
    for (var i = 0 ; i < width; i++) {
        map[i] = [];
        for (var j = 0; j < height; j++) {
            map[i][j] = EMPTY;
        }
    }
    return map;
}

//recursivly checks r for new connected rooms, that are not in rList
function check(r, rList) {
    for (var i = 0; i < r.connectedRooms.length; i++) {
        if (!isIn(r.connectedRooms[i], rList)) {
            rList.push(r.connectedRooms[i]);
            check(r.connectedRooms[i], rList);
        }
    }
    return rList;
}

//checks if a room r is in a list of rooms
function isIn(r, rList) {
    for (var i = 0; i < rList.length; i++) {
        if (r.x == rList[i].x && r.y == rList[i].y) {
            return true;
        }
    }
    return false;
}

//checks if the map is "complete" meaning that every room is in someway connected to the others
function isMapComplete(rooms) {
    var roomsChecked = [];
    roomsChecked = check(rooms[0], roomsChecked);
    return roomsChecked.length == rooms.length;
}

//checks if there are the required number of rooms with one path (dead ends) and rooms with two paths
function balanceCheck(r) {
    var onePathRooms = 0;
    var twoPathRooms = 0;
    for (var i = 0; i < r.length; i++) {
        if (r[i].connectedRooms.length == 1) {
            onePathRooms++;
        } else if (r[i].connectedRooms.length == 2) {
            twoPathRooms++;
        }
    }
    return onePathRooms >= MIN_ONE_PATH_ROOMS && twoPathRooms >= MIN_TWO_PATH_ROOMS;
}

function generatePlayer(game, room) {
    var x = Math.floor(random() * (room.width - 4) + 2) + room.x;
    var y = Math.floor(random() * (room.height - 4) + 2) + room.y;
    //var hero = new PlayerSpawn(Math.floor(random() * (room.width - 4) + 2) + room.x, Math.floor(random() * (room.height - 4) + 2) + room.y, room);
    var hero = new PlayerSpawn(x, y, room);
    room.playerSpawn = true;
    game.camera.setxOffset(x);
    game.camera.setyOffset(y);
    return hero;
}

function addHero(map, hero) {
    map[hero.x][hero.y] = HERO;
}

function getDeadEnds(rooms) {
    var dead = [];
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].connections == 1 && !rooms[i].playerSpawn) {
            dead.push(rooms[i]);
        }
    }
    return dead;
}

function getHallways(rooms) {
    var hall = [];
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].connections == 2 && !rooms[i].playerSpawn) {
            hall.push(rooms[i]);
        }
    }
    return hall;
}

function getCenterRooms(rooms) {
    var r = [];
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].connections > 2 && !rooms[i].playerSpawn) {
            r.push(rooms[i]);
        }
    }
    return r;
}

//we could have placed the loot randomly, but this makes deadends have a higher likelyhood of having better loot
function generateLoot(rooms) {
    var loot = [];
    var amt = Math.ceil((random() * rooms.length / 4) + rooms.length/8);
    var greatlootamt = 1;//Math.floor(amt/5 + random() * amt/5);
    var goodlootamt = Math.floor(amt/4 + random() * amt/4);
    var deadends = getDeadEnds(rooms);
    var hallways = getHallways(rooms);
    var centerrooms = getCenterRooms(rooms);
    for (var i = 0; i < amt; i++) {
        var room;
        if (deadends.length) {
            room = deadends[0];
            deadends.splice(0, 1);
        } else if (hallways.length) {
            room = hallways[0];
            hallways.splice(0, 1);
        } else {
            room = centerrooms[0];
            centerrooms.splice(0, 1);
        }
        var lootVal;
        if (greatlootamt) {
           lootVal = GREATLOOT;
            greatlootamt--;
        } else if (goodlootamt) {
            lootVal = GOODLOOT;
            goodlootamt--;
        } else {
            lootVal = BASICLOOT;
        }
        var l = new TreasureSpawn(Math.floor(random() * (room.width - 4) + 2) + room.x, Math.floor(random() * (room.height - 4) + 2) + room.y, room, lootVal);
        room.lootSpawn = lootVal;
        loot.push(l);
    }
    return loot;
}

function addLoot(map, loot) {
    for (var i = 0; i < loot.length; i++) {
        map[loot[i].x][loot[i].y] = loot[i].quality;
    }
}

function generateDungeonSpawnPoints(rooms) {
    var dungeonSpawns = [];
    //*
    for (var i = 0; i < rooms.length; i++) {
        if (!rooms[i].playerSpawn) {
            var roomdim = rooms[i].width + rooms[i].height;
            var numOfSpawns = (Math.floor(random() * (roomdim/8)) + roomdim/16) * SPAWN_MULTIPLIER + SPAWN_MIN;
            if (rooms[i].lootSpawn){
                numOfSpawns +=3;
            }
            for (var j = 0; j < numOfSpawns; j++) {
                var cSpawn = new CreatureSpawn(Math.floor(random() * (rooms[i].width - 4) + 2) + rooms[i].x, Math.floor(random() * (rooms[i].height - 4) + 2) + rooms[i].y, rooms[i]);
                dungeonSpawns.push(cSpawn);
            }
        }
    }
    /**/
    return dungeonSpawns;
}

function addSpawns(map, spawns) {
    for (var i = 0; i < spawns.length; i++) {
        map[spawns[i].x][spawns[i].y] = ENEMY;
    }
}

function generateDungeonStairs(rooms) {
    for (var i = 0; i < rooms.length; i++) {
        if (!rooms[i].playerSpawn && !rooms[i].lootSpawn) {
            for (var j = 0; j < rooms[i].connectedRooms.length; j++) {
                if (rooms[i].connectedRooms[j].playerSpawn) {
                    j = rooms[i].connectedRooms.length;
                }
            } 
            return new StairSpawn(Math.floor(random() * (rooms[i].width - 4) + 2) + rooms[i].x, Math.floor(random() * (rooms[i].height - 4) + 2) + rooms[i].y, rooms[i]);
        }
    }
    return new StairSpawn(Math.floor(random() * (rooms[0].width - 4) + 2) + rooms[0].x, Math.floor(random() * (rooms[0].height - 4) + 2) + rooms[0].y, rooms[0]);
}

//*
function getBossableRooms(rooms) {
    var bRooms = [];
    for (var i = 0; i < rooms.length; i++) {
        if (!rooms[i].playerSpawn && !rooms[i].bossSpawn) {
            bRooms.push(rooms[i]);
        }
    }
    return bRooms;
}

function generateBossSpawnPoints(rooms, number) {
    var possibleRooms;
    var bossSpawns = [];
    for (var i = 0; i < number; i++) {
        possibleRooms = getBossableRooms(rooms);
        if (possibleRooms.length > 0) {
            var r = Math.floor(random() * possibleRooms.length);
            var bSpawn = new BossSpawn(Math.floor(random() * (possibleRooms[r].width - 4) + 2) + possibleRooms[r].x, Math.floor(random() * (possibleRooms[r].height - 4) + 2) + possibleRooms[r].y, possibleRooms[r]);
            possibleRooms[r].bossSpawn = true;
            bossSpawns.push(bSpawn);
        }
    }
    return bossSpawns
}
/**/

//the "main" method
function init(gameEngine) {
    var size = gameEngine.level * 5 + MAP_WIDTH;
    if (size > MAX_MAP_SIZE) size = MAX_MAP_SIZE;
    var map = createMap(size + 2 * BUFFER_SPACE, size + 2 * BUFFER_SPACE);
    //var canvas = document.getElementById("gameWorld");
    //var ctx = canvas.getContext("2d");
    var isComplete = false;
    var balanced = false;
    while(!isComplete || !balanced) {
        var r = generateRooms(size);
        var p = [];
        for (var c = 0; c < r.length; c++) {
            p = p.concat(generatePaths(r[c], r, size));
        }
        isComplete = isMapComplete(r);
        balanced = balanceCheck(r);
    }
    var h = generatePlayer(gameEngine, r[Math.floor(random() * r.length)]);
    var l = generateLoot(r);
    var s = generateDungeonSpawnPoints(r);
    var b = generateBossSpawnPoints(r, Math.ceil(gameEngine.level / 2));
    addRooms(map, r);
    var stairs = generateDungeonStairs(r);
    addPaths(map, p, size);
    //addSpawns(map, s);
    addLoot(map, l);
    //addHero(map, h);
// 	displayMap(map, ctx);
    var dungeon = new Dungeon(gameEngine, map, r, p, h, l, s, b, stairs);
    return dungeon;
};

//starts the document
//document.addEventListener("DOMContentLoaded", init, false);