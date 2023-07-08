import { vec3, mat4 } from "gl-matrix";
import { Entity, Transform } from "./entity.js";

export class Camera extends Entity {

    constructor() {
        super();
        this.transform = new Transform();
    }

    GetViewMatrix() {
        const center = vec3.transformQuat(vec3.create(), this.transform!.position, this.transform!.rotation);
        return mat4.lookAt(mat4.create(), this.transform!.position, center, vec3.fromValues(0, 1, 0));
    }
}