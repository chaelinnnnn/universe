let font;
let lines = [
  "Somewhere, something incredible",
  "is waiting to be known."
];
let particles = [];

// 입자 기본 설정
let settings = {
  nearDist: 100,
  midDist: 250,
  forceNear: 6,
  forceMid: 0.05,
  colorA: { r: 0, g: 91, b: 255 },
  colorB: { r: 255, g: 0, b: 168 }
};

// GUI용 설정
let guiSettings = {
  textSpread: 0,
  moveForce: 0.05,
  sizeSmall: 3,
  sizeLarge: 6
};

function preload() {
  font = loadFont("https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf");
}

function setup() {
  let canvas = createCanvas(windowWidth - 350, windowHeight);
  canvas.parent('canvas-container');
  textAlign(CENTER, CENTER);
  
  // 커스텀 GUI 컨트롤 연결
  setupCustomGUI();
  
  // 글자 모양 스텐실
  let stencil = createGraphics(width, height);
  stencil.pixelDensity(1);
  stencil.textFont(font);
  stencil.textAlign(CENTER, CENTER);
  stencil.textSize(60);
  stencil.clear();
  stencil.fill(255);
  stencil.noStroke();
  
  let yOffset = height / 2 - 60;
  for (let i = 0; i < lines.length; i++) {
    stencil.text(lines[i], width / 2, yOffset + i * 120);
  }
  
  stencil.loadPixels();
  
  // 입자 생성
  while (particles.length < 6000) {
    let x = floor(random(width));
    let y = floor(random(height));
    let idx = 4 * (y * width + x);
    if (stencil.pixels[idx] > 128) {
      particles.push(new Particle(x, y));
    }
  }
}

function setupCustomGUI() {
  // Small Particle
  let smallSlider = select('#sizeSmall');
  smallSlider.input(() => {
    guiSettings.sizeSmall = parseFloat(smallSlider.value());
    select('#sizeSmallValue').html(guiSettings.sizeSmall);
  });
  
  // Large Particle
  let largeSlider = select('#sizeLarge');
  largeSlider.input(() => {
    guiSettings.sizeLarge = parseFloat(largeSlider.value());
    select('#sizeLargeValue').html(guiSettings.sizeLarge);
  });
  
  // Near Distance
  let nearDistSlider = select('#nearDist');
  nearDistSlider.input(() => {
    settings.nearDist = parseFloat(nearDistSlider.value());
    select('#nearDistValue').html(settings.nearDist);
  });
  
  // Mid Distance
  let midDistSlider = select('#midDist');
  midDistSlider.input(() => {
    settings.midDist = parseFloat(midDistSlider.value());
    select('#midDistValue').html(settings.midDist);
  });
  
  // Near Force
  let nearForceSlider = select('#forceNear');
  nearForceSlider.input(() => {
    settings.forceNear = parseFloat(nearForceSlider.value());
    select('#forceNearValue').html(settings.forceNear);
  });
  
  // Mid Restoring
  let midForceSlider = select('#forceMid');
  midForceSlider.input(() => {
    settings.forceMid = parseFloat(midForceSlider.value());
    select('#forceMidValue').html(settings.forceMid);
  });
  
  // Text Spread
  let spreadSlider = select('#textSpread');
  spreadSlider.input(() => {
    guiSettings.textSpread = parseFloat(spreadSlider.value());
    select('#textSpreadValue').html(guiSettings.textSpread);
  });
  
  // Movement Speed
  let moveSlider = select('#moveForce');
  moveSlider.input(() => {
    guiSettings.moveForce = parseFloat(moveSlider.value());
    select('#moveForceValue').html(guiSettings.moveForce);
  });
}

function draw() {
  background(30);
  for (let p of particles) {
    p.update();
    p.show();
  }
}

function windowResized() {
  resizeCanvas(windowWidth - 350, windowHeight);
}

class Particle {
  constructor(x, y) {
    this.base = createVector(x, y);
    this.pos = createVector(width / 2, height / 2);
    this.vel = createVector(0, 0);
    this.sizeType = random() < 0.5 ? "small" : "large";
  }
  
  update() {
    let target = p5.Vector.lerp(createVector(width / 2, height / 2), this.base, guiSettings.textSpread);
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    
    if(d < settings.nearDist) {
      let repel = p5.Vector.sub(this.pos, createVector(mouseX, mouseY));
      repel.setMag(map(d, 0, settings.nearDist, settings.forceNear, 0));
      this.vel.add(repel);
    } 
    else if(d < settings.midDist) {
      let gentle = p5.Vector.sub(target, this.pos).mult(settings.forceMid);
      this.vel.add(gentle);
    }
    
    let force = p5.Vector.sub(target, this.pos).mult(guiSettings.moveForce);
    this.vel.add(force);
    this.vel.mult(0.8);
    this.pos.add(this.vel);
  }
  
  show() {
    noStroke();
    if(this.sizeType === "small") {
      fill(settings.colorA.r, settings.colorA.g, settings.colorA.b);
      circle(this.pos.x, this.pos.y, guiSettings.sizeSmall);
    } else {
      fill(settings.colorB.r, settings.colorB.g, settings.colorB.b);
      circle(this.pos.x, this.pos.y, guiSettings.sizeLarge);
    }
  }
}
