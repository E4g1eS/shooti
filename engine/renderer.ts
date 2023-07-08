import { mat4 } from "gl-matrix";
import { Entity } from "./entity.js";
import { World } from "./world.js";

export class Renderer {
    private _context!: GPUCanvasContext;

    private _adapter!: GPUAdapter;
    private _device!: GPUDevice;
    private _textureFormat!: GPUTextureFormat;
    private _encoder!: GPUCommandEncoder;

    private _defaultPipeline!: GPURenderPipeline;

    private constructor() { }

    static async Initialize(context: GPUCanvasContext) {
        const renderer = new Renderer();

        renderer._context = context;
        await renderer.InitWebGPU();

        return renderer;
    }

    private GetProjectionMatrix() {
        const canvas = this._context.canvas;
        return mat4.perspective(mat4.create(), 1.5, canvas.width/canvas.height, 0.1, 100);
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

        await this.InitPipeline();


    }

    /** Also loads shaders. */
    private async InitPipeline() {
        if (!this._device || !this._textureFormat)
            return;

        const defaultShader = await (await fetch("./shaders/default.wgsl")).text();

        const shaderModule = this._device.createShaderModule({
            label: "Default shader module",
            code: defaultShader,
        });

        // Pipeline of shaders - shader queue.
        this._defaultPipeline = this._device.createRenderPipeline({
            label: "Render pipeline",
            layout: "auto", // What types of input the pipeline needs

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
            },

            fragment: {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: [{ format: this._textureFormat }
                ]
            },
        });
    }

    private RenderEntity(entity: Entity, pass: GPURenderPassEncoder) {
        if (!entity.transform || !entity.model?.mesh)
            return;

        // TODO get into shader
        const modelMatrix = entity.transform.GetTransformMatrix();

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

    RenderFrame(world: World) {

        // TODO get into shader
        const viewMatrix = world.camera.GetViewMatrix();
        const projectionMatrix = this.GetProjectionMatrix();

        this._encoder = this._device.createCommandEncoder();
        const pass = this._encoder.beginRenderPass({
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

        pass.setPipeline(this._defaultPipeline);

        for (const entity of world.entities) {
            this.RenderEntity(entity, pass);
        }

        pass.end();
        const commandBuffer = this._encoder.finish();
        this._device.queue.submit([commandBuffer]);
    }
};