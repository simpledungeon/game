
const GAME_WIDTH = 800;

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
        index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
        this.frameWidth, this.frameHeight,
        locX, locY,
        this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

/**
 * An entity that displays the static title of the game "A Simple Dungeon?".
 */
function Title(gameEngine, x, y) {
	this.game = gameEngine;
	this.top = new Animation(ASSET_MANAGER.getAsset("./img/title1.png"),0 , 0, 156, 30, 1, 1, true, true);
	this.bottom = new Animation(ASSET_MANAGER.getAsset("./img/title2.png"),0 , 0, 169, 30, 1, 1, true, true);
	this.topScale = 2;
	this.botScale = 2.5;
	this.x = 800 / 2 - (156 * this.topScale) / 2;
	this.botX = 800 / 2 - (169 * this.botScale) / 2;
	this.y = y;
	Entity.call(this, this.game, this.x, this.y);
};
Title.prototype = new Entity();
Title.prototype.constructor = Title;
Title.prototype.update = function(ctx) {
    if (this.game.startGame) {
        this.removeFromWorld = true;
    }
	Entity.prototype.update.call(this);
};
Title.prototype.draw = function(ctx) {
	this.top.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.topScale);
	this.bottom.drawFrame(this.game.clockTick, ctx, this.botX, this.y + 60, this.botScale);
	Entity.prototype.draw.call(this);
};

/**
 * An entity that displays the static button "Press Space to Play".
 */
function StartButton(gameEngine, x, y) {
	this.game = gameEngine;
	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/startButton.png"),0 , 0, 333, 60, 1, 1, true, true);
	this.x = 800 / 2 - 333 / 2;
	this.y = y;
	this.scale = 1;
	Entity.call(this, this.game, this.x, this.y);
};
StartButton.prototype = new Entity();
StartButton.prototype.constructor = Title;
StartButton.prototype.update = function(ctx) {
    if (this.game.spaceTrue) {
        this.game.startGame = true;
        this.removeFromWorld = true;
    }
	Entity.prototype.update.call(this);
};
StartButton.prototype.draw = function(ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
	Entity.prototype.draw.call(this);
};

/**
 * An entity that displays the static logo of the game. 
 */
function Logo(game, x, y) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/logo.png"),0 , 0, 396, 28, 1, 1, true, true);
    this.scale = 1.5;
	this.x = 800 / 2 - (396 * this.scale) / 2;
    this.y = y;
	this.count = 0;
    Entity.call(this, game, this.x, this.y);
}
Logo.prototype = new Entity();
Logo.prototype.constructor = Logo;
Logo.prototype.update = function () {
    this.count++;
    //Create game title and instruction button once 
    //the count is 200 or a space key is pressed.
	if (this.count >= 200 || this.game.spaceTrue) {	
		var title = new Title(this.game, 800 / 2 - 169 / 2, 100);
		this.game.addLoadScreenEntity(title);
		var startButton = new StartButton(this.game, 800 / 2 - 145 / 2, 400);  
		this.game.addLoadScreenEntity(startButton);
		this.game.loadScreenEntities[0].removeFromWorld = true;
		this.game.spaceTrue = false;
	    var music = document.getElementsByTagName("audio")[6];
        this.game.backgroundMusic = music;
    }
    Entity.prototype.update.call(this);
}
Logo.prototype.draw = function (ctx) {
	ctx.save();
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
	ctx.restore();
    Entity.prototype.draw.call(this);
}

/**
 * An entity that displays "Game Over!" text when Link has 0 health left.
 */
function GameOverText(gameEngine, x, y) {
    this.game = gameEngine;
    this.x = x;
    this.y = y;
    this.scale = 2;
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/gameOver.png"), 0, 0, 150, 20, 1, 1 , true, true);
    Entity.call(this, gameEngine, this.x, this.y);
};
GameOverText.prototype = new Entity();
GameOverText.prototype.constructor = GameOverText;
GameOverText.prototype.update = function() {
    var music = document.getElementsByTagName("audio")[6];
    music.muted = true;
    Entity.prototype.update.call(this);

};
GameOverText.prototype.draw = function(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    Entity.prototype.draw.call(this);
};

