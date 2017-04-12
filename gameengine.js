

const DOWN = 0;
const UP = 1;
const LEFT = 2;
const RIGHT = 3;

// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.startGame = false;
    this.gameOver = false;
    this.entities = [];
    this.loadScreenEntities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.right = false;
    this.left = false;
    this.up = false;
    this.dungeon = null;
    this.down = false;
    this.restart = false;
    this.mute = false;
    this.spell = false;
    this.camera = new Camera(this, null, 800, 600, PIXELS_PER_TILE * MAX_MAP_SIZE  + 2 * BUFFER_SPACE * PIXELS_PER_TILE, PIXELS_PER_TILE * MAX_MAP_SIZE + 2 * BUFFER_SPACE * PIXELS_PER_TILE);
    this.xOffset = 0;
    this.yOffset = 0;
    this.score = 0;
    this.over = false;
    this.level = 1;
    this.backgroundMusic = null;
    this.dungeon = init(this);
}

GameEngine.prototype.init = function (ctx, followed) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    this.followed = followed;
    this.camera.follow(followed);
}

GameEngine.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {

    var that = this;
    
    this.ctx.canvas.addEventListener("click", function(e) {
		that.click = {x: e.clientX, y: e.clientY};
	}, false);
	
    this.ctx.canvas.addEventListener("keydown", function (e) {
		if (String.fromCharCode(e.which) === ' ') {
            that.spaceTrue = true;
        }
        if (String.fromCharCode(e.which) === document.getElementById('swing').value.toUpperCase().charAt(0)) {
            that.space = true;
        }
        if (String.fromCharCode(e.which) === document.getElementById('down').value.toUpperCase().charAt(0)) {
            if (!that.down)
                that.down = true;
        }
        if (String.fromCharCode(e.which) === document.getElementById('up').value.toUpperCase().charAt(0)) {
            if(!that.up)
                that.up = true;
        }
        if (String.fromCharCode(e.which) === document.getElementById('left').value.toUpperCase().charAt(0)) {
            if(!that.left)
                that.left = true;
        }
        if (String.fromCharCode(e.which) === document.getElementById('right').value.toUpperCase().charAt(0)) {
            if(!that.right)
                that.right = true;
        }
        if (String.fromCharCode(e.which) === document.getElementById('restart').value.toUpperCase().charAt(0)) {
            if(!that.restart)
                that.restart = true;
        }
        if (String.fromCharCode(e.which) === document.getElementById('mute').value.toUpperCase().charAt(0)) {
                that.mute = !that.mute;
        }
        if (String.fromCharCode(e.which) === document.getElementById('spell').value.toUpperCase().charAt(0)) {
                that.spell = true;
        }
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        if (String.fromCharCode(e.which) === document.getElementById('down').value.toUpperCase().charAt(0)) {
            that.down = false;
        }
        if (String.fromCharCode(e.which) === document.getElementById('up').value.toUpperCase().charAt(0)) {
            that.up = false;
        }
        if (String.fromCharCode(e.which) === document.getElementById('left').value.toUpperCase().charAt(0)) {
            that.left = false;
        }
        if (String.fromCharCode(e.which) === document.getElementById('right').value.toUpperCase().charAt(0)) {
            that.right = false;
        }
        if (String.fromCharCode(e.which) === document.getElementById('restart').value.toUpperCase().charAt(0)) {
            that.restart = false;
        }
        e.preventDefault();
    }, false);
}

GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
}

