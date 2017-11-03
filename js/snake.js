// CONSTANTS
var COLS = 26;
var ROWS = 26;

//IDS
var EMPTY = 0;
var SNAKE = 1;
var FRUIT = 2;

//DIRECTIONS
var LEFT = 0;
var RIGHT = 1;
var UP = 2;
var DOWN = 3;

//KEYCODES - Look this up when working with it. Each event on the keyboard has special keycode
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_SPACEBAR = 32;


/* Design of a grid object. Builds the grid which the snake moves across.
 This object has width and height integer vars and a private grid array. 
 The array grid holds the span of width array objects. 
 The array objects within grid span the length of height and hold a value for the grid tile. */
var grid = {
	width: null,
	height: null,
	_grid: null,

	init: function(d, col, row) {
		this.width = col;
		this.height = row;

		this._grid = [];
		for (var i = 0; i < col; i++) {
			this._grid.push([]);
			for (var j = 0; j < row; j++) {
				this._grid[i].push(d);
     
			}
		}

	},

    // Set a value on one point on the grid.
	set: function(val, x, y) {
		this._grid[x][y] = val;
	},

	get: function(x, y) {
		return this._grid[x][y];
	}

}

/* Design for a snake object. 
The snake object has a direction integer variable, a 'last' object value, a private queue array, 
and boolean pauseState and pauseKeyDown values. The last object is an x,y position on the grid where the head of the snake is.
The queue is an array of x,y values that make up the snake.
*/
var snake = {
	direction: null,
	last: null,
	_queue:null,
	pauseState: null,
	pauseKeyDown: null,

	init: function(direction, x, y) {
		this.direction = direction;
        this._queue = [];
        this.insert(x, y);
        this.pauseState = true;
        this.pauseKeyDown = false;
	},

	// Inserts an x,y position onto the front of the snake queue.
	// The last variable now becomes the object at the front of the queue.
	insert: function(x, y) {
		this._queue.unshift({x:x, y:y});
		this.last = this._queue[0];

	},

	// Remove the last object on the array
	remove: function() {
        return this._queue.pop();
	}, 

	// Actuate the pause state from true to false or vice versa.
	actuatePause: function() {
		this.pauseState = !(this.pauseState);
	},

	// Taking in a keystate array (This will be initialized in main function).
	// Check if the spacebar is equal to true and the spacebar hasn't already been pressed. 
	// (Testing that the spacebar was not already pressed was crux of problem calling in update function. Looping too fast.)
	// Change the pause state when we know someone has pressed the spacebar button. 
	checkPauseKey: function(keyState) {
		if (keyState[KEY_SPACEBAR] && !(this.pauseKeyDown)) {
			this.actuatePause();
		}
		this.pauseKeyDown = keyState[KEY_SPACEBAR];
	}

}

// Function loops through the entire grid and checks if the value in each box is equal to 0 (i.e. it's empty)
// Pushes that position onto an array. A random object in the array is chosen where the FRUIT value is placed on the grid.
function setFood() {
	var empty = [];

	for (var i = 0; i < grid.width; i++) {
		for (var j = 0; j < grid.height; j++) {
			if (grid.get(i, j) == EMPTY) {
				empty.push({x:i, y:j});
			}

		}
	}

	var randPosition = empty[Math.floor(Math.random()*empty.length)];
	grid.set(FRUIT, randPosition.x, randPosition.y);

}

// Global MAIN vars.
var canvas; 
var ctx;
var keystate;
var frames;
var score;

function main() {
	// create a canvas HTML element to insert into the body.
	canvas = document.createElement("canvas");
	canvas.width = COLS*20;
	canvas.height = ROWS*20;

	// creates and returns a drawing context object on the canvas. 
	// This allows us to draw onto the canvas. In this case in a 2D context. On the object CanvasRenderingContext2D.
	ctx = canvas.getContext("2d");

	// Need to append child node on to the list of body nodes.
	// Small deviation...remember if this HTML element had some piece of text, you would need to appendChild the text value on
	// onto this Child node as well.
	document.body.appendChild(canvas);

	keystate = {};

    // Adding a listener for whenever a user presses down a key.
    // When a key is pressed down, the value at the index which is equal to the keycode 
    //(special mapped number to certain values on keyboard) turns to true.
	document.addEventListener("keydown", function(e){
      keystate[e.keyCode] = true;
	});

	// Similar to before except the value at the index which is equal to the keycode
	// turns to false.
	document.addEventListener("keyup", function(e){
      // delete keystate[e.keyCode];
      // trying this out because I think it would work too no?
      keystate[e.keyCode] = false;
	});

	frames = 0;

	// start up the app.
	init();

	// keep on looping it.
	loop();

}