function restartGame() {
    //ASSET_MANAGER = new AssetManager();
    //ASSET_MANAGER.downloadAll();
    //ASSET_MANAGER.gameEngine = new GameEngine();
    // console.log("Game should have been restarted")
    
}





// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/link.png");
ASSET_MANAGER.queueDownload("./img/monsters1.png");
ASSET_MANAGER.queueDownload("./img/monsters2.png");
ASSET_MANAGER.queueDownload("./img/monsters3.png");
ASSET_MANAGER.queueDownload("./img/tileset.png");
ASSET_MANAGER.queueDownload("./img/chest.png");
ASSET_MANAGER.queueDownload("./img/HeartContainer.png");
ASSET_MANAGER.queueDownload("./img/HeartContainerEmpty.png");
ASSET_MANAGER.queueDownload("./img/link swing down.png");
ASSET_MANAGER.queueDownload("./img/link swing up.png");
ASSET_MANAGER.queueDownload("./img/link swing right.png");
ASSET_MANAGER.queueDownload("./img/logo.png");
ASSET_MANAGER.queueDownload("./img/title1.png");
ASSET_MANAGER.queueDownload("./img/title2.png");
ASSET_MANAGER.queueDownload("./img/startButton.png");
ASSET_MANAGER.queueDownload("./img/gameOver.png");
ASSET_MANAGER.queueDownload("./img/Stairs.png");
ASSET_MANAGER.queueDownload("./img/Slime.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();

    var link = new Link(gameEngine, gameEngine.dungeon.hero.x * PIXELS_PER_TILE, gameEngine.dungeon.hero.y * PIXELS_PER_TILE);
    gameEngine.init(ctx, link);
    //gameEngine.camera.follow(link);
    var bg = new Logo(gameEngine, 800 / 2 - 396, 600 / 2 -  42/ 2);
    var hearts = new HealthHearts(gameEngine);

    gameEngine.gameX = gameEngine.dungeon.hero.x * PIXELS_PER_TILE;
    gameEngine.gameY = gameEngine.dungeon.hero.y * PIXELS_PER_TILE;
    
    gameEngine.addLoadScreenEntity(bg);
    gameEngine.addEntity(gameEngine.dungeon);

    for (var i = 0; i < gameEngine.dungeon.loot.length; i++) {
        //*
        var lootVal = gameEngine.dungeon.loot[i].quality;
        var chest = new Chest(gameEngine, gameEngine.dungeon.loot[i].x * PIXELS_PER_TILE, 
                            gameEngine.dungeon.loot[i].y * PIXELS_PER_TILE, gameEngine.dungeon.loot[i].quality);
        gameEngine.addEntity(chest);
        /**/
    }
    
    var stairs = new Stairs(gameEngine, gameEngine.dungeon.stairs.x * PIXELS_PER_TILE, gameEngine.dungeon.stairs.y * PIXELS_PER_TILE);
    gameEngine.addEntity(stairs);

    var bossCreated = false;
    for (var i = 0; i < gameEngine.dungeon.spawns.length; i++) {

        var maxVariation;
        if (bossCreated) maxVariation = 3;//no boss only basic enemies on the first floor
        else maxVariation = 3;

        switch (Math.floor(Math.random() * maxVariation)) {
            case 0:
                var slime = new Slime(gameEngine, gameEngine.dungeon.spawns[i].x * PIXELS_PER_TILE, gameEngine.dungeon.spawns[i].y * PIXELS_PER_TILE);
                gameEngine.addEntity(slime);
                break;
            case 1:
                var octo = new Octo(gameEngine, gameEngine.dungeon.spawns[i].x * PIXELS_PER_TILE, gameEngine.dungeon.spawns[i].y * PIXELS_PER_TILE);
                gameEngine.addEntity(octo);
                break;
            case 2:
                var shell = new Shell(gameEngine, gameEngine.dungeon.spawns[i].x * PIXELS_PER_TILE, gameEngine.dungeon.spawns[i].y * PIXELS_PER_TILE);
                gameEngine.addEntity(shell);
                break;
            case 4:
                var kingslime = new KingSlime(gameEngine, gameEngine.dungeon.spawns[i].x * PIXELS_PER_TILE, gameEngine.dungeon.spawns[i].y * PIXELS_PER_TILE);
                gameEngine.addEntity(kingslime);
                bossCreated = true;
                break;
            case 3:
                var knight = new Knight(gameEngine, gameEngine.dungeon.spawns[i].x * PIXELS_PER_TILE, gameEngine.dungeon.spawns[i].y * PIXELS_PER_TILE);
                gameEngine.addEntity(knight);
                break;
        }
    }

    for (var i = 0; i < gameEngine.dungeon.bosses.length; i++) {
        var kingslime = new KingSlime(gameEngine, gameEngine.dungeon.bosses[i].x * PIXELS_PER_TILE, gameEngine.dungeon.bosses[i].y * PIXELS_PER_TILE);
        gameEngine.addEntity(kingslime);
    }
    /**/
    
    gameEngine.addEntity(link);
    gameEngine.link = link;
    gameEngine.addEntity(hearts);

    gameEngine.start();
    document.getElementById("gameWorld").focus();

});

