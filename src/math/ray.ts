import { vec3 } from './vec';

export class Ray {
    public origin: vec3;
    public dir: vec3;
    constructor(origin: vec3, dir: vec3) {
        this.origin = origin;
        this.dir = dir;
    }

    public at(t: number): vec3 {
        const tmpOrigin: vec3 = new vec3(this.origin.x, this.origin.y, this.origin.z);
        const tmpDir: vec3 = new vec3(this.dir.x, this.dir.y, this.dir.z);
        return tmpOrigin.add(tmpDir.multiplyScalar(t));
    }

    public hitSphere(sphere: any): vec3 {
        const v1: vec3 = new vec3().subVecs(sphere.center, this.origin);
        var tca = v1.dot(this.dir);
        var d2 = v1.dot(v1) - tca * tca;
        var radius2 = sphere.radius * sphere.radius;

        if (d2 > radius2) return null;

        var thc = Math.sqrt(radius2 - d2);
        var t0 = tca - thc;
        var t1 = tca + thc;

        if (t0 < 0 && t1 < 0) return null;
        if (t0 < 0) return this.at(t1);

        return this.at(t0);
    }
}