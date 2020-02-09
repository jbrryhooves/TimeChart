import { rgb } from 'd3-color';
import { scaleLinear, scaleTime } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';

/** lower bound */
function domainSearch(data, start, end, value, key) {
    if (start >= end) {
        return start;
    }
    if (value <= key(data[start])) {
        return start;
    }
    if (value > key(data[end - 1])) {
        return end;
    }
    end -= 1;
    while (start + 1 < end) {
        const minDomain = key(data[start]);
        const maxDomain = key(data[end]);
        const ratio = maxDomain <= minDomain ? 0 : (value - minDomain) / (maxDomain - minDomain);
        let expectedIndex = Math.ceil(start + ratio * (end - start));
        if (expectedIndex === end)
            expectedIndex--;
        else if (expectedIndex === start)
            expectedIndex++;
        const domain = key(data[expectedIndex]);
        if (domain < value) {
            start = expectedIndex;
        }
        else {
            end = expectedIndex;
        }
    }
    return end;
}
class EventDispatcher {
    constructor() {
        this.callbacks = [];
    }
    on(callback) {
        this.callbacks.push(callback);
    }
    dispatch(...args) {
        for (const cb of this.callbacks) {
            cb(...args);
        }
    }
}

function maxMin(arr) {
    let max = -Infinity;
    let min = Infinity;
    for (const v of arr) {
        if (v > max)
            max = v;
        if (v < min)
            min = v;
    }
    return { max, min };
}
class RenderModel {
    constructor(options) {
        this.options = options;
        this.xScale = scaleLinear();
        this.yScale = scaleLinear();
        this.xRange = null;
        this.yRange = null;
        this.seriesInfo = new Map();
        this.updated = new EventDispatcher();
        this.redrawRequested = false;
        if (options.xRange !== 'auto' && options.xRange) {
            this.xScale.domain([options.xRange.min, options.xRange.max]);
        }
        if (options.yRange !== 'auto' && options.yRange) {
            this.yScale.domain([options.yRange.min, options.yRange.max]);
        }
    }
    resize(width, height) {
        const op = this.options;
        this.xScale.range([op.paddingLeft, width - op.paddingRight]);
        this.yScale.range([height - op.paddingBottom, op.paddingTop]);
    }
    update() {
        var _a, _b;
        for (const s of this.options.series) {
            if (!this.seriesInfo.has(s)) {
                this.seriesInfo.set(s, {
                    yRangeUpdatedIndex: 0,
                });
            }
        }
        const series = this.options.series.filter(s => s.data.length > 0);
        if (series.length === 0) {
            return;
        }
        const opXRange = this.options.xRange;
        const opYRange = this.options.yRange;
        {
            const maxDomain = Math.max(...series.map(s => s.data[s.data.length - 1].x));
            const minDomain = (_b = (_a = this.xRange) === null || _a === void 0 ? void 0 : _a.min, (_b !== null && _b !== void 0 ? _b : Math.min(...series.map(s => s.data[0].x))));
            this.xRange = { max: maxDomain, min: minDomain };
            if (this.options.realTime || opXRange === 'auto') {
                if (this.options.realTime) {
                    const currentDomain = this.xScale.domain();
                    const range = currentDomain[1] - currentDomain[0];
                    this.xScale.domain([maxDomain - range, maxDomain]);
                }
                else { // Auto
                    this.xScale.domain([minDomain, maxDomain]);
                }
            }
            else if (opXRange) {
                this.xScale.domain([opXRange.min, opXRange.max]);
            }
        }
        {
            const maxMinY = series.map(s => {
                const newY = s.data.slice(this.seriesInfo.get(s).yRangeUpdatedIndex).map(d => d.y);
                return maxMin(newY);
            });
            if (this.yRange) {
                maxMinY.push(this.yRange);
            }
            const minDomain = Math.min(...maxMinY.map(s => s.min));
            const maxDomain = Math.max(...maxMinY.map(s => s.max));
            this.yRange = { max: maxDomain, min: minDomain };
            if (opYRange === 'auto') {
                this.yScale.domain([minDomain, maxDomain]).nice();
                for (const s of series) {
                    this.seriesInfo.get(s).yRangeUpdatedIndex = s.data.length;
                }
            }
            else if (opYRange) {
                this.yScale.domain([opYRange.min, opYRange.max]);
            }
        }
        this.updated.dispatch();
    }
    requestRedraw() {
        if (this.redrawRequested) {
            return;
        }
        this.redrawRequested = true;
        requestAnimationFrame((time) => {
            this.redrawRequested = false;
            this.update();
        });
    }
}

