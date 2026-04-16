let font;
let lines = [
  "Somewhere, something incredible",
  "is waiting to be known."
];
let particles = [];

let settings = {
  nearDist: 100,
  midDist: 250,
  forceNear: 6,
  forceMid: 0.05,
  colorA: { r: 0, g: 91, b: 255 },
  colorB: { r: 255, g: 0, b: 168 }
};

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
  let canvas = createCanvas(windowWidth - 250, windowHeight);
  canvas.parent('canvas-container');
  textAlign(CENTER, CENTER);
  
  setupCustomGUI();
  setupSaveButton();
  generateParticles();
}

function setupSaveButton() {
  let btn = document.createElement('button');
  btn.id = 'saveSvgBtn';
  btn.textContent = 'Save SVG';
  btn.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: #fff;
    color: #000;
    border: none;
    padding: 10px 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    cursor: pointer;
    z-index: 999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;
  btn.addEventListener('click', saveSVG);
  document.body.appendChild(btn);
}

function saveSVG() {
  let svgParts = [];
  svgParts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">');
  svgParts.push('<rect width="' + width + '" height="' + height + '" fill="rgb(30,30,30)"/>');

  for (let p of particles) {
    let r, g, b, size;
    if (p.sizeType === "small") {
      r = settings.colorA.r;
      g = settings.colorA.g;
      b = settings.colorA.b;
      size = guiSettings.sizeSmall / 2;
    } else {
      r = settings.colorB.r;
      g = settings.colorB.g;
      b = settings.colorB.b;
      size = guiSettings.sizeLarge / 2;
    }
    svgParts.push('<circle cx="' + p.pos.x.toFixed(2) + '" cy="' + p.pos.y.toFixed(2) + '" r="' + size + '" fill="rgb(' + r + ',' + g + ',' + b + ')"/>');
  }

  svgParts.push('</svg>');

  let blob = new Blob([svgParts.join('\n')], { type: 'image/svg+xml' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'particle-text.svg';
  a.click();
  URL.revokeObjectURL(url);
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveSVG();
  }
}

function generateParticles() {
  particles = [];

  let stencil = createGraphics(width, height);
  stencil.pixelDensity(1);
  stencil.textFont(font);
  stencil.textAlign(CENTER, CENTER);
  stencil.noStroke();
  stencil.clear();
  stencil.fill(255);

  let fontSize = 100;
  stencil.textSize(fontSize);
  let maxLineWidth = Math.max(...lines.map(l => stencil.textWidth(l)));
  while (maxLineWidth > width * 0.9 && fontSize > 10) {
    fontSize -= 2;
    stencil.textSize(fontSize);
    maxLineWidth = Math.max(...lines.map(l => stencil.textWidth(l)));
  }

  let lineHeight = fontSize * 1.6;
  let totalHeight = lines.length * lineHeight;
  let startY = (height - totalHeight) / 2 + lineHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    stencil.text(lines[i], width / 2, startY + i * lineHeight);
  }

  stencil.loadPixels();

  while (particles.length < 6000) {
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
  resizeCanvas(windowWidth - 250, windowHeight);
  generateParticles();
}

function setupCustomGUI() {
  new RotaryKnob('sizeSmall', 1, 20, 3, (val) => {
    guiSettings.sizeSmall = val;
  });
  document.getElementById('sizeSmall').dataset.initial = 3;
  
  new RotaryKnob('sizeLarge', 2, 50, 6, (val) => {
    guiSettings.sizeLarge = val;
  });
  document.getElementById('sizeLarge').dataset.initial = 6;
  
  new RotaryKnob('nearDist', 50, 200, 100, (val) => {
    settings.nearDist = val;
  });
  document.getElementById('nearDist').dataset.initial = 100;
  
  new RotaryKnob('midDist', 150, 400, 250, (val) => {
    settings.midDist = val;
  });
  document.getElementById('midDist').dataset.initial = 250;
  
  new RotaryKnob('forceNear', 1, 10, 6, (val) => {
    settings.forceNear = val;
  });
  document.getElementById('forceNear').dataset.initial = 6;
  
  new RotaryKnob('forceMid', 0.01, 0.2, 0.05, (val) => {
    settings.forceMid = val;
  });
  document.getElementById('forceMid').dataset.initial = 0.05;
  
  new RotaryKnob('textSpread', 0, 1, 0, (val) => {
    guiSettings.textSpread = val;
  });
  document.getElementById('textSpread').dataset.initial = 0;
  
  new RotaryKnob('moveForce', 0.01, 0.2, 0.05, (val) => {
    guiSettings.moveForce = val;
  });
  document.getElementById('moveForce').dataset.initial = 0.05;
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

class RotaryKnob {
  constructor(id, min, max, initialValue, callback) {
    this.id = id;
    this.min = min;
    this.max = max;
    this.value = initialValue;
    this.callback = callback;
    
    this.knob = document.getElementById(id);
    this.valueDisplay = document.getElementById(id + 'Value');
    this.indicator = this.knob.querySelector('.knob-indicator');
    
    this.isDragging = false;
    this.lastAngle = 0;
    this.currentRotation = 0;
    
    this.updateDisplay();
    this.attachEvents();
  }
  
  attachEvents() {
    this.knob.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      const rect = this.knob.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      this.lastAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const rect = this.knob.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let deltaAngle = angle - this.lastAngle;
        
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
        
        this.currentRotation += deltaAngle * 0.7;
        this.lastAngle = angle;
        
        const minRotation = -135 * Math.PI / 180;
        const maxRotation = 135 * Math.PI / 180;
        const totalRotation = maxRotation - minRotation;
        
        let normalizedRotation = this.currentRotation;
        normalizedRotation = Math.max(minRotation, Math.min(maxRotation, normalizedRotation));
        this.currentRotation = normalizedRotation;
        
        const ratio = (normalizedRotation - minRotation) / totalRotation;
        this.value = this.min + ratio * (this.max - this.min);
        
        this.updateDisplay();
        this.callback(this.value);
      }
    });
    
    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    this.knob.addEventListener('dblclick', () => {
      const initialValue = parseFloat(this.knob.dataset.initial || this.value);
      this.value = initialValue;
      const ratio = (this.value - this.min) / (this.max - this.min);
      this.currentRotation = (-135 + ratio * 270) * Math.PI / 180;
      this.updateDisplay();
      this.callback(this.value);
    });
  }
  
  updateDisplay() {
    const ratio = (this.value - this.min) / (this.max - this.min);
    const rotation = -135 + (ratio * 270);
    
    this.indicator.style.transform = `rotate(${rotation}deg)`;
    
    let displayValue = this.value;
    if (this.max - this.min <= 1) {
      displayValue = this.value.toFixed(2);
    } else if (this.max - this.min <= 10) {
      displayValue = this.value.toFixed(1);
    } else {
      displayValue = Math.round(this.value);
    }
    
    this.valueDisplay.textContent = displayValue;
  }
}
