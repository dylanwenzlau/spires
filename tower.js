
backCanv = document.getElementById('backCanv');
back = backCanv.getContext('2d');
canv = document.getElementById('canv');
c = canv.getContext('2d');
c.font = back.font = '18px Times';
c.lineCap = 'round';
c.textBaseline = back.textBaseline = 'top';

//SPEED FIXES
//make background canvas for bg, gold, mobs, global menus, etc
//
//chrome is slower than firefox at same fps?!?

const fps = 30;
const timerDelay = (1000/fps)>>0;
//Mob Types [speed, health, radius, color]
const mobTypes = [[70,400,12,'#ff0'],[50,600,6,'#f70'],[100,200,8,'#f00']];
const elementNames = ["Earth","Electro","Frost","Fire"];
const upgradeNames = ["+ 10% Damage","+ 10% Range","+ 10% Reload Rate","+ 2% crit"];
const hex = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'];
timer = cx = cy = iter = newMS = oldMS = 0;

skills = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //16 different skill points
spec = 0;
skillPoints = 10;

levels = [];
/*levels[0] = {};
levels[0].lives = 10;
levels[0].bg = new Image();
levels[0].bg.src = "back1.png";
levels[0].gold = 2000;
//levels[0].towerTypes = [Tower, LightTower, IceTower, FireTower];
//levels[0].route = [[618,151],[527,105],[421,80],[316,67],[223,94],[156,159],[166,195],[193,224],[294,231],[373,222],[458,204],[509,209],[538,231],[547,270],[532,308],[486,333],[431,341],[342,343],[171,372],[84,405],[43,445],[33,464]];
levels[0].route = [[650,240],[540,100],[430,240],[430,400],[320,400],[320,80],[210,80],[210,240],[-10,240]];
levels[0].spots = [[375,350,0],[375,300,0],[375,250,0],[375,200,0],[265,130,0],[265,180,0],[265,230,0],[265,280,0]];
levels[0].waves = [[0,500,0,500,0,500,0,500,0,500,0,500,1,2000,1,1000,1,1000,2,5000,2,500,2,1500,2,500]];
for (var i=1; i<20; i++) levels[0].waves[i] = levels[0].waves[0];
//for (var i=1; i<10; i++) levels[i] = {};*/

for (var j=0; j<12; j++){
	levels[j] = {};
	levels[j].lives = 10;
	levels[j].bg = new Image();
	levels[j].bg.src = "back1.png";
	levels[j].gold = 1000 + j*100;
	//levels[j].route = [[660,240],[540,100],[430,240],[430,400],[320,400],[320,80],[210,80],[210,240],[-10,240]];
	levels[j].route = [[486,-20],[464,38],[440,66],[425,103],[421,162],[426,191],[423,240],[427,286],[424,335],[418,385],[391,411],[345,418],[311,390],[294,361],[304,318],[330,280],[324,247],[322,190],[318,153],[318,103],[298,79],[254,70],[215,79],[180,104],[168,130],[175,169],[168,200],[164,239],[140,266],[108,281],[54,291],[-20,298]];
	levels[j].spots = [[359,350,0],[376,296,0],[374,217,0],[369,132,0],[475,138,0],[243,120,0],[221,177,0],[270,227,0],[152,314,0]];
	levels[j].waves = [];
	for (var n=0; n<5; n++){
		levels[j].waves[n] = [];
		levels[j].waves[n][0] = 1;
		levels[j].waves[n][1] = 5000;
		for (var m=1; m<20; m++){
			levels[j].waves[n][m*2] = (Math.random()*3)>>0;
			levels[j].waves[n][m*2+1] = (Math.random()*500 + 1200 - j*60 - n*220)>>0;
		}
	}
}

//Commence cool pre-rendered drawings
var mobPics = [];
for (var i=0; i<mobTypes.length; i++){
	mobPics[i] = document.createElement('canvas');
	mobPics[i].width = 19;
	mobPics[i].height = 19;
	var s = mobPics[i].getContext('2d');
	s.fillStyle = '#000';
	s.beginPath();
	s.arc(9, 9, 9, 0, 360);
	s.fill();
	s.beginPath();
	s.strokeStyle = s.fillStyle = mobTypes[i][3];
	s.moveTo(2,10);
	s.quadraticCurveTo(9, 18, 16, 10);
	s.stroke();
	s.beginPath();
	s.arc(5,4,2,0,360);
	s.fill();
	s.beginPath();
	s.arc(13,4,2,0,360);
	s.fill();
}

var treeCanv = document.createElement('canvas');
treeCanv.width = 20;
treeCanv.height = 50;
var tree = treeCanv.getContext('2d');
tree.beginPath();
tree.strokeStyle = '#630';
tree.lineWidth = 3;
tree.moveTo(10,0);
tree.lineTo(10,50);
tree.stroke();
tree.beginPath();
tree.strokeStyle = '#490';
tree.lineWidth = 1;
for (var i=0; i<7; i++){
	tree.moveTo(10, i*5);
	tree.lineTo(0, i*5 + 9);
	tree.moveTo(10, i*5);
	tree.lineTo(20, i*5 + 9);
}
tree.stroke();

var sfCanv = document.createElement('canvas');
sfCanv.width = 15;
sfCanv.height = 15;
var sf = sfCanv.getContext('2d');
sf.strokeStyle = '#eef';
sf.beginPath();
sf.moveTo(7,0);
sf.lineTo(7,14);
sf.moveTo(1,3);
sf.lineTo(13,11);
sf.moveTo(1,11);
sf.lineTo(13,3);
sf.stroke();

const furyColors = ['#470','#ff0','#7af','#f00'];
/*var furyButtonCanv = [];
for (var i=0; i<4; i++){
	furyButtonCanv[i] = document.createElement('canvas');
	furyButtonCanv[i].width = 140;
	furyButtonCanv[i].height = 40;
	var fb = furyButtonCanv[i].getContext('2d');
	fb.lineWidth = 1;
	fb.strokeStyle = furyColors[i];
	fb.beginPath();
	for (var j=0; j<=140; j+=3){
		fb.moveTo(j,0);
		fb.lineTo(j + 8 - 16*(j%6 ? 1 : 0), 8);
		fb.moveTo(j,40);
		fb.lineTo(j + 8 - 16*(j%6 ? 1 : 0), 40 - 8);
	}
	for (var k=0; k<=40; k+=3){
		fb.moveTo(0,k);
		fb.lineTo(8, k + 8 - 16*(k%6 ? 1 : 0));
		fb.moveTo(140,k);
		fb.lineTo(140 - 8, k + 8 - 16*(k%6 ? 1 : 0));
	}
	fb.stroke();
}*/


function Screen(){
	var t = this;
	t.item = [];
}
Screen.prototype.click = function click(){
	var len = this.item.length;
	for (var i=0; i<len; i++){
		if (this.item[i].contains(cx,cy)) {
			this.item[i].action();
			return;
		}
	}
}
Screen.prototype.drawBack = function drawBack(){
	c.save();
	c.fillStyle = '#000';
	c.strokeStyle = '#840';
	c.lineWidth = 15;
	c.fillRect(0, 0, 640, 480);
	c.strokeRect(0, 0, 640, 480);
	c.restore();
}

function Button(x, y, w, h, text, action){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.text = text;
	this.action = action;
}
Button.prototype.draw = function(color){
	if (!color) color = '#44f';
	c.fillStyle = color;
	c.fillRect(this.x, this.y, this.w, this.h);
	if (this.text){
		c.fillStyle = '#000';
		c.textAlign = 'center';
		c.fillText(this.text, this.x + this.w/2, this.y + this.h/2 - 10, this.w);
		c.textAlign = 'start';
	}
	if (this.contains(cx,cy)){
		c.strokeStyle = '#ff0';
		c.strokeRect(this.x, this.y, this.w, this.h);
	}
}
Button.prototype.tick = function(){
	this.draw();
}
Button.prototype.contains = function(x,y){ //assuming button is square!!!
	if (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h) return true;
	return false;
}

