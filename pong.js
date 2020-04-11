//===========================
// DECLARING VARIABLES
//===========================
var canvas = document.getElementById("canvas"); // the canvas itself
var draw; // the canvas context
var width; // the game width
var height; // the game height
var playerHeight; // a default player height
var pause; // the pause's flag
var hudFont; // the font of both player scores
var difficulty; // a number from 1 to 10
var arrowLeft, arrowRight, enter, aKey, dKey, control; // keys' flags
var players; // this changes to 2 if you select the 2 players mode
var backgroundColor = "#082";
var hellMusic; // Doom's song
var cacodemon; // Cacodemon's img
var songStarted = false;
function declareVariables() {
  draw = canvas.getContext("2d");
  width = document.documentElement.clientWidth;
  height = document.documentElement.clientHeight;
  playerHeight = height*5/100;
  canvas.width = width;
  canvas.height = height;
  pause = true;
  hudFont = playerHeight*2 + "px Arial"
  difficulty = 5;
  cacodemon = document.getElementById("cacodemon");
  hellMusic = document.getElementById("hellMusic");
}

//===========================
// INSTANCING OBJECTS
//===========================
// game objects
var player1; // CPU, if the user is playing alone
var player2;
var ball;
// json's
var pauseButton;
var restartButton;
var infoButton;

//===========================
// OBJECTS
//===========================
var Player = function(json) {
  this.height = json.height || playerHeight;
  this.width = json.width ||  width/5;
  this.x = width/2 - this.width/2;
  this.y = json.y || null;
  this.maxSpeed = json.maxSpeed || width/200;
  this.score = 0;
  this.color = json.color || "#000";
  this.initialX = this.x;
}
class Ball {
  constructor(json) {
    this.radius = json.radius || width<height?(width/20):(height/20);
    this.x = json.x || width/2;
    this.y = json.y || height/2;
    this.hspeed = json.hspeed || 0;
    this.vspeed = json.vspeed || 0;
    this.speed = json.speed || width/100;
    this.initialSpeed = json.initialSpeed || height/100;
    this.maxSpeed = json.maxSpeed || width/15;
    this.speeder = json.speeder || .002;
    this.color = "#FFF";
  }

  move() {
    // move the ball
    this.x+= this.hspeed;
    this.y+= this.vspeed;
    // increase the ball's speed
    if(this.speed < this.maxSpeed)
      this.speed+= this.speeder;
    // if the ball collides with something
    // the walls
    if(this.x <= this.radius)
      this.hspeed = Math.abs(this.hspeed);
    else if(this.x+this.radius >= width)
      this.hspeed = -Math.abs(this.hspeed);
    // the players
    if(collides(this.getRect(), player1))
      this.playerCollision(player1);
    if(collides(this.getRect(), player2))
      this.playerCollision(player2);

    if(this.y < 0) {
      player2.score++;
      pause = true;
      this.resetBall();
    }
    else if(this.y > height) {
      player1.score++;
      pause = true;
      this.resetBall();
    }
  }

  playerCollision(player) {
    if((this.y>height/2 && this.vspeed<0)
    || (this.y<height/2 && this.vspeed>0))
      return;
    let dir = this.y>height/2?1:-1;
    this.hspeed = this.turn(player);
    this.vspeed = -dir*(this.speed - Math.abs(this.hspeed));
  }

  // not my best idea this method, but it works
  turn(player) {
    let dx = this.x - player.x;
    let section = player.width/8;
    let falseError = (Math.random()>.5?1:-1)*Math.random();
    if(dx <= section) // full left
      return -this.speed/4*3 + falseError;
    if(dx <= section*2) // half left
      return -this.speed/2 + falseError;
    if(dx <= section*3) // small left
      return -this.speed/4 + falseError;
    if(dx <= section*5) // middle
      return this.hspeed + falseError;
    if(dx <= section*6) // small right
      return this.speed/4 + falseError;
    if(dx <= section*7) // half right
      return this.speed/2 + falseError;
    return this.speed/4*3 + falseError; // full right
  }

  resetBall() {
    this.y=height/2;
    this.x=width/2;
    player1.x = player1.initialX;
    this.startMoving(this.initialSpeed);
    render();
  }

  getRect() {
    return {
      x: this.x-this.radius,
      y: this.y-this.radius,
      width: this.radius*2,
      height: this.radius*2,
    };
  }

