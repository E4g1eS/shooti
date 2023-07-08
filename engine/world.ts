import { Entity } from "./entity.js";
import { Camera } from "./camera.js";

export class World {
    entities = new Array<Entity>();
    camera = new Camera();
};