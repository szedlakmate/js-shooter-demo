/*
"Egyszerű side scroller shot'em up játék űrhajóval"
Author: Máté Szedlák
16/09/2017

Please note, that since I am a brand new junior in this field, 
I tried to google up the available resources and hints on making
HTML5 games.

Using the knowledge I found online, I was able to write this code.
Afterr all I feel the need to enlist the most important sources I
was using starting with the most important:

* Throughout step-by-step guide for writin vanilla JS HTML spacestuff game:
http://blog.sklambert.com/html5-canvas-game-panning-a-background/

* Another site but with PIXI+TypeScript: [abandoned]
https://sbcgamesdev.blogspot.hu/2015/05/phaser-tutorial-dronshooter-simple-game.html

* HTML5 canvas design tips:
https://www.slideshare.net/ernesto.jimenez/5-tips-for-your-html5-games

*/

//console.log("JS connected");

/**
 * Define an object to hold all our images for the game so images
 * are only ever created once. This type of object is known as a
 * singleton.
 */
var imageRepository = new function() {
	// Define images
	this.background = new Image();
	// Set images src
	this.background.src = "imgs/test.png";
}

/**
 * Creates the Drawable object which will be the base class for
 * all drawable objects in the game. Sets up default variables
 * that all child objects will inherit, as well as the default
 * functions.
 */
function Drawable() {
	this.init = function(x, y) {
		// Default variables
		this.x = x;
		this.y = y;
	}
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	// Define abstract function to be implemented in child objects
	this.draw = function() {
	};
}

/**
 * Creates the Background object which will become a child of
 * the Drawable object. The background is drawn on the "background"
 * canvas and creates the illusion of moving by panning the image.
 */
function Background() {
	this.speed = 1; // Redefine speed of the background for panning
	// Implement abstract function
	this.draw = function() {
		// Scroll
		this.x += this.speed;
		this.context.drawImage(imageRepository.background, this.x, this.y);
		// Extend the background
		this.context.drawImage(imageRepository.background, this.x - this.canvasWidth, this.y /*- this.canvasHeight*/);
		this.context.drawImage(imageRepository.background, this.x + this.canvasWidth, this.y /*- this.canvasHeight*/);
		// If the image scrolled off the screen, reset
		// XXX NOT NEEDED IN THEFINAL VERSION
		if (this.x >= this.canvasWidth/4 || this.x <= -this.canvasWidth/4)
		{
			this.speed *= -1;
		}
		// Emergency reset - Should be included in the infinal version
		if (this.x >= this.canvasWidth || this.x <= -this.canvasWidth)
		{
			this.x = 0;
		}
	};
}
// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();

/**
 * Creates the Game object which will hold all objects and data for
 * the game.
 */
function Game() {
	/*
	 * Gets canvas information and context and sets up all game
	 * objects.
	 * Returns true if the canvas is supported and false if it
	 * is not. This is to stop the animation script from constantly
	 * running on older browsers.
	 */
	this.init = function() {
		// Get the canvas element
		this.bgCanvas = document.getElementById('background');
		// Test to see if canvas is supported
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			// Initialize objects to contain their context and canvas
			// information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;
			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0
			return true;
		} else {
			return false;
		}
	};
	// Start the animation loop
	this.start = function() {
		animate();
	};
}

/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
	requestAnimFrame( animate );
	game.background.draw();
}
/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

var game = new Game();
function init() {
	if(game.init())
		game.start();
}