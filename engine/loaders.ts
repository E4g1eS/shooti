import { Mesh } from "./drawable.js";

export class ObjLoader {
    LoadCube() {
        const vertices = new Float32Array([
            -1, -1, -1, // 0
            -1, -1, 1, // 1
            -1, 1, -1, // 2
            -1, 1, 1, // 3
            1, -1, -1, // 4
            1, -1, 1, // 5
            1, 1, -1, // 6
            1, 1, 1, // 7
        ]);

        /** (X - right, Y - up, Z - away), clockwise triangles */
        const indices = new Uint32Array([
            // front
            0, 2, 6,
            0, 6, 4,
            // left
            1, 3, 2,
            1, 2, 0,
            // back
            5, 7, 3,
            5, 3, 1,
            // right
            4, 6, 7,
            4, 7, 5,
            // top
            2, 3, 7,
            2, 7, 6,
            // bottom
            1, 0, 4,
            1, 4, 5,
        ]);

        return new Mesh(vertices, indices);
    }
};

export class TextureLoader { };