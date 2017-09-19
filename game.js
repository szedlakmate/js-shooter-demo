/*
"Egyszerű side scroller shoot'em up játék űrhajóval"
Author: Máté Szedlák
16/09/2017

Please note, that since I am a brand new junior in this field, 
I tried to google up the available resources and hints on making
HTML5 games.

Using the knowledge I found online, I was able to write this code.
After all I feel the need to enlist the most important sources I
was using starting with the most important:

* Throughout step-by-step guide for writin vanilla JS HTML spacestuff game:
http://blog.sklambert.com/html5-canvas-game-panning-a-background/

* Another site but with PIXI+TypeScript: [abandoned]
https://sbcgamesdev.blogspot.hu/2015/05/phaser-tutorial-dronshooter-simple-game.html

* HTML5 canvas design tips:
https://www.slideshare.net/ernesto.jimenez/5-tips-for-your-html5-games

*/

//Initialize the Game and start it
var game = new Game();

function init() {
	if(game.init())
		game.drawMenu();
}


// Define an object to hold all our images for the game
var imageRepository = new function() {
	// Define images
	// WARNING: the resource should be: imgs/<objPropName>.png
	// 		    e.g: imgs/spaceship.png
	this.img = {background: new Image(), foreground: new Image(), spaceship:new Image(), bullet:new Image(), logo: new Image(), game1: new Image(), game2: new Image(), game3: new Image(), exit: new Image(), enemy: new Image(), enemyBullet: new Image()}

	// Ensure all images have loaded before starting the game
	var numLoaded = 0;

	function imageLoaded() {
		numLoaded++;
		if (numLoaded === imageRepository.numImages) {
			window.init();
		}
	}

	// Number of linked images
	this.numImages = 0;
	for (var prop in this.img){
		this.numImages++;
		prop.src = "imgs/" + prop.toString() + ".png";
	}

	// Set onload event and images src
	for (var prop in this.img){
		this.img[prop].onload = function() {
			imageLoaded();
		}
		this.img[prop].src = "imgs/" + prop.toString() + ".png";
	}
}

// Creates the Drawable object which will be the base class for all drawable objects in the game
function Drawable() {
	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	
	// Define abstract function to be implemented in child objects
	this.draw = function() {
	};
	this.move = function() {
	};
}



// Creates the Background object which will become a child of the Drawable object.
function Background() {
	this.scrollYSpeed = 0.25; // Relative speed of Y-scrolling
	this.speed = 0.5; // X-axis speed
	// Implement abstract function
	this.draw = function(shipYRatio) {
		// Scroll
		this.y = -shipYRatio * this.canvasWidth * this.scrollYSpeed;
		this.x -= this.speed;
		this.context.drawImage(imageRepository.img.background, this.x, this.y);
		// Extend the background
		this.context.drawImage(imageRepository.img.background, this.x, this.y - this.canvasHeight);
		this.context.drawImage(imageRepository.img.background, this.x, this.y + this.canvasHeight);
		this.context.drawImage(imageRepository.img.background, this.x + this.canvasWidth, this.y);
		this.context.drawImage(imageRepository.img.background, this.x + this.canvasWidth, this.y - this.canvasHeight);
		this.context.drawImage(imageRepository.img.background, this.x + this.canvasWidth, this.y + this.canvasHeight);

		// If the image scrolled off the screen, reset
		if (this.x <= -this.canvasWidth)
		{
			this.x = 0;
		}
	};
}

function Foreground() {
	this.scrollYSpeed = 0.5; // Relative speed of Y-scrolling
	this.speed = 1.0; // Speed of X-scrolling

	// Implement abstract function
	this.draw = function(shipYRatio) {
		// Clear foreground
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		// Scroll
		this.y = -shipYRatio * this.canvasWidth * this.scrollYSpeed;
		this.x -= this.speed;
		this.context.drawImage(imageRepository.img.foreground, this.x, this.y);
		// Extend the background
		this.context.drawImage(imageRepository.img.foreground, this.x, this.y - this.canvasHeight);
		this.context.drawImage(imageRepository.img.foreground, this.x, this.y + this.canvasHeight);
		this.context.drawImage(imageRepository.img.foreground, this.x + this.canvasWidth, this.y);
		this.context.drawImage(imageRepository.img.foreground, this.x + this.canvasWidth, this.y - this.canvasHeight);	
		this.context.drawImage(imageRepository.img.foreground, this.x + this.canvasWidth, this.y + this.canvasHeight);

		// If the image scrolled off the screen, reset
		if (this.x <= -this.canvasWidth)
		{
			this.x = 0;
		}
	};
}