function HealthHearts(game) {
    this.game = game;
    Entity.call(this, game, 10, 10);
}

HealthHearts.prototype.draw = function(ctx) {
    var currentHealth = 0;
    var drawX = 10;
    var drawY = 10 - 15;
    while (currentHealth < this.game.link.health.fullAmount) {
        var type = "./img/HeartContainerEmpty.png"
        if (currentHealth < this.game.link.health.amount) {
            var type = "./img/HeartContainer.png"
        }
        if (currentHealth % 20 == 0) {
            drawX = 10;
            drawY += 15;
        }
        if (currentHealth % 2 == 0) {
            ctx.drawImage(ASSET_MANAGER.getAsset(type), 0, 0, 33, 64, drawX, drawY, 15, 15);
            drawX += 15;
        } else {
            ctx.drawImage(ASSET_MANAGER.getAsset(type),34, 0, 33, 64, drawX, drawY, 15, 15);
            drawX +=15;
        }
        currentHealth++;
    }
    drawX = 10; 
    drawY += 15 + 22;
    ctx.font = "20px Arial";
    ctx.fillStyle = "White";
    ctx.fillText("Fire ball: ", drawX, drawY);
    ctx.fillRect(drawX + 80, drawY - 18, 102, 22);
    ctx.fillStyle = "Black";
    ctx.fillRect(drawX + 81, drawY - 17, 100, 20);
    ctx.fillStyle = "Green";
    ctx.fillRect(drawX + 81, drawY - 17, 100 - 100 * this.game.link.reloadTimeRemaining / this.game.link.reloadTime, 20);
    ctx.font = "30px Arial";
    ctx.fillStyle = "White";
    ctx.fillText("Score: ".concat(this.game.score), 600, 30);
    ctx.fillText("level: ".concat(this.game.level), 616, 65);
    Entity.prototype.update.call(this);
}

HealthHearts.prototype.update = function () {
    Entity.prototype.update.call(this);
}

