const s = (num) => 0.5 * num;
const NUM_CATS = 3;  // Easy to change number of cats
let foundCat = Array(NUM_CATS).fill(false);
let moveDirection = Array(NUM_CATS).fill().map(() => ({x: 0.3, y: -0.5}));
let speedCoefficient = 0.1;
let nearCatches = Array(NUM_CATS).fill(0);
let speedInc = 0.0;
const speedFullCoeff = () => speedCoefficient + nearCatches.reduce((a, b) => a + b) * speedInc;
const catchRadius = () => max(speedFullCoeff(), 3);
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
  largestDistance = s(sqrt(pow(img.width, 2) + pow(img.height, 2)));

}

function randomlyChangeDirection(catIndex) {
  if (random() < 0.005) {
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

function moveCat(catIndex) {
  if (foundCat[catIndex]) return;
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
  fill(50, 50, 50, opacity * 250);
  rect(0, 0, s(img.width), s(img.height));
}

function drawLight() {
  // Calculate the light position with a wider range
  const totalWidth = s(img.width) * 3; // One full width to the left, one full width to the right, and one in the center
  const lightX = ((frameCount) % totalWidth) - s(img.width); // Subtract width to start off-screen
  
  let radius = s(img.width) * 0.8; // Adjusted radius for better sun-beam effect
  
  let gradient = drawingContext.createRadialGradient(
    lightX, s(img.height) / 2, 0,
    lightX, s(img.height) / 2, radius
  );
  
  // Define gradient colors
  gradient.addColorStop(0, `hsla(50, 83.50%, 52.40%, 0.50)`);
  gradient.addColorStop(1, `hsla(50, 83.50%, 1.40%, 0.9)`);
  
  // Apply gradient
  drawingContext.fillStyle = gradient;
  rect(0, 0, s(img.width), s(img.height));
}

function drawCatcher(minDistance) {
  // Make it light green, half transparent  
  const opacityPreLog = map(minDistance, 0, largestDistance * 0.6, 0, 1, true);
  const opacity = 0.5 * log((100 * opacityPreLog) + 1) / log(10);
  fill(0, 255, 0, 255 - (opacity * 250));
  const gradient = drawingContext.createRadialGradient(
    mouseX, mouseY, 0,
    mouseX, mouseY, width
  );
  gradient.addColorStop(0, `hsla(104, 94.40%, 34.70%, ${(1 - opacity)})`);
  gradient.addColorStop(1, `hsla(104, 94.40%, 34.70%, ${(1 - opacity) / 10000})`);
  drawingContext.fillStyle = gradient;
  noStroke();
  if (mouseIsPressed) {
    circle(mouseX, mouseY, width * 2);
  }
  drawingContext.fillStyle = null;
  stroke(0);
  fill("steelblue");
  circle(mouseX, mouseY, catchRadius());

}

function draw() {
  for (let i = 0; i < NUM_CATS; i++) {
    moveCat(i);
  }
  clear();
  noCursor();
  image(img, 0, 0, s(img.width), s(img.height));
  fill(0);
  textSize(20);
  
  let minDistance = Infinity;
  let closestCatIndex = 0;
  for (let i = 0; i < NUM_CATS; i++) {
    if (foundCat[i]) continue;  // Skip found cats when calculating distance
    const distance = sqrt(pow(home[i].x - mouseX, 2) + pow(home[i].y - mouseY, 2));
    if (distance < minDistance) {
      minDistance = distance;
      closestCatIndex = i;
    }
    if (!foundCat[i] && distance <= catchRadius()) {
      foundCat[i] = true;
    }
  }

  const allCatsFound = foundCat.every(found => found);
  for (let i = 0; i < NUM_CATS; i++) {
    drawCat(i);
  }

  drawLight();

  if (!allCatsFound) {
    // Calculate fogOpacity before using it
    const fogOpacityPreLog = map(minDistance, 0, largestDistance * 0.6, 0, 1, true);
    const fogOpacity = 0.5 * log((100 * fogOpacityPreLog) + 1) / log(10);
    
    // Only show brown overlay if there's at least one unfound cat
    // if (minDistance !== Infinity) {
    //   // Create brown overlay rectangle - opacity based on distance to nearest unfound cat
    //   drawFog(fogOpacity);
    // }
    // Set up text styling
    fill(0);
    textFont('Courier New');
    textStyle(BOLD);
    
    if (minDistance > 100) {
      // Show progress when far from cats (e.g. "Looking for cats (2/3)")
      text(`Looking for cats (${foundCat.filter(f => f).length}/${NUM_CATS})`, s(img.width) / 2 - 100, s(img.height) + 20);
    } else {
      // Show "You're close!" message when near a cat
      text("You're close!", s(img.width) / 2 - 100, s(img.height) + 20);
      
      // Increment near-catch counter for this cat if very close
      // This affects the speed coefficient calculation
      if (minDistance < 20) {
        nearCatches[closestCatIndex]++;
      }
    }
    drawCatcher(minDistance);
  } else {
    // Set up text styling for victory message
    fill(0);
    textFont('Courier New');
    textStyle(BOLD);
    text("FOUND ALL CATS! (refresh for new cat locations)", s(img.width) / 2 - 150, s(img.height) + 20);
  }
  
  // Draw found cats
  foundCat.forEach((found, index) => {
    if (found) {
      text("🐈", home[index].x, home[index].y);
    }
  });
  
  // text(`${abs(home.x - mouseX)}, ${abs(home.y - mouseY)}, ${distance}, ${log(fogOpacity)}`, 20, 50);
  // text(`${home.x}, ${s(img.width)}, ${home.y}, ${s(img.height)}`, 20, 50);
  

  displayStats();
  
}
function displayStats() {
  textAlign(RIGHT);
  textSize(16);
  fill(0);
  text(`Speed: ${speedFullCoeff()}`, s(img.width) - 10, 25);
  text(`Found: ${foundCat.filter(f => f).length}/${NUM_CATS}`, s(img.width) - 10, 45);
  textAlign(LEFT);
}


