const s = (num) => 0.5 * num;
let foundHome = false;
let moveDirection = {x: 0.3, y: -0.5};
let speedCoefficient = 0.5

function preload() {
  img = loadImage('map.png');
}

function setup() {
  createCanvas(s(img.width), s(img.height) + 50);
  home = {x: Math.random() * s(img.width), y: Math.random() * s(img.height)}

}

function drawCat() {
  push();
  fill(0);
  text("🐈", home.x, home.y);
  pop();
}

function moveHome() {
  if (foundHome) return;
  
  const newX = home.x + moveDirection.x;
  if (newX < 0) moveDirection.x = Math.random();
  if (newX > s(img.width)) moveDirection.x = -Math.random();
  const newY = home.y + moveDirection.y;
  if (newY < 0) moveDirection.y = Math.random();
  if (newY > s(img.height)) moveDirection.y = -Math.random();
  
  const magnitude = Math.sqrt(pow(moveDirection.x, 2) + pow(moveDirection.y, 2));
  moveDirection.x /= magnitude;
  moveDirection.y /= magnitude;
  moveDirection.x *= speedCoefficient;
  moveDirection.y *= speedCoefficient;
  
  // console.log(moveDirection);
  home.x += moveDirection.x;
  home.y += moveDirection.y;
}

function draw() {
  moveHome();
  clear();
  noCursor();
  image(img, 0, 0, s(img.width), s(img.height));
  fill(0);
  textSize(20);
  
  const largestDistance = s(sqrt(pow(img.width, 2) + pow(img.height, 2)));
  const distance = sqrt(pow(home.x - mouseX, 2) + pow(home.y - mouseY, 2));
  const redValuePreLog = map(distance, 0, largestDistance * 0.6, 0, 1, true);
  const redValue = 0.5 * log((100 * redValuePreLog) + 1) / log(10);
  
  if (!foundHome && distance <= 5) foundHome = true; 
  

  if (!foundHome) {
    fill(187, 110, 71, redValue * 250);
    rect(0, 0, s(img.width), s(img.height));
    fill(0);
    textFont('Courier New');
    textStyle(BOLD);
    if (distance > 100) {
      text("You're looking for cat", s(img.width) / 2 - 100, s(img.height) + 20);
    } else {
      text("You're close!", s(img.width) / 2 - 100, s(img.height) + 20);
    }
  } else {
    text("🐈", home.x, home.y);
    fill(0);
    textFont('Courier New');
    textStyle(BOLD);
    text("FOUND CAT! (refresh for new cat location)", s(img.width) / 2 - 100, s(img.height) + 20);
  }
  
    
  // text(`${abs(home.x - mouseX)}, ${abs(home.y - mouseY)}, ${distance}, ${log(redValue)}`, 20, 50);
  // text(`${home.x}, ${s(img.width)}, ${home.y}, ${s(img.height)}`, 20, 50);
  fill("steelblue");
  circle(mouseX, mouseY, 10);

  // drawCat();
  

  
}