function createLevel(gameEngine, link) {
    gameEngine.level += 1;
    
    var hearts = new HealthHearts(gameEngine);
    
    gameEngine.gameX = gameEngine.dungeon.hero.x * PIXELS_PER_TILE;
    gameEngine.gameY = gameEngine.dungeon.hero.y * PIXELS_PER_TILE;
    
    //gameEngine.addLoadScreenEntity(bg);
    gameEngine.addEntity(gameEngine.dungeon);

    for (var i = 0; i < gameEngine.dungeon.loot.length; i++) {
        //*
        var lootVal = gameEngine.dungeon.loot[i].quality;
        var chest = new Chest(gameEngine, gameEngine.dungeon.loot[i].x * PIXELS_PER_TILE, 
                            gameEngine.dungeon.loot[i].y * PIXELS_PER_TILE, gameEngine.dungeon.loot[i].quality);
        gameEngine.addEntity(chest);
        /**/
    }
    
    var stairs = new Stairs(gameEngine, gameEngine.dungeon.stairs.x * PIXELS_PER_TILE, gameEngine.dungeon.stairs.y * PIXELS_PER_TILE);
    gameEngine.addEntity(stairs);

    var bossCreated = false;
    for (var i = 0; i < gameEngine.dungeon.spawns.length; i++) {

        var maxVariation;
        // if (bossCreated) maxVariation = 5; // use my boss function instead
        /*else */
        
        if (gameEngine.level == 1) maxVariation = 3;
        else maxVariation = 4;//Math.min(4, 3 + Math.floor(gameEngine.level / 4));//adds a new type every 4th floor until there are all the types
        
        switch (Math.floor(Math.random() * maxVariation)) {
            case 0:
                var slime = new Slime(gameEngine, gameEngine.dungeon.spawns[i].x * PIXELS_PER_TILE, gameEngine.dungeon.spawns[i].y * PIXELS_PER_TILE);
                gameEngine.addEntity(slime);
                break;
            case 1:
                var octo = new Octo(gameEngine, gameEngine.dungeon.spawns[i].x * PIXELS_PER_TILE, gameEngine.dungeon.spawns[i].y * PIXELS_PER_TILE);
                gameEngine.addEntity(octo);
                break;
            case 2:
                var shell = new Shell(gameEngine, gameEngine.dungeon.spawns[i].x * PIXELS_PER_TILE, gameEngine.dungeon.spawns[i].y * PIXELS_PER_TILE);
                gameEngine.addEntity(shell);
                break;
            // case 4:
            //     var kingslime = new KingSlime(gameEngine, gameEngine.dungeon.spawns[i].x * PIXELS_PER_TILE, gameEngine.dungeon.spawns[i].y * PIXELS_PER_TILE);
            //     gameEngine.addEntity(kingslime);
            //     bossCreated = true;
            //     break;
            case 3:
                var knight = new Knight(gameEngine, gameEngine.dungeon.spawns[i].x * PIXELS_PER_TILE, gameEngine.dungeon.spawns[i].y * PIXELS_PER_TILE);
                gameEngine.addEntity(knight);
                break;
        }
    }

    for (var i = 0; i < gameEngine.dungeon.bosses.length; i++) {
        var kingslime = new KingSlime(gameEngine, gameEngine.dungeon.bosses[i].x * PIXELS_PER_TILE, gameEngine.dungeon.bosses[i].y * PIXELS_PER_TILE);
        gameEngine.addEntity(kingslime);
    }
    /**/
    
    link.x = gameEngine.dungeon.hero.x * PIXELS_PER_TILE;
    link.y = gameEngine.dungeon.hero.y * PIXELS_PER_TILE;
   
    
    //gameEngine.camera = new Camera(this, link, 800, 600, 6000  + 2 * BUFFER_SPACE * PIXELS_PER_TILE, 6000 + 2 * BUFFER_SPACE * PIXELS_PER_TILE);
    
    gameEngine.addEntity(hearts);
    gameEngine.addEntity(link);
    gameEngine.link = link;
    //gameEngine.camera.follow(gameEngine.link);
    //gameEngine.entities.push(link);
    var index = gameEngine.entities.indexOf(link);
    if (index > -1) gameEngine.entities.splice(index, 1);
    document.getElementById("gameWorld").focus();
}