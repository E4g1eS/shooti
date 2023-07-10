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
            this.PressedKey(event.code)
        });

        canvas.addEventListener("keyup", (event) => {
            if (event.code === "Tab")
                return;

            event.preventDefault();
            this.ReleasedKey(event.code);
        });

        document.addEventListener("mousemove", (event) => {
            this._mouseMovement[0] += event.movementX;
            this._mouseMovement[1] += event.movementY;
        });
    }

    GetMouseMovement() {
        const movement = vec2.copy(this._mouseMovement);
        
        this._mouseMovement = vec2.create();

        return movement;
    }

    GetKeyTime(keyCode: string) {
        let pressTime = 0;

        const currentlyPressed = this._currentlyPressed.get(keyCode);
        if (currentlyPressed) {
            const now = performance.now();
            pressTime += now - currentlyPressed;
            
            this._currentlyPressed.set(keyCode, now);
        }

        const value = this._memory.get(keyCode);
        if (!value)
            return pressTime;

        pressTime += value;
        
        this._memory.delete(keyCode);
        
        return pressTime;
    }

    private PressedKey(keyCode: string) {
        this._currentlyPressed.set(keyCode, performance.now());
    }

    private ReleasedKey(keyCode: string) {
        const pressedAt = this._currentlyPressed.get(keyCode);

        if (!pressedAt)
            return false;

        this._currentlyPressed.delete(keyCode);

        let sum = this._memory.get(keyCode);
        if (!sum)
            sum = 0;

        sum += performance.now() - pressedAt;
        this._memory.set(keyCode, sum);

        return true;
    }
}