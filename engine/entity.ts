import { vec3 } from "gl-matrix";
import { Model } from "./drawable";

export class Transform {
    position = vec3.create();
    rotation = vec3.create();
    scale = vec3.create();
};

export class Entity {
    name = "";
    transform: Transform | null = null;
    model: Model | null = null;
};