var hp = 100;
var score = 0;
// 找出網頁中的 canvas 元素
var canvas = document.getElementById("game-canvas");
// 取得 2D繪圖用的物件
var ctx = canvas.getContext("2d");
// 設定接下來印出的字體的大小及字型
ctx.font = "24px Arial";
// 設定接下來印出的字體的顏色
ctx.fillStyle = "black";

var FPS = 60;
var CLOCK = 0,ENEMY_TIME = FPS;
var enemyPath = [
    {x:64, y:320},
    {x:160, y:320},
    {x:172, y:352},
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
//----------OK---------//
function OK(){
	var a = ( (cursor.x >= 32 && cursor.x <= 640 - 32) && (cursor.y >= 32 && cursor.y <= 480 - 32) );
	var b = !( (cursor.x >= 32*9 && cursor.x <= 32*14) && (cursor.y >= 32 && cursor.y <= 32*4) );
	var c = !( (cursor.x >= 32*15 && cursor.x <= 640 - 32) && (cursor.y >= 32 && cursor.y <= 32*5) );
	var d = ( (cursor.x >= 32 && cursor.x <= 32*2) && (cursor.y >= 480 - 32 && cursor.y <= 480) );
	//console.log(a+" "+b+" "+c+" "+d+" ");
	if (a & b & c | d) {
		return true;
	}else {
		return false;
	}
}
//-----isCollided-----//
function isCollided(pointX,pointY,targetX,targetY,w,h){
	var ok;
	if ((pointX >= targetX) && (pointX <= targetX + w) && (pointY >= targetY) && (pointY <= targetY + h)){
		ok = true;
	}else {
		ok = false;
	}
	//console.log("isCollided:"+ok);
	return ok;
}
//---getUnitVector---//
function getUnitVector (srcX, srcY, targetX, targetY) {
    var offsetX = targetX - srcX;
    var offsetY = targetY - srcY;
    var distance = Math.sqrt( Math.pow(offsetX,2) + Math.pow(offsetY,2) );
    var unitVector = {
			x: offsetX/distance,
			y: offsetY/distance,
			z: distance
    };
		//console.log("x:"+unitVector.x+" y:"+unitVector.y);
    return unitVector;
}

// 創造 img HTML 元素，並放入變數中
var bgImg = document.createElement("img");
// 設定這個元素的要顯示的圖片
bgImg.src = "images/map.png";

var Img = document.createElement("img");
Img.src = "images/slime.gif";
// var directionX = [0,1,0,-1];//上: 0，右: 1,下: 0，左:-1
// var directionY = [-1,0,1,0];//上:-1,下: 0，左: 1，右: 0
// var directionNEXT = [0,1,2,3,2,1,0];//上,右,下,左,下，右,上
var enemy = {
	x:32,y:480-32,
	direction:{x:0,y:-1},
	hp:10,
	speed:32*3,
	pathDes:0,
	score:10,
	move:function(){
		if(enemyPath[this.pathDes] != null){
			if (isCollided(enemyPath[this.pathDes].x,enemyPath[this.pathDes].y,this.x,this.y,this.speed/FPS,this.speed/FPS)) {
			  // 首先，移動到下一個路徑點
				this.x = enemyPath[this.pathDes].x;
				this.y = enemyPath[this.pathDes].y;
				// 指定下一個路徑點
				this.pathDes++;
			if(this.pathDes >= 39){
					return -1;
				}else {
					// 取得前往下一個路徑點的單位向量
					this.direction = getUnitVector(this.x,this.y,enemyPath[this.pathDes].x,enemyPath[this.pathDes].y);
				}
			}
		}
		this.x += this.speed*this.direction.x/FPS;
		this.y += this.speed*this.direction.y/FPS;
	},
};
var ENEMIES = [];
function ENEMY(){
	this.x = enemy.x;
	this.y = enemy.y;
	this.hp = enemy.hp;
	this.speed = enemy.speed;
	this.direction = enemy.direction;
	this.move = enemy.move;
	this.pathDes = enemy.pathDes;
	this.ok = enemy.ok;
	this.score = enemy.score;
}
function enemies(){
	ENEMIES.push(new ENEMY() );
}
//--------delet-------//
function DELET(number,ok){
	if(!ok){
		hp -= 10;
	}else{
		score += ENEMIES[number].score;
	}
	ENEMIES.splice( number , 1 );
}

var PtowerBtn = document.createElement("img");
PtowerBtn.src = "images/tower-btn.png";

var Ptower = document.createElement("img");
Ptower.src = "images/tower.png";
var Tower = {
	x:0,y:0,
	range:96,
	aimingEnemyId:null,
	fireRate:1,//1秒發射一次
	readyToShootTime:1,//還有幾秒就發射
	shoot: function(){
		cannonballs.push( new Cannonball(this) );
	},
	searchEnemy:function(){
		for (var i = 0; i < ENEMIES.length; i++) {
			if(getUnitVector(this.x+16,this.y+16,ENEMIES[i].x,ENEMIES[i].y).z <= this.range){
				this.aimingEnemyId = i;
				// console.log(this.aimingEnemyId);
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
		// console.log(this.aimingEnemyId);
	}};
var TOWERS = [];
function TOWER(){
	this.x = Tower.x;
	this.y = Tower.y;
	this.range = Tower.range;
	this.aimingEnemyId = Tower.aimingEnemyId;
	this.searchEnemy = Tower.searchEnemy;
	this.fireRate = Tower.fireRate;
	this.readyToShootTime = Tower.readyToShootTime;
	this.shoot = Tower.shoot;
}
function tower(){
	if(cursor.x >= 640-64 && cursor.x <= 640 && cursor.y >= 480-64 && cursor.y <= 480){
		isBuilding = !isBuilding;
		return;
	}
	if(isBuilding && OK() && NO_TOWER()){
		TOWERS.push(new TOWER() );
		return;
	}
}
function NO_TOWER(){
	for (var i = 0; i < TOWERS.length; i++) {
		if((Tower.x == TOWERS[i].x) && (Tower.y == TOWERS[i].y)){
			//console.log("重疊="+i);
			return false;
		}
	}
	return true;
}
// 初始化：
var crosshairImg = document.createElement("img");
crosshairImg.src = "images/crosshair.png";
var cannonballImg = document.createElement("img");
cannonballImg.src = "images/cannon-ball.png";
var cannonballs = [];
var cannonball = {
	x:0,y:0,
	speed:320,
	damage:10,
	direction:{x:0,y:0},
	hitted:0,
	move:function(){
		this.x += this.direction.x*this.speed/FPS;
		this.y += this.direction.y*this.speed/FPS;
		for(var i=0; i < ENEMIES.length; i++){
		  this.hitted =  isCollided( this.x, this.y, ENEMIES[i].x, ENEMIES[i].y, 32, 32 );
		  if (this.hitted) {
				//console.log("hitted:"+i);
		    ENEMIES[i].hp -= this.damage;
		    // 如果不加這行會很慘喔！
		    return -1;
		  };
		}
	}};
function Cannonball(tower){
	var aimedEnemy = ENEMIES[tower.aimingEnemyId];
	this.x = tower.x+16-4;
	this.y = tower.y;
	this.direction = getUnitVector(this.x, this.y, aimedEnemy.x+16-4, aimedEnemy.y);
	this.speed = cannonball.speed;
	this.damage = cannonball.damage;
	this.move = cannonball.move;
	this.hitted = false;
}

var cursor = {x:0,y:0};
var isBuilding = false;
function Cursor(){
	 //console.log( "x:" + event.pageX + ", y: " + event.pageY);
	 cursor.x = event.offsetX;
	 cursor.y = event.offsetY;
}
$( "#game-canvas").mousemove(function( event ) {
	Cursor();
});

$("#game-canvas").click(function(){
	tower();
});

function draw(){
	Tower.x = cursor.x - (cursor.x % 32);
	Tower.y = cursor.y - (cursor.y % 32);
	// 將背景圖片畫在 canvas 上的 (0,0) 位置
	ctx.drawImage(bgImg,0,0,640,480);
	ctx.drawImage(PtowerBtn,640-32*2,480-32*2,32*2,32*2);
	if(isBuilding){
		ctx.drawImage(Ptower,Tower.x,Tower.y,32,32);
	}
	for(var i = 0;i < ENEMIES.length;i++){
		if (ENEMIES[i].hp > 0) {
			ctx.drawImage(Img,ENEMIES[i].x,ENEMIES[i].y,40,32);
			if(ENEMIES[i].move() == -1){
				DELET(i,0);
			}
		}else{
			DELET(i,1);
		}
	}
	CLOCK++;
	if ((CLOCK)%ENEMY_TIME == 0) {
		enemies();
	}
	for(var i = 0;i < TOWERS.length;i++){
		ctx.drawImage(Ptower,TOWERS[i].x,TOWERS[i].y,32,32);
		TOWERS[i].searchEnemy();
		// 減少距離下個射擊的冷卻時間
		TOWERS[i].readyToShootTime -= 1/FPS;
		if ( TOWERS[i].aimingEnemyId!=null ) {
    	ctx.drawImage( crosshairImg, ENEMIES[TOWERS[i].aimingEnemyId].x, ENEMIES[TOWERS[i].aimingEnemyId].y, 32, 32);
		}
	}
	for(var i = 0;i < cannonballs.length;i++){
		if (!cannonballs[i].hitted){
			ctx.drawImage(cannonballImg,cannonballs[i].x,cannonballs[i].y,8,8);
			if(cannonballs[i].move() == -1){
					cannonballs.splice(i,1);
			}
		}
	}
	ctx.fillText( "HP="+hp, 10, 10);
	ctx.fillText( "SCORE="+score, 10, 20);
	if(hp <= 0){
		GAME_OVER();
	}
}

function GAME_OVER(){
	ctx.textAlign = "center";
	ctx.font = "64px Arial";
	ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2-96);
	ctx.font = "48px Arial";
	ctx.fillText("you got", canvas.width/2, canvas.height/2-32);
	ctx.font = "128px Arial";
	ctx.fillText(score, canvas.width/2, canvas.height/2+96);
	clearInterval(intervalID);
}

// 等待一秒再執行 draw
//setTimeout( draw, 1000);

var intervalID = setInterval(draw,1000 / FPS);