function init() {
	grid.init(EMPTY, COLS, ROWS);

	// set x,y positions where the snake will start. In this case pretty much the middle.
	var startSnakeX = Math.floor(grid.width/2);
	var startSnakeY = Math.floor(grid.height/2);

	// snake starts going left.
	snake.init(LEFT, startSnakeX, startSnakeY);
	// position of snake is placed on the grid.
	grid.set(SNAKE, startSnakeX, startSnakeY);

	setFood(); 

	score = 0;

}

function loop() {
	draw();
	update();

	// This function basically tells the browser there will be an animation of some sort
	// and the function will need to be called to update the animation before a 'repaint'.
	// Essentially just know this is a special function to have for moving animations on the screen! (At least at my level right now)
	// It controls the looping elegantly with proper returns/escapes etc.
	window.requestAnimationFrame(loop);

}

function update() {

	// passing in our keystate array, check if pause key is pressed. If it is, it will change the pauseState boolean value
	snake.checkPauseKey(keystate);
	// if the pauseState is true don't update the position.
	if (snake.pauseState == true) {
		return;
	}

	frames++;

	// update the direction of the snake depending on the keystate. Do not let the snake eat itself.
	if (keystate[KEY_LEFT] && snake.direction !== RIGHT) {
		snake.direction = LEFT;
	} else if (keystate[KEY_UP] && snake.direction !== DOWN) {
		snake.direction = UP;
	} else if (keystate[KEY_RIGHT] && snake.direction !== LEFT) {
		snake.direction = RIGHT;
	} else if (keystate[KEY_DOWN] && snake.direction !== UP) {
		snake.direction = DOWN;
	} 

    // update the state of the snake every 5 frames.
	if (frames % 5 === 0) {

		// take in the x and y values at the head of the snake
		// these newX and newY vars will be updated based on the direction of the snake.
		var newX = snake.last.x;
		var newY = snake.last.y;

		// test the direction and maniupulate the value to the newX or newY accordingly.
		switch(snake.direction) {
			case LEFT:
			  newX--;
			  break;
			case UP:
			  newY--;
			  break;
			case RIGHT:
			  newX++;
			  break;
			case DOWN:
			  newY++;
			  break;
		}

		// test that the new x,y values of the snake is a legal point.
		// If it is out of the bounds of the grid or the new point is a "SNAKE" (equal to 1) value, restart the game. 
		if (newX < 0 || newX > grid.width-1 ||
			newY < 0 || newY > grid.height-1 ||
			grid.get(newX, newY) == SNAKE
		) {
			return init();
		}

		// test that the new x,y point is a "FRUIT" (equal to 2) value
		// if it is, increment the score, and set a new spot for food.
		// if it is not, pop the last value of the snake array into an object var tail. Set that spot on the grid equal to empty
		if (grid.get(newX, newY) == FRUIT) {
			score++;
			setFood();
		} else {
			var tail = snake.remove();
			grid.set(EMPTY, tail.x, tail.y);
		}

		// set the new point value onto the snake and grid objects. Specify the grid object to be a snake. The newX and newY values are
		// the head of the snake.
		grid.set(SNAKE, newX, newY);
		snake.insert(newX, newY);
	}

}


// Iterate through the grid and draw a graphical representation of the SNAKE and FRUIT onto the canvas.
function draw() {

	// Specify how wide and high each tile will be.
	var tileWidth = canvas.width/grid.width;
	var tileHeight = canvas.height/grid.height;

	// iterate through every point on the grid
	for (var i = 0 ; i < grid.width; i++) {
		for (var j = 0; j < grid.height; j++) {
			switch (grid.get(i, j)) {
				// set the fill colors to whatever color you like. NOTE that you need to reset the fillStyle every single time
				// you go through a tile.
				case EMPTY:
				   ctx.fillStyle = '#fff';
				   break;
				case SNAKE:
				   ctx.fillStyle = '#0ff';
				   break;				   
				case FRUIT:
				   ctx.fillStyle = '#f00';
				   break;				
			}
			// draw the rectangle with the width and height you specified. This function takes the starting point
			// (notice in pixels so we just multiply our x,y point by the tileWidth and tileHeight) then arguments for how long you
			// want it to span in width and height.
			ctx.fillRect(i*tileWidth, j*tileHeight, tileWidth, tileHeight);
		}
	}

	// write scoreboard ontop of the grid. Point starts at 10 pixels x, and canvas height minus 10 pixels y.
	ctx.font = '14px Arial';
	ctx.fillStyle = '#000';
	ctx.fillText("SCORE: " + score, 10, canvas.height - 10);
}

main();

