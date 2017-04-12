/*
 * ***************************************
 * *           KING SLIME                *
 * ***************************************
 */
 const WALL_COLLIDE_SPEED = 250;//MUST BE EQUAL TO LINKS SPEED!!
 const SWORD_DAMAGE = 1;
 const RECOVER = 0;
 const ENEMY_RECOVER = .2;
 const HALF_HEART = 1;
 const FULL_HEART = 2;

//*
function KingSlime(game, startingX, startingY, forcedType) {
    this.game = game;
    var maxType = 1;
    if (game.level >= 3) {
        maxType += 1;
    } 
    if (game.level >= 6) {
        maxType += 1;
    }
    var type = Math.floor(Math.random() * maxType) + 1;
    if (forcedType) type = forcedType;
    this.forcedType = type;
	
	
    this.animMoveRight = new Animation(ASSET_MANAGER.getAsset("./img/Slime.png"), 0, 0 + (32 * (type - 1)), 32, 32, .2, 2, true, true);
    this.animMoveLeft = this.animMoveRight;
    this.animMoveDown = this.animMoveRight;
    this.animMoveUp = this.animMoveRight;
    //this.animMoveRight = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 405, 25, 15, 17, .2, 2, true, true);
    //this.animMoveLeft = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 405, 8, 15, 17, .2, 2, true, true);
    //this.animMoveDown = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 372, 8, 15.65, 17, .2, 2, true, true);
    //this.animMoveUp = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 372, 25, 15.65, 17, .2, 2, true, true);
    this.x = startingX;
    this.y = startingY;
    this.speed = 75;
    this.scale = 2.8;
    this.counter = 0;
    this.xToCenter = 44.8;
    this.yToCenter = 44.8;
    this.xWallBuffer = 44.8;
    this.yWallBuffer = 44.8;
    this.boundingRadius = 26;
    this.boundingRadiusYAdjust = 2;
    this.reloadTimeRemaining = 0;
    if (type == 1) {
        this.detectionRadius = 300;
        this.damage = 1;
        this.health = new Health(10, 10);
    } else if (type == 2) {
        this.detectionRadius = 400;
        this.damage = 1;
        this.health = new Health(15, 15);
    } else if (type == 3) {
        this.detectionRadius = 500;
        this.damage = 1;
        this.health = new Health(20, 20);
    }
    this.recoverTime = RECOVER;
    this.dir = Math.floor(Math.random() * 5);
    this.splatColor = "#b01010";
    Entity.call(this, game, this.x, this.y);
}

KingSlime.prototype.draw = function (ctx) {
    var x = this.x - this.game.camera.getxOffset();
    var y = this.y - this.game.camera.getyOffset();
    switch (this.dir) {
        case DOWN:
            this.animMoveDown.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        case UP:
            this.animMoveUp.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        case RIGHT:
            this.animMoveRight.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        case LEFT:
            this.animMoveLeft.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        default:
            this.animMoveDown.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
    }

    // ctx.fillStyle = "#FF0000";
    // ctx.fillRect(x + this.xToCenter - 1, y + this.yToCenter - 1, 2, 2);
    // drawBoundingCircle(this, ctx);
    Entity.prototype.update.call(this);
}

KingSlime.prototype.update = function () {
    if (this.recoverTime != 0) {
        this.recoverTime -= this.game.clockTick;
        if (this.recoverTime < 0) this.recoverTime = 0;
    }
    if (!this.reloadTimeRemaining && inDetectRange(this, this.game.link)) {
        if (this.forcedType == 1) this.reloadTimeRemaining = 1;
        else if (this.forcedType == 2) this.reloadTimeRemaining = .5;
        else if (this.forcedType == 3) this.reloadTimeRemaining = .1;
        this.game.addEntity(new Slime(this.game, this.x + this.xToCenter, this.y + this.yToCenter,this.forcedType));
    }
    this.counter += 1;
    if (this.counter == 1000) this.counter = 0;
    if (this.counter % 50 == 0)
        this.dir = Math.floor(Math.random() * 5);
    switch (this.dir) {
        case DOWN:
            this.y += this.game.clockTick * this.speed;
            break;
        case UP:
            this.y -= this.game.clockTick * this.speed;
            break;
        case RIGHT:
            this.x += this.game.clockTick * this.speed;
            break;
        case LEFT:
            this.x -= this.game.clockTick * this.speed;
            break;
        default:
            break;
    }
    if (this.reloadTimeRemaining) {
        this.reloadTimeRemaining -= this.game.clockTick;
        if (this.reloadTimeRemaining < 0) {
            this.reloadTimeRemaining = 0;
        }
    }
    checkHealth(this);
    collideWall(this);
    Entity.prototype.update.call(this);
}
/**/

/*
 * ***************************************
 * *            SLIME                    *
 * ***************************************
 */

function Slime(game, startingX, startingY, forcedType) {
    this.game = game;
    var maxType = 1;
    if (game.level >= 3) {
        maxType += 1;
    } 
    if (game.level >= 6) {
        maxType += 1;
    }
    var type = Math.floor(Math.random() * maxType) + 1;
    if (forcedType) type = forcedType;
    
    this.animMoveRight = new Animation(ASSET_MANAGER.getAsset("./img/Slime.png"), 0, 0 + (32 * (type - 1)), 32, 32, .2, 2, true, true);
    this.animMoveLeft = this.animMoveRight;
    this.animMoveDown = this.animMoveRight;
    this.animMoveUp = this.animMoveRight;
	
    //this.animMoveRight = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 44, 25, 12, 12, .2, 2, true, true);
    //this.animMoveLeft = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 44, 12, 12, 12, .2, 2, true, true);
    //this.animMoveDown = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 19.5, 12, 12, 12, .2, 2, true, true);
    //this.animMoveUp = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 19.5, 25, 12, 12, .2, 2, true, true);
    this.x = startingX;
    this.y = startingY;
    switch (type) {
        case 1:
            this.speed = 100;
            this.damage = 1;
            this.health = new Health(1, 1);
            break
        case 2: 
            this.speed = 150;
            this.damage = 1;
            this.health = new Health(1, 2);
            break
        case 3:
            this.speed = 70;
            this.damage = 1;
            this.health = new Health(1, 3);
            this.detectionRadius = 300;
            break
    };
    this.type = type;
    this.speed = 100;
    this.scale = 1.2;
    this.counter = 0;
    this.xToCenter = 18;
    this.yToCenter = 18;
    this.xWallBuffer = 18;
    this.yWallBuffer = 18;
    this.boundingRadius = 14;
    this.boundingRadiusYAdjust = 2;
    this.recoverTime = RECOVER;
    this.dir = Math.floor(Math.random() * 5);
    this.splatColor = "#b01010";
    Entity.call(this, game, this.x, this.y);
}