  startMoving(newSpeed) {
    this.speed = newSpeed;
    let side = (Math.random()>.5?1:-1);
    this.hspeed = side*(Math.random()*newSpeed - 2);
    this.vspeed = newSpeed - Math.abs(this.hspeed);
  }
  
  setSpeedAndSpeeder(difficulty) {
    ball.speeder = (2+difficulty/3)/100;
    ball.maxSpeed = width/75*(2+difficulty/3);
  }
}

function initializeObjects() {
  // game objects
  player1 = new Player({
    x: width/2 - width/10,
    y: playerHeight*2,
  });
  player2 = new Player({
    x: 0,
    y: height - playerHeight*3,
  });
  ball = new Ball({})

  // json's
  let d = width<height?(width/3):(height/3);
  pauseButton = {
    x: width/2 - d/2,
    y: height/2 - d/2,
    width: d,
    height: d,
    radius: d/2,
    color: "#420666",
    innerColor: "#AAA",
  };
  restartButton = {
    x: width/2 + pauseButton.radius + (width - (width/2 + pauseButton.radius))/2 - d/4,
    y: height/2 - d/4,
    width: d/2,
    height: d/2,
    radius: d/4,
    color: "#210333",
    innerColor: "#AAA",
    font: d/10*4 + "px Arial",
    innerText: "R",
  };
  infoButton = {
    x: (width - (width/2 + pauseButton.radius))/2 - d/4,
    y: height/2 - d/4,
    width: d/2,
    height: d/2,
    radius: d/4,
    color: "#210333",
    innerColor: "#AAA",
    font: d/10*4 + "px Arial",
    innerText: " i",
  };
}

//===========================
// DRAW FUNCTIONS
//===========================
function drawLine(x1, y1, x2, y2) {
  draw.lineWidth = height/100;
  draw.beginPath();
  draw.moveTo(x1, y1);
  draw.lineTo(x2, y2);
  draw.stroke();
}
function drawPanel() {
  draw.fillStyle = backgroundColor;
  draw.fillRect(0, 0, canvas.width, canvas.height);

  draw.fillStyle = difficulty == "hell 😈"?"#DD0":"#000";
  drawLine(0, height/2, width, height/2);
}
function drawRect(rect) {
  draw.fillRect(rect.x, rect.y, rect.width, rect.height);
}
function drawCircle(obj) {
  draw.fillStyle = obj.color;
  draw.beginPath();
  draw.arc(obj.x, obj.y, obj.radius, 0, 2*Math.PI);
  draw.fill();
}
function drawPauseButton() {
  const p = pauseButton;
  drawCircle({
    x: p.x + p.radius,
    y: p.y + p.radius,
    radius: p.radius,
    color: p.color,
  });

  draw.fillStyle = pauseButton.innerColor;
  if(!pause) {
    let aux = pauseButton;
    let aRect = {
      x: aux.x+aux.width/5,
      y: aux.y+aux.height/5,
      width: aux.width/5,
      height: aux.height/5*3,
    };
    drawRect(aRect);
    drawRect({
      x: aRect.x+aux.width/5*2,
      y: aRect.y,
      width: aRect.width,
      height: aRect.height,
    });
  }
  else {
    let aux = pauseButton;
    draw.beginPath();
    draw.moveTo(aux.x+aux.width/4, aux.y+aux.height/5);
    draw.lineTo(aux.x+aux.width/4*3, aux.y+aux.height/2);
    draw.lineTo(aux.x+aux.width/4, aux.y+aux.height/5*4);
    draw.closePath();
    draw.fill();
  }
}
function drawSmallButton(json) {
  drawCircle({
    x: json.x + json.radius,
    y: json.y + json.radius,
    radius: json.radius,
    color: json.color,
  });

  draw.fillStyle = json.innerColor;
  draw.font = json.font;
  draw.fillText(json.innerText, json.x+json.radius/2, json.y+json.radius/3*5);
}
function drawScores() {
  draw.fillStyle = difficulty=="hell 😈"?"#DD0":"#000";
  draw.font = hudFont;
  draw.fillText(player1.score, width/2, player1.height*1.9);
  draw.fillText(difficulty!="hell 😈"?player2.score:"😈", width/2, height-player2.height/10);
}
function drawBall() {
  if(difficulty!="hell 😈")
    drawCircle(ball);
  else {
    draw.drawImage(cacodemon, ball.x-ball.radius, ball.y-ball.radius, ball.radius*2, ball.radius*2);
  }
}

