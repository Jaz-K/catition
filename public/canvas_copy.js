const canvas = document.querySelector("#signature-field");
const ctx = canvas.getContext("2d");
const hiddenInput = document.querySelector("#sig");
// console.log(hiddenInput);
// console.log("canvas datas", signatureData);

// const offsetX = canvas.offsetLeft;
// const offsetY = canvas.offsetTop;

// console.log(offsetX);
// console.log(offsetY);

canvas.width = 300;
canvas.height = 100;
ctx.strokeStyle = "#fff";
ctx.lineWidth = 2;

let signing = false;
var mousePosition = {
    x: 0,
    y: 0,
};
let currentPosition = mousePosition;

// console.log(mouseX);
canvas.addEventListener("mousedown", (event) => {
    signing = true;
    currentPosition = getXY(canvas, event);
    console.log("currentPosition", currentPosition);
    // console.log("mousedown", event);
});

canvas.addEventListener("mouseup", () => {
    signing = false;
    // console.log("mouseup", event);
    let signatureData = canvas.toDataURL();
    // console.log(signatureData);
    hiddenInput.value = signatureData;
});

canvas.addEventListener("mousemove", (event) => {
    if (signing) {
        // console.log("mouse is moving", event);
        mousePosition = getXY(canvas, event);
        console.log("mouseposition", mousePosition);
        renderSign(currentPosition.x, currentPosition.y);
    }
});

function renderSign(x, y) {
    ctx.beginPath();
    ctx.moveTo(mousePosition.x, mousePosition.y);
    ctx.lineTo(x, y);
    currentPosition = mousePosition;
    ctx.stroke();
}

function getXY(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}
// RESET Canvas
const reset = document.querySelector("#reset");

reset.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