function CheckBox(x, y, w, h, action){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.action = action;
	this.checked = 0;
}
CheckBox.prototype.tick = function(){
	this.draw();
}
CheckBox.prototype.draw = function(color){
	if (!color) color = '#999';
	c.strokeStyle = color;
	c.lineWidth = 3;
	c.strokeRect(this.x, this.y, this.w, this.h);
	if (this.checked){
		c.strokeStyle = '#eee';
		c.beginPath();
		c.moveTo(this.x + 5, this.y + this.h/2);
		c.lineTo(this.x + this.w*.45, this.y + this.h*.8);
		c.lineTo(this.x + this.w*.8, this.y + this.h*.2);
		c.stroke();
	}
	if (this.contains(cx,cy)){
		c.strokeStyle = '#ff0';
		c.strokeRect(this.x, this.y, this.w, this.h);
	}
	c.lineWidth = 1;
}
CheckBox.prototype.contains = function(x,y){ //assuming button is square!!!
	if (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h) return true;
	return false;
}

main = new Screen();
main.item[0] = new Button(220, 220, 200, 60, "New Game", function(){screen = campaign;})
main.item[1] = new Button(220, 310, 200, 60, "Load Game", function(){alert('not connected!')})
main.tick = function tick(){
	this.drawBack();
	
	this.item[0].draw();
	this.item[1].draw();
	
	centerText(320, 60, 60, '#f44', "Spires of Destruction");
}

campaign = new Screen();
campaign.tock = 0;
for (i=0; i<10; i++){
	campaign.item[i] = new Button((i%5)*128 + 24, (i<5)?200:300, 80, 80, "Level "+(i+1), function(){if (!this.id || levels[this.id - 1].victories) screen = new Level(this.id)})
	campaign.item[i].id = i;
}
campaign.item[10] = new Button(20, 420, 120, 40, "Skill Tree", function(){screen = skillTree});
campaign.tick = function tick(){
	this.drawBack();
	
	var it;
	var y = 0;
	for (var i=0; i<campaign.item.length; i++){
		it = campaign.item[i];
		if (!i || (i && levels[i-1].victories)){
			it.draw();
		}
		else{
			it.draw('#555');
		}
	}
	
	c.lineWidth = 1;
	
	if (skillPoints){
		if (++this.tock == 20) this.tock = 0;
		y = ((this.tock < 10) ? 15 - this.tock : this.tock - 4).toString(16);
		c.fillStyle = '#'+y+y+'0';
		c.fillRect(150, 420, 40, 40);
		centerText(170, 440, 20, '#000', skillPoints);
	}
	
	centerText(320, 50, 64, '#fff', "Campaign Menu");
}

skillTree = new Screen();
skillTree.tick = function(){
	this.drawBack();
	this.draw();
}
skillTree.toggle = function(skill){
	if (skills[skill]) {
		skills[skill] = 0;
		skillPoints++;
	}
	else if(skillPoints){
		skills[skill] = 1;
		skillPoints--;
	}
}
skillTree.reset = function(){
	for (var i=0; i<16; i++){
		if (skills[i]){
			skills[i] = 0;
			skillPoints++;
		}
	}
}
skillTree.draw = function(){
	centerText(320, 30, 48, '#fff', "Skill Tree");
	centerText(320, 440, 30, '#ffa', skillPoints+" skill "+(skillPoints == 1 ? "point" : "points")+" remaining");
	for (var i=0; i<4; i++) {
		centerText(i*95 + 225, 90, 20, "#777", elementNames[i]);
		centerText(100, (i%4)*65 + 170, 20, "#777", upgradeNames[i]);
	}
	centerText(100, 120, 20, "#777", "Specialty");
	
	for (i=0; i<4; i++){
		this.item[i].draw(skills[i] ? '#470' : '#230');
	}
	for (i=4; i<8; i++){
		this.item[i].draw(skills[i] ? '#ff0' : '#440');
	}
	for (i=8; i<12; i++){
		this.item[i].draw(skills[i] ? '#48f' : '#114');
	}
	for (i=12; i<16; i++){
		this.item[i].draw(skills[i] ? '#f44' : '#411');
	}
	for (i=16; i<22; i++) this.item[i].draw();
}
skillTree.spec = function(s){
	if (spec) skillTree.item[15+spec].checked = 0;
	skillTree.item[15+s].checked = 1;
	spec = s;
}
for (i=0; i<16; i++){
	skillTree.item[i] = new Button(((i/4)>>0)*95 + 200, (i%4)*65 + 145, 50, 50, "", function(){skillTree.toggle(this.id)})
	skillTree.item[i].id = i;
}
for (i=16; i<20; i++){
	skillTree.item[i] = new CheckBox((i-16)*95 + 213, 110, 24, 24, function(){skillTree.spec(this.id)})
	skillTree.item[i].id = i-15;
}
skillTree.item[20] = new Button(20, 420, 120, 40, "Back", function(){screen = campaign;})
skillTree.item[21] = new Button(500, 420, 120, 40, "Reset", function(){skillTree.reset();})

function centerText(x, y, size, color, text){
	c.save();
	c.fillStyle = color;
	c.font = size+"px Times";
	c.textAlign = 'center';
	c.fillText(text, x, y - size/2);
	c.restore();
}
function LL(){
	var t = this;

	t.count = 0;
	var tail = {next:null};
	var head = {prev:null,next:tail};
	tail.prev = head;

	t.add = function add(m){
		m.prev = tail.prev;
		m.next = tail;
		m.prev.next = m.next.prev = m;
		t.count++;
	}
	t.remove = function remove(m){
		m.prev.next = m.next;
		m.next.prev = m.prev;
		t.count--;
	}
	t.contains = function contains(m){
		var n = head.next;
		while (n){
			if (m == n) return true;
			n = n.next;
		}
		return false;
	}
	t.getFirst = function getFirst(){return head.next;}
	t.countItems = function countItems(){
		var total = 0;
		var m = head.next;
		while (m != tail){
			total++;
			m = m.next;
		}
		return total;
	}
}