Slime.prototype.draw = function (ctx) {
    var x = this.x - this.game.camera.getxOffset();
    var y = this.y - this.game.camera.getyOffset();
    switch (this.dir) {
        case DOWN:
            this.animMoveDown.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
            break;
        case UP:
            this.animMoveUp.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
            break;
        case RIGHT:
            this.animMoveRight.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        case LEFT:
            this.animMoveLeft.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        default:
            this.animMoveDown.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
    }

    // ctx.fillStyle = "#FF0000";
    // ctx.fillRect(x + this.xToCenter - 1, y + this.yToCenter - 1, 2, 2);
    // drawBoundingCircle(this, ctx);
    Entity.prototype.update.call(this);
}

Slime.prototype.update = function () {
    if (this.recoverTime != 0) {
        this.recoverTime -= 1*this.game.clockTick;
        if (this.recoverTime < 0) this.recoverTime = 0;
    }
    this.counter += 1;
    if (this.counter == 1000) this.counter = 0;
    if (this.counter % 10 == 0)
        if (this.type != 3) this.dir = Math.floor(Math.random() * 5);
        else if (!inDetectRange(this, this.game.link) || !Math.floor(Math.random() * 5)) {
                this.dir = Math.floor(Math.random() * 5);
             } else {
                this.dir = chase(this, this.game.link);
             }
    switch (this.dir) {
        case DOWN:
            this.y += this.game.clockTick * this.speed;
            break;
        case UP:
            this.y -= this.game.clockTick * this.speed;
            break;
        case RIGHT:
            this.x += this.game.clockTick * this.speed;
            break;
        case LEFT:
            this.x -= this.game.clockTick * this.speed;
            break;
        default:
            break;
    }
    if (collideWall(this)) if (this.type == 3) if (inDetectRange(this, this.game.link)) this.dir = chase(this, this.game.link);
    checkHealth(this);
    Entity.prototype.update.call(this);
}

/*
 * ***************************************
 * *            KNIGHT                    *
 * ***************************************
 */

//*
function Knight(game, startingX, startingY, forcedType) {
    this.game = game;
    var maxType = 1;
    if (game.level >= 7) {
        maxType += 1;
    } 
    if (game.level >= 9) {
        maxType += 1;
    }
    var type = Math.floor(Math.random() * maxType) + 1;
    if (forcedType) type = forcedType;
    
    this.animMoveRight = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 174.5, 64.5, 18, 18, .2, 2, true, true);
    this.animMoveLeft = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 174.5, 47.5, 18, 18, .2, 2, true, true);
    this.animMoveDown = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 139.5, 47.5, 18, 18, .2, 2, true, true);
    this.animMoveUp = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 139.5, 64.5, 18, 18, .2, 2, true, true);
    this.x = startingX;
    this.y = startingY;
    if (type == 1) {
        this.speed = 100;
        this.detectionRadius = 400;
        this.damage = 2;
        this.health = new Health(4, 4);
    } else if (type == 2) {
        this.speed = 100;
        this.detectionRadius = 700;
        this.damage = 4;
        this.health = new Health(7, 7);
    } else if (type == 3) {
        this.speed = 100;
        this.detectionRadius = 1000;
        this.damage = 6;
        this.health = new Health(10, 10);
    }
    this.scale = 3.5;
    this.counter = 0;
    this.xToCenter = 31;
    this.yToCenter = 31;
    this.xWallBuffer = 25;
    this.yWallBuffer = 25;
    this.boundingRadius = 25;
    this.boundingRadiusYAdjust = 0;
    this.recoverTime = RECOVER;
    this.chaseSwitch = true;
    this.dir = Math.floor(Math.random() * 5);
    this.splatColor = "#b01010";
    Entity.call(this, game, this.x, this.y);
}

Knight.prototype.draw = function (ctx) {
    var x = this.x - this.game.camera.getxOffset();
    var y = this.y - this.game.camera.getyOffset();
    switch (this.dir) {
        case DOWN:
            this.animMoveDown.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        case UP:
            this.animMoveUp.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
            break;
        case RIGHT:
            this.animMoveRight.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
            break;
        case LEFT:
            this.animMoveLeft.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
            break;
        default:
            this.animMoveDown.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
    }
    // ctx.fillStyle = "#FF0000";
    // ctx.fillRect(x + this.xToCenter - this.xWallBuffer, y + this.yToCenter - this.yWallBuffer, this.xToCenter + this.xWallBuffer, this.yToCenter + this.yWallBuffer);
    // drawBoundingCircle(this, ctx);
    Entity.prototype.update.call(this);
}

Knight.prototype.update = function () {
   if (this.recoverTime != 0) {
        this.recoverTime -= 1*this.game.clockTick;
        if (this.recoverTime < 0) this.recoverTime = 0;
    }
    this.counter += 1;
    if (this.counter == 1000) this.counter = 0;
    if (this.counter % 10 == 0)
        if (!inDetectRange(this, this.game.link)) {
            this.dir = Math.floor(Math.random() * 5);
        } else {
            this.dir = chase(this, this.game.link);
        }
    switch (this.dir) {
        case DOWN:
            this.y += this.game.clockTick * this.speed;
            break;
        case UP:
            this.y -= this.game.clockTick * this.speed;
            break;
        case RIGHT:
            this.x += this.game.clockTick * this.speed;
            break;
        case LEFT:
            this.x -= this.game.clockTick * this.speed;
            break;
        default:
            break;
    }
    if (collideWall(this)) if (inDetectRange(this, this.game.link)) this.dir = chase(this, this.game.link);
    checkHealth(this);
    Entity.prototype.update.call(this);
}

/*
 * ***************************************
 * *            OCTO                     *
 * ***************************************
 */

