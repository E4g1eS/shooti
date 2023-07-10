@vertex
fn vertexMain(@location(0) pos: vec3f) -> @builtin(position) vec4f {
    //return vec4f(pos.x +1 , pos.y + 1, pos.z + 1.2, 1);
    return vec4f(pos.x, pos.y, pos.z, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1);
}