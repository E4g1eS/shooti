import { Mesh } from "./drawable.js";

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

class InvalidObjFile extends Error {
    constructor() {
        super("Obj file is invalid!");
    }
}

class ObjFileData {
    vertices = new Array<number>();
    normals = new Array<number>();
    textureCoords = new Array<number>();
    indices = new Array<Array<number>>();
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

            if (numStrings.length !== 3)
                return new InvalidObjFile();

            const lastIndex = indices.push(new Array<number>()) - 1;

            for (const numString of numStrings) {

                if (numString === "") {
                    indices[lastIndex].push(0);
                    continue;
                }

                const num = parseInt(numString);

                if (isNaN(num))
                    throw new InvalidObjFile();

                indices[lastIndex].push(num);
            }
        }
    }

    /** Loads from ../content/ */
    async Load(fileName: string) {
        const fileText = await (await fetch("../content/" + fileName)).text();

        const objFileData = new ObjFileData();

        for (const line of fileText.split("\n")) {
            const type = this.LineType(line)
            switch (this.LineType(line)) {
                case "v":
                    this.AddNumbers(line, objFileData.vertices);
                    break;

                case "vn":
                    this.AddNumbers(line, objFileData.normals);
                    break;

                case "vt":
                    this.AddNumbers(line, objFileData.textureCoords);
                    break;

                case "f":
                    this.AddIndices(line, objFileData.indices);

                case "#":
                case "":
                    continue;

                default:
                    console.log(`"${type}" is unknown token type in obj file "${fileName}".`);
                    break;
            }
        }

        console.log(objFileData);

        const verticesArray = new Float32Array(0);
        const indicesArray = new Uint32Array(0);

        return new Mesh(verticesArray, indicesArray);
    }
};