//*
function Octo(game, startingX, startingY, forcedType) {
    this.game = game;
    var maxType = 1;
    if (game.level >= 5) {
        maxType += 1;
    } 
    if (game.level >= 8) {
        maxType += 1;
    }
    var type = Math.floor(Math.random() * maxType) + 1;
    
    if (forcedType) type = forcedType;
    this.animMoveRight = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 166, 165, 14, 18, .2, 2, true, true);
    this.animMoveLeft = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 166, 147, 14, 18, .2, 2, true, true);
    this.animMoveDown = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 136, 147, 14, 18, .2, 2, true, true);
    this.animMoveUp = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 136, 165, 14, 18, .2, 2, true, true);
    this.x = startingX;
    this.y = startingY;
    this.type = type;
    if (type == 1) {
        this.speed = 100;
        this.damage = 1;
        this.detectionRadius = 300;
        this.health = new Health(1, 1);
    } else if (type == 2) {
        this.speed = 100;
        this.damage = 1;
        this.detectionRadius = 350;
        this.health = new Health(2, 2);
    } else if (type == 3) {
        this.speed = 100;
        this.damage = 1;
        this.detectionRadius = 400;
        this.health = new Health(3, 3);
        this.clipSize = 10;
    }
    this.scale = 3;
    this.counter = 0;
    this.xToCenter = 21;
    this.yToCenter = 24;
    this.xWallBuffer = 21;
    this.yWallBuffer = 22;
    this.boundingRadius = 19;
    this.boundingRadiusYAdjust = 0;
    this.reloadTimeRemaining = 0;
    this.recoverTime = RECOVER;
    this.dir = Math.floor(Math.random() * 5);
    this.splatColor = "#601030";
    Entity.call(this, game, this.x, this.y);
}

Octo.prototype.draw = function (ctx) {
    var x = this.x - this.game.camera.getxOffset();
    var y = this.y - this.game.camera.getyOffset();
    switch (this.dir) {
        case DOWN:
            this.animMoveDown.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        case UP:
            this.animMoveUp.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        case RIGHT:
            this.animMoveRight.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        case LEFT:
            this.animMoveLeft.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        default:
            this.animMoveDown.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
    }
    //ctx.fillStyle = "#FF0000";
    //ctx.fillRect(x + this.xToCenter - 1, y + this.yToCenter - 1, 2, 2);

    //drawBoundingCircle(this, ctx);
    Entity.prototype.update.call(this);
}

Octo.prototype.update = function () {
    if (this.recoverTime != 0) {
        this.recoverTime -= 1*this.game.clockTick;
        if (this.recoverTime < 0) this.recoverTime = 0;
    }
    this.counter += 1;
    if (this.counter == 1000) this.counter = 0;
    if (this.counter % 35 == 0) {
        this.dir = Math.floor(Math.random() * 5);
    }
    if (!this.reloadTimeRemaining && inDetectRange(this, this.game.link)) {
        if (this.type == 1) this.reloadTimeRemaining = 2;
        else if (this.type == 2) this.reloadTimeRemaining = 1;
        else if (this.type == 3) {
            if (this.clipSize > 0) {
                this.reloadTimeRemaining = .25;
                this.clipSize -= 1;
            } else {
                this.reloadTimeRemaining = 4;
                this.clipSize = 10;
            }
        }
        this.game.addEntity(new WaterBall(this.game, this.dir, this, this.game.link, this.x + this.xToCenter, this.y + this.yToCenter));
    }
    switch (this.dir) {
        case DOWN:
            this.y += this.game.clockTick * this.speed;
            break;
        case UP:
            this.y -= this.game.clockTick * this.speed;
            break;
        case RIGHT:
            this.x += this.game.clockTick * this.speed;
            break;
        case LEFT:
            this.x -= this.game.clockTick * this.speed;
            break;
        default:
            break;
    }
    //reloads the water gun
    if (this.reloadTimeRemaining) {
        this.reloadTimeRemaining -= this.game.clockTick;
        if (this.reloadTimeRemaining < 0) {
            this.reloadTimeRemaining = 0;
        }
    }
    collideWall(this);
    checkHealth(this);
    Entity.prototype.update.call(this);
};
/**/

function WaterBall(game, direction, start, target, startingX, startingY) {
    this.type = start.type;
    if (this.type == 1) {
        this.speed = 200;
        this.damage = 1;
        this.splatColor = "#0106Ae";
    } else if (this.type == 2) {
        this.speed = 300;
        this.damage = 2;
        this.splatColor = "#71369e";
    } else if (this.type == 3) {
        this.speed = 150;
        this.damage = 1;
        this.splatColor = "#019690";
    }
    this.radius = 8;
    this.x = startingX;
    this.y = startingY;
    this.xToCenter = 0;
    this.yToCenter = 0;
    this.xWallBuffer = 0;
    this.yWallBuffer = 0;
    this.boundingRadius = this.radius;
    this.boundingRadiusYAdjust = 0;
    this.dir = direction;
    this.game = game;
    // var dist = distanceTo(start, target);
    var difX = (target.x - start.x)/* + Math.random() * 200 - 100*/;
    var difY = (target.y - start.y)/*+ Math.random() * 200 - 100*/;
	this.xSpeed = difX;
	this.ySpeed = difY;
	var speed = Math.sqrt(this.xSpeed * this.xSpeed + this.ySpeed * this.ySpeed);
    var ratio = this.speed / speed;
    this.xSpeed *= ratio;
    this.ySpeed *= ratio;
    this.health = new Health(1, 1);
    this.recoverTime = RECOVER;
    Entity.call(this, game, this.x, this.y);
}

WaterBall.prototype.draw = function (ctx) {
    var x = this.x - this.game.camera.getxOffset() + this.xToCenter;
    var y = this.y - this.game.camera.getyOffset() + this.yToCenter;
    ctx.beginPath();
    if (this.type == 1) ctx.fillStyle = "#AABFFE";
    else if (this.type == 2) ctx.fillStyle = "#41066e";
    else if (this.type == 3) ctx.fillStyle = "#AA6660";
    ctx.arc(x, y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    if (this.type == 1) ctx.fillStyle = "#0106Ae";
    else if (this.type == 2) ctx.fillStyle = "#71369e";
    else if (this.type == 3) ctx.fillStyle = "#019690";
    ctx.arc(x, y, this.radius - 2, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    Entity.prototype.update.call(this);
}

WaterBall.prototype.update = function() {
    this.x += this.xSpeed * this.game.clockTick;
    this.y += this.ySpeed * this.game.clockTick;
    if (collideWall(this)) kill(this);
    checkHealth(this);
    Entity.prototype.update.call(this);
};

/*
 * ***************************************
 * *            SHELL                    *
 * ***************************************
 */

//*
function Shell(game, startingX, startingY, forcedType) {
    this.game = game;
    var maxType = 1;
    if (game.level >= 5) {
        maxType += 1;
    } 
    if (game.level >= 9) {
        maxType += 1;
    }
    var type = Math.floor(Math.random() * maxType) + 1;
    if (forcedType) type = forcedType;
    this.type = type;
    this.animMoveRight = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 176.5, 28, 18, 18, .2, 2, true, true);
    this.animMoveLeft = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 176.5, 8, 18, 18, .2, 2, true, true);
    this.animMoveDown = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 141, 8, 18, 18, .2, 2, true, true);
    this.animMoveUp = new Animation(ASSET_MANAGER.getAsset("./img/monsters"+ type +".png"), 141, 28, 18, 18, .2, 2, true, true);
    this.x = startingX;
    this.y = startingY;
    this.scale = 2.5;
    this.counter = 0;
    this.xToCenter = 24;
    this.yToCenter = 24;
    this.xWallBuffer = 24;
    this.yWallBuffer = 24;
    this.boundingRadius = 18;
    this.boundingRadiusYAdjust = 0;
    if (type == 1) {
        this.detectionRadius = 400;
        this.damage = 1;
        this.health = new Health(2, 2);
        this.speed = 200;
    } else if (type == 2) {
        this.detectionRadius = 800;
        this.damage = 1;
        this.health = new Health(2, 2);
        this.speed = 250;
    } else if (type == 3) {
        this.detectionRadius = 2000;
        this.damage = 4;
        this.health = new Health(1, 2);
        this.speed = 300;
    }
    //this.detectionRadius = 2000; //for a challenge or the hardest shell
    this.recoverTime = RECOVER;
    this.chaseSwitch = true;
    this.dir = Math.floor(Math.random() * 5);
    this.splatColor = "#b01010";
    Entity.call(this, game, this.x, this.y);
}

