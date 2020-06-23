new p5();
var canvas;
let idNum = 0
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("sketch");
    canvas.position(0, 0);
    frameRate(30);

    for (i = 0; i < 20; i++) {
        particles.push(new Particle(i, idNum, random(0, windowWidth), random(0, windowHeight)))
        idNum++
    }

    smooth()
}

var rectX = 0
var velX = 3
let rightX = true

let scrollChange = false
let scroll = this.scrollY;
let speeds = [1, 3];
let speed = speeds[0];

let birthRate = 800
let lastBirth = 0

let particles = []
let lines = []

let res = 50
MAX_LENGTH = 150
STRING_POWER = 0.2

function draw() {
    background(15, 7, 28);
    translate(0, -0.25*this.scrollY);
    clearLines()
    scrollSpeedChange()

    // showGrid()

    for (i of lines) {
        // particles[i.p1ID].pull(p5.Vector.mult(i.vec, -1))
        // particles[i.p1ID].pull(i.vec)
        particles[i.p2ID].pull(i.vec)
        i.display()
    }
    for (i of particles) {
        i.display()
    }
}

function clearLines() {
    for (i=0; i < lines.length; i++) {
        let line = lines[i]
        if (line.goodLength == false) {
            lines.splice(i, 1)
        }
    }
}

function evalGrid(x, y) {
    let xQuad, yQuad

    xQuad = ceil(x/res)
    yQuad = ceil(y/res)

    return createVector(xQuad, yQuad)
}

function showGrid() {
    push()
    stroke(75, 201, 86, 100)
    // render vert lines
    for (i=0; i < windowWidth; i += res) {
        line(i, 0, i, windowHeight)
    }
    // render hor lines
    for (i=0; i < windowHeight; i += res) {
        line(0, i, windowWidth, i)
    }
    pop()
}

function testRect() {
    fill(0, 0, 255);
    rect(rectX, windowHeight/2, 100, 100);
    if (rectX < 0) {
        rightX = true
    } else if (rectX > windowWidth - 100) {
        rightX = false
    }
    if (rightX) {
        rectX += velX*speed;
    } else {
        rectX -= velX*speed;
    }
}

function scrollSpeedChange() {
    if (scrollChange) {
        speed = speeds[1];
    } else { speed = speeds[0]}

    if (scroll != this.scrollY) {
        scrollChange = true
    } else {scrollChange = false}
    scroll = this.scrollY;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

class Particle {
    constructor(index, id, x, y) {
        this.index = index
        this.id = index
        this.pos = createVector(x, y)
        this.vel = createVector(random(-1, 1), random(-1, 1))
        this.size = random(10, 20)
        this.sizeSq = sq(this.size)
        this.quadCoor = createVector(0, 0)
    }

    display() {
        push()
        noStroke()
        translate(this.pos.x, this.pos.y)
        fill(245, 179, 66)
        ellipse(0, 0, this.size, this.size)
        pop()
        this.move()
        this.limits()

        this.quadCoor = evalGrid(this.pos.x, this.pos.y)
        
        this.evalLines()
    }

    pull(lineVec) {
        let accX = STRING_POWER*lineVec.x/this.sizeSq
        let accY = STRING_POWER*lineVec.y/this.sizeSq
        let acc = createVector(accX, accY)
        print(lineVec)
        this.vel.add(acc)
    }

    move() {
        this.pos.add(p5.Vector.mult(this.vel, speed))
    }

    evalLines() {
        for (i=0; i < particles.length; i++) {
            let p = particles[i]
            if (i !== this.index) {
                if (p.quadCoor.equals(this.quadCoor.x, this.quadCoor.y)) {
                    let same = false
                    for (let k=0; k<lines.length; k++) {
                        let l = lines[k]
                        if ((l.p1ID == p.id && l.p2ID == this.id)
                        || (l.p2ID == p.id && l.p1ID == this.id)) {
                            same = true
                        }
                    }
                    if (same == false) {
                        lines.push(new Line(p.id, this.id))
                    }
                }
            }
        }
    }

    limits() {
        if (this.pos.x > windowWidth) {
            this.pos.x = 0
        } else if (this.pos.x < 0) {
            this.pos.x = windowWidth
        }
        if (this.pos.y > windowHeight) {
            this.pos.y = 0
        } else if (this.pos.y < 0) {
            this.pos.y = windowHeight
        }
        // this.vel.setMag(random(1, 4)*speed)
        if (this.vel.mag() < 2) {
            this.vel.setMag(2)
        }

        this.vel.limit(10*speed)
    }
}

class Line {
    constructor(p1ID, p2ID) {
        this.p1ID = p1ID
        this.p2ID = p2ID
        this.vec = createVector(0, 0)
        this.length = 0
        this.goodLength = true
        this.thickness = 0
    }

    display() {
        push()
        this.vec.x = particles[this.p1ID].pos.x - particles[this.p2ID].pos.x
        this.vec.y = particles[this.p1ID].pos.y - particles[this.p2ID].pos.y
        this.length = particles[this.p1ID].pos.dist(particles[this.p2ID].pos)
        this.thickness = map(this.length, 0, MAX_LENGTH, 4, 0)
        strokeWeight(this.thickness)
        stroke(75, 149, 201)
        if ( this.length > MAX_LENGTH) {
            this.goodLength = false
        }

        if (this.goodLength) {
            line(particles[this.p1ID].pos.x, particles[this.p1ID].pos.y, particles[this.p2ID].pos.x, particles[this.p2ID].pos.y)
        }
        pop()
    }
}