function Menu() {
	// Menu Layout on Y-axis
	this.layoutY = [10, 150, 250, 350, 450];

	// Implement abstract function
	this.draw = function(shipXRatio) {
		this.context.drawImage(imageRepository.img.logo, (this.canvasWidth - imageRepository.img.logo.width)/2, this.layoutY[0]);
		this.context.drawImage(imageRepository.img.game1, (this.canvasWidth - imageRepository.img.game1.width)/2, this.layoutY[1]);
		this.context.drawImage(imageRepository.img.game2, (this.canvasWidth - imageRepository.img.game2.width)/2, this.layoutY[2]);
		this.context.drawImage(imageRepository.img.game3, (this.canvasWidth - imageRepository.img.game3.width)/2, this.layoutY[3]);
		this.context.drawImage(imageRepository.img.exit, (this.canvasWidth - imageRepository.img.exit.width)/2, this.layoutY[4]);
	};

	this.clear = function() {
		// Clear foreground
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
	}
}

// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();
Foreground.prototype = new Drawable();
Menu.prototype = new Drawable();


// Creates the Bullet object which the ship fires. The bullets are
// drawn on the "main" canvas.
function Bullet(object) {	
	this.alive = false; // Is true if the bullet is currently in use

	var self = object;

	// Sets the bullet values
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};

	this.draw = function() {
		this.context.clearRect(this.x-1, this.y-1, this.width+1, this.height+1);
		this.x += this.speed;
		if (self === "bullet" && this.x >= this.canvasWidth) {
			return true;
		}
		else if (self === "enemyBullet" && this.x <=  0 - this.Height) {
			return true;
		}
		else {
			if (self === "bullet") {
				this.context.drawImage(imageRepository.img.bullet, this.x, this.y);
			}
			else if (self === "enemyBullet") {
				this.context.drawImage(imageRepository.img.enemyBullet, this.x, this.y);
			}
			return false;
		}
	};

	// Resets the bullet values
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	};
}
Bullet.prototype = new Drawable();


// Custom Pool object. Holds Bullet objects to be managed to prevent
// garbage collection. 
function Pool(maxSize) {
	var size = maxSize; // Max bullets allowed in the pool
	var pool = [];
	
	this.init = function(object) {
		if (object == "bullet") {
			for (var i = 0; i < size; i++) {
				// Initalize the object
				var bullet = new Bullet("bullet");
				bullet.init(0,0, imageRepository.img.bullet.width, imageRepository.img.bullet.height);
				pool[i] = bullet;
			}
		}
		else if (object == "enemy") {
			for (var i = 0; i < size; i++) {
				var enemy = new Enemy();
				enemy.init(0,0, imageRepository.img.enemy.width, imageRepository.img.enemy.height);
				pool.unshift(enemy);
			}
		}
		else if (object == "enemyBullet") {
			for (var i = 0; i < size; i++) {
				var bullet = new Bullet("enemyBullet");
				bullet.init(0,0, imageRepository.img.enemyBullet.width, imageRepository.img.enemyBullet.height);
				pool[i] = bullet;
			}
		}
	};
	
	this.get = function(x, y, speed) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	};

	this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
		if(!pool[size - 1].alive && 
			!pool[size - 2].alive) {
			this.get(x1, y1, speed1);
		this.get(x2, y2, speed2);
	}
};

