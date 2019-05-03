
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

    public lengthSq(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
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

    public dot(a: vec3): number {
        return this.x * a.x + this.y * a.y + this.z * a.z;
    }

    public subVecs(a: vec3, b: vec3): vec3 {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }

    public multiplyScalar(scalar: number): vec3 {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    public divideScalar(scalar: number): vec3 {
        return this.multiplyScalar(1 / scalar);
    }

    public normalize(): vec3 {
        return this.divideScalar(this.length() || 1);
    }

    public cross(a: vec3, b: vec3): vec3 {
        let ax = a.x, ay = a.y, az = a.z;
        let bx = b.x, by = b.y, bz = b.z;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
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

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    public multiplyScalar(scalar: number): vec4 {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.w *= scalar
        return this;
    }

    public divideScalar(scalar: number): vec4 {
        return this.multiplyScalar(1 / scalar);
    }

    public normalize(): vec4 {
        return this.divideScalar(this.length() || 1);
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