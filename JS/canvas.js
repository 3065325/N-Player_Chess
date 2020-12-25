import Registry from "./registry.js";
const canvas = document.querySelector("canvas");
console.assert(canvas instanceof HTMLCanvasElement, "Element retrieved not Canvas.");
const c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let vw = canvas.width / 100;
let vh = canvas.height / 100;
Registry.m = vw;
const CENTER = true;
const CanvasUpdate = (Color) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    vw = canvas.width / 100;
    vh = canvas.height / 100;
    Registry.m = vw;
    c.fillStyle = Color;
    c.fillRect(0, 0, canvas.width, canvas.height);
    if (CENTER) {
        c.translate(0.5 * canvas.width, 0.5 * canvas.height);
    }
};
let mousePos = [0, 0];
canvas.addEventListener('mousemove', (e) => {
    const boundingRect = canvas.getBoundingClientRect();
    mousePos[0] = e.clientX - boundingRect.left - (+CENTER) * 0.5 * canvas.width;
    mousePos[1] = -(e.clientY - boundingRect.top - (+CENTER) * 0.5 * canvas.height);
});
export { canvas, c, CanvasUpdate, vw, vh, mousePos };
//# sourceMappingURL=canvas.js.map