// this one draws everything
function render() {
  drawPanel();
  draw.fillStyle = player1.color;
  drawRect(player1);
  draw.fillStyle = player2.color;
  drawRect(player2);
  drawPauseButton();
  drawSmallButton(restartButton);
  drawSmallButton(infoButton);
  drawScores();
  drawBall();
}

//===========================
// JS EVENTS
//===========================
// mouse move event, if the user have a mouse
canvas.addEventListener("mousemove", function(mouse) {
  if(pause)
    return;
  let actualX = mouse.x-player2.width/2;
  let maxX = width-player2.width;
  player2.x = Math.min(Math.max(0, actualX), maxX);
});

// touch event, for the touch screen users
canvas.addEventListener("touchmove", function(touch) {
  if(pause)
    return;
  var touchItSelf1 = touch.changedTouches[0];
  var touchItSelf2 = "none";
  if(touch.changedTouches.length > 1)
    touchItSelf2 = touch.changedTouches[1];
  var touch1 = {
    x : parseInt(touchItSelf1.clientX),
    y : parseInt(touchItSelf1.clientY),
  };
  var touch2 = {x: 0, y: 0};
  if(touchItSelf2 != "none")
  touch2 = {
    x : parseInt(touchItSelf2.clientX),
    y : parseInt(touchItSelf2.clientY),
  };
  touch.preventDefault();
  
  let maxX = width-player1.width;
  // if the user playing the 2 players mode
  if(players > 1) {
    if(touch1.y < height/2) { // if the first touch is on the top
      let x1 = touch1.x-player1.width/2;
      player1.x = Math.min(Math.max(0, x1), maxX);
      if(touchItSelf2 != "none") { // if there's only one touch detected, only one player is moved
        let x2 = touch2.x-player2.width/2;
        player2.x = Math.min(Math.max(0, x2), maxX);
      }
    }
    else { // if the first touch is on the bottom
      let x1 = touch1.x-player2.width/2;
      player2.x = Math.min(Math.max(0, x1), maxX);
      if(touchItSelf2 != "none") { // if there's only one touch detected, only one player is moved
        let x2 = touch2.x-player1.width/2;
        player1.x = Math.min(Math.max(0, x2), maxX);
      }
    }
  }
  else {
    // if the user is playing alone
    let actualX = touch1.x - player2.height/2;
    player2.x = Math.min(Math.max(0, actualX), maxX);
  }
});

// single click event (works with touch and mouse)
canvas.addEventListener("click", function(click) {
  if(pointCollision(click.x, click.y, pauseButton)) {
    pause = !pause;
    render();
    return;
  }
  if(pointCollision(click.x, click.y, restartButton)) {
    restartGame();
    return;
  }
  if(pointCollision(click.x, click.y, infoButton)) {
    info();
    return;
  }
});

// key events, if the user have a keyboard
window.addEventListener("keydown", function(key) {
  if(key.key == "P" || key.key == "p") {
    if(difficulty =="hell 😈") {
		if(hellMusic.paused)
			hellMusic.play();
		else
			hellMusic.pause();
	}
    return;
  }
  if(key.key == "Enter" && !enter) {
    pause = !pause;
    enter = true;
  }
  if((key.key == "R" || key.key == "r") && !control) { // don't restart the game if the user try to refresh the page (because 
    restartGame();
    return;
  }
  if((key.key == "I" || key.key == "i") && !control) { // don't show the information alert if the user try to inspect the game
    info();
    return;
  }
  if(key.key == "Control" && !control)
    control = true;
  if(key.key == "ArrowRight" && !arrowRight)
    arrowRight = true;
  if(key.key == "ArrowLeft" && !arrowLeft)
    arrowLeft = true;
  if((key.key == "A" || key.key == "a") && !aKey)
    aKey = true;
  if((key.key == "D" || key.key == "d")  && !dKey)
    dKey = true;
});

window.addEventListener("keyup", function(key) {
  if(key.key == "Control")
    control = false;
  if(key.key == "Enter")
    enter = false;
  if(key.key == "ArrowRight")
    arrowRight = false;
  if(key.key == "ArrowLeft")
    arrowLeft = false;
  if(key.key == "A" || key.key == "a")
    aKey = false;
  if(key.key == "D" || key.key == "d")
    dKey = false;
});

