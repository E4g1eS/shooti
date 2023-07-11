import { mat4 } from "wgpu-matrix";

import { Entity } from "./entity.js";
import { World } from "./world.js";

const FOV = 1.5;
const MAT4_SIZE = 4 * 4 * 32;

function GetProjectionMatrix(canvas: HTMLCanvasElement | OffscreenCanvas) {
    return mat4.perspective(FOV, canvas.width / canvas.height, 0.1, 100);
}

interface Pipeline {
    Render(pass: GPURenderPassEncoder, world: World, entities: Entity[]): void;
}

class DefaultPipeline implements Pipeline {

    private _context: GPUCanvasContext;
    private _device: GPUDevice;
    private _gpuPipeline!: GPURenderPipeline;

    private _matrixUniformsBindGroupLayout: GPUBindGroupLayout;

    private _projectionBuffer: GPUBuffer;
    private _viewBuffer: GPUBuffer;
    private _modelBuffer: GPUBuffer;

    private constructor(context: GPUCanvasContext, device: GPUDevice, textureFormat: GPUTextureFormat, shaderText: string) {
        this._context = context;
        this._device = device;

        const shaderModule = this._device.createShaderModule({
            label: "Default shader module",
            code: shaderText,
        });

        this._matrixUniformsBindGroupLayout = this._device.createBindGroupLayout({
            label: "Bind group layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "uniform"
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "uniform"
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "uniform"
                    }
                },
            ]
        });

        const pipelineLayout = this._device.createPipelineLayout({
            bindGroupLayouts: [
                this._matrixUniformsBindGroupLayout, // @group(0)
            ]
        });

        this._gpuPipeline = this._device.createRenderPipeline({
            label: "Render pipeline",
            layout: pipelineLayout, // What types of input the pipeline needs

            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: [{
                    arrayStride: 12, // How many bytes is one element (two times 32 bits = 2x4 bytes)
                    attributes: [ // Can be more types in sequence
                        { // This is type for vertex data
                            format: "float32x3", // One vertex is two times 32 bits float
                            offset: 0, // How far is this type from beginning of element
                            shaderLocation: 0, // To what input does this get fed in the *vertex shader*
                        }]
                }],
            },

            primitive: {
                frontFace: "cw",
                topology: "triangle-list",
                cullMode: "back",
            },

            fragment: {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: [{ format: textureFormat }
                ]
            },
        });

        this._projectionBuffer = this._device.createBuffer({
            label: "Projection matrix buffer",
            size: MAT4_SIZE,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this._viewBuffer = this._device.createBuffer({
            label: "View matrix buffer",
            size: MAT4_SIZE,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this._modelBuffer = this._device.createBuffer({
            label: "Model matrix buffer",
            size: MAT4_SIZE,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    static async Create(context: GPUCanvasContext, device: GPUDevice, textureFormat: GPUTextureFormat) {
        const shaderText = await (await fetch("./shaders/default.wgsl")).text();
        return new DefaultPipeline(context, device, textureFormat, shaderText);
    }

    private RenderEntity(entity: Entity, pass: GPURenderPassEncoder) {
        if (!entity.transform || !entity.model?.mesh)
            return;

        const modelMatrix = entity.transform.GetModelMatrix();
        this._device.queue.writeBuffer(this._modelBuffer, 0, modelMatrix);

        const matrixUniformsBindGroup = this._device.createBindGroup({
            layout: this._matrixUniformsBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this._projectionBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: this._viewBuffer }
                },
                {
                    binding: 2,
                    resource: { buffer: this._modelBuffer }
                }
            ]
        });

        pass.setBindGroup(0, matrixUniformsBindGroup);

        const vertexBuffer = this._device.createBuffer({
            label: entity.name,
            size: entity.model.mesh.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this._device.queue.writeBuffer(vertexBuffer, 0, entity.model.mesh.vertices);
        pass.setVertexBuffer(0, vertexBuffer);

        const indexBuffer = this._device.createBuffer({
            label: entity.name,
            size: entity.model.mesh.indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });

        this._device.queue.writeBuffer(indexBuffer, 0, entity.model.mesh.indices);
        pass.setIndexBuffer(indexBuffer, "uint32");
        pass.drawIndexed(entity.model.mesh.indices.length);
    }

    Render(pass: GPURenderPassEncoder, world: World, entities: Entity[]) {
        const projectionMatrix = GetProjectionMatrix(this._context.canvas);
        this._device.queue.writeBuffer(this._projectionBuffer, 0, projectionMatrix);

        const viewMatrix = world.camera.GetViewMatrix();
        this._device.queue.writeBuffer(this._viewBuffer, 0, viewMatrix);

        pass.setPipeline(this._gpuPipeline);

        for (const entity of entities) {
            this.RenderEntity(entity, pass);
        }
    }
}

export class Renderer {
    private _context!: GPUCanvasContext;

    private _adapter!: GPUAdapter;
    private _device!: GPUDevice;
    private _textureFormat!: GPUTextureFormat;
    private _encoder!: GPUCommandEncoder;

    private _pipeline!: Pipeline;

    private _defaultPipeline!: GPURenderPipeline;

    private _bindGroupLayout!: GPUBindGroupLayout;

    private constructor() { }

    static async Initialize(context: GPUCanvasContext) {
        const renderer = new Renderer();

        renderer._context = context;
        await renderer.InitWebGPU();

        return renderer;
    }

    private async InitWebGPU() {
        // Check if WebGPU is available.
        if (!navigator.gpu)
            throw new Error("WebGPU not available!");

        // Get WebGPU adapter - like the GPU hardware.
        const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
        if (!adapter)
            throw new Error("No adapter available!");

        this._adapter = adapter;

        // Get WebGPU adapters device - software implementation.
        this._device = await adapter.requestDevice();

        // Get preferred *texture* format -> for optimalization for different GPUs.
        this._textureFormat = navigator.gpu.getPreferredCanvasFormat();
        this._context.configure({
            device: this._device,
            format: this._textureFormat,
        });

        this._pipeline = await DefaultPipeline.Create(this._context, this._device, this._textureFormat);
    }

    RenderFrame(world: World) {
        const encoder = this._device.createCommandEncoder({});
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this._context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: {
                    r: 0.3,
                    g: 0.3,
                    b: 0.3,
                    a: 1,
                },
                storeOp: "store",
            }],
        });

        this._pipeline.Render(pass, world, world.entities);

        pass.end();
        const commandBuffer = encoder.finish();
        this._device.queue.submit([commandBuffer]);
    }
};