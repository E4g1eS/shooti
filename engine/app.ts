import { Renderer } from "./renderer.js";
import { World } from "./world.js";
import { Input } from "./input.js";

export interface Updatable {
    Update(): void;
}

export class App {

    world = new World();
    input: Input;
    private _renderer!: Renderer;

    private constructor(context: GPUCanvasContext) {

        if (!(context.canvas instanceof HTMLCanvasElement))
            throw new Error("Canvas must not be offscreen");

        this.input = new Input(context.canvas);
    }

    static async Initialize(context: GPUCanvasContext) {
        const app = new App(context);

        app._renderer = await Renderer.Initialize(context);

        return app;
    }

    private Render() {
        this._renderer.RenderFrame(this.world);
    }

    Tick(updatable: Updatable) {
        updatable.Update();
        this.Render();

        if (this.input.GetKeyTime("Escape"))
            return;

        requestAnimationFrame(() => this.Tick(updatable));
    }
};