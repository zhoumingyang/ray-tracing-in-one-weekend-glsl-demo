import { vec3, vec4 } from './vec';

export class mat4 {
    public elements: number[];

    constructor() {
        this.elements = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    public identity(): mat4 {
        this.elements = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        return this;
    }

    public lookAt(eye: vec3, target: vec3, up: vec3): mat4 {
        let te: number[] = this.elements;
        let x = new vec3();
        let y = new vec3();
        let z = new vec3().subVecs(eye, target);
        if (z.lengthSq() === 0) {
            z.z = 1;
        }

        z.normalize();
        x.cross(up, z);

        if (x.lengthSq() === 0) {
            Math.abs(up.z) === 1 ? z.x += 0.0001 : z.z += 0.0001;
            z.normalize();
            x.cross(up, z);
        }

        x.normalize();
        y.cross(z, x);

        te[0] = x.x; te[4] = y.x; te[8] = z.x;
        te[1] = x.y; te[5] = y.y; te[9] = z.y;
        te[2] = x.z; te[6] = y.z; te[10] = z.z;
        return this;
    }

    public frsutum(left: number, right: number, bottom: number, top: number, near: number, far: number): mat4 {
        const te: number[] = this.elements;
        const x: number = 2 * near / (right - left);
        const y: number = 2 * near / (top - bottom);

        const a: number = (right + left) / (right - left);
        const b: number = (top + bottom) / (top - bottom);
        const c: number = - (far + near) / (far - near);
        const d: number = - 2 * far * near / (far - near);

        te[0] = x; te[4] = 0; te[8] = a; te[12] = 0;
        te[1] = 0; te[5] = y; te[9] = b; te[13] = 0;
        te[2] = 0; te[6] = 0; te[10] = c; te[14] = d;
        te[3] = 0; te[7] = 0; te[11] = - 1; te[15] = 0;

        return this;
    }

    public perspective(fovy: number, aspect: number, near: number = 0.1, far: number = 10000): mat4 {
        const ymax: number = near * Math.tan(fovy * Math.PI / 360.0);
        const ymin: number = -ymax;
        const xmin: number = ymin * aspect;
        const xmax: number = ymax * aspect;
        return this.frsutum(xmin, xmax, ymin, ymax, near, far);
    }

    public inverse(m: mat4): mat4 {
        const te: number[] = this.elements;
        const me: number[] = m.elements;

        let n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
            n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
            n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
            n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

            t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

        if (det === 0) {
            const msg: string = "THREE.Matrix4: .getInverse() can't invert matrix, determinant is 0";
            console.warn(msg);
            return this.identity();
        }

        let detInv = 1 / det;
        te[0] = t11 * detInv;
        te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

        te[4] = t12 * detInv;
        te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

        te[8] = t13 * detInv;
        te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

        te[12] = t14 * detInv;
        te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
        return this;
    }

    public multiplyVec4(v: vec4): vec4 {
        let x = v.x, y = v.y, z = v.z, w = v.w;
        let e: number[] = this.elements;
        const r = new vec4();
        r.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
        r.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
        r.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
        r.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
        return r;
    }
}