/**
 * Common utilities
 * @module glMatrix
 */
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */

function create() {
  var out = new ARRAY_TYPE(2);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */

function fromValues(x, y) {
  var out = new ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */

function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */

function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */

function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
}
/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */

function normalize(out, a) {
  var x = a[0],
      y = a[1];
  var len = x * x + y * y;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
}();

class LinkedWebGLProgram {
    constructor(gl, vertexSource, fragmentSource, debug) {
        var _a;
        this.gl = gl;
        const program = throwIfFalsy(gl.createProgram());
        gl.attachShader(program, throwIfFalsy(createShader(gl, gl.VERTEX_SHADER, vertexSource, debug)));
        gl.attachShader(program, throwIfFalsy(createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, debug)));
        gl.linkProgram(program);
        if (debug) {
            const success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (!success) {
                const message = (_a = gl.getProgramInfoLog(program), (_a !== null && _a !== void 0 ? _a : 'Unknown Error.'));
                gl.deleteProgram(program);
                throw new Error(message);
            }
        }
        this.program = program;
    }
    use() {
        this.gl.useProgram(this.program);
    }
}
function createShader(gl, type, source, debug) {
    var _a;
    const shader = throwIfFalsy(gl.createShader(type));
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (debug) {
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            const message = (_a = gl.getShaderInfoLog(shader), (_a !== null && _a !== void 0 ? _a : 'Unknown Error.'));
            gl.deleteShader(shader);
            throw new Error(message);
        }
    }
    return shader;
}
function throwIfFalsy(value) {
    if (!value) {
        throw new Error('value must not be falsy');
    }
    return value;
}

function resolveColorRGBA(color) {
    const rgbColor = typeof color === 'string' ? rgb(color) : rgb(color);
    return [rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255, rgbColor.opacity];
}

