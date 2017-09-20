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

* Explosion with particles:
http://cssdeck.com/labs/particles-explosion-with-html5-canvas

*/

// Wrapping up the whole program
function shootem (){

	//Initialize the Game and start it
	//this.start = function() {
		var game = new Game();
	//}

	this.init = function() {
		if(game.init()) {
			game.initialScreenDraw();
			setTimeout(function(){
				animate();
				game.drawMenu();
			}, 2000);
		}
	}



	// Define an object to hold all our images for the game
	var imageRepository = new function() {
		// Define images
		// WARNING: the resource should be: imgs/<objPropName>.png
		// 		    e.g: imgs/spaceship.png
		this.img = {splashscreen: new Image(), background: new Image(), foreground: new Image(), spaceship:new Image(), 
			bullet:new Image(), logo: new Image(), game1: new Image(), game2: new Image(), 
			game3: new Image(), exit: new Image(), enemy: new Image(), gameover: new Image()}

		// Ensure all images have loaded before starting the game
		var numLoaded = 0;

		function imageLoaded() {
			numLoaded++;
			if (numLoaded === imageRepository.numImages) {
				playgame.init();
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

	/**
	 * QuadTree object.
	 *
	 * The quadrant indexes are numbered as below:
	 *     |
	 *  1  |  0
	 *   —-+—-
	 *  2  |  3
	 *     |
	 */
	 function QuadTree(boundBox, lvl) {
	 	var maxObjects = 10;
	 	this.bounds = boundBox || {
	 		x: 0,
	 		y: 0,
	 		width: 0,
	 		height: 0
	 	};
	 	var objects = [];
	 	this.nodes = [];
	 	var level = lvl || 0;
	 	var maxLevels = 5;
		/*
		 * Clears the quadTree and all nodes of objects
		 */
		 this.clear = function() {
		 	objects = [];
		 	for (var i = 0; i < this.nodes.length; i++) {
		 		this.nodes[i].clear();
		 	}
		 	this.nodes = [];
		 };
		/*
		 * Get all objects in the quadTree
		 */
		 this.getAllObjects = function(returnedObjects) {
		 	for (var i = 0; i < this.nodes.length; i++) {
		 		this.nodes[i].getAllObjects(returnedObjects);
		 	}
		 	for (var i = 0, len = objects.length; i < len; i++) {
		 		returnedObjects.push(objects[i]);
		 	}
		 	return returnedObjects;
		 };
		/*
		 * Return all objects that the object could collide with
		 */
		 this.findObjects = function(returnedObjects, obj) {
		 	if (typeof obj === "undefined") {
		 		console.log("UNDEFINED OBJECT");
		 		return;
		 	}
		 	var index = this.getIndex(obj);
		 	if (index != -1 && this.nodes.length) {
		 		this.nodes[index].findObjects(returnedObjects, obj);
		 	}
		 	for (var i = 0, len = objects.length; i < len; i++) {
		 		returnedObjects.push(objects[i]);
		 	}
		 	return returnedObjects;
		 };
		/*
		* Insert the object into the quadTree. If the tree
		* excedes the capacity, it will split and add all
		* objects to their corresponding nodes.
		*/
		this.insert = function(obj) {
			if (typeof obj === "undefined") {
				return;
			}
			if (obj instanceof Array) {
				for (var i = 0, len = obj.length; i < len; i++) {
					this.insert(obj[i]);
				}
				return;
			}
			if (this.nodes.length) {
				var index = this.getIndex(obj);
				// Only add the object to a subnode if it can fit completely
				// within one
				if (index != -1) {
					this.nodes[index].insert(obj);
					return;
				}
			}
			objects.push(obj);
			// Prevent infinite splitting
			if (objects.length > maxObjects && level < maxLevels) {
				if (this.nodes[0] == null) {
					this.split();
				}
				var i = 0;
				while (i < objects.length) {
					var index = this.getIndex(objects[i]);
					if (index != -1) {
						this.nodes[index].insert((objects.splice(i,1))[0]);
					}
					else {
						i++;
					}
				}
			}
		};
		/*
		 * Determine which node the object belongs to. -1 means
		 * object cannot completely fit within a node and is part
		 * of the current node
		 */
		 this.getIndex = function(obj) {
		 	var index = -1;
		 	var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
		 	var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
			// Object can fit completely within the top quadrant
			var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
			// Object can fit completely within the bottom quandrant
			var bottomQuadrant = (obj.y > horizontalMidpoint);
			// Object can fit completely within the left quadrants
			if (obj.x < verticalMidpoint &&
				obj.x + obj.width < verticalMidpoint) {
				if (topQuadrant) {
					index = 1;
				}
				else if (bottomQuadrant) {
					index = 2;
				}
			}
			// Object can fix completely within the right quandrants
			else if (obj.x > verticalMidpoint) {
				if (topQuadrant) {
					index = 0;
				}
				else if (bottomQuadrant) {
					index = 3;
				}
			}
			return index;
		};
		/*
		 * Splits the node into 4 subnodes
		 */
		 this.split = function() {
			// Bitwise or [html5rocks]
			var subWidth = (this.bounds.width / 2) | 0;
			var subHeight = (this.bounds.height / 2) | 0;
			this.nodes[0] = new QuadTree({
				x: this.bounds.x + subWidth,
				y: this.bounds.y,
				width: subWidth,
				height: subHeight
			}, level+1);
			this.nodes[1] = new QuadTree({
				x: this.bounds.x,
				y: this.bounds.y,
				width: subWidth,
				height: subHeight
			}, level+1);
			this.nodes[2] = new QuadTree({
				x: this.bounds.x,
				y: this.bounds.y + subHeight,
				width: subWidth,
				height: subHeight
			}, level+1);
			this.nodes[3] = new QuadTree({
				x: this.bounds.x + subWidth,
				y: this.bounds.y + subHeight,
				width: subWidth,
				height: subHeight
			}, level+1);
		};
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
		this.collidableWith = "";
		this.isColliding = false;
		this.type = "";
		// Define abstract function to be implemented in child objects
		this.draw = function() {
		};
		this.move = function() {
		};
		this.isCollidableWith = function(object) {
			return (this.collidableWith === object.type);
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
			// Clear menu
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
			this.context.clearRect(this.x, this.y, this.width, this.height);
			this.x += this.speed;
			if (this.isColliding) {
				return true;
			}
			else if (self === "bullet" && this.x >= this.canvasWidth) {
				return true;
			}
			/*else if (self === "enemyBullet" && this.x <=  0 - this.width) {
				return true;
			}*/
			else {
				if (self === "bullet") {
					this.context.drawImage(imageRepository.img.bullet, this.x, this.y);
				}/*
				else if (self === "enemyBullet") {
					this.context.drawImage(imageRepository.img.enemyBullet, this.x, this.y);
				}*/
				return false;
			}
		};

		// Resets the bullet values
		this.clear = function() {
			this.x = 0;
			this.y = 0;
			this.speed = 0;
			this.alive = false;
			this.isColliding = false;
		};
	}
	Bullet.prototype = new Drawable();


	// Custom Pool object. Holds Bullet objects to be managed to prevent
	// garbage collection. 
	function Pool(maxSize) {
		var size = maxSize; // Max bullets allowed in the pool
		var pool = [];

		this.getPool = function() {
			var obj = [];
			for (var i = 0; i < size; i++) {
				if (pool[i].alive) {
					obj.push(pool[i]);
				}
			}
			return obj;
		}	
		
		this.init = function(object) {
			if (object == "bullet") {
				for (var i = 0; i < size; i++) {
					// Initalize the object
					var bullet = new Bullet("bullet");
					bullet.init(0,0, imageRepository.img.bullet.width, imageRepository.img.bullet.height);
					bullet.collidableWith = "enemy";
					bullet.type = "bullet";
					pool[i] = bullet;
				}
			}
			else if (object == "enemy") {
				for (var i = 0; i < size; i++) {
					var enemy = new Enemy();
					enemy.init(0,0, imageRepository.img.enemy.width, imageRepository.img.enemy.height);
					enemy.collidableWith = "ship";
					enemy.type = "enemy";
					pool.unshift(enemy);
				}
			}/*
			else if (object == "enemyBullet") {
				for (var i = 0; i < size; i++) {
					var bullet = new Bullet("enemyBullet");
					bullet.init(0,0, imageRepository.img.enemyBullet.width, imageRepository.img.enemyBullet.height);
					bullet.collidableWith = "ship";
					bullet.type = "enemyBullet";
					pool[i] = bullet;
				}
			}*/
		};
		
		this.get = function(x, y, speed) {
			if(!pool[size - 1].alive) {
				pool[size - 1].spawn(x, y, speed);
				pool.unshift(pool.pop());
			}
		};

		this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
			if(!pool[size - 1].alive && !pool[size - 2].alive) {
				this.get(x1, y1, speed1);
				this.get(x2, y2, speed2);
			}
		};

		this.animate = function() {
			let dateAndTime = new Date();
			let actualTime = dateAndTime.getHours()*60*60 + dateAndTime.getMinutes()*60 + dateAndTime.getSeconds()

			if (game.time) {
				if (actualTime - game.time > game.enemyDelay || actualTime - game.time < 0) {
					game.time = actualTime;
					game.addEnemy();
				}
			} else game.time = actualTime;

			for (var i = 0; i < size; i++) {
				// Only draw until we find an element that is not alive
				if (pool[i].alive) {
					if (pool[i].draw()) {
						pool[i].clear();
						pool.push((pool.splice(i,1))[0]);
					}
				}
				else {
					pool[i].clear(); // XXX Bugfix? XXX
					//break;  // Temporal codepatch
				}
			}
		};
	}


	function Ship() {
		this.speed = 3;
		this.bulletPool = new Pool(16);
		this.bulletPool.init("bullet");

		var fireRate = 15;
		var counter = 0;

		this.collidableWith = "enemy";
		this.type = "ship";

		this.draw = function() {
			this.context.drawImage(imageRepository.img.spaceship, this.x, this.y);
		};

		this.move = function() {	
			if (!game.isDead) {
				counter++;
				// Determine if the action is move action
				if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.down || KEY_STATUS.up) {
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
					if (!this.isColliding) {
						this.draw();
					} 
				}
				if (this.isColliding) {
					this.context.clearRect(this.x, this.y, this.width, this.height);
					game.isDead = true;
					setTimeout(game.gameOver, 300);
				}
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

	// Create the Enemy ship object.
	function Enemy() {
		/*
		var percentFire = .01;
		var chance = 0;*/
		this.alive = false;
		this.collidableWith = "bullet";
		this.type = "enemy";

		// Sets the Enemy values
		this.spawn = function(x, y, speed) {
			this.x = x;
			this.y = y;
			this.speed = speed;
			this.speedX = -speed;
			this.speedY = 0;
			this.alive = true;
			this.topEdge = 0;
			this.bottomEdge = game.mainCanvas.height - imageRepository.img.enemy.height;
		};

		//Move the enemy
		this.draw = function() {
			this.context.clearRect(this.x, this.y, this.width, this.height);
			this.x += this.speedX;
			this.y += this.speedY;
			if (this.x < -imageRepository.img.enemy.width) {
				this.clear();
			}

			this.speedY += (Math.random()-0.5)*0.5*this.speed;
			if ( Math.abs(this.speedY) > this.speed) this.speedY *= 0.9
				if (this.y <= 0) {
					this.speedY = Math.abs(this.speedY)/2;
				}
				else if (this.y >= game.shipCanvas.height - this.height) {
					this.speedY = -Math.abs(this.speedY)/2;
				}

				if (!this.isColliding) {
					this.context.drawImage(imageRepository.img.enemy, this.x, this.y);
					/*
					// Enemy has a chance to shoot every movement
					chance = Math.floor(Math.random()*101);
					if (chance/100 < percentFire) {
						this.fire();
					}*/
				} else {
					game.explode(this.x, this.y, 30);
					this.clear();
				}
			};

		/*	
		// Fires a bullet
		this.fire = function() {
			game.enemyBulletPool.get(this.x+this.width/2, this.y+this.height, -2.5);
		}
		*/
		// Resets the enemy values

		this.clear = function() {
			this.x = -100;
			this.y = -100;
			this.speed = 0;
			this.speedX = 0;
			this.speedY = 0;
			this.alive = false;
			this.isColliding = false;
		};
	}
	Enemy.prototype = new Drawable();


	// Creates the Game object which will hold all objects and data for the game.
	function Game() {

		// Swithes
		this.isDead = false;
		this.withMenu = false;
		this.game1 = false;
		this.game2 = false;
		this.game3 = false;
		this.exit = false;
		this.initial = true;

		this.time = null;
		this.score = 0;
		this.explosionParticles = [];


		// Setting the default delay of enemies
		this.enemyDelay = 2.0; //s

		this.init = function() {
			this.withMenu = true;
			// Get the canvas elements
			this.bgCanvas = document.getElementById('background');
			this.fgCanvas = document.getElementById('foreground');
			this.shipCanvas = document.getElementById('ship');
			this.mainCanvas = document.getElementById('main');
			this.menuCanvas = document.getElementById('menu');
			this.introCanvas = document.getElementById('intro');

			this.scoretext = document.getElementById('score');
			
			// Test to see if canvas is supported. Only need to check one canvas
			if (this.bgCanvas.getContext) {
				this.bgContext = this.bgCanvas.getContext('2d');
				this.fgContext = this.fgCanvas.getContext('2d');
				this.shipContext = this.shipCanvas.getContext('2d');
				this.mainContext = this.mainCanvas.getContext('2d');
				this.menuContext = this.menuCanvas.getContext('2d');
				this.introContext = this.introCanvas.getContext('2d');

				// Initialize objects to contain their context and canvas information
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
				
				Menu.prototype.context = this.menuContext;
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
				
				this.reset();

				return true;
			} else {
				return false;
			}
		};

		this.initialScreenDraw = function() {
			this.introContext.drawImage(imageRepository.img.splashscreen, 0, 0);
		};

		this.reset = function() {
			this.time = null;
			this.score = 0;
			this.scoretext.innerText = this.score;
			this.explosionParticles = [];


			//this.shipContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
			this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
			this.menuContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);


			// Initialize the ship object
			this.ship = new Ship();
			// Set the ship to start near the bottom middle of the canvas
			var shipStartX = 5 + imageRepository.img.spaceship.width/2;
			var shipStartY = this.shipCanvas.height/2 - imageRepository.img.spaceship.height/2;
			this.ship.init(shipStartX, shipStartY, imageRepository.img.spaceship.width,
				imageRepository.img.spaceship.height);

			// Initialize the enemy pool object
			this.enemyPool = new Pool(30);
			/*this.enemyBulletPool = new Pool(50);*/

			this.enemyPool.init("enemy");
			/*this.enemyBulletPool.init("enemyBullet");*/

			// Start QuadTree
			this.quadTree = new QuadTree({x:0,y:0,width:this.mainCanvas.width,height:this.mainCanvas.height});
		}

		this.createParticle = function(x, y) {
			//Place the circles at the explosion
			this.x = x;
			this.y = y;
			this.originX = x;
			this.originY = y;

			//Random radius between 2 and 6
			this.radius = 2 + Math.random()*3; 
			
			//Random velocities
			this.vx = -5 + Math.random()*10;
			this.vy = -5 + Math.random()*10;
		}

		this.explode = function(x, y, particleNum) {
			for (var i = 0; i < particleNum; i++) {
				this.explosionParticles.push(new this.createParticle(x, y));
			}
			this.score++;
			this.scoretext.innerText = this.score;
		}

		this.drawExplosion = function() {

		  	//Fill canvas with black color
		  	this.menuContext.globalCompositeOperation = "source-over";
		  	//this.mainContext.fillStyle = "rgba(0,0,0,0.15)";
		  	//ctx.fillRect(0, 0, W, H);

		  	//Clean the circles
		  	if (this.explosionParticles[0]) {
		  		this.menuContext.clearRect(this.explosionParticles[0].originX - 60, this.explosionParticles[0].originY - 60, 120, 120);
		  	}
		  	//Fill the canvas with circles
		  	for(var j = 0; j < this.explosionParticles.length; j++){
		  		var c = this.explosionParticles[j];

		    	//Create the circles
		    	this.menuContext.beginPath();
		    	this.menuContext.arc(c.x, c.y, Math.max(c.radius, 0), 0, Math.PI*2, false);
		    	this.menuContext.fillStyle = "rgba(255, 30, 0, 0.5)";
		    	this.menuContext.fill();

		    	c.x += c.vx;
		    	c.y += c.vy;
		    	c.radius -= .4;

		    	if(c.radius <= 0) {
		    		c.radius = 0;
		    		this.explosionParticles.splice(j, 1);
		    	}
		    }
		}

		this.drawGameOver = function(){
			this.menuContext.drawImage(imageRepository.img.gameover, (this.mainCanvas.width - imageRepository.img.gameover.width)/2, this.mainCanvas.height/2);
		} 


		this.gameOver = function() {
			game.drawGameOver();	

			setTimeout(function(){
				game.menuContext.clearRect(0, 0, game.mainCanvas.width, game.mainCanvas.height);
				game.game1 = false;
				game.game2 = false;
				game.game3 = false;
				game.withMenu = true;
				game.reset();
				game.drawMenu();
			}, 2000);
		}

		this.addEnemy = function() {
			if (this.game1 || this.game2 || this.game3) {
				this.enemyPool.get(this.shipCanvas.width + imageRepository.img.enemy.width, Math.random()*this.shipCanvas.height*0.9+10, 2);
			}
		}

		// Main menu
		this.drawMenu = function() {

			if (this.initial !== false) {
				this.introCanvas.style.opacity = "0";
				this.initial = false;
				setTimeout(function(){game.introCanvas.style.display = "none";}, 3000);
			}
			// Add event listener for `click` events.
			this.menu.draw();
			this.menuCanvas.addEventListener('click', eventListener = function(event) {
				if (game.withMenu) {
					var x = event.pageX - game.menuCanvas.offsetLeft, y = event.pageY - game.menuCanvas.offsetTop;

					if ((x > (game.mainCanvas.width - imageRepository.img.game1.width)/2) && (x < (game.mainCanvas.width + imageRepository.img.game1.width)/2)) {
						if ((y > game.menu.layoutY[1]) && (y < game.menu.layoutY[1] + imageRepository.img.game1.height)) {
							game.game1 = true;
							game.isDead = false;
							game.withMenu = false;
							game.removeEventListener();
							console.log("GAME 1");
							game.start();
						} else if ((y > game.menu.layoutY[2]) && (y < game.menu.layoutY[2] + imageRepository.img.game2.height)) {
							game.game2 = true;
							game.isDead = false;
							game.withMenu = false;
							game.removeEventListener(); 
							console.log("GAME 2");
							game.start();
						} else if ((y > game.menu.layoutY[3]) && (y < game.menu.layoutY[3] + imageRepository.img.game3.height)) {
							game.game3 = true;
							game.isDead = false;
							game.withMenu = false;
							game.removeEventListener();
							console.log("GAME 3");
							game.start();
						} else if ((y > game.menu.layoutY[4]) && (y < game.menu.layoutY[4] + imageRepository.img.exit.height)) {
							game.removeEventListener();
							game.exit = true;
							console.log("EXIT");
							window.location.href = 'https://9gag.com/';
						}
					}
				}
			}, false);

		};

		this.removeEventListener = function() {
			game.menuCanvas.removeEventListener('click', eventListener, false);
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
		// Insert objects into quadtree
		if (!game.isDead) {
			game.quadTree.clear();
			game.quadTree.insert(game.ship);
			game.quadTree.insert(game.ship.bulletPool.getPool());
			game.quadTree.insert(game.enemyPool.getPool());
			//game.quadTree.insert(game.enemyBulletPool.getPool());
			detectCollision();
		}

		requestAnimFrame( animate );
		let shipYRatio = (game.ship.y - game.background.canvasHeight/2)/game.background.canvasHeight/2;

		if (!game.isDead) {
			game.enemyPool.animate();
			game.ship.move();
			game.ship.bulletPool.animate(); 
			//game.enemyBulletPool.animate();
		}
		game.background.draw(shipYRatio);
		game.foreground.draw(shipYRatio);
		game.drawExplosion();


	}

	function detectCollision() {
		var objects = [];
		game.quadTree.getAllObjects(objects);
		for (var x = 0, len = objects.length; x < len; x++) {
			game.quadTree.findObjects(obj = [], objects[x]);

			for (y = 0, length = obj.length; y < length; y++) {

				// DETECT COLLISION ALGORITHM
				if (objects[x].collidableWith === obj[y].type &&
					(objects[x].x < obj[y].x + obj[y].width &&
						objects[x].x + objects[x].width > obj[y].x &&
						objects[x].y < obj[y].y + obj[y].height &&
						objects[x].y + objects[x].height > obj[y].y)) {
					objects[x].isColliding = true;
				obj[y].isColliding = true;
			}
		}
	}
	};


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

	}


// Starting the code
var playgame = new shootem();