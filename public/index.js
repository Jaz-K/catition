const canvas = document.querySelector("#signature-field");
const ctx = canvas.getContext("2d");
const hiddenInput = document.querySelector("#sig");

canvas.width = 300;
canvas.height = 50;
ctx.strokeStyle = "#fff";
ctx.lineWidth = 2;

let signing = false;

let mousePosition = {
    x: 0,
    y: 0,
};
let currentPosition = mousePosition;

canvas.addEventListener("mousedown", (event) => {
    signing = true;
    currentPosition = getXY(canvas, event);
    console.log("currentPosition", currentPosition);
});

canvas.addEventListener("mouseup", () => {
    signing = false;
    let signatureData = canvas.toDataURL();
    hiddenInput.value = signatureData;
});

canvas.addEventListener("mousemove", (event) => {
    if (signing) {
        mousePosition = getXY(canvas, event);
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
    hiddenInput.value = "";
});

// CONFIRM DELETION
/* const deleteUser = document.querySelector("#delete");

deleteUser.addEventListener("click", confirmDelete);

function confirmDelete(event) {
    let feedback = confirm("Are you sure you want to delete?");
    if (feedback) {
    } else {
        event.preventDefault();
    }
} */
