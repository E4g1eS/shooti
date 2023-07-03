import { App } from "../engine/app.js";
import { Model } from "../engine/drawable.js";
import { Entity, Transform } from "../engine/entity.js";
import { ObjLoader } from "../engine/loaders.js";

export default class Game {
    app? : App;

    constructor(context: GPUCanvasContext) {
        App.Initialize(context).then((app) => {
            this.app = app;
            this.Initialize();
        });
    }

    Initialize() {
        if (!this.app)
            throw new Error("Could not initialize engine app.");

        const objLoader = new ObjLoader();
        const cubeMesh = objLoader.LoadCube();

        const cubeModel = new Model();
        cubeModel.mesh = cubeMesh;

        const cube = new Entity();
        cube.name = "cube";
        cube.transform = new Transform();
        cube.model = cubeModel;

        this.app.world.entities.push(cube);

        this.app.Tick();
    }
};