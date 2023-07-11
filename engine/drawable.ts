interface Drawable {};

export class Model {
    mesh?: Mesh;
    texture?: Texture;
};

export class Mesh {
    readonly vertices;
    readonly indices;
    readonly normals?;
    readonly textureCoords?;

    constructor(vertices: Float32Array, indices: Uint32Array, normals?: Float32Array, textureCoords?: Float32Array) {
        this.vertices = vertices;
        this.indices = indices;
        this.normals = normals;
        this.textureCoords = textureCoords;
    }
};

class Texture {};