Shell.prototype.draw = function (ctx) {
    var x = this.x - this.game.camera.getxOffset();
    var y = this.y - this.game.camera.getyOffset();
    switch (this.dir) {
        case DOWN:
            this.animMoveDown.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
            break;
        case UP:
            this.animMoveUp.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
            break;
        case RIGHT:
            this.animMoveRight.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
            break;
        case LEFT:
            this.animMoveLeft.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
            break;
        default:
            this.animMoveDown.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
    }
    //ctx.fillStyle = "#FF0000";
    //ctx.fillRect(x + this.xToCenter - 1, y + this.yToCenter - 1, 2, 2);
    //drawBoundingCircle(this, ctx);
    Entity.prototype.update.call(this);
};

Shell.prototype.update = function () {
   if (this.recoverTime != 0) {
        this.recoverTime -= 1*this.game.clockTick;
        if (this.recoverTime < 0) this.recoverTime = 0;
    }
    this.counter += 1;
    if (this.counter == 1000) this.counter = 0;
    if (this.counter % 10 == 0)
        if (!inDetectRange(this, this.game.link)) {
            this.dir = Math.floor(Math.random() * 5);
        } else {
            this.dir = chase(this, this.game.link);
        }
    switch (this.dir) {
        case DOWN:
            this.y += this.game.clockTick * this.speed;
            break;
        case UP:
            this.y -= this.game.clockTick * this.speed;
            break;
        case RIGHT:
            this.x += this.game.clockTick * this.speed;
            break;
        case LEFT:
            this.x -= this.game.clockTick * this.speed;
            break;
        default:
            break;
    }
    if (collideWall(this)) if (inDetectRange(this, this.game.link)) this.dir = chase(this, this.game.link);
    checkHealth(this);
    Entity.prototype.update.call(this);
};
/**/
/**/

/*
 * ***************************************
 * *            LINK                     *
 * ***************************************
 */
const LINK_START_HEALTH = 6;
const LINK_HEALTH_ABSOLUTE_MAX = 40;
function Link(game, startingX, startingY) {
    this.game = game;
    this.animSpeed = .06;
    this.anim_idleRight = new Animation(ASSET_MANAGER.getAsset("./img/link.png"), 9, 58, 40, 32, 3, 2, true, false);
    this.anim_idleDown = new Animation(ASSET_MANAGER.getAsset("./img/link.png"), 9, 1, 40, 32, 3, 2, true, false);
    this.anim_idleUp = new Animation(ASSET_MANAGER.getAsset("./img/link.png"), 9, 106, 40, 36, 10, 1, true, false, false);
    this.anim_walkRight = new Animation(ASSET_MANAGER.getAsset("./img/link.png"), 130, 59, 42.5, 32, this.animSpeed, 10, true, false);
    this.anim_walkDown = new Animation(ASSET_MANAGER.getAsset("./img/link.png"), 130, 0, 42.5, 36, this.animSpeed, 10, true, false);
    this.anim_walkUp = new Animation(ASSET_MANAGER.getAsset("./img/link.png"), 130, 105, 42.5, 36, this.animSpeed, 10, true, false);
    this.anim_swingDown = new Animation(ASSET_MANAGER.getAsset("./img/link swing down.png"),0,0,52,53, this.animSpeed/3, 8, false,false);
    this.anim_swingUp = new Animation(ASSET_MANAGER.getAsset("./img/link swing up.png"),0,0,54,41, this.animSpeed/3, 8, false,false);
    this.anim_swingRight = new Animation(ASSET_MANAGER.getAsset("./img/link swing right.png"),0,0,49,56, this.animSpeed/3, 8, false,false);
    this.anim_dead = new Animation(ASSET_MANAGER.getAsset("./img/link.png"), 704, 4, 30, 32, 10, 1, true, false);
    
    this.x = startingX;
    this.y = startingY;
    this.speed = 250;
    this.scale = 1.8;
    this.dir = DOWN;
    this.walking = false;
    this.swinging = false;
    //this.count = 0;
    //this.game = game;
    this.width = 20;
    this.height = 20;
    this.xToCenter = 26;
    this.yToCenter = 36;
    this.xWallBuffer = 20;
    this.yWallBuffer = 18;
    this.boundingRadius = 19;//21;
    this.boundingRadiusYAdjust = -5;
    this.swordRadius = 55;
    this.colliding = false;
    this.health = new Health(LINK_START_HEALTH, LINK_HEALTH_ABSOLUTE_MAX);
    this.recoverTime = 0;
    this.dead = false;
    this.basicChest = false;
    this.goodChest = false;
    this.greatChest = false;
    this.reloadTime = 2;
    this.reloadTimeRemaining = 0;
    this.count = 0;
    Entity.call(this, game, this.x, this.y);
}

Link.prototype.getX = function() {
    return this.x;
};

Link.prototype.getY = function() {
    return this.y;
};