this.animate = function() {
	let actualTime = new Date()
	actualtime = actualTime.getHours()*60*60 + actualTime.getMinutes()*60 + actualTime.getSeconds()
	
	if (!this.time) {
		if (actualTime - this.time > 2.0 || actualTime - this.time < 0) {
			this.time = actualtime;
			game.addEnemy();
			/*
			game.enemyPool.init("enemy");
			game.enemyPool.get(game.shipCanvas.width- imageRepository.img.enemy.width, Math.random()*game.shipCanvas.height*0.9+10, 2);
			game.enemyBulletPool.init("enemyBullet");*/
		}
	} else this.time = actualtime;
	for (var i = 0; i < size; i++) {
			// Only draw until we find an element that is not alive
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}


function Ship() {
	this.speed = 3;
	this.bulletPool = new Pool(30);
	this.bulletPool.init("bullet");

	var fireRate = 15;
	var counter = 0;

	this.draw = function() {
		this.context.drawImage(imageRepository.img.spaceship, this.x, this.y);
	};
	this.move = function() {	
		counter++;
		// Determine if the action is move action
		if (KEY_STATUS.left || KEY_STATUS.right ||
			KEY_STATUS.down || KEY_STATUS.up) {
			// The ship moved, so erase it's current image so it can
			// be redrawn in it's new location
			this.context.clearRect(this.x, this.y, this.width, this.height);
			
			// Update x and y according to the direction to move and
			// redraw the ship. Change the else if's to if statements
			// to have diagonal movement.
			if (KEY_STATUS.left) {
				this.x -= this.speed
				if (this.x <= 0) // Keep player within the screen
					this.x = 0;
			} else if (KEY_STATUS.right) {
				this.x += this.speed
				if (this.x >= this.canvasWidth - this.width)
					this.x = this.canvasWidth - this.width;
			} else if (KEY_STATUS.up) {
				this.y -= this.speed
				if (this.y <= 0)
					this.y = 0;
			} else if (KEY_STATUS.down) {
				this.y += this.speed
				if (this.y >= this.canvasHeight - this.height)
					this.y = this.canvasHeight - this.height;
			}
			
			// Finish by redrawing the ship
			this.draw();
		}
		
		if (KEY_STATUS.space && counter >= fireRate) {
			this.fire();
			counter = 0;
		}
	};
	
	this.fire = function() {
		this.bulletPool.getTwo(this.x, this.y+6, 3,
			this.x, this.y+33, 3);
	};
}
Ship.prototype = new Drawable();

/**
 * Create the Enemy ship object.
 */
 function Enemy() {
 	var percentFire = .01;
 	var chance = 0;
 	this.alive = false;

	// Sets the Enemy values

	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.speedX = -speed;
		this.speedY = 0;
		this.alive = true;
		this.topEdge = this.y - 90;
		this.bottomEdge = this.y + 90;
	 	//this.leftEdge = this.x - 140;
	 };

	//Move the enemy

	this.draw = function() {
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
		this.x += this.speedX;
		this.y += this.speedY;
		this.speedY += (Math.random()-0.5)*0.5*this.speed;
		if ( Math.abs(this.speedY) > this.speed) this.speedY *= 0.9
			if (this.y <= this.topEdge) {
				this.speedY = Math.abs(this.speedY)/2;
			}
			else if (this.y >= this.bottomEdge + this.width) {
				this.speedY = -Math.abs(this.speedY)/2;
			}

			this.context.drawImage(imageRepository.img.enemy, this.x, this.y);
		// Enemy has a chance to shoot every movement
		chance = Math.floor(Math.random()*101);
		if (chance/100 < percentFire) {
			this.fire();
		}
	};
	/*
	 * Fires a bullet
	 */
	 this.fire = function() {
	 	game.enemyBulletPool.get(this.x+this.width/2, this.y+this.height, -2.5);
	 }
	/*
	 * Resets the enemy values
	 */
	 this.clear = function() {
	 	this.x = 0;
	 	this.y = 0;
	 	this.speed = 0;
	 	this.speedX = 0;
	 	this.speedY = 0;
	 	this.alive = false;
	 };
	}
	Enemy.prototype = new Drawable();


 // Creates the Game object which will hold all objects and data for the game.
 function Game() {

	// Swithes
	this.withMenu = true;
	this.game1 = false;
	this.game2 = false;
	this.game3 = false;
	this.exit = false;

	this.init = function() {
		// Get the canvas elements
		this.bgCanvas = document.getElementById('background');
		this.fgCanvas = document.getElementById('foreground');
		this.shipCanvas = document.getElementById('ship');
		this.mainCanvas = document.getElementById('main');
		this.menuCanvas = document.getElementById('menu');
		
		// Test to see if canvas is supported. Only need to
		// check one canvas
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.fgContext = this.fgCanvas.getContext('2d');
			this.shipContext = this.shipCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');
			this.menuContext = this.menuCanvas.getContext('2d');

			// Initialize objects to contain their context and canvas
			// information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.mainCanvas.width;
			Background.prototype.canvasHeight = this.mainCanvas.height;

			Foreground.prototype.context = this.fgContext;
			Foreground.prototype.canvasWidth = this.mainCanvas.width;
			Foreground.prototype.canvasHeight = this.mainCanvas.height;
			
			Ship.prototype.context = this.shipContext;
			Ship.prototype.canvasWidth = this.shipCanvas.width;
			Ship.prototype.canvasHeight = this.shipCanvas.height;
			
			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;
			
			Menu.prototype.context = this.mainContext;
			Menu.prototype.canvasWidth = this.mainCanvas.width;
			Menu.prototype.canvasHeight = this.mainCanvas.height;

			Enemy.prototype.context = this.mainContext;
			Enemy.prototype.canvasWidth = this.mainCanvas.width;
			Enemy.prototype.canvasHeight = this.mainCanvas.height;

			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0

			this.foreground = new Foreground();
			this.foreground.init(0,0); // Set draw point to 0,0

			this.menu = new Menu();
			this.menu.init(0,0); // Set draw point to 0,0
			
			// Initialize the ship object
			this.ship = new Ship();
			// Set the ship to start near the bottom middle of the canvas
			var shipStartX = 5 + imageRepository.img.spaceship.width/2;
			var shipStartY = this.shipCanvas.height/2 - imageRepository.img.spaceship.height/2;
			this.ship.init(shipStartX, shipStartY, imageRepository.img.spaceship.width,
				imageRepository.img.spaceship.height);

			// Initialize the enemy pool object
			this.enemyPool = new Pool(30);
			this.enemyBulletPool = new Pool(50);

			this.enemyPool.init("enemy");
			this.enemyPool.get(this.shipCanvas.width- imageRepository.img.enemy.width, Math.random()*this.shipCanvas.height*0.9+10, 2);
			this.enemyBulletPool.init("enemyBullet");

			/*
			var height = imageRepository.img.enemy.height;
			var width = imageRepository.img.enemy.width;
			var x = 100;
			var y = -imageRepository.img.enemy.height;
			var spacer = y * 1.5;
			for (var i = 1; i <= 18; i++) {
				this.enemyPool.get(x,y,2);
				x += width + 25;
				if (i % 6 == 0) {
					x = 100;
					y += spacer
				}
			}
			*/



			return true;
		} else {
			return false;
		}
	};

	this.addEnemy = function() {
		console.log("Add enemy");
		this.enemyPool.init("enemy");
		this.enemyPool.get(this.shipCanvas.width- imageRepository.img.enemy.width, Math.random()*this.shipCanvas.height*0.9+10, 2);
		this.enemyBulletPool.init("enemyBullet");
	}

	// Mainmenu
	this.drawMenu = function() {
		animate();

		// Add event listener for `click` events.
		this.menuCanvas.addEventListener('click', eventListener = function(event) {

		var x = event.pageX - game.menuCanvas.offsetLeft,
		y = event.pageY - game.menuCanvas.offsetTop;

		if ((x > (game.mainCanvas.width - imageRepository.img.game1.width)/2) && (x < (game.mainCanvas.width + imageRepository.img.game1.width)/2)) {
			if ((y > game.menu.layoutY[1]) && (y < game.menu.layoutY[1] + imageRepository.img.game1.height)) {
				game.game1 = true;
				game.drawMenu = false;
				game.removeEventListener();
				console.log("GAME 1");
				game.start();
			} else if ((y > game.menu.layoutY[2]) && (y < game.menu.layoutY[2] + imageRepository.img.game2.height)) {
				game.game2 = true;
				game.drawMenu = false;
				game.removeEventListener(); 
				console.log("GAME 2");
				game.start();
			} else if ((y > game.menu.layoutY[3]) && (y < game.menu.layoutY[3] + imageRepository.img.game3.height)) {
				game.game3 = true;
				game.drawMenu = false;
				game.removeEventListener();
				console.log("GAME 3");
				game.start();
			} else if ((y > game.menu.layoutY[4]) && (y < game.menu.layoutY[4] + imageRepository.img.exit.height)) {
				game.removeEventListener();
				game.exit = true;
				window.location.href = 'https://9gag.com/';
			}
		}

		}, false);

	};
