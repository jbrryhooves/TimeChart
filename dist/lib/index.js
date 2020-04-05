import { rgb } from 'd3-color';
import { RenderModel } from './renderModel';
import { LineChartRenderer } from './lineChartRenderer';
import { CanvasLayer } from './canvasLayer';
import { SVGLayer } from './svgLayer';
import { ContentBoxDetector } from "./contentBoxDetector";
import { ChartZoom } from './chartZoom';
import { D3AxisRenderer } from './d3AxisRenderer';
import { Legend } from './legend';
import { Crosshair } from './crosshair';
import { NearestPoint } from './nearestPoint';
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
export default class TimeChart {
    constructor(el, options) {
        var _a, _b;
        this.el = el;
        options = options !== null && options !== void 0 ? options : {};
        const series = (_b = (_a = options.series) === null || _a === void 0 ? void 0 : _a.map(s => (Object.assign(Object.assign({ data: [] }, defaultSeriesOptions), s)))) !== null && _b !== void 0 ? _b : [];
        const renderOptions = Object.assign(Object.assign(Object.assign({}, defaultOptions), options), { series });
        this.model = new RenderModel(renderOptions);
        const canvasLayer = new CanvasLayer(el, renderOptions, this.model);
        const lineChartRenderer = new LineChartRenderer(this.model, canvasLayer.gl, renderOptions);
        const svgLayer = new SVGLayer(el);
        const contentBoxDetector = new ContentBoxDetector(el, renderOptions);
        const axisRenderer = new D3AxisRenderer(this.model, svgLayer.svgNode, renderOptions);
        const legend = new Legend(el, renderOptions);
        const crosshair = new Crosshair(svgLayer, this.model, renderOptions, contentBoxDetector);
        const nearestPoint = new NearestPoint(svgLayer, this.model, renderOptions, contentBoxDetector);
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
                const dirs = [
                    [resolvedOptions.x, this.model.xScale, this.model.xRange],
                    [resolvedOptions.y, this.model.yScale, this.model.yRange],
                ];
                for (const [op, scale, range] of dirs) {
                    if (!(op === null || op === void 0 ? void 0 : op.autoRange)) {
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
        this.model.resize(this.el.clientWidth, this.el.clientHeight);
    }
    update() {
        this.model.requestRedraw();
    }
}
//# sourceMappingURL=index.js.map