GameEngine.prototype.addLoadScreenEntity = function (entity) {
    this.loadScreenEntities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
   if (this.startGame === false) {
        for (var i = 0; i < this.loadScreenEntities.length; i++) {
            this.loadScreenEntities[i].draw(this.ctx);
        }
    } else {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }
    }

    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    if (this.backgroundMusic != null) {
        this.backgroundMusic.loop = true;
        if (this.mute) {
            this.backgroundMusic.volume = 0.0;
        } else {
            this.backgroundMusic.volume = 0.3;
        }
        this.backgroundMusic.play();
    }
    var entitiesCount = this.entities.length;
    if (this.startGame === false) {
        for (var i = 0; i < this.loadScreenEntities.length; i++) {
            var loadEntity = this.loadScreenEntities[i];
            if (loadEntity.removeFromWorld == false) {
                loadEntity.update();
            }
        }
    } else {
        this.camera.update();
        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }
        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    }
    for (var i = this.loadScreenEntities.length - 1; i >= 0; --i) {
            if (this.loadScreenEntities[i].removeFromWorld) {
                this.loadScreenEntities.splice(i, 1);
            }
    }

    
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.space = null;
    this.spaceTrue = null;
    //this.dir = DOWN;
    //this.walking = false;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}

/**
 * A camera/viewport object for the game. The camera holds the xOffset and yOffset 
 * relative to the coordinates of the object that the camera follows.
 
 * The viewport/camera is centered around the followed object by constantly checking:
 * xOffset = followed.x - viewportWidth / 2
 * yOffset = followed.y - viewportHeight / 2
 * 
 * The correctly draw any entity, the coordinates of the entity must be change
 * in the draw function to:
 * x = x - xOffset
 * y = y - yOffset
 * 
 * @param {GameEngine} gameEngine The engine of the game.
 * @param {Object} followed The object to be followed.
 * @param {int} canvasWidth The width of the viewport/camera
 * @param {int} canvasHeight The height of the viewport/camera
 * @param {int} worldWidth The width of the game world/map
 * @param {int} worldHeight The height of the game world/map
 **/
function Camera(gameEngine, followed, canvasWidth, canvasHeight, worldWidth, worldHeight) {
    this.game = gameEngine;
    this.followed = followed;
    //Distance from object to borders before camera starts to move.
    this.deadZoneX = canvasWidth / 2;
    this.deadZoneY = canvasHeight / 2;

    this.viewPortWidth = canvasWidth;
    this.viewPortHeight = canvasHeight;

    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    //Position of the viewport.
    this.xOffset = 0;
    this.yOffset = 0;


}
Camera.prototype = new Entity();
Camera.prototype.constructor = Camera;

//Getters and setters
Camera.prototype.getxOffset = function() {
    return parseInt(this.xOffset);
}

Camera.prototype.getyOffset = function() {
    return parseInt(this.yOffset);
}

Camera.prototype.setxOffset = function(xOffset) {
    return this.xOffset = xOffset;
}

Camera.prototype.setyOffset = function(yOffset) {
    return this.yOffset = yOffset;
}

/**
* Tell the camera to follow an object. The camera will also
* center itself on the object.
* 
* @param {Object} followed The object to be followed
*/
Camera.prototype.follow = function(followed) {
    this.followed = followed;
    this.xOffset = followed.getX() - this.viewPortWidth / 2;
    this.yOffset = followed.getY() - this.viewPortHeight / 2;
}
/**
* Update the camera. This function always checks if there is something to be
* followed, the camera will center on it.
* 
* It also checks if the camera is out of the world bounds or not. If so, the 
* camera stops moving, only the followed object moves.
*/
Camera.prototype.update = function() {

    if (this.followed !== null) {
        this.xOffset = this.followed.getX() - this.viewPortWidth / 2 + this.followed.xToCenter;
        this.yOffset = this.followed.getY() - this.viewPortHeight / 2 + this.followed.yToCenter;
    }
    if (this.followed.getX() < this.viewPortWidth / 2) {
        this.xOffset = 0;
    }
    if (this.xOffset + this.viewPortWidth > this.worldWidth) {
        this.xOffset = this.worldWidth - this.viewPortWidth;
    }
    if (this.followed.getY() < this.viewPortHeight / 2) {
        this.yOffset = 0;
    }
    if (this.yOffset + this.viewPortHeight > this.worldHeight) {
        this.yOffset = this.worldHeight - this.viewPortHeight ;
    }
   
}
