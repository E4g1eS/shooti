interface Drawable {};

export class Model {
    mesh?: Mesh;
    texture?: Texture;
};

export class Mesh {
    readonly vertices;
    readonly indices;

    constructor(vertices: Float32Array, indices: Uint32Array) {
        this.vertices = vertices;
        this.indices = indices;
    }
};

class Texture {};