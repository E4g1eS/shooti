import { vec3, mat4 } from "gl-matrix";
import { Model } from "./drawable";

export class Transform {
    position = vec3.create();
    rotation = vec3.create();
    scale = vec3.create();

    GetTranslationMatrix() {

    }

    GetRotationMatrix() {

    }

    GetScaleMatrix() {

    }

    GetTransformMatrix() {

    }
};

export class Entity {
    name = "";
    transform: Transform | null = null;
    model: Model | null = null;
};