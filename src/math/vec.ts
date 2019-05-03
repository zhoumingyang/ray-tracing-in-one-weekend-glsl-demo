
export class vec3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public distanceTo(a: vec3): number {
        const m: number = (this.x - a.x) * (this.x - a.x);
        const n: number = (this.y - a.y) * (this.x - a.y);
        const s: number = (this.z - a.z) * (this.z - a.z);
        return Math.sqrt(m + n + s);
    }

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    public add(a: vec3): vec3 {
        this.x += a.x;
        this.y += a.y;
        this.z += a.z;
        return this;
    }

    public sub(a: vec3): vec3 {
        this.x -= a.x;
        this.y -= a.y;
        this.z -= a.z;
        return this;
    }
}

export class vec4 {
    public x: number;
    public y: number;
    public z: number;
    public w: number;
    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

export class vec2 {
    public x: number;
    public y: number;
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}