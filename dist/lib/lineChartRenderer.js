import { vec2, vec3, mat4 } from 'gl-matrix';
import { LinkedWebGLProgram, throwIfFalsy } from './webGLUtils';
import { resolveColorRGBA } from './options';
const vsSource = `#version 300 es
layout (location = ${0 /* DATA_POINT */}) in vec2 aDataPoint;
layout (location = ${1 /* DIR */}) in vec2 aDir;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uLineWidth;

void main() {
    vec4 cssPose = uModelViewMatrix * vec4(aDataPoint, 0.0, 1.0);
    vec4 dir = uModelViewMatrix * vec4(aDir, 0.0, 0.0);
    dir = normalize(dir);
    gl_Position = uProjectionMatrix * (cssPose + vec4(-dir.y, dir.x, 0.0, 0.0) * uLineWidth);
}
`;
const fsSource = `#version 300 es
precision lowp float;

uniform vec4 uColor;

out vec4 outColor;

void main() {
    outColor = uColor;
}
`;
class LineChartWebGLProgram extends LinkedWebGLProgram {
    constructor(gl) {
        super(gl, vsSource, fsSource);
        this.locations = {
            uModelViewMatrix: throwIfFalsy(gl.getUniformLocation(this.program, 'uModelViewMatrix')),
            uProjectionMatrix: throwIfFalsy(gl.getUniformLocation(this.program, 'uProjectionMatrix')),
            uLineWidth: throwIfFalsy(gl.getUniformLocation(this.program, 'uLineWidth')),
            uColor: throwIfFalsy(gl.getUniformLocation(this.program, 'uColor')),
        };
    }
}
const INDEX_PER_POINT = 4;
const POINT_PER_DATAPOINT = 4;
const INDEX_PER_DATAPOINT = INDEX_PER_POINT * POINT_PER_DATAPOINT;
const BYTES_PER_POINT = INDEX_PER_POINT * Float32Array.BYTES_PER_ELEMENT;
const BUFFER_DATA_POINT_CAPACITY = 128 * 1024;
const BUFFER_CAPACITY = BUFFER_DATA_POINT_CAPACITY * INDEX_PER_DATAPOINT + 2 * POINT_PER_DATAPOINT;
class VertexArray {
    constructor(gl) {
        this.gl = gl;
        this.length = 0;
        this.vao = throwIfFalsy(gl.createVertexArray());
        this.bind();
        this.dataBuffer = throwIfFalsy(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, BUFFER_CAPACITY * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(0 /* DATA_POINT */);
        gl.vertexAttribPointer(0 /* DATA_POINT */, 2, gl.FLOAT, false, BYTES_PER_POINT, 0);
        gl.enableVertexAttribArray(1 /* DIR */);
        gl.vertexAttribPointer(1 /* DIR */, 2, gl.FLOAT, false, BYTES_PER_POINT, 2 * Float32Array.BYTES_PER_ELEMENT);
    }
    bind() {
        this.gl.bindVertexArray(this.vao);
    }
    clear() {
        this.length = 0;
    }
    delete() {
        this.clear();
        this.gl.deleteBuffer(this.dataBuffer);
        this.gl.deleteVertexArray(this.vao);
    }
    /**
     * @param start At least 1, since datapoint 0 has no path to draw.
     * @returns Next data point index, or `dataPoints.length` if all data added.
     */
    addDataPoints(dataPoints, start) {
        const remainDPCapacity = BUFFER_DATA_POINT_CAPACITY - this.length;
        const remainDPCount = dataPoints.length - start;
        const isOverflow = remainDPCapacity < remainDPCount;
        const numDPtoAdd = isOverflow ? remainDPCapacity : remainDPCount;
        let extraBufferLength = INDEX_PER_DATAPOINT * numDPtoAdd;
        if (isOverflow) {
            extraBufferLength += 2 * INDEX_PER_POINT;
        }
        const buffer = new Float32Array(extraBufferLength);
        let bi = 0;
        const vDP = vec2.create();
        const vPreviousDP = vec2.create();
        const dir1 = vec2.create();
        const dir2 = vec2.create();
        function calc(dp, previousDP) {
            vDP[0] = dp.x;
            vDP[1] = dp.y;
            vPreviousDP[0] = previousDP.x;
            vPreviousDP[1] = previousDP.y;
            vec2.subtract(dir1, vDP, vPreviousDP);
            vec2.normalize(dir1, dir1);
            vec2.negate(dir2, dir1);
        }
        function put(v) {
            buffer[bi] = v[0];
            buffer[bi + 1] = v[1];
            bi += 2;
        }
        let previousDP = dataPoints[start - 1];
        for (let i = 0; i < numDPtoAdd; i++) {
            const dp = dataPoints[start + i];
            calc(dp, previousDP);
            previousDP = dp;
            for (const dp of [vPreviousDP, vDP]) {
                for (const dir of [dir1, dir2]) {
                    put(dp);
                    put(dir);
                }
            }
        }
        if (isOverflow) {
            calc(dataPoints[start + numDPtoAdd], previousDP);
            for (const dir of [dir1, dir2]) {
                put(vPreviousDP);
                put(dir);
            }
        }
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, BYTES_PER_POINT * POINT_PER_DATAPOINT * this.length, buffer);
        this.length += numDPtoAdd;
        return start + numDPtoAdd;
    }
    draw() {
        const gl = this.gl;
        this.bind();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.length * POINT_PER_DATAPOINT);
    }
}
class SeriesVertexArray {
    constructor(gl, series) {
        this.gl = gl;
        this.series = series;
        this.vertexArrays = [];
    }
    syncBuffer() {
        let activeArray;
        let bufferedDataPointNum = 1;
        const newArray = () => {
            activeArray = new VertexArray(this.gl);
            this.vertexArrays.push({
                array: activeArray,
                firstDataPointIndex: bufferedDataPointNum,
            });
        };
        if (this.vertexArrays.length > 0) {
            const lastVertexArray = this.vertexArrays[this.vertexArrays.length - 1];
            bufferedDataPointNum = lastVertexArray.firstDataPointIndex + lastVertexArray.array.length;
            if (bufferedDataPointNum > this.series.data.length) {
                throw new Error('remove data unsupported.');
            }
            if (bufferedDataPointNum === this.series.data.length) {
                return;
            }
            activeArray = lastVertexArray.array;
        }
        else if (this.series.data.length >= 2) {
            newArray();
            activeArray = activeArray;
        }
        else {
            return; // Not enough data
        }
        while (true) {
            bufferedDataPointNum = activeArray.addDataPoints(this.series.data, bufferedDataPointNum);
            if (bufferedDataPointNum >= this.series.data.length) {
                if (bufferedDataPointNum > this.series.data.length) {
                    throw Error('Assertion failed.');
                }
                break;
            }
            newArray();
        }
    }
    draw() {
        for (const a of this.vertexArrays) {
            a.array.draw();
        }
    }
}
export class LineChartRenderer {
    constructor(model, gl, options) {
        this.model = model;
        this.gl = gl;
        this.options = options;
        this.program = new LineChartWebGLProgram(this.gl);
        this.arrays = new Map();
        this.height = 0;
        model.onUpdate(() => this.drawFrame());
        this.program.use();
    }
    syncBuffer() {
        for (const s of this.options.series) {
            let a = this.arrays.get(s);
            if (!a) {
                a = new SeriesVertexArray(this.gl, s);
                this.arrays.set(s, a);
            }
            a.syncBuffer();
        }
    }
    onResize(width, height) {
        this.height = height;
        const scale = vec2.fromValues(width, height);
        vec2.divide(scale, scale, [2, 2]);
        vec2.inverse(scale, scale);
        const translate = mat4.create();
        mat4.fromTranslation(translate, [-1.0, -1.0, 0.0]);
        const projectionMatrix = mat4.create();
        mat4.fromScaling(projectionMatrix, [...scale, 1.0]);
        mat4.multiply(projectionMatrix, translate, projectionMatrix);
        const gl = this.gl;
        gl.uniformMatrix4fv(this.program.locations.uProjectionMatrix, false, projectionMatrix);
    }
    drawFrame() {
        var _a;
        this.syncBuffer();
        this.syncDomain();
        const gl = this.gl;
        for (const [ds, arr] of this.arrays) {
            const color = resolveColorRGBA(ds.color);
            gl.uniform4fv(this.program.locations.uColor, color);
            const lineWidth = (_a = ds.lineWidth, (_a !== null && _a !== void 0 ? _a : this.options.lineWidth));
            gl.uniform1f(this.program.locations.uLineWidth, lineWidth / 2);
            arr.draw();
        }
    }
    ySvgToCanvas(v) {
        return -v + this.height;
    }
    syncDomain() {
        const m = this.model;
        const gl = this.gl;
        const baseTime = this.options.baseTime;
        const zero = [m.xScale(baseTime), this.ySvgToCanvas(m.yScale(0)), 0];
        const one = [m.xScale(baseTime + 1), this.ySvgToCanvas(m.yScale(1)), 0];
        const modelViewMatrix = mat4.create();
        const scaling = vec3.create();
        vec3.subtract(scaling, one, zero);
        mat4.fromScaling(modelViewMatrix, scaling);
        const translateMat = mat4.create();
        mat4.fromTranslation(translateMat, zero);
        mat4.multiply(modelViewMatrix, translateMat, modelViewMatrix);
        gl.uniformMatrix4fv(this.program.locations.uModelViewMatrix, false, modelViewMatrix);
    }
}
//# sourceMappingURL=lineChartRenderer.js.map