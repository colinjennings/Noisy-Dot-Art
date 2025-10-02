
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 60 by 60 -- can separate into 2, 3, 4, 5, 6 parts
const DOTS_X = 60;
const DOTS_Y = 60;

const RADIUS_CIRCLE = 8;
const DOT_SPACING = -0.1 * RADIUS_CIRCLE; // spacing as a function of radius
const MARGIN = 80;

const WIDTH = DOTS_X*(2*RADIUS_CIRCLE + DOT_SPACING)+DOT_SPACING+MARGIN;
const HEIGHT = DOTS_Y*(2*RADIUS_CIRCLE + DOT_SPACING)+DOT_SPACING+MARGIN;

let rng_seed;

window.addEventListener('load', function() {
    rng_seed = Math.random();
    resizeCanvas();
});


function makeRNG(seed) {
  let state = seed >>> 0;
  return function() {
    // LCG parameters (Numerical Recipes)
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000; // normalize to [0, 1)
  };
}


function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = WIDTH + 'px';
    canvas.style.height = HEIGHT + 'px';
    canvas.width = Math.round(WIDTH * dpr);
    canvas.height = Math.round(HEIGHT * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
}


function drawDot(x, y, r, color, rng) {

    ctx.beginPath();
    ctx.fillStyle = color;

    // I like the uneveness of the dots, but I don't like the corners
    // todo; smooth spline where start and end are the same, then wrap it into a circle. is this efficient?
    const steps = 10;
    for (let i = 0; i <= steps; i++) {

        const angle = (i / steps) * Math.PI * 2;
        const jitter = (rng() - 0.5) * 0.15 * r;
        const radius = r + jitter;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;

        if (i === 0) {
            ctx.moveTo(px, py);
            firstX = px;
            firstY = py;
        } 
        else {
            const prevAngle = ((i - 0.5) / steps) * Math.PI * 2;
            const midX = x + Math.cos(prevAngle) * r;
            const midY = y + Math.sin(prevAngle) * r;
            ctx.quadraticCurveTo(midX, midY, px, py);
        }
    }   

    ctx.closePath();
    ctx.fill();
}

// todo: this is pretty bad! fix it?
function generateColors(rng) {

    // grab a hue on the color wheel
    const hue1 = Math.floor(rng() * 360);

    // grab things ~120 degrees apart
    const hue2 = ((hue1 + 120 + (rng()-0.5)*50)) % 360;
    const hue3 = ((hue1 + 240) +  (rng()-0.5)*50) % 360;

    return [hue1, hue2, hue3]
}


// returns 2d-matrix of 0,1,2 corresponding to color of dots
function createDotMatrix(rng) {
 
    let matrix = Array.from({ length: 60 }, () => Array(60).fill(0));

    for (let x = 0; x < DOTS_X; x++) {
        for (let y = 0; y < DOTS_Y; y++) {
            //matrix[x][y] = Math.floor(x / 20);
            matrix[x][y] = Math.round(rng()*3)
        }
    }

    return matrix;
}

    
function draw(matrix) {
    
    drawRng = makeRNG(rng_seed*100)

    matrix = createDotMatrix(drawRng)
    hues = generateColors(drawRng);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // draw the dots
    for (let t = 0; t < DOTS_Y; t++) {
        for (let i = 0; i < DOTS_X; i++) {
            drawDot(MARGIN/2 + RADIUS_CIRCLE+DOT_SPACING + i*(2*RADIUS_CIRCLE + DOT_SPACING), 
                    MARGIN/2 + RADIUS_CIRCLE+DOT_SPACING + t*(2*RADIUS_CIRCLE + DOT_SPACING),
                    RADIUS_CIRCLE, `hsl(${hues[matrix[i][t]]}, 100%, 50%)`, drawRng);
        }
    }

}


window.addEventListener('resize', resizeCanvas);