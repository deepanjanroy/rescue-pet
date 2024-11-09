const s = (num) => 0.5 * num;
const NUM_CATS = 3;  // Easy to change number of cats
let foundHome = Array(NUM_CATS).fill(false);
let moveDirection = Array(NUM_CATS).fill().map(() => ({x: 0.3, y: -0.5}));
let speedCoefficient = 3.0
let nearCatches = Array(NUM_CATS).fill(0);
let speedInc = 0.1;
const speedFullCoeff = () => speedCoefficient + nearCatches.reduce((a, b) => a + b) * speedInc;
const catchRadius = () => speedFullCoeff() * 5;
const ALWAYS_SHOW_CATS = false;

function preload() {
  img = loadImage('map.png');
}

function setup() {
  createCanvas(s(img.width), s(img.height) + 50);
  home = Array(NUM_CATS).fill().map(() => ({
    x: Math.random() * s(img.width), 
    y: Math.random() * s(img.height)
  }));
}

function randomlyChangeDirection(catIndex) {
  if (random() < 0.02) {
    const angle = random(TWO_PI);
    moveDirection[catIndex] = {
      x: cos(angle),
      y: sin(angle)
    };
  }
}

function drawCat(catIndex) {
  const showTime = 10;  // frames to show
  const period = 600;   // 10s * 60fps = 600 frames
  if (ALWAYS_SHOW_CATS || (frameCount % period < showTime)) {
    push();
    fill(0);
    text("🐈", home[catIndex].x, home[catIndex].y);
    circle(home[catIndex].x, home[catIndex].y, 5 + sin(frameCount * 0.1) * 2);
    pop();
  }
}

function moveHome(catIndex) {
  if (foundHome[catIndex]) return;
  randomlyChangeDirection(catIndex);
  const speed = speedFullCoeff();
  const nextPos = {
    x: home[catIndex].x + moveDirection[catIndex].x,
    y: home[catIndex].y + moveDirection[catIndex].y
  };

  if (nextPos.x < 0 || nextPos.x > s(img.width)) {
    moveDirection[catIndex].x *= -1;
  }
  if (nextPos.y < 0 || nextPos.y > s(img.height)) {
    moveDirection[catIndex].y *= -1;
  }

  const magnitude = Math.sqrt(pow(moveDirection[catIndex].x, 2) + pow(moveDirection[catIndex].y, 2));
  moveDirection[catIndex].x = (moveDirection[catIndex].x / magnitude) * speed;
  moveDirection[catIndex].y = (moveDirection[catIndex].y / magnitude) * speed;
  
  home[catIndex].x += moveDirection[catIndex].x;
  home[catIndex].y += moveDirection[catIndex].y;
}

function drawFog(opacity) {
  // fill(50, 50, 50, opacity * 250);
  // rect(0, 0, s(img.width), s(img.height));
}

function drawLight() {
  // Create a radial gradient for the spotlight effect
  let radius = s(img.width); // Adjust this value to change spotlight size
  let gradient = drawingContext.createRadialGradient(
    (frameCount * 10) % s(img.width), s(img.height) / 2, 0,
    (frameCount * 10) % s(img.width), s(img.height) / 2, radius
  );
  
  // Define gradient colors
  gradient.addColorStop(0, `hsla(50, 83.50%, 52.40%, 0.50)`);
  gradient.addColorStop(1, `hsla(50, 83.50%, 10.40%, 0.50)`);
  
  // Apply gradient
  drawingContext.fillStyle = gradient;
  rect(0, 0, s(img.width), s(img.height));
}

function draw() {
  for (let i = 0; i < NUM_CATS; i++) {
    moveHome(i);
  }
  clear();
  noCursor();
  image(img, 0, 0, s(img.width), s(img.height));
  drawLight();
  fill(0);
  textSize(20);
  
  let minDistance = Infinity;
  let closestCatIndex = 0;
  for (let i = 0; i < NUM_CATS; i++) {
    if (foundHome[i]) continue;  // Skip found cats when calculating distance
    const distance = sqrt(pow(home[i].x - mouseX, 2) + pow(home[i].y - mouseY, 2));
    if (distance < minDistance) {
      minDistance = distance;
      closestCatIndex = i;
    }
    if (!foundHome[i] && distance <= catchRadius()) {
      foundHome[i] = true;
    }
  }

  const allCatsFound = foundHome.every(found => found);

  if (!allCatsFound) {
    // Calculate fogOpacity before using it
    const largestDistance = s(sqrt(pow(img.width, 2) + pow(img.height, 2)));
    const fogOpacityPreLog = map(minDistance, 0, largestDistance * 0.6, 0, 1, true);
    const fogOpacity = 0.5 * log((100 * fogOpacityPreLog) + 1) / log(10);
    
    // Only show brown overlay if there's at least one unfound cat
    if (minDistance !== Infinity) {
      // Create brown overlay rectangle - opacity based on distance to nearest unfound cat
      drawFog(fogOpacity);
    }
    // Set up text styling
    fill(0);
    textFont('Courier New');
    textStyle(BOLD);
    
    if (minDistance > 100) {
      // Show progress when far from cats (e.g. "Looking for cats (2/3)")
      text(`Looking for cats (${foundHome.filter(f => f).length}/${NUM_CATS})`, s(img.width) / 2 - 100, s(img.height) + 20);
    } else {
      // Show "You're close!" message when near a cat
      text("You're close!", s(img.width) / 2 - 100, s(img.height) + 20);
      
      // Increment near-catch counter for this cat if very close
      // This affects the speed coefficient calculation
      if (minDistance < 20) {
        nearCatches[closestCatIndex]++;
      }
    }
  } else {
    // Set up text styling for victory message
    fill(0);
    textFont('Courier New');
    textStyle(BOLD);
    text("FOUND ALL CATS! (refresh for new cat locations)", s(img.width) / 2 - 150, s(img.height) + 20);
  }
  
  // Draw found cats
  foundHome.forEach((found, index) => {
    if (found) {
      text("🐈", home[index].x, home[index].y);
    }
  });
  
  // text(`${abs(home.x - mouseX)}, ${abs(home.y - mouseY)}, ${distance}, ${log(fogOpacity)}`, 20, 50);
  // text(`${home.x}, ${s(img.width)}, ${home.y}, ${s(img.height)}`, 20, 50);
  fill("steelblue");
  circle(mouseX, mouseY, catchRadius());

  for (let i = 0; i < NUM_CATS; i++) {
    drawCat(i);
  }
  displayStats();
  
}
function displayStats() {
  textAlign(RIGHT);
  textSize(16);
  fill(0);
  text(`Speed: ${speedFullCoeff()}`, s(img.width) - 10, 25);
  text(`Found: ${foundHome.filter(f => f).length}/${NUM_CATS}`, s(img.width) - 10, 45);
  textAlign(LEFT);
}


