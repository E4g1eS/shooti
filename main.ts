import Game from "./shooti/game.js";

let game = null;

function CanvasResize() {
    const canvas = document.getElementById("game-canvas");

    if (!canvas || !(canvas instanceof HTMLCanvasElement))
        throw new Error("Canvas not found!");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function Main() {
    const canvas = document.getElementById("game-canvas");

    if (!canvas || !(canvas instanceof HTMLCanvasElement))
        throw new Error("Canvas not found!");

    const context = canvas.getContext("webgpu");

    if (!context || !(context instanceof GPUCanvasContext))
        throw new Error("WebGPU context not possible!");

    CanvasResize();

    canvas.addEventListener("click", async () => {
        canvas.requestPointerLock();
    });

    game = new Game(context);
}

document.addEventListener("DOMContentLoaded", Main);
window.addEventListener("resize", CanvasResize);