var VertexAttribLocations;
(function (VertexAttribLocations) {
    VertexAttribLocations[VertexAttribLocations["DATA_POINT"] = 0] = "DATA_POINT";
    VertexAttribLocations[VertexAttribLocations["DIR"] = 1] = "DIR";
})(VertexAttribLocations || (VertexAttribLocations = {}));
const vsSource = `#version 300 es
layout (location = ${VertexAttribLocations.DATA_POINT}) in vec2 aDataPoint;
layout (location = ${VertexAttribLocations.DIR}) in vec2 aDir;

uniform vec2 uModelScale;
uniform vec2 uModelTranslation;
uniform vec2 uProjectionScale;
uniform float uLineWidth;

void main() {
    vec2 cssPose = uModelScale * aDataPoint + uModelTranslation;
    vec2 dir = uModelScale * aDir;
    dir = normalize(dir);
    vec2 pos2d = uProjectionScale * (cssPose + vec2(-dir.y, dir.x) * uLineWidth);
    gl_Position = vec4(pos2d, 0, 1);
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
    constructor(gl, debug) {
        super(gl, vsSource, fsSource, debug);
        this.locations = {
            uModelScale: throwIfFalsy(gl.getUniformLocation(this.program, 'uModelScale')),
            uModelTranslation: throwIfFalsy(gl.getUniformLocation(this.program, 'uModelTranslation')),
            uProjectionScale: throwIfFalsy(gl.getUniformLocation(this.program, 'uProjectionScale')),
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
    /**
     * @param firstDataPointIndex At least 1, since datapoint 0 has no path to draw.
     */
    constructor(gl, dataPoints, firstDataPointIndex) {
        this.gl = gl;
        this.dataPoints = dataPoints;
        this.firstDataPointIndex = firstDataPointIndex;
        this.length = 0;
        this.vao = throwIfFalsy(gl.createVertexArray());
        this.bind();
        this.dataBuffer = throwIfFalsy(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, BUFFER_CAPACITY * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(VertexAttribLocations.DATA_POINT);
        gl.vertexAttribPointer(VertexAttribLocations.DATA_POINT, 2, gl.FLOAT, false, BYTES_PER_POINT, 0);
        gl.enableVertexAttribArray(VertexAttribLocations.DIR);
        gl.vertexAttribPointer(VertexAttribLocations.DIR, 2, gl.FLOAT, false, BYTES_PER_POINT, 2 * Float32Array.BYTES_PER_ELEMENT);
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
     * @returns Next data point index, or `dataPoints.length` if all data added.
     */
    addDataPoints() {
        const dataPoints = this.dataPoints;
        const start = this.firstDataPointIndex + this.length;
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
        const vDP = create();
        const vPreviousDP = create();
        const dir1 = create();
        const dir2 = create();
        function calc(dp, previousDP) {
            vDP[0] = dp.x;
            vDP[1] = dp.y;
            vPreviousDP[0] = previousDP.x;
            vPreviousDP[1] = previousDP.y;
            subtract(dir1, vDP, vPreviousDP);
            normalize(dir1, dir1);
            negate(dir2, dir1);
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
    draw(renderIndex) {
        const first = Math.max(0, renderIndex.min - this.firstDataPointIndex);
        const last = Math.min(this.length, renderIndex.max - this.firstDataPointIndex);
        const count = last - first;
        const gl = this.gl;
        this.bind();
        gl.drawArrays(gl.TRIANGLE_STRIP, first * POINT_PER_DATAPOINT, count * POINT_PER_DATAPOINT);
    }
}
/**
 * An array of `VertexArray` to represent a series
 *
 * `series.data`  index: 0  [1 ... C] [C+1 ... 2C] ... (C = `BUFFER_DATA_POINT_CAPACITY`)
 * `vertexArrays` index:     0         1           ...
 */
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
            activeArray = new VertexArray(this.gl, this.series.data, bufferedDataPointNum);
            this.vertexArrays.push(activeArray);
        };
        if (this.vertexArrays.length > 0) {
            const lastVertexArray = this.vertexArrays[this.vertexArrays.length - 1];
            bufferedDataPointNum = lastVertexArray.firstDataPointIndex + lastVertexArray.length;
            if (bufferedDataPointNum > this.series.data.length) {
                throw new Error('remove data unsupported.');
            }
            if (bufferedDataPointNum === this.series.data.length) {
                return;
            }
            activeArray = lastVertexArray;
        }
        else if (this.series.data.length >= 2) {
            newArray();
            activeArray = activeArray;
        }
        else {
            return; // Not enough data
        }
        while (true) {
            bufferedDataPointNum = activeArray.addDataPoints();
            if (bufferedDataPointNum >= this.series.data.length) {
                if (bufferedDataPointNum > this.series.data.length) {
                    throw Error('Assertion failed.');
                }
                break;
            }
            newArray();
        }
    }
    draw(renderDomain) {
        const data = this.series.data;
        if (data.length === 0 || data[0].x > renderDomain.max || data[data.length - 1].x < renderDomain.min) {
            return;
        }
        const key = (d) => d.x;
        const minIndex = domainSearch(data, 1, data.length, renderDomain.min, key);
        const maxIndex = domainSearch(data, minIndex, data.length - 1, renderDomain.max, key) + 1;
        const minArrayIndex = Math.floor((minIndex - 1) / BUFFER_DATA_POINT_CAPACITY);
        const maxArrayIndex = Math.ceil((maxIndex - 1) / BUFFER_DATA_POINT_CAPACITY);
        const renderIndex = { min: minIndex, max: maxIndex };
        for (let i = minArrayIndex; i < maxArrayIndex; i++) {
            this.vertexArrays[i].draw(renderIndex);
        }
    }
}
class LineChartRenderer {
    constructor(model, gl, options) {
        this.model = model;
        this.gl = gl;
        this.options = options;
        this.program = new LineChartWebGLProgram(this.gl, this.options.debugWebGL);
        this.arrays = new Map();
        this.height = 0;
        this.width = 0;
        model.updated.on(() => this.drawFrame());
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
        this.width = width;
        const scale = fromValues(width, height);
        divide(scale, scale, [2, 2]);
        inverse(scale, scale);
        const gl = this.gl;
        gl.uniform2fv(this.program.locations.uProjectionScale, scale);
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
            const renderDomain = {
                min: this.model.xScale.invert(-lineWidth / 2),
                max: this.model.xScale.invert(this.width + lineWidth / 2),
            };
            arr.draw(renderDomain);
        }
    }
    ySvgToView(v) {
        return -v + this.height / 2;
    }
    xSvgToView(v) {
        return v - this.width / 2;
    }
    syncDomain() {
        const m = this.model;
        const gl = this.gl;
        const zero = [this.xSvgToView(m.xScale(0)), this.ySvgToView(m.yScale(0))];
        const one = [this.xSvgToView(m.xScale(1)), this.ySvgToView(m.yScale(1))];
        const scaling = create();
        subtract(scaling, one, zero);
        gl.uniform2fv(this.program.locations.uModelScale, scaling);
        gl.uniform2fv(this.program.locations.uModelTranslation, zero);
    }
}

class CanvasLayer {
    constructor(el, options, model) {
        this.options = options;
        model.updated.on(() => this.clear());
        el.style.position = 'relative';
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.position = 'absolute';
        el.appendChild(canvas);
        const ctx = canvas.getContext('webgl2');
        if (!ctx) {
            throw new Error('Unable to initialize WebGL. Your browser or machine may not support it.');
        }
        const gl = ctx;
        this.gl = gl;
        const bgColor = resolveColorRGBA(options.backgroundColor);
        gl.clearColor(...bgColor);
        this.canvas = canvas;
    }
    onResize() {
        const canvas = this.canvas;
        const scale = this.options.pixelRatio;
        canvas.width = canvas.clientWidth * scale;
        canvas.height = canvas.clientHeight * scale;
        this.gl.viewport(0, 0, canvas.width, canvas.height);
    }
    clear() {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}

class SVGLayer {
    constructor(el, options, model) {
        this.options = options;
        this.model = model;
        this.xAxis = axisBottom(this.model.xScale);
        this.yAxis = axisLeft(this.model.yScale);
        model.updated.on(() => this.update());
        el.style.position = 'relative';
        const svg = select(el).append('svg')
            .style('position', 'absolute')
            .style('width', '100%')
            .style('height', '100%');
        this.svgNode = svg.node();
        this.xg = svg.append('g');
        this.yg = svg.append('g');
    }
    update() {
        const xs = this.model.xScale;
        const xts = scaleTime()
            .domain(xs.domain().map(d => d + this.options.baseTime))
            .range(xs.range());
        this.xAxis.scale(xts);
        this.xg.call(this.xAxis);
        this.yAxis.scale(this.model.yScale);
        this.yg.call(this.yAxis);
    }
    onResize() {
        const svg = this.svgNode;
        const op = this.options;
        this.xg.attr('transform', `translate(0, ${svg.clientHeight - op.paddingBottom})`);
        this.yg.attr('transform', `translate(${op.paddingLeft}, 0)`);
        this.update();
    }
}

function zip(...rows) {
    return [...rows[0]].map((_, c) => rows.map(row => row[c]));
}
/**
 * least squares
 *
 * beta^T = [b, k]
 * X = [[1, x_1],
 *      [1, x_2],
 *      [1, x_3], ...]
 * Y^T = [y_1, y_2, y_3, ...]
 * beta = (X^T X)^(-1) X^T Y
 * @returns `{k, b}`
 */
function linearRegression(data) {
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    const len = data.length;
    for (const p of data) {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumXX += p.x * p.x;
    }
    const det = (len * sumXX) - (sumX * sumX);
    const k = det === 0 ? 0 : ((len * sumXY) - (sumX * sumY)) / det;
    const b = (sumY - k * sumX) / len;
    return { k, b };
}
function scaleK(scale) {
    const domain = scale.domain();
    const range = scale.range();
    return (domain[1] - domain[0]) / (range[1] - range[0]);
}
/**
 * @returns If domain changed
 */
function applyNewDomain(op, domain) {
    const inExtent = domain[1] - domain[0];
    const previousDomain = op.scale.domain();
    if ((previousDomain[1] - previousDomain[0]) * inExtent <= 0) {
        // forbidden reverse direction.
        return false;
    }
    const extent = Math.min(op.maxDomainExtent, op.maxDomain - op.minDomain, Math.max(op.minDomainExtent, inExtent));
    const deltaE = (extent - inExtent) / 2;
    domain[0] -= deltaE;
    domain[1] += deltaE;
    const deltaO = Math.min(Math.max(op.minDomain - domain[0], 0), op.maxDomain - domain[1]);
    domain[0] += deltaO;
    domain[1] += deltaO;
    const eps = extent * 1e-6;
    op.scale.domain(domain);
    if (zip(domain, previousDomain).some(([d, pd]) => Math.abs(d - pd) > eps)) {
        return true;
    }
    return false;
}
function variance(data) {
    const mean = data.reduce((a, b) => a + b) / data.length;
    return data.map(d => (d - mean) ** 2).reduce((a, b) => a + b) / data.length;
}
function clamp(value, min, max) {
    if (value > max) {
        return max;
    }
    else if (value < min) {
        return min;
    }
    return value;
}

var DIRECTION;
(function (DIRECTION) {
    DIRECTION[DIRECTION["UNKNOWN"] = 0] = "UNKNOWN";
    DIRECTION[DIRECTION["X"] = 1] = "X";
    DIRECTION[DIRECTION["Y"] = 2] = "Y";
})(DIRECTION || (DIRECTION = {}));
function dirOptions(options) {
    return [
        { dir: DIRECTION.X, op: options.x },
        { dir: DIRECTION.Y, op: options.y },
    ].filter(i => i.op !== undefined);
}

class ChartZoomTouch {
    constructor(el, options) {
        this.el = el;
        this.options = options;
        this.scaleUpdated = new EventDispatcher();
        this.majorDirection = DIRECTION.UNKNOWN;
        this.previousPoints = new Map();
        this.enabled = {
            [DIRECTION.X]: false,
            [DIRECTION.Y]: false,
        };
        el.addEventListener('touchstart', e => this.onTouchStart(e), { passive: true });
        el.addEventListener('touchend', e => this.onTouchEnd(e), { passive: true });
        el.addEventListener('touchcancel', e => this.onTouchEnd(e), { passive: true });
        el.addEventListener('touchmove', e => this.onTouchMove(e), { passive: true });
        this.update();
    }
    update() {
        this.syncEnabled();
        this.syncTouchAction();
    }
    syncEnabled() {
        for (const { dir, op } of dirOptions(this.options)) {
            if (!op) {
                this.enabled[dir] = false;
            }
            else {
                const domain = op.scale.domain().sort();
                this.enabled[dir] = op.minDomain < domain[0] && domain[1] < op.maxDomain;
            }
        }
    }
    syncTouchAction() {
        const actions = [];
        if (!this.enabled[DIRECTION.X]) {
            actions.push('pan-x');
        }
        if (!this.enabled[DIRECTION.Y]) {
            actions.push('pan-y');
        }
        if (actions.length === 0) {
            actions.push('none');
        }
        this.el.style.touchAction = actions.join(' ');
    }
    calcKB(dir, op, data) {
        if (dir === this.majorDirection && data.length >= 2) {
            const domain = op.scale.domain();
            const extent = domain[1] - domain[0];
            if (variance(data.map(d => d.domain)) > 1e-4 * extent * extent) {
                return linearRegression(data.map(t => ({ x: t.current, y: t.domain })));
            }
        }
        // Pan only
        const k = scaleK(op.scale);
        const b = data.map(t => t.domain - k * t.current).reduce((a, b) => a + b) / data.length;
        return { k, b };
    }
    touchPoints(touches) {
        const boundingBox = this.el.getBoundingClientRect();
        const ts = new Map([...touches].map(t => [t.identifier, {
                [DIRECTION.X]: t.clientX - boundingBox.left,
                [DIRECTION.Y]: t.clientY - boundingBox.top,
            }]));
        let changed = false;
        for (const { dir, op } of dirOptions(this.options)) {
            const scale = op.scale;
            const temp = [...ts.entries()].map(([id, p]) => ({ current: p[dir], previousPoint: this.previousPoints.get(id) }))
                .filter(t => t.previousPoint !== undefined)
                .map(({ current, previousPoint }) => ({ current, domain: scale.invert(previousPoint[dir]) }));
            if (temp.length === 0) {
                continue;
            }
            const { k, b } = this.calcKB(dir, op, temp);
            const domain = scale.range().map(r => b + k * r);
            if (applyNewDomain(op, domain)) {
                changed = true;
            }
        }
        this.previousPoints = ts;
        if (changed) {
            this.scaleUpdated.dispatch();
        }
        return changed;
    }
    dirOptions(dir) {
        return {
            [DIRECTION.X]: this.options.x,
            [DIRECTION.Y]: this.options.y,
        }[dir];
    }
    onTouchStart(event) {
        if (this.majorDirection === DIRECTION.UNKNOWN && event.touches.length >= 2) {
            const ts = [...event.touches];
            function vari(data) {
                const mean = data.reduce((a, b) => a + b) / data.length;
                return data.map(d => (d - mean) ** 2).reduce((a, b) => a + b);
            }
            const varX = vari(ts.map(t => t.clientX));
            const varY = vari(ts.map(t => t.clientY));
            this.majorDirection = varX > varY ? DIRECTION.X : DIRECTION.Y;
            if (this.dirOptions(this.majorDirection) === undefined) {
                this.majorDirection = DIRECTION.UNKNOWN;
            }
        }
        this.touchPoints(event.touches);
    }
    onTouchEnd(event) {
        if (event.touches.length < 2) {
            this.majorDirection = DIRECTION.UNKNOWN;
        }
        this.touchPoints(event.touches);
    }
    onTouchMove(event) {
        this.touchPoints(event.touches);
    }
}

class ChartZoomWheel {
    constructor(el, options) {
        this.el = el;
        this.options = options;
        this.scaleUpdated = new EventDispatcher();
        el.addEventListener('wheel', ev => this.onWheel(ev));
    }
    onWheel(event) {
        event.preventDefault();
        let deltaX = event.deltaX;
        let deltaY = event.deltaY;
        switch (event.deltaMode) {
            case 1: // line
                deltaX *= 30;
                deltaY *= 30;
                break;
            case 2: // page
                deltaX *= 400;
                deltaY *= 400;
                break;
        }
        const transform = {
            [DIRECTION.X]: {
                translate: 0,
                zoom: 0,
            },
            [DIRECTION.Y]: {
                translate: 0,
                zoom: 0,
            }
        };
        if (event.ctrlKey) { // zoom
            if (event.altKey) {
                transform[DIRECTION.X].zoom = deltaX;
                transform[DIRECTION.Y].zoom = deltaY;
            }
            else {
                transform[DIRECTION.X].zoom = (deltaX + deltaY);
            }
        }
        else { // translate
            if (event.altKey) {
                transform[DIRECTION.X].translate = deltaX;
                transform[DIRECTION.Y].translate = deltaY;
            }
            else {
                transform[DIRECTION.X].translate = (deltaX + deltaY);
            }
        }
        const boundingRect = this.el.getBoundingClientRect();
        const origin = {
            [DIRECTION.X]: event.clientX - boundingRect.left,
            [DIRECTION.Y]: event.clientY - boundingRect.top,
        };
        let changed = false;
        for (const { dir, op } of dirOptions(this.options)) {
            const domain = op.scale.domain();
            const k = scaleK(op.scale);
            const trans = transform[dir];
            const transOrigin = op.scale.invert(origin[dir]);
            trans.translate *= k;
            trans.zoom *= 0.002;
            if (event.shiftKey) {
                trans.translate *= 5;
                trans.zoom *= 5;
            }
            const extent = domain[1] - domain[0];
            const translateCap = 0.4 * extent;
            trans.translate = clamp(trans.translate, -translateCap, translateCap);
            const zoomCap = 0.5;
            trans.zoom = clamp(trans.zoom, -zoomCap, zoomCap);
            const newDomain = domain.map(d => d + trans.translate + (d - transOrigin) * trans.zoom);
            if (applyNewDomain(op, newDomain)) {
                changed = true;
            }
        }
        if (changed) {
            this.scaleUpdated.dispatch();
        }
    }
}

class ChartZoomMouse {
    constructor(el, options) {
        this.el = el;
        this.options = options;
        this.scaleUpdated = new EventDispatcher();
        this.previousPoint = null;
        el.style.userSelect = 'none';
        el.addEventListener('pointerdown', ev => this.onMouseDown(ev));
        el.addEventListener('pointerup', ev => this.onMouseUp(ev));
        el.addEventListener('pointermove', ev => this.onMouseMove(ev));
    }
    point(ev) {
        const boundingRect = this.el.getBoundingClientRect();
        return {
            [DIRECTION.X]: ev.clientX - boundingRect.left,
            [DIRECTION.Y]: ev.clientY - boundingRect.top,
        };
    }
    onMouseMove(event) {
        if (this.previousPoint === null) {
            return;
        }
        const p = this.point(event);
        let changed = false;
        for (const { dir, op } of dirOptions(this.options)) {
            const offset = p[dir] - this.previousPoint[dir];
            const k = scaleK(op.scale);
            const domain = op.scale.domain();
            const newDomain = domain.map(d => d - k * offset);
            if (applyNewDomain(op, newDomain)) {
                changed = true;
            }
        }
        this.previousPoint = p;
        if (changed) {
            this.scaleUpdated.dispatch();
        }
    }
    onMouseDown(event) {
        if (event.pointerType !== 'mouse') {
            return;
        }
        this.el.setPointerCapture(event.pointerId);
        this.previousPoint = this.point(event);
        this.el.style.cursor = 'grabbing';
    }
    onMouseUp(event) {
        if (this.previousPoint === null) {
            return;
        }
        this.previousPoint = null;
        this.el.releasePointerCapture(event.pointerId);
        this.el.style.cursor = '';
    }
}

const defaultAxisOptions = {
    minDomain: -Infinity,
    maxDomain: Infinity,
    minDomainExtent: 0,
    maxDomainExtent: Infinity,
};
class ChartZoom {
    constructor(el, options) {
        this.scaleUpdated = new EventDispatcher();
        options = (options !== null && options !== void 0 ? options : {});
        this.options = {
            x: options.x && Object.assign(Object.assign({}, defaultAxisOptions), options.x),
            y: options.y && Object.assign(Object.assign({}, defaultAxisOptions), options.y),
        };
        this.touch = new ChartZoomTouch(el, this.options);
        this.mouse = new ChartZoomMouse(el, this.options);
        this.wheel = new ChartZoomWheel(el, this.options);
        const cb = () => this.scaleUpdated.dispatch();
        this.touch.scaleUpdated.on(cb);
        this.mouse.scaleUpdated.on(cb);
        this.wheel.scaleUpdated.on(cb);
    }
    onScaleUpdated(callback) {
        this.scaleUpdated.on(callback);
    }
    /** Call this when scale updated outside */
    update() {
        this.touch.update();
    }
}

const defaultOptions = {
    pixelRatio: window.devicePixelRatio,
    lineWidth: 1,
    backgroundColor: rgb(255, 255, 255, 1),
    paddingTop: 10,
    paddingRight: 10,
    paddingLeft: 45,
    paddingBottom: 20,
    xRange: 'auto',
    yRange: 'auto',
    realTime: false,
    baseTime: 0,
    debugWebGL: false,
};
const defaultSeriesOptions = {
    color: rgb(0, 0, 0, 1),
    name: '',
};
class TimeChart {
    constructor(el, options) {
        var _a, _b;
        this.el = el;
        options = (options !== null && options !== void 0 ? options : {});
        const series = (_b = (_a = options.series) === null || _a === void 0 ? void 0 : _a.map(s => (Object.assign(Object.assign({ data: [] }, defaultSeriesOptions), s))), (_b !== null && _b !== void 0 ? _b : []));
        const renderOptions = Object.assign(Object.assign(Object.assign({}, defaultOptions), options), { series });
        this.model = new RenderModel(renderOptions);
        this.canvasLayer = new CanvasLayer(el, renderOptions, this.model);
        this.svgLayer = new SVGLayer(el, renderOptions, this.model);
        this.lineChartRenderer = new LineChartRenderer(this.model, this.canvasLayer.gl, renderOptions);
        this.options = Object.assign(renderOptions, {
            zoom: this.registerZoom(options.zoom)
        });
        this.onResize();
        window.addEventListener('resize', () => this.onResize());
    }
    registerZoom(zoomOptions) {
        if (zoomOptions) {
            const z = new ChartZoom(this.el, {
                x: zoomOptions.x && Object.assign(Object.assign({}, zoomOptions.x), { scale: this.model.xScale }),
                y: zoomOptions.y && Object.assign(Object.assign({}, zoomOptions.y), { scale: this.model.yScale })
            });
            const resolvedOptions = z.options;
            this.model.updated.on(() => {
                var _a;
                const dirs = [
                    [resolvedOptions.x, this.model.xScale, this.model.xRange],
                    [resolvedOptions.y, this.model.yScale, this.model.yRange],
                ];
                for (const [op, scale, range] of dirs) {
                    if (!((_a = op) === null || _a === void 0 ? void 0 : _a.autoRange)) {
                        continue;
                    }
                    let [min, max] = scale.domain();
                    if (range) {
                        min = Math.min(min, range.min);
                        max = Math.max(max, range.max);
                    }
                    op.minDomain = min;
                    op.maxDomain = max;
                }
                z.update();
            });
            z.onScaleUpdated(() => {
                this.options.xRange = null;
                this.options.yRange = null;
                this.options.realTime = false;
                this.update();
            });
            return resolvedOptions;
        }
    }
    onResize() {
        const canvas = this.canvasLayer.canvas;
        this.model.resize(canvas.clientWidth, canvas.clientHeight);
        this.svgLayer.onResize();
        this.canvasLayer.onResize();
        this.lineChartRenderer.onResize(canvas.clientWidth, canvas.clientHeight);
        this.update();
    }
    update() {
        this.model.requestRedraw();
    }
}

export default TimeChart;
//# sourceMappingURL=timechart.es5.js.map