function Level(id){
	var t = this;
	
	const BOLT_DMG = 20 * (1 + skills[8]/10);
	const ORB_RANGE = 120 * (1 + skills[9]/10);
	const ORB_DELAY = 100 * (1 - skills[10]/10);
	const BOLT_CRIT = .02 + skills[11]*.02;
	const BOLT_RANGE = 100;
	const BOLT_SPEED = 320;
	const BOLT_LENGTH = 2;
	const ORB_TOCK = .25; //Angular distance between each bolt that is fired
	const ORB_DMG = 2;
	const ORB_CRIT = 0;
	const ORB_RADIUS = 6;
	const ORB_SPEED = 120;
	const SLOW_RATE = .35;
	const SLOW_LENGTH = 2.5

	const BOMB_DMG = 50 * (1 + skills[12]/10);
	const BEAM_DMG = 5 * (1 + skills[12]/10);
	const FIRE_RANGE = 110 * (1 + skills[13]/10);
	const FIRE_DELAY = 30 * (1 - skills[14]/10);
	const BOMB_CRIT = .03 + skills[15]*.02;
	const BOMB_RADIUS = 10;
	const BOMB_SPEED = 150;
	const BLAST_RADIUS = 60;
	const WORM_SPEED = 280/fps;
	const BEAM_CRIT = 0;
	const SPARK_RADIUS = 30;

	const SHOT_DMG = 10 * (1 + skills[0]/10);
	const SHOT_RANGE = 90 * (1 + skills[1]/10);
	const SHOT_DELAY = 10 * (1 - skills[2]/10);
	const SHOT_CRIT = .06;
	const SHOT_RADIUS = 2;
	const SHOT_SPEED = 500;

	const ZAP_DMG = 5 * (1 + skills[4]/10);
	const ZAP_RANGE = 80 * (1 + skills[5]/10);
	const ZAP_DELAY = 20 * (1 - skills[6]/10);
	const ZAP_CRIT = skills[7]*.02;
	const ZAP_LENGTH = 8; //in frames
	const ZAP_COLORS = ["#fff","#ff0","#f90","#a0f"];
	const CHAIN_LEN = 4;
	
	const MAX_TOWER_LEVEL = 4;
	const TOWER_RANGES = [
		[SHOT_RANGE, (SHOT_RANGE*11/10)>>0, (SHOT_RANGE*12/10)>>0, (SHOT_RANGE*13/10)>>0],
		[ZAP_RANGE, (ZAP_RANGE*11/10)>>0, (ZAP_RANGE*12/10)>>0, (ZAP_RANGE*13/10)>>0],
		[ORB_RANGE, (ORB_RANGE*11/10)>>0, (ORB_RANGE*12/10)>>0, (ORB_RANGE*13/10)>>0],
		[FIRE_RANGE, (FIRE_RANGE*11/10)>>0, (FIRE_RANGE*12/10)>>0, (FIRE_RANGE*13/10)>>0]
	];
	const TOWER_DMG = [
		[SHOT_DMG, SHOT_DMG*2, SHOT_DMG*4, SHOT_DMG*8],
		[ZAP_DMG, ZAP_DMG*2, ZAP_DMG*4, ZAP_DMG*8],
		[BOLT_DMG, BOLT_DMG*2, BOLT_DMG*3, BOLT_DMG*4],
		[BEAM_DMG, BEAM_DMG*2, BEAM_DMG*3, BEAM_DMG*6]
	];
	const TOWER_DELAY = [
		[SHOT_DELAY, SHOT_DELAY-2, SHOT_DELAY-4, SHOT_DELAY-6],
		[ZAP_DELAY, ZAP_DELAY-2, ZAP_DELAY-4, ZAP_DELAY-6],
		[ORB_DELAY, ORB_DELAY-15, ORB_DELAY-30, ORB_DELAY-45],
		[FIRE_DELAY, FIRE_DELAY-3, FIRE_DELAY-6, FIRE_DELAY-9]
	]
	const TOWER_BUY = [
		[100,200,450,900],
		[100,200,450,900],
		[200,400,800,1600],
		[150,300,600,1200]
	];
	const TOWER_SELL = [
		[50,150,375,825],
		[50,150,375,825],
		[100,300,700,1500],
		[75,225,525,1125]
	]
	const pelletInfo = ["Javelin Tower","Throws deadly accurate","heat-seeking spears",0,"Damage: "+SHOT_DMG,"Range: "+SHOT_RANGE,"Reload: fast","Cost: "+TOWER_BUY[0][0]+" gold"];
	const lightInfo = ["Electro Tower","Electrocutes enemies",0,0,"Damage: "+ZAP_DMG+"/sec","Range: "+ZAP_RANGE,"Reload: fast","Cost: "+TOWER_BUY[1][0]+" gold"];
	const iceInfo = ["Frost Tower","Shoots ice orbs that slow","and damage multiple enemies",0,"Bolt-Damage: "+BOLT_DMG,"Range: "+ORB_RANGE,"Reload: slow","Cost: "+TOWER_BUY[2][0]+" gold"];
	const fireInfo = ["Fire Tower","Incinerates multiple enemies","with a high energy laser",0,"Damage: "+BEAM_DMG+"/sec","Range: "+FIRE_RANGE,"Reload: slow","Cost: "+TOWER_BUY[3][0]+" gold"];
	
	function addTower(spot,type){
		if (gold < TOWER_BUY[type][0]) return false;
		gold -= TOWER_BUY[type][0];
		
		if (!type)			new Tower		(spot, SHOT_RANGE, SHOT_DMG, SHOT_DELAY);				//SPOT RANGE DAMAGE DELAY
		else if (type == 1) new LightTower	(spot, ZAP_RANGE, ZAP_DMG, ZAP_DELAY);					//SPOT RANGE DAMAGE DELAY
		else if (type == 2) new IceTower	(spot, ORB_RANGE, BOLT_DMG, ORB_DELAY, ORB_DMG, SLOW_RATE);		//SPOT RANGE DAMAGE DELAY ORBDAMAGE SLOWRATE
		else if (type == 3) new FireTower	(spot, FIRE_RANGE, BEAM_DMG, FIRE_DELAY, BLAST_RADIUS);		//SPOT RANGE DAMAGE DELAY BLASTRADIUS
		return true;
	}
	
	t.setGold = function(g){gold = g;}
	var mobs = new LL();
	var shots = new LL();
	var buttons = new LL();
	var l = levels[id];
	var lives = l.lives;
	const bg = l.bg;
	var gold = l.gold;
	
	const route = l.route;
	var spots = [];
	for (var i=0; i<l.spots.length; i++){
		spots[i] = [l.spots[i][0], l.spots[i][1], l.spots[i][2]];
	}
	const waves = l.waves;
	var wave = 0, currentMob = 0, frame = 0, started = 0, done = 0, menu = 0;
	var nextFrame = (wave[1]/fps)>>0;
	var paused = 0, power = 0;
	
	tt = {show:false,w:160,h:140,line:[],text:[]};
	tt.tick = function tick(){
		var t = this;
		var x,y;
		if (t.x - t.w - 25 > 0) x = t.x - t.w - 25;
		else x = t.x + 25;
		if (t.y - t.h - 25 > 0) y = t.y - t.h - 25;
		else y = t.y + 25;
		
		c.save();
		c.fillStyle = '#333';
		c.fillRect(x,y,t.w,t.h);
		c.fillStyle = '#fff';
		var h = 8;
		if (t.text[0]) {
			c.fillText(t.text[0], x + 10, y + h);
			h += 30;
		}
		c.font = "13px Times";
		c.fillStyle = '#ccc';
		for (var i=1; i<4; i++){
			if (t.text[i]){
				c.fillText(t.text[i], x + 10, y + h);
				h += 15;
			}
		}
		if (h != 38 && h != 8) h += 10;
		c.fillStyle = '#ff0';
		for (i=4; i<12; i++){
			if (!t.text[i]) break;
			c.fillText(t.text[i], x + 10, y + h);
			h += 15;
		}
		c.restore();
	}
	tt.measure = function(){
		this.h = this.w = 16;
		var w = 0;
		if (this.text[0]) {
			this.h += 20;
			this.w = c.measureText(this.text[0]).width + 20;
		}
		c.font = "13px Times";
		for (var i=1; i<12; i++){
			if (this.text[i]) {
				this.h += 15;
				w = c.measureText(this.text[i]).width + 20;
				if (w > this.w) this.w = w;
			}
		}
		c.font = "18px Times";
		if (this.text[1]) this.h += 10;
		if (this.text[4]) this.h += 10;
	}
	function drawRoute(){
		back.beginPath();
		back.lineJoin = 'round';
		back.lineWidth = 30;
		back.moveTo(route[0][0], route[0][1]);
		for (var i=1; i<route.length; i++){
			back.lineTo(route[i][0], route[i][1]);
		}
		back.strokeStyle = '#555';
		back.lineWidth = 40;
		back.stroke();
		back.strokeStyle = '#aaa';
		back.lineWidth = 34;
		back.stroke();
	}
	function drawBack(){
		//back.drawImage(bg,0,0);
		back.fillStyle = '#840';
		back.fillRect(0, 0, 640, 480);
		for (var i=0; i<50; i++){
			back.drawImage(treeCanv, Math.random()*620, Math.random()*430);
		}
		for (var i=0; i<20; i++){
			back.drawImage(sfCanv, Math.random()*610, Math.random()*420);
		}
		drawRoute();
		
		back.fillStyle = '#333';
		back.fillText("Gold: ", 540, 10);
		back.fillText("Mobs: ", 440, 10);
		back.fillText("Lives: ", 40, 10);
	}
	drawBack();
	function victory(){
		if (!l.victories) {
			skillPoints++;
			l.victories = ["normal", 1];
		}
		done = 0;
		alert("You won!");
		screen = campaign;
	}
	function defeat(){
		alert("You lose, butthole.");
		//screen = campaign;
	}
	function pause(){
		if (paused){
			paused = 0;
			//canv.removeEventListener('click', pause, false);
			//canv.addEventListener('click', t.click, false);
			drawBack();
			screen = level;
		}
		else pauseOnly();
	}
	function pauseOnly(){
		paused = 1;
		c.clearRect(0,0,640,480);
		//canv.removeEventListener('click', t.click, false);
		//canv.addEventListener('click', pause, false);
		drawBack();
		back.fillStyle = 'rgba(0,0,0,0.5)';
		back.fillRect(0, 0, 640, 480);
		back.fillStyle = '#999';
		back.fillRect(220, 180, 200, 50);
		back.fillStyle = '#333';
		back.textAlign = 'center';
		back.fillText('Paused', 320, 185);
		back.fillText('Click to Continue', 320, 210);
		back.textAlign = 'start';
		
		level = screen;
		screen = {tick:function tick(){},click:pause};
	}
	
	function Crit(x, y, damage){
		var t = this;
		shots.add(t);
		var ticks = 25;
		t.tick = function tick(){
			if (!ticks) shots.remove(t);
			else{
				c.fillStyle = '#ff0';
				c.font = ((ticks > 12) ? 64 - 2*ticks : 40) + 'px Times';
				c.textAlign = "center";
				c.fillText(damage, x, y - 10);
				c.font = '18px Times';
				c.textAlign = "start";
			}
			ticks--;
		}
	}
	function Chill(mob, slowRate){
		var t = this;
		shots.add(t);
		var ticks = SLOW_LENGTH*fps;
		var oldSpeed = mob.speed;
		t.mob = mob;
		t.mob.speed = slowRate*oldSpeed;
		t.tick = function tick(){
			if (!t.mob){
				shots.remove(t);
				return;
			}
			if (!ticks){
				t.mob.speed = oldSpeed;
				t.mob.chill = 0;
				shots.remove(t);
			}
			ticks--;
		}
	}
	function Explosion(x, y){
		var t = this;
		var ticks = fps/3;
		shots.add(t);
		
		t.tick = function tick(){
			c.strokeStyle = '#f44';
			c.lineWidth = 3;
			c.beginPath();
			c.arc(x, y, 4*(fps/3 - ticks), 0, 360);
			c.stroke();
			c.lineWidth = 1;
			
			ticks--;
			if (!ticks){
				shots.remove(t);
			}
		}
	}
	
	var Mob = (function(){
		function Mob(type){
			var t = this;
			mobs.add(t);
			t.type = type;
			t.speed = mobTypes[type][0] / fps;
			t.health = t.maxHealth = mobTypes[type][1];
			t.r = mobTypes[type][2];

			t.node = 0;
			t.gold = (t.health/10)>>0;
			t.x = route[0][0], t.y = route[0][1];
			t.xHeading = route[0][0], t.yHeading = route[0][1];
			t.xDev = Math.random()*20 - 10;
			t.yDev = Math.random()*20 - 10;
		}
		Mob.prototype.contains = function contains(x,y,padding){
			var t = this;
			if (Math.sqrt((t.x - x)*(t.x - x) + (t.y - y)*(t.y - y)) < t.r + padding) return true;
			return false;
		}
		Mob.prototype.hit = function hit(damage,crit){ //return true if mob is killed
			if (this.health <= 0) return true; //Return true if mob is already dead so death isn't counted twice
			var t = this;
			if (crit){
				if (Math.random() < crit){
					var critDamage = ((1 + Math.random()*2)*damage)>>0;
					t.health -= critDamage;
					new Crit(t.x, t.y - 20, critDamage + damage);
				}
			}
			t.health -= damage;
			if (t.health <= 0){
				mobs.remove(t);
				gold += t.gold;
				var s = shots.getFirst();
				while (s.tick != undefined) {
					if (s.mob == t) s.mob = 0;
					s = s.next;
				}
				return true;
			}
			return false;
		}
		Mob.prototype.tick = function tick(){
			var t = this;
			if (Math.sqrt((t.xHeading-t.x)*(t.xHeading-t.x) + (t.yHeading-t.y)*(t.yHeading-t.y)) < t.speed) {
				if ((++t.node) != route.length){
					t.xHeading = route[t.node][0];
					t.yHeading = route[t.node][1];
					/*if (t.yHeading - t.y == 0){
						t.dy = 0;
						t.dx = t.speed;
					}
					else{
						var ratio = (t.xHeading - t.x)/(t.yHeading - t.y);
						if (ratio < 0) ratio *= -1;

						t.dy = Math.sqrt(t.speed*t.speed/(ratio*ratio + 1));
						t.dx = ratio*t.dy;
					}
					if (t.xHeading - t.x < 0) t.dx *= -1;
					if (t.yHeading - t.y < 0) t.dy *= -1;*/
				}
				else {
					mobs.remove(t);
					if (--lives == 0) defeat();
					return;
				}
			}
			if (t.yHeading - t.y == 0){
				t.dy = 0;
				t.dx = t.speed;
			}
			else{
				var ratio = (t.xHeading - t.x)/(t.yHeading - t.y);
				if (ratio < 0) ratio *= -1;

				t.dy = Math.sqrt(t.speed*t.speed/(ratio*ratio + 1));
				t.dx = ratio*t.dy;
			}
			if (t.xHeading - t.x < 0) t.dx *= -1;
			if (t.yHeading - t.y < 0) t.dy *= -1;

			/*var ran = Math.random()*(t.speed/2) - t.speed/4;
			t.dx += ran;
			t.dy -= ran;*/

			t.x += t.dx;
			t.y += t.dy;

			t.draw();
		}
		Mob.prototype.draw = function draw(){
			c.drawImage(mobPics[this.type], this.x-9, this.y - 9);
			/*else{
				c.fillStyle = '#000';
				c.beginPath();
				c.arc(t.x, t.y, t.r, 0, 360);
				c.fill();
			}*/
			/*if (this.chill){
				c.fillStyle = '#7af';
				c.fillRect(this.x - 6, this.y + 10, 12, 3);
			}*/
		}
		Mob.prototype.drawHP = function drawHP(){
			c.fillStyle = '#f00';
			c.fillRect(this.x - 10, this.y - 15, 20, 5);
			c.fillStyle = '#4f4';
			c.fillRect(this.x - 10, this.y - 15, this.health/this.maxHealth*20, 5);
		}
		
		return Mob;
	})()

	T = Tower.prototype;
	T.type = 0;
	T.img = [];
	T.power = false;
	for (var i=0; i<4; i++){
		T.img[i] = new Image();
		T.img[i].src = "pellet"+i+".png";
	}
	T.tick = function tick(){
		var t = this;
		if (t.cooldown) t.cooldown--;
		else{
			var m = mobs.getFirst();
			while (m.speed){
				var distance = Math.sqrt((m.x - t.x)*(m.x - t.x) + (m.y - t.y)*(m.y - t.y));
				if (distance <= (spec === 1 && power.value ? 600 : t.range)){
					new Shot(t.x, t.y, SHOT_RADIUS, m, SHOT_SPEED, t.damage, SHOT_CRIT);
					t.cooldown = t.delay;
					break;
				}
				m = m.next;
			}
		}
		t.draw();
	}
	T.draw = function draw(){
		var t = this;
		c.drawImage(t.img[t.level-1], t.x - 20, t.y - 20);
		if (Math.sqrt((t.x - cx)*(t.x - cx) + (t.y - cy)*(t.y - cy)) < 20 || (menu && menu.tower == t)){
			c.strokeStyle = '#db0';
			c.lineWidth = 2;
			c.beginPath();
			c.arc(t.x, t.y, 20, 0, 360);
			c.stroke();
			c.lineWidth = 1;
		}
	}
	T.upgrade = function upgrade(){
		var t = this;
		if (t.level == 4 || gold < TOWER_BUY[t.type][t.level]) return false;
		gold -= TOWER_BUY[t.type][t.level];
		t.range = TOWER_RANGES[t.type][t.level];
		t.damage = TOWER_DMG[t.type][t.level];
		t.delay = TOWER_DELAY[t.type][t.level];
		t.level++;
		return true;
	}
	T.sell = function sell(){
		spots[this.spot][2] = 0;
		gold += TOWER_SELL[this.type][this.level-1];
		return true;
	}
	function Tower(spot, range, damage, delay){
		if (!range) return;
		var t = this;
		t.level = 1;
		t.range = range;
		t.damage = damage;
		t.delay = delay;
		t.spot = spot;
		spots[spot][2] = t; //Add this to spots array
		t.cooldown = 0; //Firing cooldown, always fires instantly first time
		t.x = spots[spot][0];
		t.y = spots[spot][1];
	}

	I = IceTower.prototype = new Tower();
	I.type = 2;
	I.constructor = IceTower;
	I.img = [];
	for (var i=0; i<4; i++){
		I.img[i] = new Image();
		I.img[i].src = "ice"+i+".png";
	}
	I.tick = function(){
		var t = this;
		if (t.cooldown) t.cooldown--;
		else{
			var m = mobs.getFirst();
			while (m.speed){
				var distance = Math.sqrt((m.x - t.x)*(m.x - t.x) + (m.y - t.y)*(m.y - t.y));
				if (distance <= t.range){
					var r = spec == 3 && power.value ? this.range*2 : this.range;
					new Orb(this.x, this.y, this.x + (m.x - this.x) * r/distance, this.y + (m.y - this.y) * r/distance, ORB_RADIUS, ORB_SPEED, this.damage, this.orbDamage, this.slowRate);
					t.cooldown = t.delay;
					break;
				}
				m = m.next;
			}
		}
		t.draw();
	}
	I.upgrade = function upgrade(){
		if (!Tower.prototype.upgrade.call(this)) return false;
		t.orbDamage += 1;
		return true;
	}
	function IceTower(spot, range, damage, delay, orbDamage, slowRate){
		Tower.prototype.constructor.call(this, spot, range, damage, delay);
		this.orbDamage = orbDamage;
		this.slowRate = slowRate;
	}

	F = FireTower.prototype = new Tower();
	F.type = 3;
	F.constructor = FireTower;
	F.img = [];
	for (var i=0; i<4; i++){
		F.img[i] = new Image();
		F.img[i].src = "fire"+i+".png";
	}
	F.tick = function tick(){
		var t = this;
		if (t.cooldown) t.cooldown--;
		else{
			var m = mobs.getFirst();
			while (m.speed){
				var distance = Math.sqrt((m.x - t.x)*(m.x - t.x) + (m.y - t.y)*(m.y - t.y));
				if (distance <= t.range){
					new Beam(t.x, t.y, m, t.damage);
					t.cooldown = (spec == 4 && power.value) ? (t.delay/2)>>0 : t.delay;
					break;
				}
				m = m.next;
			}
		}
		t.draw();
	}
	F.draw = function(){
		T.draw.call(this);
		c.fillStyle = '#000';
		c.beginPath();
		c.arc(this.x, this.y, 5, 0, 360);
		c.fill();
		var percent = (this.delay - this.cooldown)/this.delay;
		//c.fillStyle = '#'+hex[(percent*15)>>0]+'00';
		c.fillStyle = '#f55';
		c.beginPath();
		c.moveTo(this.x, this.y);
		c.arc(this.x, this.y, 5, -Math.PI/2, Math.PI*(percent*2 - 1/2), false);
		c.fill();
	}
	function FireTower(spot, range, damage, delay, blastRadius){
		Tower.prototype.constructor.call(this,spot,range,damage,delay);
		this.blastRadius = blastRadius;
	}

	var Beam = (function(){
		function Beam(x, y, mob, damage){
			shots.add(this);
			this.x = x;
			this.y = y;
			this.mob = mob;
			this.mx = this.mob.x;
			this.my = this.mob.y;
			this.damage = damage;
			this.ticks = 10;
		}
		Beam.prototype.tick = function(){
			if (!this.ticks){
				shots.remove(this);
				return;
			}
			
			new Spark(this.mx, this.my);
			//new Spark(this.mx, this.my);
			
			var m = mobs.getFirst();
			while (m.speed){
				if (Math.sqrt((m.x - this.mx)*(m.x - this.mx) + (m.y - this.my)*(m.y - this.my)) < SPARK_RADIUS){
					m.hit(this.damage, BEAM_CRIT);
				}
				m = m.next;
			}
			this.ticks--;
			
			this.draw();
			
			if (this.mob){
				this.mx = this.mob.x;
				this.my = this.mob.y;
			}
		}
		Beam.prototype.draw = function(){
			/*var dist = Math.sqrt((this.x - this.mx)*(this.x - this.mx) + (this.y - this.my)*(this.y - this.my));*/
			var angle;
			var width = 3 + ((this.ticks/2)>>0);
			//console.log(this.mx + " "+this.my);
			if (this.mx - this.x == 0) angle = Math.PI/4;
			else angle = Math.atan((this.my - this.y)/(this.mx - this.x));
			var g = c.createLinearGradient(this.x - Math.sin(angle)*width/2, this.y + Math.cos(angle)*width/2 ,this.x - Math.sin(-angle)*width/2, this.y - Math.cos(angle)*width/2);
			g.addColorStop(0,'rgba(255,55,55,.8)');
			g.addColorStop(.5,'rgba(255,255,255,.8)');
			g.addColorStop(1,'rgba(255,55,55,.8)');
			c.save();
			c.strokeStyle = g;
			c.lineWidth = width;
			c.beginPath();
			//console.log(this.x+" "+this.y+" "+this.mx+" "+this.my);
			c.moveTo(this.x, this.y);
			c.lineTo(this.mx, this.my);
			c.stroke();
			c.restore();
		}
		
		return Beam;
	})()
	
	var Spark = (function(){
		function Spark(x, y){
			shots.add(this);
			this.x = x;
			this.y = y;
			var ran = Math.random()*Math.PI*2;
			this.dx = Math.sin(ran)*7;
			this.dy = Math.cos(ran)*7;
			this.ticks = 4;
		}
		Spark.prototype.tick = function(){
			if (!this.ticks){
				shots.remove(this);
				return;
			}
			this.x += this.dx;
			this.y += this.dy;
			this.draw();
			this.ticks--;
		}
		Spark.prototype.draw = function(){
			//c.fillStyle = this.colors[(Math.random()*2)>>0];
			c.fillStyle = '#fff';
			c.beginPath();
			c.arc(this.x, this.y, 1, 0, 360);
			c.fill();
		}
		Spark.prototype.colors = ['#f00','#fff'];
		
		return Spark;
	})()

	var LightTower = (function(){
		var x,y,mx,my,newx,newy,dx,dy,lastMob;
		
		function LightTower(spot,range,damage,delay){
			var t = this;
			t.level = 1;
			t.range = range;
			t.damage = damage;
			t.spot = spot;
			t.delay = delay;
			t.cooldown = 0;
			t.zapping = 0;
			spots[spot][2] = t; //Mark spot as taken
			t.x = spots[spot][0];
			t.y = spots[spot][1];
		}
		
		L = LightTower.prototype = new Tower();
		L.type = 1;
		L.constructor = LightTower;
		L.img = [];
		for (var i=0; i<4; i++){
			L.img[i] = new Image();
			L.img[i].src = "light"+i+".png";
		}
		L.zap = function(){
			var t = this;
			if (!t.mob) return;

			c.beginPath();
			c.moveTo(t.x, t.y);
			x = t.x, y = t.y, mx = t.mob.x, my = t.mob.y;
			dx = (mx - x)/10, dy = (my - y)/10;
			for (var i=1; i<11; i++){
				//newx = x + Math.random()*.3*(mx-x) + .1*(mx-x), newy = y + Math.random()*.3*(my-y) + .1*(my-y);
				if (i == 10){
					newx = mx, newy = my;
				}
				else {
					newx = t.x + dx*i + Math.random()*10 - 5, newy = t.y + dy*i + Math.random()*10 - 5;
				}
				//Add some of this before the for loop !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				c.strokeStyle = '#000';
				c.lineWidth = 8;
				c.lineTo(newx,newy);
				c.stroke();
				c.moveTo(x,y);
				c.strokeStyle = ZAP_COLORS[t.level - 1];
				c.lineWidth = 2;
				c.lineTo(newx,newy);
				c.stroke();
				x = newx, y = newy;
			}
			if (t.branches[0]){
				lastMob = t.mob;
				for (var i=0; i<CHAIN_LEN; i++){
					if (t.branches[i]){
						mx = t.branches[i].x, my = t.branches[i].y;
						dx = (mx - x)/10, dy = (my - y)/10;
						for (var j=1; j<11; j++){
							if (j == 10){
								newx = mx, newy = my;
							}
							else {
								newx = lastMob.x + dx*j + Math.random()*10 - 5, newy = lastMob.y + dy*j + Math.random()*10 - 5;
							}
							c.strokeStyle = '#000';
							c.lineWidth = 8;
							c.lineTo(newx,newy);
							c.stroke();
							c.moveTo(x,y);
							c.strokeStyle = ZAP_COLORS[t.level - 1];
							c.lineWidth = 2;
							c.lineTo(newx,newy);
							c.stroke();
							x = newx, y = newy;
						}
						lastMob = t.branches[i];
					}
				}
				/*if (t.xmob){
					mx = t.xmob.x, my = t.xmob.y;
					dx = (mx - x)/10, dy = (my - y)/10;
					for (var i=1; i<11; i++){
						if (i == 10){
							newx = mx, newy = my;
						}
						else {
							newx = t.mob.x + dx*i + Math.random()*10 - 5, newy = t.mob.y + dy*i + Math.random()*10 - 5;
						}
						c.strokeStyle = '#000';
						c.lineWidth = 8;
						c.lineTo(newx,newy);
						c.stroke();
						c.moveTo(x,y);
						c.strokeStyle = ZAP_COLORS[t.level - 1];
						c.lineWidth = 2;
						c.lineTo(newx,newy);
						c.stroke();
						x = newx, y = newy;
					}
				}*/
			}
			c.lineWidth = 1;
		}
		L.tick = function tick(){
			var t = this;
			t.draw();
			if (t.cooldown){
				t.cooldown--;
				return;
			}
			if (!t.zapping) {
				t.mob = 0;
				t.branches = [];
				if (spec === 2 && power.value){
					var branch = 0;
					var m = mobs.getFirst();
					var last = t;
					while (m.speed){
						if ((m.x - last.x)*(m.x - last.x) + (m.y - last.y)*(m.y - last.y) <= t.range*t.range){
							if (!branch) t.mob = m;
							else t.branches[branch-1] = m;
							if (++branch === CHAIN_LEN) break;
							last = m;
						}
						m = m.next;
					}
				}
				else{
					var m = mobs.getFirst();
					while (m.speed){
						if ((m.x - t.x)*(m.x - t.x) + (m.y - t.y)*(m.y - t.y) <= t.range*t.range){
							t.mob = m;
							break;
						}
						m = m.next;
					}
				}
				
				if (!t.mob) return;
				t.zapping = ZAP_LENGTH;
			}

			t.zapping--;
			if (!t.zapping) t.cooldown = t.delay;

			if (t.mob.hit(t.damage, ZAP_CRIT)) {
				t.cooldown = t.delay;
				t.zapping = 0;
			}
			for (var i=0; i<CHAIN_LEN; i++){
				if (t.branches[i]){
					t.branches[i].hit(t.damage, ZAP_CRIT);
				}
			}
			t.zap();
		}
		
		return LightTower;
	})()

	var towerTypes = [Tower, LightTower, IceTower, FireTower];
	
	buttons.add(new Button(10, 400, 100, 30, "Start", function(){started = 1;}))
	buttons.add(new Button(10, 440, 100, 30, "Pause", pause))
	if (spec){
		var types = ["Earth","Electro","Frost","Fire"];
		const UTEXT = "Unleash "+types[spec-1]+" Fury!";
		const UX = 10, UY = 350, UW = 140, UH = 40;
		const FURY_LENGTH = fps*10;
		const FURY_COOLDOWN = fps*60;
		buttons.add(power = new Button(UX, UY, UW, UH, UTEXT, 0))
		power.cooldown = 0;
		power.tick = function(){
			if (this.value) this.value--;
			else if (this.cooldown) this.cooldown--;
			this.draw();
		}
		power.draw = function(){
			c.fillStyle = '#000';
			c.fillRect(UX, UY, UW, UH);
			if (this.value){
				c.fillStyle = furyColors[spec-1];;
				c.fillRect(UX, UY, UW*(this.value/FURY_LENGTH), UH);
			}
			else{
				c.fillStyle = '#f70';
				c.fillRect(UX, UY, UW*(1 - this.cooldown/(FURY_COOLDOWN)), UH);
				centerText(UX + UW/2, UY + UH/2, 15, '#fff', UTEXT);
			}
			//c.drawImage(furyButtonCanv[spec-1], UX, UY);
			
			if (cx > UX && cx < UX + UW && cy > UY && cy < UY + UH){
				c.strokeStyle = '#ff0';
				c.strokeRect(UX, UY, UW, UH);
			}
		}
		power.action = function(){
			if (this.cooldown) return;
			this.value = FURY_LENGTH;
			this.cooldown = FURY_COOLDOWN;
		}
	}

	Shot.prototype.tick = function tick(){
		var t = this;
		if (!t.mob){
			shots.remove(t);
			return;
		}
		if (Math.sqrt((t.mx-t.x)*(t.mx-t.x) + (t.my-t.y)*(t.my-t.y)) < t.speed) {
			t.x = t.mob.x, t.y = t.mob.y;
			t.draw();
			shots.remove(t);
			t.mob.hit(t.damage, t.crit);
		}
		else{
			if (t.my - t.y == 0){
				t.dy = 0;
				t.dx = t.speed;
			}
			else{
				t.ratio = (t.mx - t.x)/(t.my - t.y);
				if (t.ratio < 0) t.ratio *= -1;

				t.dy = Math.sqrt(t.speed*t.speed/(t.ratio*t.ratio + 1));
				t.dx = t.ratio*t.dy;
			}
			
			if (t.mx - t.x < 0) t.dx *= -1;
			if (t.my - t.y < 0) t.dy *= -1;

			t.x += t.dx;
			t.y += t.dy;

			t.mx = t.mob.x, t.my = t.mob.y;
			t.draw();
		}
		return true;
	}
	Shot.prototype.draw = function draw(){
		c.strokeStyle = '#530';
		c.lineWidth = 2;
		c.beginPath();
		c.moveTo(this.x - this.dx, this.y - this.dy);
		c.lineTo(this.x, this.y);
		c.stroke();
		c.lineWidth = 1;
	}
	function Shot(x, y, r, mob, speed, damage, crit){
		if (!mob) return;
		var t = this;
		shots.add(t);
		t.mob = mob;
		t.mx = mob.x, t.my = mob.y, t.x = x, t.y = y, t.r = r;
		t.speed = speed/fps;
		t.damage = damage;
		t.crit = crit;
	}
	
	function Bomb(x,y,r,mob,speed,damage,crit,blastRadius){
		Shot.prototype.constructor.call(this,x,y,r,mob,speed,damage,crit);
		this.blastRadius = blastRadius;
	}
	B = Bomb.prototype = new Shot();
	B.constructor = Bomb;
	B.explode = function explode(){
		var t = this;
		shots.remove(t);
		var m = mobs.getFirst();
		while (m.speed){
			if (m.contains(t.x, t.y, t.blastRadius)) m.hit(t.damage, t.crit);
			m = m.next;
		}
		new Explosion(t.x, t.y);
	}
	B.tick = function tick(){
		var t = this;
		if (Math.sqrt((t.mx-t.x)*(t.mx-t.x) + (t.my-t.y)*(t.my-t.y)) < t.speed) {
			if (t.mob) {
				t.x = t.mob.x;
				t.y = t.mob.y;
			}
			t.draw();
			t.explode();
		}
		else{
			if (t.my - t.y == 0){
				t.dy = 0;
				t.dx = t.speed;
			}
			else{
				t.ratio = (t.mx - t.x)/(t.my - t.y);
				if (t.ratio < 0) t.ratio *= -1;

				t.dy = Math.sqrt(t.speed*t.speed/(t.ratio*t.ratio + 1));
				t.dx = t.ratio*t.dy;
			}

			t.x = (t.mx - t.x > 0) ? t.x + t.dx : t.x - t.dx;
			t.y = (t.my - t.y > 0) ? t.y + t.dy : t.y - t.dy;

			if (t.mob) t.mx = t.mob.x, t.my = t.mob.y;
			t.draw();
		}
		return true;
	}
	B.draw = function draw(){
		var t = this;
		c.fillStyle = '#f70';
		c.beginPath();
		c.arc(t.x, t.y, BOMB_RADIUS, 0, 360);
		c.fill();
		c.fillStyle = '#ff0';
		c.beginPath();
		c.arc(t.x, t.y, BOMB_RADIUS/2, 0, 360);
		c.fill();
	}
	
	function Worm(x, y, mob, damage, crit){
		shots.add(this);
		this.x = x;
		this.y = y;
		this.mob = mob;
		this.damage = damage;
		this.crit = crit;
		this.chain = [x,y,x,y,x,y,x,y,x,y,x,y,x,y];
	}
	Worm.prototype.tick = function(){
		var t = this;
		//console.log(t.chain[0] + " "+ t.chain[1]);
		t.mx = t.mob.x;
		t.my = t.mob.y;
		
		if (Math.sqrt((t.mx-t.x)*(t.mx-t.x) + (t.my-t.y)*(t.my-t.y)) < WORM_SPEED) {
			t.x = t.mob.x, t.y = t.mob.y;
			t.draw();
			shots.remove(t);
			t.mob.hit(t.damage, t.crit);
		}
		else{
			if (t.my - t.y == 0){
				t.dy = 0;
				t.dx = WORM_SPEED;
			}
			else{
				t.ratio = (t.mx - t.x)/(t.my - t.y);
				if (t.ratio < 0) t.ratio *= -1;

				t.dy = Math.sqrt(WORM_SPEED*WORM_SPEED/(t.ratio*t.ratio + 1));
				t.dx = t.ratio*t.dy;
			}
			
			if (t.mx - t.x < 0) t.dx *= -1;
			if (t.my - t.y < 0) t.dy *= -1;

			t.x += t.dx;
			t.y += t.dy;
			
			if (Math.sqrt((t.x - t.chain[0])*(t.x - t.chain[0]) + (t.y - t.chain[1])*(t.y - t.chain[1])) > 6){
				for (var i=13; i>1; i--){
					t.chain[i] = t.chain[i-2];
				}
				t.chain[0] = t.x;
				t.chain[1] = t.y;
			}

			t.draw();
		}
		//console.log(t.x+" "+t.y+" "+t.mx+" "+t.my+" "+t.dx+" "+t.dy);
	}
	Worm.prototype.draw = function(){
		var t = this;
		c.fillStyle = '#f44';
		for (var i=0; i<7; i++){
			c.beginPath();
			c.arc(t.chain[2*i], t.chain[2*i + 1], /*(6 - (i<=3?3-i:i-3))*/ 3, 0, 360);
			c.fill();
		}
	}

	Bolt.prototype.tick = function tick(){
		var t = this;
		t.x += t.dx;
		t.y += t.dy;
		t.draw();
		var m = mobs.getFirst();
		while (m.speed){
			if (m.contains(t.x, t.y, 0)){
				m.hit(t.damage, t.crit);
				shots.remove(t);
				break;
			}
			m = m.next;
		}
		t.ticks--;
		if (!t.ticks) shots.remove(t);
	}
	Bolt.prototype.draw = function draw(){
		c.strokeStyle = '#bdf';
		c.beginPath();
		c.moveTo(this.x,this.y);
		c.lineTo(this.x + this.dx*this.len, this.y + this.dy*this.len);
		c.stroke();
	}
	function Bolt(x, y, xx, yy, len, speed, damage, crit){
		if (!speed) return;
		var t = this;
		shots.add(t);
		t.speed = speed/fps;
		t.damage = damage;
		t.crit = crit;
		t.len = len, t.y = y, t.x = x;
		var lx = xx - x, ly = yy - y;
		t.ticks = (Math.sqrt(lx*lx + ly*ly)/t.speed)>>0;

		if (ly == 0){
			t.dy = 0;
			t.dx = t.speed;
		}
		else{
			t.ratio = lx/ly;
			if (t.ratio < 0) t.ratio *= -1;

			t.dy = Math.sqrt(t.speed*t.speed/(t.ratio*t.ratio + 1));
			t.dx = t.ratio*t.dy;
		}
		if (lx < 0) t.dx *= -1;
		if (ly < 0) t.dy *= -1;
	}

	C = IceBolt.prototype = new Bolt();
	C.constructor = IceBolt;
	C.tick = function tick(){
		var t = this;
		t.x += t.dx;
		t.y += t.dy;
		t.draw();
		var m = mobs.getFirst();
		while (m.speed){
			if (m.contains(t.x, t.y, 0)){
				m.hit(t.damage, t.crit);
				if (!m.chill) m.chill = new Chill(m, t.slowRate);
				shots.remove(t);
				break;
			}
			m = m.next;
		}
		t.ticks--;
		if (!t.ticks) shots.remove(t);
	}
	function IceBolt(x, y, xx, yy, len, speed, damage, crit, slowRate){
		Bolt.prototype.constructor.call(this,x,y,xx,yy,len,speed,damage,crit);
		this.slowRate = slowRate;
	}

	O = Orb.prototype = new Bolt();
	O.constructor = Orb;
	O.tick = function tick(){
		var t = this;
		t.x += t.dx;
		t.y += t.dy;
		t.ticks--;
		t.draw();
		var m = mobs.getFirst();
		while (m.speed){
			if (m.contains(t.x, t.y, t.r)) {
				m.hit(t.orbDamage, t.crit);
				if (!m.chill) m.chill = new Chill(m, t.slowRate);
			}
			m = m.next;
		}
		for (var i=0; i<2; i++){
			new IceBolt(t.x, t.y, t.x + Math.sin(t.tock)*BOLT_RANGE, t.y + Math.cos(t.tock)*BOLT_RANGE, 2, BOLT_SPEED, t.damage, BOLT_CRIT, t.slowRate);//100 is the range of the Bolt
			if (spec == 3 && power.value) new IceBolt(t.x, t.y, t.x + Math.sin(t.tock - Math.PI)*BOLT_RANGE, t.y + Math.cos(t.tock - Math.PI)*BOLT_RANGE, BOLT_LENGTH, BOLT_SPEED, t.damage, BOLT_CRIT, t.slowRate);
			t.tock += ORB_TOCK;
		}
		
		if (!t.ticks) shots.remove(t);
	}
	O.draw = function draw(){
		c.fillStyle = '#bdf';
		c.beginPath();
		c.arc(this.x, this.y, this.r, 0, 360);
		c.fill();
	}
	function Orb(x, y, xx, yy, r, speed, damage, orbDamage, slowRate){
		//alert((xx-x)+" "+(yy-y));
		var t = this;
		Bolt.prototype.constructor.call(t,x,y,xx,yy,0,speed,damage,ORB_CRIT);
		t.r = r;
		t.tock = 0;
		t.orbDamage = orbDamage;
		t.slowRate = slowRate;
	}

	function contains(x, y, px, py, w, h){
		if (px - w/2 < x && x < px + w/2 && py - h/2 < y && y < py + h/2) return true;
		else return false;
	}
	function Menu(spot){
		var t = this;
		var s = spots[spot];
		var item,tower;
		t.x = s[0];
		t.y = s[1];
		//MENU ITEM POSITIONS: 
		//0 = 0,-50
		//1 = 0, 50
		//2 = -50, 0
		//3 = 50, 0
		const mr = 50; //menu radius
		const mi = [[0,-mr],[0,mr],[-mr,0],[mr,0]];
		function update(){
			item = [];
			t.tower = tower = s[2];
			if (tower){
				item[0] = tower.level == MAX_TOWER_LEVEL ? 0 : {action:function(){return tower.upgrade()},
					info: ["Upgrade to level "+(tower.level + 1), 0,0,0, "Damage: "+TOWER_DMG[tower.type][tower.level], "Range: "+TOWER_RANGES[tower.type][tower.level], "Cost: "+TOWER_BUY[tower.type][tower.level]+" gold"]}
				item[1] = {action:function(){return tower.sell()}, info:["Sell for "+TOWER_SELL[tower.type][tower.level-1]+" gold"]}
			}
			else{
				item[0] = {action:function(){return addTower(spot,0)}, info:pelletInfo};
				item[1] = {action:function(){return addTower(spot,1)}, info:lightInfo};
				item[2] = {action:function(){return addTower(spot,2)}, info:iceInfo};
				item[3] = {action:function(){return addTower(spot,3)}, info:fireInfo};
			}
		}
		function drawArrow(x,y,r){
			c.save();
			c.fillStyle = '#444';
			c.beginPath();
			c.arc(x,y,20,0,360)
			c.fill();
			c.strokeStyle = '#4f4';
			c.lineWidth = 3;
			c.beginPath();
			c.moveTo(x, y - r);
			c.lineTo(x, y + r);
			c.moveTo(x, y - r);
			c.lineTo(x - r, y);
			c.moveTo(x, y - r);
			c.lineTo(x + r, y);
			c.stroke();
			c.restore();
		}
		function drawX(x,y,r){
			c.save();
			c.fillStyle = '#444';
			c.beginPath();
			c.arc(x,y,20,0,360)
			c.fill();
			c.strokeStyle = '#f44';
			c.lineWidth = 3;
			c.beginPath();
			c.moveTo(x - r, y - r);
			c.lineTo(x + r, y + r);
			c.moveTo(x - r, y + r);
			c.lineTo(x + r, y - r);
			c.stroke();
			c.restore();
		}
		t.click = function click(x,y){
			for (var i=0; i<4; i++){
				if (!item[i]) continue;
				if (x > t.x + mi[i][0] - 20 && x < t.x + mi[i][0] + 20 && y > t.y + mi[i][1] - 20 && y < t.y + mi[i][1] + 20) {
					if (!item[i].action()) update();
					else menu = tt.show = 0;
					return;
				}
			}
		}
		t.draw = function draw(){
			c.fillStyle = 'rgba(0,0,0,.2)';
			c.strokeStyle = '#ff0';
			var hover = 9;
			for (var i=0; i<4; i++)
				if (contains(cx, cy, t.x + mi[i][0], t.y + mi[i][1], 40, 40)) hover = i;
			
			tt.show = false;
			if (tower){ //Draw Tower upgrade and sell buttons
				c.beginPath();
				if (hover === 0 && tower.level < MAX_TOWER_LEVEL){
					c.fillStyle = 'rgba(55,55,255,.3)';
					c.arc(t.x, t.y, TOWER_RANGES[tower.type][tower.level], 0, 360);
				}
				else c.arc(t.x, t.y, tower.range, 0, 360);
				c.fill();
				
				if (tower.level < MAX_TOWER_LEVEL) {
					drawArrow(t.x, t.y - mr, 15);
				}
				drawX(t.x, t.y + mr, 12);
				
				for (i=0; i<2; i++){
					if (hover == i){
						c.beginPath();
						c.arc(t.x + mi[i][0], t.y + mi[i][1], 20, 0, 360);
						c.stroke();
						if (!tt.show){
							tt.x = t.x + mi[i][0];
							tt.y = t.y + mi[i][1];
							tt.text = item[i].info;
							tt.measure();
							tt.show = true;
						}
					}
				}
			}
			else{ //Draw Tower Build buttons
				if (hover === 9){ //If nothing is being hovered over
					c.fillStyle = 'rgba(0,0,0,.2)';
					c.beginPath();
					c.arc(t.x, t.y, 80, 0, 360);
					c.fill();
				}
				else{
					for (var i=0; i<4; i++){
						if (hover === i) {
							c.fillStyle = 'rgba(55,55,255,.3)';
							c.beginPath();
							c.arc(t.x, t.y, TOWER_RANGES[i][0], 0, 360);
							c.fill();
							if (!tt.show){
								tt.x = t.x + mi[i][0];
								tt.y = t.y + mi[i][1];
								tt.text = item[i].info;
								tt.measure();
								tt.show = true;
							}
						}
					}
				}
				for (i=0; i<4; i++){
					c.drawImage(towerTypes[i].prototype.img[3], t.x + mi[i][0] - 20, t.y + mi[i][1] - 20);
					if (hover == i) {
						c.beginPath();
						c.arc(t.x + mi[i][0], t.y + mi[i][1], 20, 0, 360);
						c.stroke();
					}
				}
			}
		}
		update();
	}
	
	this.click = function click(){
		var x = cx, y = cy;
		
		if (menu){
			if (Math.sqrt((x-menu.x)*(x-menu.x) + (y-menu.y)*(y-menu.y)) < 70){ //fix the 70 to match dynamic tower range circle
				menu.click(x,y);
				return;
			}
			menu = 0;
		}

		var s;
		for (var i=0; i<spots.length; i++){
			s = spots[i];
			if (contains(x,y, s[0], s[1], 30, 30)){
				menu = new Menu(i);
				return;
			}
		}
		
		var b = buttons.getFirst();
		while (b.x != undefined){
			if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) {
				b.action();
				return;
			}
			b = b.next;
		}
	}
	
	this.tick = function tick(){ //currently about 35% of execution with frost1, fire1, frost3, light1
		c.clearRect(0,0,640,480);
		c.fillStyle = '#f90';
		c.fillText(gold, 600, 10);
		c.fillText(mobs.count, 500, 10);
		c.fillText(lives, 100, 10);
		
		if (started){
			if (frame++ == nextFrame){
				var w = waves[wave];
				var m = currentMob;
				new Mob(w[m*2]);
				if (m*2 + 1 == w.length - 1 && wave == waves.length - 1){
					started = 0;
					done = 1;
				}
				else{
					if (m*2 + 1 == w.length - 1){
						w = waves[++wave];
						m = -1;
					}
					m++;
					nextFrame = (w[m*2 + 1]/fps)>>0;
					frame = 0;
				}
				currentMob = m;
			}
		}
		else{
			if (!mobs.count && done) victory();
		}

		var m = mobs.getFirst();
		while (m.tick != undefined) {
			m.tick();
			m = m.next;
		}
		m = mobs.getFirst();
		while (m.tick != undefined){
			m.drawHP();
			m = m.next;
		}

		for (var i=0; i<spots.length; i++){
			if (spots[i][2])
				spots[i][2].tick();
			else{
				c.fillStyle = '#985';
				if (contains(cx,cy,spots[i][0],spots[i][1],30,30)) c.strokeStyle = '#db0';
				else c.strokeStyle = '#333';
				c.fillRect(spots[i][0] - 15, spots[i][1] - 15, 30, 30);
				c.strokeRect(spots[i][0] - 15, spots[i][1] - 15, 30, 30);
			}
		}

		var s = shots.getFirst();
		while (s.tick != undefined) {
			s.tick();
			s = s.next;
		}

		var b = buttons.getFirst();
		while (b.x != undefined){
			b.tick();
			b = b.next;
		}

		if (menu) menu.draw();
		if (tt.show) tt.tick();
		
		iter++;
		if (iter == 15){
			iter = 0;
			newMS = (new Date()).getTime();
			if (oldMS){
				document.getElementById('fps').innerHTML = ((150000/(newMS - oldMS))>>0)/10;
	}
			oldMS = newMS;
		}
	}
	//Add code to remove this listener when leaving a level
	window.addEventListener('resize', function resize(){if (window.innerHeight < 480) pauseOnly();}, false);
	window.addEventListener('keypress', function(e){if (e.which == 112) pause();}, false)
	
	thing = LightTower;
}

canv.addEventListener('click', function click(){screen.click();}, false);
wrap = document.getElementById('wrap');
canv.addEventListener('mousemove', function mousemove(e){
	cx = e.clientX - wrap.offsetLeft;
	cy = e.clientY - wrap.offsetTop + window.pageYOffset;
}, false);

var screen = main;
timer = setInterval(function(){screen.tick()}, timerDelay);
/*function go(){
	screen.tick();
	timer = setTimeout(go, timerDelay);
}
go();*/

/*newRoute = 0;
function addRoute(){
	if (!newRoute) newRoute = "[";
	else newRoute += ",";
	newRoute += "["+cx+","+cy+"]";
	console.log(newRoute+"]");
}
canv.addEventListener('click', addRoute, false);*/
