/*
"Egyszerű side scroller shot'em up játék űrhajóval"
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



//Initialize the Game and start it.
var game = new Game();

function init() {
	if(game.init())
		game.start();
}



// Define an object to hold all our images for the game so images
// are only ever created once. This type of object is known as a 
// singleton.

var imageRepository = new function() {
	// Define images
	this.background = new Image();
	this.foreground = new Image();
	this.spaceship = new Image();
	this.bullet = new Image();

	// Ensure all images have loaded before starting the game
	var numImages = 4;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}
	this.background.onload = function() {
		imageLoaded();
	}
	this.foreground.onload = function() {
		imageLoaded();		
	}
	this.spaceship.onload = function() {
		imageLoaded();
	}
	this.bullet.onload = function() {
		imageLoaded();
	}
	
	// Set images src
	this.background.src = "imgs/test.png";
	this.foreground.src = "imgs/fg.png";
	this.spaceship.src = "imgs/ship.png";
	this.bullet.src = "imgs/bullet.png";
}


// Creates the Drawable object which will be the base class for
// all drawable objects in the game. Sets up defualt variables
// that all child objects will inherit, as well as the defualt
// functions. 
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



// Creates the Background object which will become a child of
// the Drawable object. The background is drawn on the "background"
// canvas and creates the illusion of moving by panning the image.
function Background() {
	this.scrollXSpeed = 0.5; // Relative speed of scrolling
	// Implement abstract function
	this.draw = function(shipXRatio) {
		// Scroll
		this.x = shipXRatio * this.canvasWidth * this.scrollXSpeed;
		this.context.drawImage(imageRepository.background, this.x, this.y);
		// Extend the background
		this.context.drawImage(imageRepository.background, this.x - this.canvasWidth, this.y /*- this.canvasHeight*/);
		this.context.drawImage(imageRepository.background, this.x + this.canvasWidth, this.y /*- this.canvasHeight*/);
		// If the image scrolled off the screen, reset
		// XXX NOT NEEDED IN THEFINAL VERSION
		/*if (this.x >= this.canvasWidth/4 || this.x <= -this.canvasWidth/4)
		{
			this.speed *= -1;
		}
		*/
		// Emergency reset - Should be included in the infinal version
		if (this.x >= this.canvasWidth || this.x <= -this.canvasWidth)
		{
			this.x = 0;
		}
	};
}

function Foreground() {
	this.scrollXSpeed = 1.0; // Relative speed of scrolling
	// Implement abstract function
	this.draw = function(shipXRatio) {
		// Clear foreground
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		// Scroll
		this.x = shipXRatio * this.canvasWidth * this.scrollXSpeed;
		this.context.drawImage(imageRepository.foreground, this.x, this.y);
		// Extend the background
		this.context.drawImage(imageRepository.foreground, this.x - this.canvasWidth, this.y /*- this.canvasHeight*/);
		this.context.drawImage(imageRepository.foreground, this.x + this.canvasWidth, this.y /*- this.canvasHeight*/);
		// If the image scrolled off the screen, reset
		// XXX NOT NEEDED IN THEFINAL VERSION
		/*
		if (this.x >= this.canvasWidth/2 || this.x <= -this.canvasWidth/2)
		{
			this.speed *= -1;
		}
		// Emergency reset - Should be included in the infinal version
		if (this.x >= this.canvasWidth || this.x <= -this.canvasWidth)
		{
			this.x = 0;
		}
		*/
	};
}

// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();
Foreground.prototype = new Drawable();


// Creates the Bullet object which the ship fires. The bullets are
// drawn on the "main" canvas.
function Bullet() {	
	this.alive = false; // Is true if the bullet is currently in use
	
	 // Sets the bullet values
	 this.spawn = function(x, y, speed) {
	 	this.x = x;
	 	this.y = y;
	 	this.speed = speed;
	 	this.alive = true;
	 };

	 this.draw = function() {
	 	this.context.clearRect(this.x, this.y, this.width, this.height);
	 	this.y -= this.speed;
	 	if (this.y <= 0 - this.height) {
	 		return true;
	 	}
	 	else {
	 		this.context.drawImage(imageRepository.bullet, this.x, this.y);
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
	
	this.init = function() {
		for (var i = 0; i < size; i++) {
			// Initalize the bullet object
			var bullet = new Bullet();
			bullet.init(0,0, imageRepository.bullet.width,
				imageRepository.bullet.height);
			pool[i] = bullet;
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
	for (var i = 0; i < size; i++) {
			// Only draw until we find a bullet that is not alive
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
	this.bulletPool.init();

	var fireRate = 15;
	var counter = 0;

	this.draw = function() {
		this.context.drawImage(imageRepository.spaceship, this.x, this.y);
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
				if (this.y <= this.canvasHeight/4*3)
					this.y = this.canvasHeight/4*3;
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
		this.bulletPool.getTwo(this.x+6, this.y, 3,
			this.x+33, this.y, 3);
	};
}
Ship.prototype = new Drawable();


 // Creates the Game object which will hold all objects and data for the game.
 function Game() {

 	this.init = function() {
		// Get the canvas elements
		this.bgCanvas = document.getElementById('background');
		this.fgCanvas = document.getElementById('foreground');
		this.shipCanvas = document.getElementById('ship');
		this.mainCanvas = document.getElementById('main');
		
		// Test to see if canvas is supported. Only need to
		// check one canvas
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.fgContext = this.fgCanvas.getContext('2d');
			this.shipContext = this.shipCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');

			// Initialize objects to contain their context and canvas
			// information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Foreground.prototype.context = this.fgContext;
			Foreground.prototype.canvasWidth = this.fgCanvas.width;
			Foreground.prototype.canvasHeight = this.fgCanvas.height;
			
			Ship.prototype.context = this.shipContext;
			Ship.prototype.canvasWidth = this.shipCanvas.width;
			Ship.prototype.canvasHeight = this.shipCanvas.height;
			
			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;
			
			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0

			this.foreground = new Foreground();
			this.foreground.init(0,0); // Set draw point to 0,0
			
			// Initialize the ship object
			this.ship = new Ship();
			// Set the ship to start near the bottom middle of the canvas
			var shipStartX = this.shipCanvas.width/2 - imageRepository.spaceship.width;
			var shipStartY = this.shipCanvas.height/4*3 + imageRepository.spaceship.height*2;
			this.ship.init(shipStartX, shipStartY, imageRepository.spaceship.width,
				imageRepository.spaceship.height);

			return true;
		} else {
			return false;
		}
	};
	
	// Start the animation loop
	this.start = function() {
		this.ship.draw();
		animate();
	};
}


 // The animation loop. 
 function animate() {
 	requestAnimFrame( animate );
 	let shipXRatio = (game.ship.x - game.background.canvasWidth/2)/game.background.canvasWidth/2
 	game.background.draw(shipXRatio);
 	game.foreground.draw(shipXRatio);
 	game.ship.move();
 	game.ship.bulletPool.animate(); 
 }


// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
	32: 'space',
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
}

// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
	KEY_STATUS[KEY_CODES[code]] = false;
}

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