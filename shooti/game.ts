import { quat, vec2, vec3 } from "wgpu-matrix";

import { App, Updatable } from "../engine/app.js";
import { Entity, Transform } from "../engine/entity.js";
import { ObjLoader } from "../engine/loaders.js";

const MOUSE_SENSITIVITY = 0.001;
const MOVEMENT_SPEED = 0.003;

export default class Game implements Updatable {
    app?: App;

    suzanne?: Entity;

    constructor(context: GPUCanvasContext) {
        App.Initialize(context).then((app) => {
            this.app = app;
            this.Initialize();
        });
    }

    private async InitializeWorld() {
        const objLoader = new ObjLoader();

        this.suzanne = new Entity("suzanne");
        this.suzanne.name = "suzanne";
        this.suzanne.transform = new Transform();
        this.suzanne.model = await objLoader.Load("suzanne.obj");

        if (!this.app)
            return;

        this.app.world.entities.push(this.suzanne);

        const cube = new Entity("cube");
        cube.transform = new Transform(vec3.create(0, -5, 0));
        cube.model = await objLoader.Load("cube.obj");

        this.app.world.entities.push(cube);

        if (!this.app.world.camera.transform)
            return;

        this.app.world.camera.transform.position = vec3.add(this.app.world.camera.transform.position, vec3.create(0, 0, 2));
    }

    async Initialize() {
        if (!this.app)
            throw new Error("Could not initialize engine app.");

        await this.InitializeWorld();

        this.app.Tick(this);
    }

    Update() {

        if (!this.app)
            return;

        if (!this.suzanne?.transform || !this.app.world.camera.transform)
            return;

        const mouseMovement = this.app.input.GetMouseMovement();
        this.app.world.camera.transform.rotation = quat.rotateX(this.app.world.camera.transform.rotation, mouseMovement[1] * -MOUSE_SENSITIVITY);
        this.app.world.camera.transform.rotation = quat.rotateY(this.app.world.camera.transform.rotation, mouseMovement[0] * -MOUSE_SENSITIVITY);

        const forwardDirection = vec3.transformQuat(vec3.create(0, 0, -1), this.app.world.camera.transform.rotation);
        const forwardAmount = (this.app.input.GetKeyTime("KeyW") - this.app.input.GetKeyTime("KeyS")) * MOVEMENT_SPEED;
        this.app.world.camera.transform.position = vec3.add(this.app.world.camera.transform.position, vec3.mulScalar(forwardDirection, forwardAmount));

        const sideDirection = vec3.cross(forwardDirection, vec3.create(0, 1, 0));
        const sideAmount = (this.app.input.GetKeyTime("KeyD") - this.app.input.GetKeyTime("KeyA")) * MOVEMENT_SPEED;
        this.app.world.camera.transform.position = vec3.add(this.app.world.camera.transform.position, vec3.mulScalar(sideDirection, sideAmount));

        const upAmount = (this.app.input.GetKeyTime("Space") - this.app.input.GetKeyTime("ShiftLeft")) * MOVEMENT_SPEED;
        this.app.world.camera.transform.position = vec3.add(this.app.world.camera.transform.position, vec3.mulScalar(vec3.create(0, 1, 0), upAmount));

        if (this.app.input.GetKeyTime("KeyI") !== 0)
            this.suzanne.transform.position = vec3.add(this.suzanne.transform.position, vec3.create(0, 0.1, 0));

        if (this.app.input.GetKeyTime("KeyK") !== 0)
            this.suzanne.transform.position = vec3.add(this.suzanne.transform.position, vec3.create(0, -0.1, 0));
    }
};