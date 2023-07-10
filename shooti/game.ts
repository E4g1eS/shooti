import { quat, vec2, vec3 } from "wgpu-matrix";

import { App, Updatable } from "../engine/app.js";
import { Model } from "../engine/drawable.js";
import { Entity, Transform } from "../engine/entity.js";
import { ObjLoader } from "../engine/loaders.js";

const MOUSE_SENSITIVITY = 0.01;

export default class Game implements Updatable{
    app?: App;

    cube?: Entity;

    constructor(context: GPUCanvasContext) {
        App.Initialize(context).then((app) => {
            this.app = app;
            this.Initialize();
        });
    }

    private InitializeWorld() {
        const objLoader = new ObjLoader();
        const cubeMesh = objLoader.LoadCube();

        const cubeModel = new Model();
        cubeModel.mesh = cubeMesh;

        const cube = new Entity();
        cube.name = "cube";
        cube.transform = new Transform();
        cube.transform.position = vec3.add(cube.transform.position, vec3.create(0.1, 0.1, 0));
        cube.model = cubeModel;

        this.cube = cube;

        if (!this.app)
            return;

        this.app.world.entities.push(cube);

        if (!this.app.world.camera.transform)
            return;

        //this.app.world.camera.transform.position = vec3.add(this.app.world.camera.transform.position, vec3.create(0, 0, 2));
    }

    Initialize() {
        if (!this.app)
            throw new Error("Could not initialize engine app.");

        this.InitializeWorld();

        this.app.Tick(this);
    }

    Update() {

        if (!this.app)
            return;

        if (!this.cube?.transform || !this.app.world.camera.transform)
            return;

        if (this.app.input.GetKeyTime("KeyD") !== 0)
            this.cube.transform.position = vec3.add(this.cube.transform.position, vec3.create(0.1, 0, 0));

        if (this.app.input.GetKeyTime("KeyA") !== 0)
            this.cube.transform.position = vec3.add(this.cube.transform.position, vec3.create(-0.1, 0, 0));

        if (this.app.input.GetKeyTime("KeyL") !== 0)
            this.app.world.camera.transform.position = vec3.add(this.app.world.camera.transform.position, vec3.create(0.1, 0, 0));

        if (this.app.input.GetKeyTime("KeyJ") !== 0)
            this.app.world.camera.transform.position = vec3.add(this.app.world.camera.transform.position, vec3.create(-0.1, 0, 0));

        const mouseMovement = this.app.input.GetMouseMovement();
        this.app.world.camera.transform.rotation = quat.rotateX(this.app.world.camera.transform.rotation, mouseMovement[1]);
        this.app.world.camera.transform.rotation = quat.rotateY(this.app.world.camera.transform.rotation, mouseMovement[0]);
    }
};