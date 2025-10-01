
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const WIDTH = 800;
const HEIGHT = 600;
const RADIUS_CIRCLE = 10;
const DOT_SPACING = 0.1 * RADIUS_CIRCLE; // spacing as a function of radius


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


// draws a dot (relative to top right of canvas)
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



function draw() {

    let rng = makeRNG('salmon of doubt')

    let dotsX = Math.round(WIDTH/(2*RADIUS_CIRCLE + DOT_SPACING))
    let dotsY = Math.round(HEIGHT/(2*RADIUS_CIRCLE + DOT_SPACING))

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // draw the dots
    for (let t = 0; t < dotsY; t++) {
        for (let i = 0; i < dotsX; i++) {
            drawDot(10+i*(2*RADIUS_CIRCLE + DOT_SPACING), 10+t*(2*RADIUS_CIRCLE + DOT_SPACING), RADIUS_CIRCLE, 'crimson', rng);
        }
    }

    


}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);