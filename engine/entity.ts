import { vec3, mat4, quat } from "wgpu-matrix";
import { Model } from "./drawable";

export class Transform {
    position = vec3.create();
    rotation = quat.identity();
    scale = vec3.create(1, 1, 1);

    GetModelMatrix() {
        const identity = mat4.identity();
        const scaled = mat4.scale(identity, this.scale);
        const axisAngle = quat.toAxisAngle(this.rotation);
        const rotated = mat4.rotate(scaled, axisAngle.axis, axisAngle.angle);
        const translated = mat4.translate(rotated, this.position);
        return translated;
    }
};

export class Entity {
    name = "";
    transform: Transform | null = null;
    model: Model | null = null;
};