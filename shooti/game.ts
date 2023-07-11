import { quat, vec2, vec3 } from "wgpu-matrix";

import { App, Updatable } from "../engine/app.js";
import { Model } from "../engine/drawable.js";
import { Entity, Transform } from "../engine/entity.js";
import { ObjLoader } from "../engine/loaders.js";

const MOUSE_SENSITIVITY = 0.001;
const MOVEMENT_SPEED = 0.003;

export default class Game implements Updatable{
    app?: App;

    entity?: Entity;

    constructor(context: GPUCanvasContext) {
        App.Initialize(context).then((app) => {
            this.app = app;
            this.Initialize();
        });
    }

    private async InitializeWorld() {
        const objLoader = new ObjLoader();
        const mesh = objLoader.LoadCone();
        //const cubeMesh = objLoader.LoadCube();

        const loadedMesh = objLoader.Load("cube.obj");

        const model = new Model();
        model.mesh = mesh;

        const entity = new Entity();
        entity.name = "entity";
        entity.transform = new Transform();
        entity.model = model;

        this.entity = entity;

        if (!this.app)
            return;

        this.app.world.entities.push(entity);

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

        if (!this.entity?.transform || !this.app.world.camera.transform)
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
            this.entity.transform.position = vec3.add(this.entity.transform.position, vec3.create(0, 0.1, 0));

        if (this.app.input.GetKeyTime("KeyK") !== 0)
            this.entity.transform.position = vec3.add(this.entity.transform.position, vec3.create(0, -0.1, 0));
    }
};