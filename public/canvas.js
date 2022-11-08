const canvas = document.querySelector("#signature-field");
const ctx = canvas.getContext("2d");
canvas.width = 300;
canvas.height = 80;
ctx.strokeStyle = "#264653";
ctx.lineWidth = 2;

let signing = false;
let mousePosition = {
    x: 0,
    y: 0,
};

let lastPosition = mousePosition;

canvas.addEventListener("mousedown", (event) => {
    signing = true;
    lastPosition = getMousePosition(canvas, event);
    console.log("mousedown", event);
});

canvas.addEventListener("mouseup", (event) => {
    signing = false;
    console.log("mouseup", event);
});

canvas.addEventListener("mousemove", (event) => {
    mousePosition = getMousePosition(canvas, event);
    console.log("mouse is moving", event);
});

function getMousePosition(canvas, mouseEvent) {
    const signArea = canvas.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - signArea.left,
        y: mouseEvent.clientY - signArea.top,
    };
}

function renderCanvas() {
    if (signing) {
        ctx.moveTo(lastPosition.x, lastPosition.y);
        ctx.lineTo(mousePosition.x, mousePosition.y);
        ctx.stroke();
        lastPosition = mousePosition;
    }
}

renderCanvas();

// x: mouseEvent.clientX - rect.left,
// y: mouseEvent.clientY - rect.top

//clear button clearCanvas()
