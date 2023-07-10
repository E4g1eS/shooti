import { vec2 } from "wgpu-matrix";

export class Input {
    /** Stores keyCode -> time of press. */
    private _currentlyPressed = new Map<string, number>();
    /** Stores keyCode -> sum of length of press. */
    private _memory = new Map<string, number>();
    /** Stores mouse movement */
    private _mouseMovement = vec2.create();

    constructor(canvas: HTMLCanvasElement) {

        // Canvas is focusable.
        canvas.tabIndex = 0;

        canvas.addEventListener("keydown", event => {
            if (event.code === "Tab")
                return;

            event.preventDefault();
            this.PressedKey(event.code, performance.now())
        });

        canvas.addEventListener("keyup", (event) => {
            if (event.code === "Tab")
                return;

            event.preventDefault();
            this.ReleasedKey(event.code, performance.now());
        });

        document.addEventListener("mousemove", (event) => {
            this._mouseMovement[0] += event.movementX;
            this._mouseMovement[1] += event.movementY;
        });
    }

    GetMouseMovement(reset: boolean = true) {
        const movement = this._mouseMovement;

        if (reset)
            this._mouseMovement = vec2.create();

        return movement;
    }

    GetKeyTime(keyCode: string, reset: boolean = true) {
        let pressTime = 0;

        const currentlyPressed = this._currentlyPressed.get(keyCode);
        if (currentlyPressed) {
            const now = performance.now();
            pressTime += now - currentlyPressed;
            
            if (reset)
                this._currentlyPressed.set(keyCode, now);
        }

        const value = this._memory.get(keyCode);
        if (!value)
            return pressTime;

        pressTime += value;

        if (reset)
            this._memory.delete(keyCode);
        
        return pressTime;
    }

    private PressedKey(code: string, timestamp: number) {
        this._currentlyPressed.set(code, timestamp);
    }

    private ReleasedKey(code: string, timestamp: number) {
        const pressedAt = this._currentlyPressed.get(code);

        if (!pressedAt)
            return false;

        let sum = this._memory.get(code);

        if (!sum)
            sum = 0;

        sum += timestamp - pressedAt;
        this._memory.set(code, sum);
        return true;
    }
}