//===========================
// GAME THINGS, I don't know
//===========================
function collides(obj1, obj2) {
  let x11 = obj1.x,
    y11 = obj1.y,
    x12 = obj1.x + obj1.width,
    y12 = obj1.y + obj1.height,
    x21 = obj2.x,
    y21 = obj2.y,
    x22 = obj2.x + obj2.width,
    y22 = obj2.y + obj2.height;
  if((x11 >= x21 && x11 <= x22)
  || (x12 >= x21 && x12 <= x22)) {
    if(y11==y21 || y11==y22
    || y12==y21 || y12==y22)
      return true;
    if((y12 > y21 && y12 < y22)
    || (y11 > y21 && y11 < y22))
      return true;
    }
  return false;
}

function pointCollision(x, y, rect) {
  return (x>=rect.x && x<=rect.x+rect.width
    && y>=rect.y && y<=rect.y+rect.height);
}

function restartGame() {
  pause = true;
  ball.resetBall();
  player1.score = 0;
  player2.score = 0;
  render();
  setMode();
}

function info() {
  pause = true;
  if(confirm("A classic Pong game"
  + "\nMade by: P_Luizon"
  + "\n\nCurrent difficulty: " + difficulty
  + "\n\n"
  + "If you find any bug feel free "
  + "to tell me about it."
  + "\n\n"
  + "Press ok if you'll do it 8]")) {
    const alertMessage = "In case mailto won't work, "
    + "here you have my mail in your clipboard :)"
    + "\n\npluizoncv@gmail.com";
    alert(alertMessage);

    // doing weird things in order to copy to clipboard
    const txtArea = document.createElement('textarea');
    txtArea.value = "pluizoncv@gmail.com";
    document.body.appendChild(txtArea);
    txtArea.select();
    document.execCommand('copy');
    document.body.removeChild(txtArea);

    // trying to redirect the user to the mail thing
    var mailMessage = "Hey dude, I found some things you have to fix in that pong you did in DCoder.";
    var subject = "Fix this bugs from your DCoder Pong, folk";
    document.location.href = "mailto:pluizoncv@gmail.com?"
    + "subject=" + encodeURIComponent(subject)
    + "&body=" + encodeURIComponent(mailMessage);
  }
}

function setMode() {
    let message = "Do you want to play the 2 players mode? Press OK if you do, "
    + "ignore this message if you want to play alone :)";
    players = 1;
    if(confirm(message)) {
        players = 2;
        ball.setSpeedAndSpeeder(1);
		if(difficulty=="hell 😈") {
		  deactivateModoDiablo();
		}
		difficulty = "not available in 2 players mode";
    }
    else
      setDifficulty();
}

function deactivateModoDiablo() {
  player1.color = "#000";
  player2.color = "#000";
  ball.color = "#FFF";
  infoButton.color = "#210333";
  pauseButton.color = "#420666";
  restartButton.color = "#210333";
  backgroundColor = "#082";
  hellMusic.load();
  hellMusic.pause();
  songStarted = false;
  
  alert("Modo diablo deactived 👿");
}