Link.prototype.draw = function (ctx) {
    var xOffset = this.game.camera.getxOffset();
    var yOffset = this.game.camera.getyOffset();
    if (this.dead) {
        this.anim_dead.drawFrame(this.game.clockTick, ctx, this.x - 12 - xOffset, this.y - yOffset - 2, this.scale);
        ctx.font = "25px Arial";
        ctx.fillStyle = "Red";
        ctx.fillText("Press '"+document.getElementById('restart').value.toUpperCase().charAt(0)+"' to restart the game", 800/2 - 175, 600 / 2 + 50);
    } else {
        if (this.dir == DOWN) {
            if (this.swinging) {
                this.anim_swingDown.drawFrame(this.game.clockTick, ctx, this.x - 12 - xOffset, this.y - yOffset - 2, this.scale);
            } else {
                if (this.walking) {
                    this.anim_walkDown.drawFrame(this.game.clockTick, ctx, this.x - 12 - xOffset, this.y - yOffset, this.scale);
                } else {
                    this.anim_idleDown.drawFrame(this.game.clockTick, ctx, this.x - xOffset, this.y - yOffset, this.scale);
                }
            }
        } else if (this.dir == UP) {
            if (this.swinging) {
                this.anim_swingUp.drawFrame(this.game.clockTick, ctx, this.x - 34 - xOffset, this.y - yOffset - 16, this.scale);
            } else {
                if (this.walking) {
                    this.anim_walkUp.drawFrame(this.game.clockTick, ctx, this.x - 10 - xOffset, this.y - yOffset, this.scale);
                } else {
                    this.anim_idleUp.drawFrame(this.game.clockTick, ctx, this.x + 2- xOffset, this.y - yOffset, this.scale);
                }
            }
        } else if (this.dir == RIGHT) {
            if (this.swinging) {
                this.anim_swingRight.drawFrame(this.game.clockTick, ctx, this.x - 12 + 2 - xOffset, this.y  - yOffset - 16, this.scale);
            } else {
                if (this.walking) {
                    this.anim_walkRight.drawFrame(this.game.clockTick, ctx, this.x - 12 + 2 - xOffset, this.y - yOffset + 4, this.scale);
                } else {
                    this.anim_idleRight.drawFrame(this.game.clockTick, ctx, this.x + 2 - xOffset, this.y - yOffset + 4, this.scale);
                }
            }
        } else if (this.dir == LEFT){
            ctx.save();
            ctx.translate(2*this.x - xOffset, 0);
            ctx.scale(-1, 1);
            if (this.swinging) {
                this.anim_swingRight.drawFrame(this.game.clockTick, ctx, this.x - 60 + 1, this.y - yOffset - 16, this.scale);
            } else {
                if (this.walking) {
                    this.anim_walkRight.drawFrame(this.game.clockTick, ctx, this.x - (5 * 12) + 1, this.y - yOffset + 4, this.scale);
                } else {
                    this.anim_idleRight.drawFrame(this.game.clockTick, ctx, this.x - (4 * 12) + 1, this.y - yOffset + 4, this.scale);
                }
            }
            ctx.restore();
        }
    }
    // ctx.fillStyle = "#FF0000";
    // ctx.fillRect(this.x - xOffset + this.xToCenter - 1, this. y - yOffset + this.yToCenter - 1, 2, 2);
    // ctx.fillRect(this.x - xOffset + this.xToCenter - this.xWallBuffer, this.y - yOffset + this.yToCenter - this.yWallBuffer, 2 * this.xWallBuffer, 2 * this.yWallBuffer);
    
    // if (this.colliding) {
    //     // switch (this.dir) {
    //     //     case DOWN:
    //     //         var push ;
    //     //         this.y -= this.game.clockTick * this.speed + 10;
    //     //         //collideWall(this);
    //     //         break;
    //     //     default:
    //     //         break;
    //     // }
    //   // fillBoundingCircle(this, ctx);
    // }
   // drawBoundingCircle(this, ctx);
   if (this.basicChest && this.count <= 200) {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "20px serif";
        ctx.fillText("One Heart Restored!", 800 / 2, 30);
   }
   if (this.goodChest && this.count <= 200) {
        ctx.textAlign = "center";
       ctx.fillStyle = "white";

        ctx.font = "20px serif";
        ctx.fillText("Health Replenished!", 800 / 2, 30);
   }
   if (this.greatChest && this.count <= 200) {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "20px serif";
        ctx.fillText("Gained One heart!", 800 / 2, 30);
   }
   
    Entity.prototype.update.call(this);
}

Link.prototype.update = function () {
    if (this.basicChest || this.goodChest || this.greatChest)
        this.count++;
    if (this.count > 200) {
        this.count = 0;
        this.basicChest = false;
        this.goodChest = false;
        this.greatChest = false;
    }
    if (this.dead) {
        this.game.gameOver = true;
        this.walking = false;
        this.game.addEntity(new GameOverText(this.game, 800 / 2 - 170, 600 / 2 - 85));
        if (!this.game.mute) {
            var gameOver = document.getElementById("gameOver");
                gameOver.volume = 0.5;
            if (!gameOver.ended) {
                   gameOver.play();
            }
        }
        if (this.game.restart) {
            this.game.level = 0;
            this.game.score = 0;
            this.health = new Health(LINK_START_HEALTH, LINK_HEALTH_ABSOLUTE_MAX);
            this.dead = false;
            this.game.startGame = true;
            this.game.gameOver = false;
    	    var music = document.getElementsByTagName("audio")[6];
            this.game.backgroundMusic = music;
            this.game.backgroundMusic.loop = true;
            this.game.backgroundMusic.volume = 0.3;
            this.game.backgroundMusic.play();
            this.game.backgroundMusic = music;
            
            music.muted = false;
            newLevel(this.game);
        }
    } else {
        if (this.anim_swingDown.isDone()) {
                this.anim_swingDown.elapsedTime = 0;
                this.swinging = false;
            }
        if (this.anim_swingRight.isDone()) {
                this.anim_swingRight.elapsedTime = 0;
                this.swinging = false;
            }
        if (this.anim_swingUp.isDone()) {
                this.anim_swingUp.elapsedTime = 0;
                this.swinging = false;
            }
        if (this.swinging) {
            for (var i = 0; i < this.game.entities.length; i++) {
                if (!(this.game.entities[i] instanceof Chest))
                swingCollide(this, this.game.entities[i]);
            }
        }
        if (this.dir == RIGHT && this.walking) {
            this.x += this.game.clockTick * this.speed;
        }
        if (this.dir == UP && this.walking) 
            this.y -= this.game.clockTick * this.speed;
    
        if (this.dir == DOWN && this.walking)
            this.y += this.game.clockTick * this.speed;
    
        if (this.dir == LEFT && this.walking)
            this.x -= this.game.clockTick * this.speed;
        if (this.game.down && !this.swinging) {
            this.dir = DOWN;
            this.walking = true;
        }
        if (this.game.up && !this.swinging) {
            this.dir = UP;
            this.walking = true;
        }
        if (this.game.left && !this.swinging) {
            this.dir = LEFT;
            this.walking = true;
        }
        if (this.game.right && !this.swinging) {
            this.dir = RIGHT;
            this.walking = true;
        }
        if (this.game.spell) {
            if (!this.reloadTimeRemaining) {
                this.reloadTimeRemaining = this.reloadTime;
                this.game.addEntity(new FireBall(this.game, this));
            }
            this.game.spell = false;
        }
        if (this.reloadTimeRemaining) {
            this.reloadTimeRemaining -= this.game.clockTick;
            if (this.reloadTimeRemaining < 0) {
               this.reloadTimeRemaining = 0;
            }
    }
        if (!this.game.down && !this.game.up && !this.game.right && !this.game.left) {
            this.walking = false;
        }
        if (this.game.space) {
            this.swinging = true;
            this.walking = false;
         }
        if (!this.health.amount <= 0) {
            for (var i = 0; i < this.game.entities.length; i++) {           
                if (collideOther(this, this.game.entities[i])) {
                    this.colliding = true;
                    if (!this.recoverTime) {
                        this.health.amount -= this.game.entities[i].damage;
                        this.recoverTime = 1;
                    }
                    break;
                }
                this.colliding = false;
            }
        }
        if (this.recoverTime != 0) {
            this.recoverTime -= 5*this.game.clockTick;
            if (this.recoverTime < 0) this.recoverTime = 0;
        }
        
        collideWall(this);
        if (this.health.amount <= 0) {
            this.dead = true;
        }
            //************************ SOUNDS **************************//
        if (!this.game.mute) {
            var footstep = document.getElementById("footstep");
            if (this.walking) {
                footstep.muted = false;
                footstep.volume = 0.1;
                footstep.play();
            } else { 
                footstep.muted = true;
            }
            if (this.swinging) {
                var swoosh = document.getElementById("swoosh");
                swoosh.volume = 0.5;
                swoosh.play();
            }
        }
        
        if (this.x - 32 < this.game.dungeon.stairs.x * PIXELS_PER_TILE &&
            this.x + 32 > this.game.dungeon.stairs.x * PIXELS_PER_TILE &&
            this.y - 32 < this.game.dungeon.stairs.y * PIXELS_PER_TILE &&
            this.y + 32 > this.game.dungeon.stairs.y * PIXELS_PER_TILE) {
                newLevel(this.game);
        }
    }
    

    
    Entity.prototype.update.call(this);
}

