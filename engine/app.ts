import { Renderer } from "./renderer.js";
import { World } from "./world.js";

export class App {

    world = new World();
    private _renderer!: Renderer;

    private constructor() { }

    static async Initialize(context: GPUCanvasContext) {
        const app = new App();

        app._renderer = await Renderer.Initialize(context);

        return app;
    }

    private Update() {

    }

    private Render() {
        this._renderer.RenderFrame(this.world);
    }

    Tick() {
        this.Update();
        this.Render();

        requestAnimationFrame(() => this.Tick());
    }
};