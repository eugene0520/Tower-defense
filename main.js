var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");
var clock = 0;
var HP = 100;
var FPS = 60;
var cursor = {};
var isBuilding = false;
var tower = {
    range: 96,
    aimingEnemyId: null,
    fireRate: 1, // 1秒發射一次
    readyToShootTime: 1, // 還有幾秒就發射
    searchEnemy: function(){
        // 減少距離下個射擊的冷卻時間
        this.readyToShootTime -= 1/FPS;
        for(var i=0; i<enemies.length; i++){
            var distance = Math.sqrt( 
                Math.pow(this.x-enemies[i].x,2) + Math.pow(this.y-enemies[i].y,2) 
            );
            if (distance<=this.range) {
                this.aimingEnemyId = i;
                // 判斷是否倒數完畢
                if (this.readyToShootTime<=0) {
                    this.shoot();
                    this.readyToShootTime = this.fireRate;
                }
                return;
            }
        }
        // 如果都沒找到，會進到這行，清除鎖定的目標
        this.aimingEnemyId = null;
    }, 
    shoot: function(){
        var newCannonball = new Cannonball(this);
        cannonballs.push( newCannonball );
    }

};

var enemies = []

function Enemy() { 
    this.x = 96-32; 
    this.y = 480-32;
    this.direction = {x:0,y:-1};
    this.speed = 64;
    this.pathDes = 0;
    this.move = function(){
        if( isCollided(enemyPath[this.pathDes].x, enemyPath[this.pathDes].y, this.x, this.y, this.speed/FPS, this.speed/FPS) ){

			if(this.pathDes==14){
				this.hp=0;
				HP-=10;
			} else {
		
	            // 首先，移動到下一個路徑點
	            this.x = enemyPath[this.pathDes].x;
	            this.y = enemyPath[this.pathDes].y;
	
	            // 指定下一個路徑點
	            this.pathDes++;
	
	            // 取得前往下一個路徑點的單位向量
	            var unitVector = getUnitVector( this.x, this.y, enemyPath[this.pathDes].x, enemyPath[this.pathDes].y );
	            this.direction.x = unitVector.x;
	            this.direction.y = unitVector.y;
			}

        } else {
            // this.x += this.direction.x * this.speed/FPS;
            this.x = this.x + this.direction.x * this.speed/FPS;
            // this.y += this.direction.y * this.speed/FPS;
            this.y = this.y + this.direction.y * this.speed/FPS;
        }
    };
}

var cannonballs=[];

function Cannonball () {
    this.speed = 320;
    this.damage = 5;
    var aimedEnemy = enemies[tower.aimingEnemyId];
    this.x = tower.x+16;
    this.y = tower.y;
    this.direction = getUnitVector(this.x, this.y, aimedEnemy.x, aimedEnemy.y);
	this.move = function(){
		this.x += this.direction.x*this.speed/FPS;
		this.y += this.direction.y*this.speed/FPS;
	}
}



var enemyPath = [
    {x:64, y:320},
    {x:160, y:320},
    {x:175, y:352},
    {x:192, y:352},
    {x:192, y:384},
    {x:256, y:384},
    {x:256, y:192},
    {x:64, y:192},
    {x:64, y:32},
    {x:512, y:32},
    {x:512, y:192},
    {x:384, y:192},
    {x:384, y:320},
    {x:544, y:320},
    {x:544, y:384}
];

// ====== 引入圖檔 ====== //
var crosshairImg = document.createElement("img");
crosshairImg.src = "images/crosshair.png";
var bgImg = document.createElement("img");
bgImg.src = "images/map.png";
var buttonImg = document.createElement("img");
buttonImg.src = "images/tower-btn.png";
var towerImg = document.createElement("img");
towerImg.src = "images/tower.png";
var slimeImg = document.createElement("img");
slimeImg.src = "images/slime.gif";
var cannonballImg = document.createElement("img");
cannonballImg.src = "images/cannon-ball.png";
// ==================== //

$("#game-canvas").mousemove(function(event) {
    cursor = {
        x: event.offsetX,
        y: event.offsetY
    };
});

$("#game-canvas").click(function(){
    if( isCollided(cursor.x, cursor.y, 640-64, 480-64, 64, 64) ){
        if (isBuilding) {
            isBuilding = false;
        } else {
            isBuilding = true;
        }
    } else if (isBuilding) {
        tower.x = cursor.x - cursor.x%32;
        tower.y = cursor.y - cursor.y%32;
    }
});
// 設定接下來印出的字體的大小及字型
ctx.font = "24px Snap ITC";

// 設定接下來印出的字體的顏色
ctx.fillStyle = "white";

function draw(){
	

	ctx.drawImage(bgImg,0,0);
	for(var i=0; i<enemies.length; i++){
		if (enemies[i].hp<=0) {
			enemies.splice(i,1);
		} else {
			enemies[i].move();
			ctx.drawImage( slimeImg, enemies[i].x, enemies[i].y);
		}
	}
	tower.searchEnemy();
	if ( tower.aimingEnemyId!=null ) {
	  var id = tower.aimingEnemyId;
	   ctx.drawImage( crosshairImg, enemies[id].x, enemies[id].y );
	}
	if ( (clock%80)==0 ) {
		var newEnemy = new Enemy();
		enemies.push(newEnemy);
	}
	
	for(var i=0; i<cannonballs.length; i++){
		cannonballs[i].move();
		ctx.drawImage( 
			cannonballImg,cannonballs[i].x,cannonballs[i].y 
		);
	}

	
    ctx.drawImage(buttonImg, 640-64, 480-64, 64, 64);
    ctx.drawImage(towerImg, tower.x, tower.y);
    ctx.fillText( "HP:"+HP, 20, 30 );

	// ctx.drawImage(slimeImg, enemy.x, enemy.y);
	
	
    if(isBuilding){
		ctx.drawImage(towerImg, cursor.x, cursor.y);
    }
    clock++;
}

setInterval(draw, 1000/FPS);



// ====== 其他函式 ====== //

function isCollided(pointX, pointY, targetX, targetY, targetWidth, targetHeight) {
    if(     pointX >= targetX
        &&  pointX <= targetX + targetWidth
        &&  pointY >= targetY
        &&  pointY <= targetY + targetHeight
    ){
        return true;
    } else {
        return false;
    }
}

function getUnitVector(srcX, srcY, targetX, targetY) {
    var offsetX = targetX - srcX;
    var offsetY = targetY - srcY;
    var distance = Math.sqrt( Math.pow(offsetX,2) + Math.pow(offsetY,2) );

    var unitVector = {
        x: offsetX/distance,
        y: offsetY/distance
    };
    return unitVector;
}
