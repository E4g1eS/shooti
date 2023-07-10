@group(0) @binding(0) var<uniform> projectionMatrix: mat4x4f;
@group(0) @binding(1) var<uniform> viewMatrix: mat4x4f;
@group(0) @binding(2) var<uniform> modelMatrix: mat4x4f;

@vertex
fn vertexMain(@location(0) pos: vec3f) -> @builtin(position) vec4f {
    //return vec4f(pos.x +1 , pos.y + 1, pos.z + 1.2, 1);
    //return projectionMatrix * viewMatrix * modelMatrix * vec4f(pos.x, pos.y, pos.z, 1);

    if (modelMatrix[3][0] == 0) {
        return vec4f(0, 0, 0, 1);
    }

    return viewMatrix * modelMatrix * vec4f(pos.x, pos.y, pos.z, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1);
}