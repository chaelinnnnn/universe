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
  colorA: [0,91,255],
  colorB: [255,0,168]
};
// GUI용 설정
let guiSettings = {
  textSpread: 0,      // 0: 중앙, 1: 글자
  moveForce: 0.05,
  sizeSmall: 3,
  sizeLarge: 6
};
let gui;

function preload() {
  font = loadFont("https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf");
}

function setup() {
  createCanvas(windowWidth - 300, windowHeight);
  textAlign(CENTER, CENTER);
  
  // dat.GUI 설정
  gui = new dat.GUI();
  gui.add(guiSettings, "sizeSmall", 1, 20, 1).name("Small Particle");
  gui.add(guiSettings, "sizeLarge", 2, 50, 1).name("Large Particle");
  gui.addColor(settings, "colorA").name("Bright Color");
  gui.addColor(settings, "colorB").name("Warm Color");
  gui.add(settings, "nearDist", 50, 200, 1).name("Near Reaction");
  gui.add(settings, "midDist", 150, 400, 1).name("Mid Reaction");
  gui.add(settings, "forceNear", 1, 10, 0.1).name("Near Force");
  gui.add(settings, "forceMid", 0.01, 0.2, 0.01).name("Mid Restoring");
  gui.add(guiSettings, "textSpread", 0, 1, 0.01).name("Text Spread");
  gui.add(guiSettings, "moveForce", 0.01, 0.2, 0.01).name("Movement Speed");
  
  // 글자 모양 스텐실
  let stencil = createGraphics(width, height);
  stencil.pixelDensity(1);
  stencil.textFont(font);
  stencil.textAlign(CENTER, CENTER);
  stencil.textSize(60); // 캔버스 크기에 맞춰 텍스트 크기도 증가
  stencil.clear();
  stencil.fill(255);
  stencil.noStroke();
  
  let yOffset = height / 2 - 60;
  for (let i = 0; i < lines.length; i++) {
    stencil.text(lines[i], width / 2, yOffset + i * 120);
  }
  
  stencil.loadPixels();
  
  // 입자 생성
  while (particles.length < 6000) { // 큰 화면에 맞춰 입자 수 증가
    let x = floor(random(width));
    let y = floor(random(height));
    let idx = 4 * (y * width + x);
    if (stencil.pixels[idx] > 128) {
      particles.push(new Particle(x, y));
    }
  }
}

function draw() {
  background(30);
  for (let p of particles) {
    p.update();
    p.show();
  }
}

function windowResized() {
  resizeCanvas(windowWidth - 300, windowHeight);
}

class Particle {
  constructor(x, y) {
    this.base = createVector(x, y);
    this.pos = createVector(width / 2, height / 2);
    this.vel = createVector(0, 0);
    this.sizeType = random() < 0.5 ? "small" : "large";
  }
  
  update() {
    // 중앙 ↔ 글자 위치 보간
    let target = p5.Vector.lerp(createVector(width / 2, height / 2), this.base, guiSettings.textSpread);
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    
    // 근접 힘
    if(d < settings.nearDist) {
      let repel = p5.Vector.sub(this.pos, createVector(mouseX, mouseY));
      repel.setMag(map(d, 0, settings.nearDist, settings.forceNear, 0));
      this.vel.add(repel);
    } 
    // 중간 복원력
    else if(d < settings.midDist) {
      let gentle = p5.Vector.sub(target, this.pos).mult(settings.forceMid);
      this.vel.add(gentle);
    }
    
    // 기본 이동
    let force = p5.Vector.sub(target, this.pos).mult(guiSettings.moveForce);
    this.vel.add(force);
    this.vel.mult(0.8);
    this.pos.add(this.vel);
  }
  
  show() {
    noStroke();
    if(this.sizeType === "small") {
      fill(settings.colorA);
      circle(this.pos.x, this.pos.y, guiSettings.sizeSmall);
    } else {
      fill(settings.colorB);
      circle(this.pos.x, this.pos.y, guiSettings.sizeLarge);
    }
  }
}
