const canvas = document.querySelector("#signature-field");
const ctx = canvas.getContext("2d");
const hiddenInput = document.querySelector("#sig");
// console.log(hiddenInput);
// console.log("canvas datas", signatureData);

const offsetX = canvas.offsetLeft;
const offsetY = canvas.offsetTop;

console.log(offsetX);
console.log(offsetY);

canvas.width = 300;
canvas.height = 50;
ctx.strokeStyle = "#264653";
ctx.lineWidth = 2;

let signing = false;
let mouseX = 0;
let mouseY = 0;

// console.log(mouseX);
canvas.addEventListener("mousedown", (event) => {
    signing = true;
    mouseX = event.clientX - offsetX;
    mouseY = event.clientY - offsetY;
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
        renderSign(event.clientX - offsetX, event.clientY - offsetY);
    }
});

function renderSign(x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(mouseX, mouseY);
    mouseX = x;
    mouseY = y;
    ctx.stroke();
}
// RESET signature
const reset = document.querySelector("#reset");

reset.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
