import { vec3, mat4 } from "wgpu-matrix";
import { Entity, Transform } from "./entity.js";

export class Camera extends Entity {

    constructor() {
        super();
        this.transform = new Transform();
    }

    GetViewMatrix() {
        const direction = vec3.transformQuat(vec3.create(0, 0, 1), this.transform!.rotation);
        const target = vec3.add(this.transform!.position, direction);
        return mat4.lookAt(this.transform!.position, target, vec3.create(0, -1, 0));
    }
}