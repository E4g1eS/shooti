import { vec3, mat4, quat } from "gl-matrix";
import { Model } from "./drawable";

export class Transform {
    position = vec3.create();
    rotation = quat.create();
    scale = vec3.create();

    GetTranslationMatrix() {
        return mat4.fromTranslation(mat4.create(), this.position);
    }

    GetRotationMatrix() {
        return mat4.fromQuat(mat4.create(), this.rotation);
    }

    GetScaleMatrix() {
        return mat4.fromScaling(mat4.create(), this.scale);
    }

    GetTransformMatrix() {
        return mat4.fromRotationTranslationScale(mat4.create(), this.rotation, this.position, this.scale);
    }
};

export class Entity {
    name = "";
    transform: Transform | null = null;
    model: Model | null = null;
};