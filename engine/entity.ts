import { vec3, mat4, quat } from "wgpu-matrix";
import { Model } from "./drawable";

export class Transform {
    position = vec3.create();
    rotation = quat.identity();
    scale = vec3.create(1, 1, 1);

    GetModelMatrix() {
        const result = mat4.identity();
        mat4.scale(result, this.scale, result);
        const axisAngle = quat.toAxisAngle(this.rotation);
        mat4.rotate(result, axisAngle.axis, axisAngle.angle, result);
        mat4.translate(result, this.position, result);
        return result;
    }
};

export class Entity {
    name = "";
    transform: Transform | null = null;
    model: Model | null = null;
};