function setDifficulty() {
  let message = "Put a number from 1 to 10, "
  + "will be the level of difficulty of the game :)"
  + "\nOr write \"modo diablo\" and see what happen 8]";
  let d = "5";
  let answer = prompt(message, "5");
  if(typeof answer != undefined && answer !== null)
    d = answer;
	
  if(d=="modo diablo") {
    if(difficulty=="hell 😈") {
	    alert("Modo diablo is already actived 😈"
		+"\nPress \"p\" to pause and play the song 8]");
		return;
	}
    ball.setSpeedAndSpeeder(.5);
	ball.maxSpeed = 100;
    player1.maxSpeed = 10000000000000000;
	player1.color = "#D66";
	player2.color = "#D66";
	ball.color = "#DC0";
	infoButton.color = "#A00";
	pauseButton.color = "#D00";
	restartButton.color = "#A00";
	backgroundColor = "#774400";
	difficulty = "hell 😈";
	hellMusic.play();
	
	alert("Modo diablo activated 😈"
	+"\nPress \"p\" to pause and play the song 8]");
    return;
  }
  else {
    if(difficulty=="hell 😈") {
	  deactivateModoDiablo();
	}
  }

  let itLooksLikeAnIntegerNumber = true;
  for(let i=0; i<Math.min(2, d.length); i++) {
    if(!"1234567890".includes(d[i])) {
      alert("That's not an integer number, "
      + "you'll be at level 5");
      difficulty = 5;
      itLooksLikeAnIntegerNumber = false;
      break;
    }
  }

  if(itLooksLikeAnIntegerNumber) {
    message = "";
    let messageDone = false;
    let level = "";
    if(d.length==0) {
      message+= "So, you put nothing, then you'll be at level 1";
      messageDone = true;
      difficulty = 1;
    }
    if(d.length>2)
      message+= "Whatever you put, I took the first 2 numbers.";
    if(d.length>=2)
      if(d[0]+d[1]>10) {
        message+= "\nThere's not a level that high, you'll be at level 10.";
        messageDone = true;
        difficulty = 10;
      }
      else {
        if(d[0]+d[1]==10)
          level = d[0]+d[1];
        else
          level = d[1];
      }
    if(level.length == 0)
      level = d[0];
    if(!messageDone) {
      if(message.length >= 0)
        message+= "\n";
      message+= "You'll be at level " + level + ".";
      difficulty = level;
    }
    alert(message);
  }

  ball.setSpeedAndSpeeder(difficulty);
  player1.maxSpeed = width/400*difficulty;

  console.log("Current dificulty level: " + difficulty);
}

//===========================
// THE LOOP, called every single frame
//===========================
function loop() {
  if(!songStarted && difficulty == "hell 😈") {
	let promise = hellMusic.play();
	
	if (promise !== undefined) {
	  promise.then(_ => {
		songStarted = true;
		console.log("yes");
	  }).catch(error => {
		console.log("no");
	  });
	}

  }
//  console.log(hellMusic);
  if(pause)
    return;
  // ball
  ball.move();

  ////////////////// players //////////////////
  let sign = 0;
  let maxX = width - player1.width;
  let moveSpeed = width/30;
  // CPU
  if(players == 1) {
      let p1x = player1.x+player1.width/2;
      if(p1x < ball.x)
        player1.x = Math.min(width-player1.width,
          Math.min(player1.x+player1.maxSpeed,
            ball.x-player1.width/2));
      else if(p1x > ball.x)
        player1.x = Math.max(0,
          Math.max(player1.x-player1.maxSpeed,
            ball.x-player1.width/2));
  }
  else // player1
  {
    if(aKey)
      sign--;
    if(dKey)
      sign++;
    if(sign!=0)
      player1.x = Math.min(Math.max(0, player1.x+sign*moveSpeed), maxX);
  }

  // player2
  sign = 0;
  if(arrowLeft)
    sign--;
  if(arrowRight)
    sign++;
  if(sign!=0)
    player2.x = Math.min(Math.max(0, player2.x+sign*moveSpeed), maxX);
}

//===========================
// AN IIFE, to do everything as fast as it is posible
//===========================
/* I did the following things as I saw in a
   page, use setInterval(loop, 1000/fps)
   could be not the best idea, it works but
   not perfectly in every device/browser.
   This weird things I do in the following
   IIFE don't lose frames, also if some of
   them can't be displayed by the
   device/browser. It works in time, not in
   fps.
   This page btw: https://developer.mozilla.org/es/docs/Games/Anatomy
   */
var lastTick, lastRender, tickLength
;(function() {
  function main(frame) {
    window.requestAnimationFrame( main );
    var nextTick = lastTick + tickLength;
    var numTicks = 0;

    if (frame > nextTick) {
      var timeSinceTick = frame - lastTick;
      numTicks = Math.floor( timeSinceTick / tickLength );
    }

    queueUpdates( numTicks );
    render();
    lastRender = frame;
  }

  function queueUpdates( numTicks ) {
    for(var i=0; i < numTicks; i++) {
      lastTick = lastTick + tickLength; //Now lastTick is this tick.
      loop();
    }
  }

  lastTick = performance.now();
  lastRender = lastTick; //Pretend the first draw was on first update.
  tickLength = 16; //This sets the game to run at 60Hz (16ms)
  
  declareVariables();
  initializeObjects();
  render();
  ball.startMoving(ball.initialSpeed);
  setMode();
  main(performance.now());
})();

console.log("refresh if the screen goes white");