function FireBall(game,  start) {
    this.damage = 0;
    this.speed = 400;
    this.otherDamage = 2;
    this.splatColor = "#991010";
    this.radius = 8;
    this.x = start.x + start.xToCenter;
    this.y = start.y + start.yToCenter;
    this.xToCenter = 0;
    this.yToCenter = 0;
    this.xWallBuffer = 0;
    this.yWallBuffer = 0;
    this.fireBallBoundingRadius = this.radius;
    this.boundingRadiusYAdjust = 0;
    this.game = game;
    // var dist = distanceTo(start, target);
    this.xSpeed = 0;
    this.ySpeed = 0;
    switch (start.dir) {
        case DOWN:
            this.ySpeed = this.speed;
            break;
        case UP:
            this.ySpeed = -this.speed;
            break;
        case LEFT:
            this.xSpeed = -this.speed;
            break;
        case RIGHT:
            this.xSpeed = this.speed;
            break;
    }
    this.health = new Health(2,2);
    this.recoverTime = RECOVER;
    Entity.call(this, game, this.x, this.y);
}

FireBall.prototype.draw = function (ctx) {
    var x = this.x - this.game.camera.getxOffset() + this.xToCenter;
    var y = this.y - this.game.camera.getyOffset() + this.yToCenter;
    ctx.beginPath();
    ctx.fillStyle = "#880505";
    ctx.arc(x, y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "#991010";
    ctx.arc(x, y, this.radius - 2, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    Entity.prototype.update.call(this);
}

FireBall.prototype.update = function() {
    this.x += this.xSpeed * this.game.clockTick;
    this.y += this.ySpeed * this.game.clockTick;
    if (collideWall(this)) this.health.amount = 0;
    checkHealth(this);
    for (var i = 0; i < this.game.entities.length; i++) {
        fireBallCollide(this, this.game.entities[i]);
    }
    Entity.prototype.update.call(this);
};

function fireBallCollide(fireBall, other) {
    if (fireBall != other && fireBall.game.link != other &&distanceTo(fireBall, other) < fireBall.fireBallBoundingRadius + other.boundingRadius) {
        //fireBall.health.amount -= other.damage;
        other.health.amount -= fireBall.otherDamage;
		fireBall.otherDamage = 0;
		kill(fireBall);
    }
}

 function Chest(game, startingX, startingY, lootType) {
     this.game = game;
    this.animClosed = new Animation(ASSET_MANAGER.getAsset("./img/chest.png"), 0, 7, 16, 18, .2, 1, true, false);
     this.animOpen = new Animation(ASSET_MANAGER.getAsset("./img/chest.png"), 18, 7, 16, 18, .2, 1, true, false);
     this.animGoodClosed = new Animation(ASSET_MANAGER.getAsset("./img/chest.png"), 0, 26, 16, 18, .2, 1, true, false);
     this.animGoodOpen = new Animation(ASSET_MANAGER.getAsset("./img/chest.png"), 18,26, 16, 18, .2, 1, true, false);
     this.animGreatClosed = new Animation(ASSET_MANAGER.getAsset("./img/chest.png"), 36, 12, 34, 28, .2, 1, true, false);
     this.animGreatOpen = new Animation(ASSET_MANAGER.getAsset("./img/chest.png"), 137, 39, 35, 32, .2, 1, true, false);
    this.x = startingX;
    this.y = startingY;
    this.open = false;
    this.scale = 2;
    this.boundingRadiusYAdjust = 0;
    this.lootType = lootType;
    if (lootType == BASICLOOT || lootType == GOODLOOT) {
        this.xToCenter = 16;
        this.yToCenter = 18;
        this.chestRadius = 20;
    } else {
        this.xToCenter = 34;
        this.yToCenter = 28;
        this.chestRadius = 30;
    }
    Entity.call(this, game, this.x, this.y);
 }

Chest.prototype.draw = function (ctx) {
    var x = this.x - this.game.camera.getxOffset();
    var y = this.y - this.game.camera.getyOffset();
    
    if (this.lootType == BASICLOOT) {
        if (this.open) {
            this.animOpen.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
        } else {
            this.animClosed.drawFrame(this.game.clockTick, ctx,  x, y, this.scale);
        }
    } else if (this.lootType == GOODLOOT) {
        if (this.open) {
            this.animGoodOpen.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
        } else {
            this.animGoodClosed.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
        }
    } else if (this.lootType == GREATLOOT) {
        if (this.open) {
            this.animGreatOpen.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
        } else {
            this.animGreatClosed.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
        }
    }
    //drawBoundingCircle(this, this.game.ctx);
    Entity.prototype.update.call(this);
 }

 Chest.prototype.update = function () {
    if (!this.open) chestCollide(this, this.game.link);
    Entity.prototype.update.call(this);
 }
 
 function chestCollide(chest, link) {
     if (distanceTo(chest, link) <= chest.chestRadius + link.boundingRadius) {
        if (chest.lootType == BASICLOOT) {
             link.health.addAmount(FULL_HEART);
             link.basicChest = true;
             
         } else if (chest.lootType == GOODLOOT) {
             link.health.addFull();
            link.goodChest = true;
         } else if (chest.lootType == GREATLOOT) {
             link.health.gainHeart();
            link.greatChest = true;      
         }
         chest.open = true;
         
         if (!this.game.mute) {
             var chestOpen = document.getElementById("chestOpen");
             chestOpen.volume = 1;
             chestOpen.playbackRate = 3;
            chestOpen.play();
         }
     }
 }
 
 function Stairs(game, startingX, startingY) {
     this.game = game;
    this.anim = new Animation(ASSET_MANAGER.getAsset("./img/Stairs.png"), 0, 0, 32, 32, .2, 1, true, false);
    this.x = startingX;
    this.y = startingY;
    this.scale = 2;
    Entity.call(this, game, this.x, this.y);
 }
 
 Stairs.prototype.draw = function (ctx) {
    var x = this.x - this.game.camera.getxOffset();
    var y = this.y - this.game.camera.getyOffset();
    
     this.anim.drawFrame(this.game.clockTick, ctx, x, y, this.scale);
    Entity.prototype.update.call(this);
 }
 
Stairs.prototype.update = function () {
    Entity.prototype.update.call(this);
 }
 
 class Health {
    constructor(startHealth, maxHealth) {
        this.amount = startHealth;
        this.cap = maxHealth;
        this.fullAmount = startHealth;
    }
  }

Health.prototype.addAmount = function(amount) {
    this.amount += amount;
    if (this.amount > this.fullAmount) {
        this.amount = this.fullAmount;
    }
}

Health.prototype.addFull = function() {
    this.amount = this.fullAmount;
}

Health.prototype.gainHeart = function() {
    this.fullAmount += 2;
    if (this.fullAmount > this.cap) this.fullAmount = this.cap;
    this.addFull();
}
  
function checkHealth(ent) {
    
    if (ent.health.amount <= 0) {
        kill(ent);
    }
}

function fillBoundingCircle(ent, ctx) {
    /*ctx.beginPath();
    ctx.arc(ent.x - ent.game.camera.getxOffset() + ent.xToCenter, ent.y - ent.game.camera.getyOffset() + ent.yToCenter + ent.boundingRadiusYAdjust, ent.boundingRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#DD0000";
    ctx.fill();
    ctx.closePath();*/
}

function drawBoundingCircle(ent, ctx) {
    ctx.beginPath();
    ctx.arc(ent.x - ent.game.camera.getxOffset() + ent.xToCenter, ent.y - ent.game.camera.getyOffset() + ent.yToCenter + ent.boundingRadiusYAdjust, ent.boundingRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "#0000AA";
    ctx.stroke();
    ctx.closePath();
}

function strongCollideWall(ent) {
    collideWall(ent);
    collideWall(ent);
}

function collideWall(ent) {
    var collided = false;
    if (!(ent instanceof Chest)) {
        game = ent.game;
        var collideSpeed = WALL_COLLIDE_SPEED * 2;
        if (ent.recoverTime == RECOVER) collideSpeed = ent.speed;
        if (ent instanceof Shell) if (ent.type == 3) collideSpeed = 300;
        //down collision
        if (game.dungeon.map[Math.floor((ent.x + ent.xToCenter)/PIXELS_PER_TILE)][Math.floor((ent.y + ent.yToCenter + ent.yWallBuffer)/PIXELS_PER_TILE)] == WALL) {
            ent.y -= ent.game.clockTick * collideSpeed;//ent.speed;
            collided = true;
        }
        //up collision
        if (game.dungeon.map[Math.floor((ent.x + ent.xToCenter)/PIXELS_PER_TILE)][Math.floor((ent.y + ent.yToCenter - ent.yWallBuffer)/PIXELS_PER_TILE)] == WALL) { 
            ent.y += ent.game.clockTick * collideSpeed;//ent.speed;
            collided = true;
        }
        //right collision
        if (game.dungeon.map[Math.floor((ent.x + ent.xToCenter + ent.xWallBuffer)/PIXELS_PER_TILE)][Math.floor((ent.y + ent.yToCenter)/PIXELS_PER_TILE)] == WALL) {
            ent.x -= ent.game.clockTick * collideSpeed;//ent.speed;
            collided = true;
        }
        //down collision
        if (game.dungeon.map[Math.floor((ent.x + ent.xToCenter - ent.xWallBuffer)/PIXELS_PER_TILE)][Math.floor((ent.y + ent.yToCenter)/PIXELS_PER_TILE)] == WALL) {
            ent.x += ent.game.clockTick * collideSpeed;//ent.speed;
            collided = true;
        }
        if (game.dungeon.map[Math.floor((ent.x + ent.xToCenter)/PIXELS_PER_TILE)][Math.floor((ent.y + ent.yToCenter)/PIXELS_PER_TILE)] == EMPTY) {
            kill(ent)
        }
    }
    return collided;
}

function distanceTo(ent, other) {
    var x = ent.x + ent.xToCenter - (other.x + other.xToCenter);
    var y = ent.y + ent.yToCenter + ent.boundingRadiusYAdjust - (other.y + other.yToCenter + other.boundingRadiusYAdjust);
    return Math.sqrt(x*x+y*y);
}
    
function collideOther(ent, other) {
    var collDir = DOWN;
    //if (!collideWall(ent) || !collideWall(other)) {
        if (ent != other && distanceTo(ent, other) <= ent.boundingRadius + other.boundingRadius) {
            // if (ent.y + ent.yToCenter <= other.y + other.yToCenter) {
            //     var dif = (other.y + other.yToCenter - (ent.y + ent.yToCenter))/2;
            //     ent.y -= dif;
            //     if (collideWall(ent)) {
            //         ent.y += dif;
            //         other.y += dif;
            //     }
            //     //other.y += dif;
            // } else {
            //     var dif = (ent.y + ent.yToCenter - (other.y + other.yToCenter))/2;
            //     ent.y += dif;
            //     if (collideWall(ent)) {
            //         ent.y -= dif;
            //         other.y -= dif;
            //     }
            //     //other.y -= dif;
            // }
            var dif = (other.y + other.yToCenter - (ent.y + ent.yToCenter))/2;
            ent.y -= dif;
            if (collideWall(ent)) {
                ent.y += dif;
                other.y += dif;
            }
            dif = (other.x + other.xToCenter - (ent.x + ent.xToCenter))/2;
            ent.x -= dif;
            if (collideWall(ent)) {
                ent.x+= dif;
                other.x += dif;
                //strongCollideWall(other);
            }
            if (other instanceof WaterBall) kill(other);
            return other;
        }
    //}
    return false;
}

function swingCollide(ent, other) {
    if (ent != other && distanceTo(ent, other) <= ent.swordRadius + other.boundingRadius) {
        switch (ent.dir) {
        case DOWN:
            if (ent.y+ent.yToCenter < other.y+other.yToCenter+other.boundingRadius) {
                if (other.recoverTime == 0) {
                    other.health.amount -= SWORD_DAMAGE;
                    other.recoverTime = ENEMY_RECOVER;
                }
                other.y += 10;
            }
            break;
        case UP:
            if (ent.y+ent.yToCenter > other.y+other.yToCenter+other.boundingRadius) {
               if (other.recoverTime == 0) {
                    other.health.amount -= SWORD_DAMAGE;
                    other.recoverTime = ENEMY_RECOVER;
                }
                other.y -= 10;
            }
            break;
        case LEFT:
            if (ent.x+ent.xToCenter > other.x+other.xToCenter+other.boundingRadius) {
                if (other.recoverTime == 0) {
                    other.health.amount -= SWORD_DAMAGE;
                    other.recoverTime = ENEMY_RECOVER;
                }
                other.x -= 10;
            }
            break;
        case RIGHT:
            if (ent.x+ent.xToCenter < other.x+other.xToCenter+other.boundingRadius) {
                if (other.recoverTime == 0) {
                    other.health.amount -= SWORD_DAMAGE;
                    other.recoverTime = ENEMY_RECOVER;
                }
                other.x += 10;
            }
            break;
        default:
            break;
        }
        collideWall(other);
    }
}

function inDetectRange(ent, other) {
    if (distanceTo(ent, other) <= ent.detectionRadius + other.boundingRadius) {
        return other;
    }
    return false;
}

function chase(ent, other) {
    var dir = DOWN;
    var xDif = ent.x + ent.xToCenter - (other.x + other.xToCenter);
    var yDif = ent.y + ent.yToCenter - (other.y + other.yToCenter);
    if ((ent.chaseSwitch = !ent.chaseSwitch)) {
        if (Math.abs(xDif) > ent.xWallBuffer-1) {
            if (xDif > 0) {
                dir = LEFT;
            } else {
                dir = RIGHT;
            }
        } else {
            if (yDif > 0) {
                dir = UP;
            } else {
                dir = DOWN;
            }
        }
    } else {
        if (Math.abs(yDif) > ent.xWallBuffer-1) {
            if (yDif > 0) {
                dir = UP;
            } else {
                dir = DOWN;
            }
        } else {
            if (xDif > 0) {
                dir = LEFT;
            } else {
                dir = RIGHT;
            }
        }
    }
    return dir;
}

const GORE_LEVEL = 20;//20
const MAX_GORE_VELOCITY = 40;//40

function BloodSplat(x, y, game, entForColor) {
    var splatColor = "#b01010";
    
    splatColor = entForColor.splatColor;
	this.mass = Math.floor(Math.random() * 75) + 25;
	this.radius = this.mass/8;
	this.decay = Math.random() * 2 + 1;
    this.x = x;
    this.y = y;
	//this.xSpeed = Math.random() * 2 * MAX_GORE_VELOCITY - MAX_GORE_VELOCITY;
	//this.ySpeed = Math.random() * 2 * MAX_GORE_VELOCITY - MAX_GORE_VELOCITY;
	this.color =  entForColor.splatColor;
    this.game = game;
    this.velocity = { x: Math.random() * 2 * MAX_GORE_VELOCITY - MAX_GORE_VELOCITY, y: Math.random() * 2 * MAX_GORE_VELOCITY - MAX_GORE_VELOCITY };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > MAX_GORE_VELOCITY) {
        var ratio = MAX_GORE_VELOCITY / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    Entity.call(this, game, this.x, this.y);
}

BloodSplat.prototype.update = function() {
    
    this.mass -= this.decay;
    this.decay += 0.05;
	this.radius = this.mass/10;
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
    if (this.mass <= 0) this.removeFromWorld = true;
    
    Entity.prototype.update.call(this);
}

BloodSplat.prototype.draw = function(ctx) {
    var x = this.x - this.game.camera.getxOffset();
    var y = this.y - this.game.camera.getyOffset();
	if (this.radius < 0) this.radius = 0;
	ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(x, y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    Entity.prototype.update.call(this);
}

function kill (ent) {
    
    ///////////////////////////////////////////////////////////////////maybe give each enemy a score value so that water bombs dont give points when they hit walls?
    if (!(ent instanceof WaterBall) && !(ent instanceof FireBall)) {
        ent.game.score += ent.health.cap /** 10/**/ * ent.game.level;
         
    }
    for (var i = 0; i < GORE_LEVEL; i++) {
            ent.game.addEntity(new BloodSplat(ent.x + ent.xToCenter, ent.y + ent.yToCenter, ent.game, ent));
            if (!ent.game.mute) {
                if (!(ent instanceof WaterBall)) {
                    var bloodSquirt = document.getElementById("bloodSquirt");
                    bloodSquirt.volume = 0.5;
                    bloodSquirt.play();
                }
                if (ent instanceof WaterBall && this.game.gameOver == false) {
                    var bubble = document.getElementById("bubble");
                    bubble.volume = 0.5;
                    bubble.play();
                }
            }
    
        }
//     var index = ent.game.entities.indexOf(ent);
// 	if (index > - 1) ent.game.entities.splice(index, 1);
// 	ent.delete;
    ent.removeFromWorld = true;
}

function newLevel(game) {
    var link = game.link;
    var firstLink = false;
    for (i = game.entities.length - 1; i >= 0; i--) {
        if (!(game.entities[i] == null) && game.entities[i] != game.link) {
            game.entities[i].removeFromWorld = true;
        }
    }
    game.dungeon = init(game);
    createLevel(game, link);
}