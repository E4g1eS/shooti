import { Mesh, Model } from "./drawable.js";

export class SimpleLoader {
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

    /** Triangle with 3D leg facing +Z, point is up +Y. */
    LoadCone() {
        const vertices = new Float32Array([
            -1, 0, -1, // 0 left, close
            0, 1, -1, // 1 top, close
            1, 0, -1, // 2 right, close
            0, 0, 1, // 3 away
        ]);

        const indices = new Uint32Array([
            // front
            0, 1, 2,
            // left
            3, 1, 0,
            // right
            2, 1, 3,
            // bottom
            0, 2, 3,
        ]);


        return new Mesh(vertices, indices);
    }
}

export class InvalidObjFile extends Error {
    constructor() {
        super("Obj file is invalid!");
    }
}

class ObjFile {
    vertices = new Array<number>();
    textureCoords = new Array<number>();
    normals = new Array<number>();
    indices = new Array<Array<number>>();

    /** Start offset is multiplied by count. */
    private PushNumbers(from: number[], to: number[], startOffset: number, count: number) {
        for (let i = 0; i < count; i++) {
            to.push(from[startOffset * count + i])
        }
    }

    ContructModel() {
        const result = new Model();

        if (this.indices.length % 3 !== 0)
            throw new InvalidObjFile();

        const alreadyDone = new Map<string, number>();

        const newVertices = new Array<number>();
        const newTextureCoords = new Array<number>();
        const newNormals = new Array<number>();
        const newIndices = new Array<number>();

        for (const indice of this.indices) {
            const isDone = alreadyDone.get(indice.toString());

            if (isDone) {
                newIndices.push(isDone);
                continue;
            }

            this.PushNumbers(this.vertices, newVertices, indice[0], 3);

            if (this.textureCoords.length !== 0)
                this.PushNumbers(this.textureCoords, newTextureCoords, indice[1], 2);

            if (this.normals.length !== 0)
                this.PushNumbers(this.normals, newNormals, indice[2], 3);

            const lastVertexIndex = (newVertices.length / 3) - 1
            newIndices.push(lastVertexIndex);
            alreadyDone.set(indice.toString(), lastVertexIndex);
        }

        result.mesh = new Mesh(
            new Float32Array(newVertices),
            new Uint32Array(newIndices),
            newNormals.length > 0 ? new Float32Array(newNormals) : undefined,
            newTextureCoords.length > 0 ? new Float32Array(newTextureCoords) : undefined
        );

        return result;
    }
}

enum NumberType {
    Float,
    Int,
}

export class ObjLoader {
    private SplitLine(line: string, ignoreFirst = true, max?: number) {
        let split = line.split(/\s+/, max);

        if (ignoreFirst && split.length > 0)
            split = split.slice(1);

        return split;
    }

    private LineType(line: string) {
        const tokens = this.SplitLine(line, false, 1);
        if (tokens.length === 0 || tokens[0] === "")
            return ""

        return tokens[0];
    }

    private AddNumbers(line: string, arr: number[], type: NumberType = NumberType.Float) {
        const tokens = this.SplitLine(line);

        for (const token of tokens) {
            let num: number = 0;

            switch (type) {
                case NumberType.Float:
                    num = parseFloat(token);
                    break;

                case NumberType.Int:
                    num = parseInt(token);
                    break;
            }

            if (isNaN(num))
                throw new InvalidObjFile();

            arr.push(num);
        }
    }

    private AddIndices(line: string, indices: number[][]) {
        const groups = this.SplitLine(line);

        for (const group of groups) {
            const numStrings = group.split("/");

            const lastIndex = indices.push(new Array<number>()) - 1;

            if (numStrings.length < 1 || numStrings.length > 3)
                throw new InvalidObjFile();

            for (const numString of numStrings) {

                if (numString === "") {
                    indices[lastIndex].push(0);
                    continue;
                }

                const num = parseInt(numString);

                if (isNaN(num))
                    throw new InvalidObjFile();

                indices[lastIndex].push(num - 1);
            }
        }
    }

    /** Loads from ../content/ */
    async Load(fileName: string) {
        const fileText = await (await fetch("../content/" + fileName)).text();

        const objFile = new ObjFile();

        for (const line of fileText.split("\n")) {
            const type = this.LineType(line)
            switch (this.LineType(line)) {
                case "v":
                    this.AddNumbers(line, objFile.vertices);
                    break;

                case "vn":
                    this.AddNumbers(line, objFile.normals);
                    break;

                case "vt":
                    this.AddNumbers(line, objFile.textureCoords);
                    break;

                case "f":
                    this.AddIndices(line, objFile.indices);

                case "#":
                case "":
                    continue;

                default:
                    console.log(`"${type}" is unknown token type in obj file "${fileName}".`);
                    break;
            }
        }

        return objFile.ContructModel();
    }
};