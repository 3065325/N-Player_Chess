import Registry from "./registry.js";

const canvas: any = document.querySelector("canvas");
console.assert(canvas instanceof HTMLCanvasElement, "Element retrieved not Canvas.");
const c: CanvasRenderingContext2D = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let vw: number = canvas.width / 100;
let vh: number = canvas.height / 100;
Registry.m = vw;
Registry.renderDelta = 1/60;

const CanvasUpdate = (CENTER: boolean, Color: string): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    vw = canvas.width / 100;
    vh = canvas.height / 100;
    Registry.m = vw;

    c.fillStyle = Color;
    c.fillRect(0, 0, canvas.width, canvas.height);

    if (CENTER) {
        c.translate(canvas.width/2, canvas.height/2);
    }
}

export {canvas, c, CanvasUpdate, vw, vh};