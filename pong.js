//===========================
// DECLARING VARIABLES
//===========================
var canvas = document.getElementById("canvas"); // the canvas itself
var draw; // the canvas context
var width; // the game width
var height; // the game height
var playerHeight; // a default player height
var pause;
var hudFont;
var difficulty;
function declareVariables() {
  draw = canvas.getContext("2d");
  width = document.documentElement.clientWidth;
  height = document.documentElement.clientHeight;  
  playerHeight = height*5/100;
  canvas.width = width;
  canvas.height = height;
  pause = true;
  hudFont = playerHeight*2 + "px Arial"
}

//===========================
// INSTANCING OBJECTS
//===========================
// game objects
var CPU;
var user;
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
  this.maxSpeed = json.maxSpeed || width/100;
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
    this.maxSpeed = json.maxSpeed || width/5;
    this.speeder = json.speeder || .002;
    this.color = "#FFF";
  }
  
  move() {
    // move the ball
    this.x+= this.hspeed;
    this.y+= this.vspeed;
    // increase the ball's speed
    this.speed+= this.speeder;
    // if the ball collides with something
    // the walls
    if(this.x <= this.radius)
      this.hspeed = Math.abs(this.hspeed);
    else if(this.x+this.radius >= width)
      this.hspeed = -Math.abs(this.hspeed);
    // the players
    if(collides(this.getRect(), CPU))
      this.playerCollision(CPU);
    if(collides(this.getRect(), user))
      this.playerCollision(user);
      
    if(this.y < 0) {
      user.score++;
      pause = true;
      this.resetBall();
    }
    else if(this.y > height) {
      CPU.score++;
      pause = true;
      this.resetBall();
    }
  }
  
  playerCollision(player) {
    if((this.y>height/2 && this.vspeed<0)
    || (this.y<height/2 && this.vspeed>0))
      return;
    //this.vspeed = (this.y>height/2?-1:1)*Math.abs(this.vspeed);
    let dir = this.y>height/2?1:-1;
    this.hspeed = this.turn(player);
    this.vspeed = -dir*(this.speed - Math.abs(this.hspeed));
  }
  
  // not my best idea this method, but it works
  turn(player) {
    let dx = this.x - player.x;
    let section = player.width/8;
    if(dx <= section) // full left
      return -this.speed/4*3;
    if(dx <= section*2) // half left
      return -this.speed/2;
    if(dx <= section*3) // small left
      return -this.speed/4;
    if(dx <= section*5) // middle
      return this.hspeed;
    if(dx <= section*6) // small right
      return this.speed/4;
    if(dx <= section*7) // half right
      return this.speed/2;
    return this.speed/4*3; // full right
  }
  
  resetBall() {
    this.y=height/2;
    this.x=width/2;
    CPU.x = CPU.initialX;
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
}

function initializeObjects() {
  // game objects
  CPU = new Player({
    x: width/2 - width/10,
    y: playerHeight*2,
    maxSpeed: width/200,
  });
  user = new Player({
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
  draw.fillStyle = "#082";
  draw.fillRect(0, 0, canvas.width, canvas.height);
  
  draw.fillStyle = "#000";
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
  draw.fillStyle = "#000";
  draw.font = hudFont;
  draw.fillText(CPU.score, width/2, CPU.height*1.9);
  draw.fillText(user.score, width/2, height-user.height/10);
}

// this one draws everything
function render() {
  drawPanel();
  draw.fillStyle = "#000";
  drawRect(CPU);
  drawRect(user);
  drawPauseButton();
  drawSmallButton(restartButton);
  drawSmallButton(infoButton);
  drawScores();
  drawCircle(ball);
}


//===========================
// JS EVENTS
//===========================
// mouse move event, if the user have a mouse
canvas.addEventListener("mousemove", function(mouse) {

  if(pause)
    return;
  let actualX = mouse.x-user.width/2;
  let maxX = width-user.width;
  user.x = Math.min(Math.max(0, actualX), maxX);
});

// touch event, for the touch screen users
canvas.addEventListener("touchmove", function(touch) {

  if(pause)
    return;
  var touchItSelf = touch.changedTouches[0];
  var touchX = parseInt(touchItSelf.clientX);
  touch.preventDefault();
  
  let actualX = touchX-user.width/2;
  let maxX = width-user.width;
  user.x = Math.min(Math.max(0, actualX), maxX);
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
    pause = true;
    if(confirm("A classic Pong game"
    + "\nMade by: P_Luizon"
    + "\n\nCurrent difficulty: " + difficulty
    + "\n\n"
    + "If you find any bug feel free "
    + "to tell me about it."
    + "\n\n"
    + "Press ok if you'll do it 8]")) {
      const alertMessage = "Mailto could don't work in DCoder. "
      + "So, here you have my mail in your clipboard :)"
      + "\n\npluizoncv@gmail.com";
      alert(alertMessage);
      
      // doing weird things to copy to clipboard
      const txtArea = document.createElement('textarea');
      txtArea.value = "pluizoncv@gmail.com";
      document.body.appendChild(txtArea);
      txtArea.select();
      document.execCommand('copy');
      document.body.removeChild(txtArea);
      
      // trying to redirect the user to the mail thing
      var mailMessage = "Hey dude, I found some things you have to fix in that pong you did in DCoder.";
      var subject = "Fix this bugs from your DCoder Pong, folk";
      //document.location.href = "mailto:pluizoncv@gmail.com";
      document.location.href = "mailto:pluizoncv@gmail.com?"
      + "subject=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(mailMessage);
      /**/
    }
    return;
  }
});

// key events, if the user have a keyboard
window.addEventListener("keydown", function(key) {
  if(key.key == "enter")
    pause = !pause;
  if(pause)
    return;
  let maxX = width-user.width;
  let sign = 0;
  if(key.key == "ArrowRight")
    sign = 1;
  else if(key.key == "ArrowLeft")
    sign = -1;
  if(sign != 0) // if you don't press left or rigth, it ain't gonna happen a thing
    user.x = Math.min(Math.max(0, user.x+sign*width/30), maxX);
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
  CPU.score = 0;
  user.score = 0;
  render();
  setDifficulty();
}

function setDifficulty() {
  let message = "Put a number from 1 to 10, "
  + "will be the level of difficulty of the game :)";
  let d = prompt(message, "1 - 10");
  
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
  
  ball.speeder = (2+difficulty/3)/100;
  CPU.maxSpeed = width/400*difficulty;
  
  console.log("Current dificulty level: " + difficulty);
  /**/
}

//===========================
// THE LOOP, called every single frame
//===========================
function loop() {
  if(pause)
    return;
  // ball
  ball.move();
  
  // CPU
  let p1x = CPU.x+CPU.width/2;
  if(p1x < ball.x)
    CPU.x = Math.min(width-CPU.width,
      Math.min(CPU.x+CPU.maxSpeed,
        ball.x-CPU.width/2));
  else if(p1x > ball.x)
    CPU.x = Math.max(0,
      Math.max(CPU.x-CPU.maxSpeed,
        ball.x-CPU.width/2));
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
  /**/
  declareVariables();
  initializeObjects();
  render();
  ball.startMoving(ball.initialSpeed);
  setDifficulty();
  main(performance.now());
})();

console.log("refresh if the screen goes white");