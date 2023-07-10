import { vec3, mat4, quat } from "wgpu-matrix";
import { Model } from "./drawable";

export class Transform {
    position = vec3.create();
    rotation = quat.create();
    scale = vec3.create();

    GetTranslationMatrix() {
        return mat4.translation(this.position);
    }

    GetRotationMatrix() {
        return mat4.fromQuat(this.rotation);
    }

    GetScaleMatrix() {
        return mat4.scaling(this.scale);
    }

    GetModelMatrix() {
        return mat4.mul(this.GetTranslationMatrix(), mat4.mul(this.GetRotationMatrix(), this.GetScaleMatrix()));
    }
};

export class Entity {
    name = "";
    transform: Transform | null = null;
    model: Model | null = null;
};