/*
	this.eventListener = 

*/

	this.removeEventListener = function() {
		this.menuCanvas.removeEventListener('click', eventListener, false);
	}

	// Start screen
	this.start = function() {
		this.withMenu = false;
		this.menu.clear();
		addListeners();
		this.ship.draw();
	};
}


 // The animation loop. 
 function animate() {
 	requestAnimFrame( animate );
 	let shipYRatio = (game.ship.y - game.background.canvasHeight/2)/game.background.canvasHeight/2;

 	if (game.withMenu) game.menu.draw(); else {
 		game.enemyPool.animate();
 		game.enemyBulletPool.animate();
 	}
 	game.background.draw(shipYRatio);
 	game.foreground.draw(shipYRatio);
 	game.ship.move();
 	game.ship.bulletPool.animate(); 

 }


// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
	32: 'space',
	38: 'up',
	40: 'down'
	// Additional buttons
	/*37: 'left',
	39: 'right',*/
}

// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
	KEY_STATUS[KEY_CODES[code]] = false;
}

function screenWidth() {
	return ;
}

function addListeners() {
	document.onkeydown = function(e) {
	 	// Firefox and opera use charCode instead of keyCode to
	  	// return which key was pressed.
	  	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
	  	if (KEY_CODES[keyCode]) {
	  		e.preventDefault();
	  		KEY_STATUS[KEY_CODES[keyCode]] = true;
	  	}
	  }

	  document.onkeyup = function(e) {
	  	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
	  	if (KEY_CODES[keyCode]) {
	  		e.preventDefault();
	  		KEY_STATUS[KEY_CODES[keyCode]] = false;
	  	}
	  }

	}

// requestAnim shim layer by Paul Irish
// Finds the first API that works to optimize the animation loop, 
// otherwise defaults to setTimeout().
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame    || 
	window.oRequestAnimationFrame      || 
	window.msRequestAnimationFrame     || 
	function(/* function */ callback, /* DOMElement */ element){
		window.setTimeout(callback, 1000 / 60);
	};
})();