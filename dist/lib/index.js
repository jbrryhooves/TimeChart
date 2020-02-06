import { rgb } from 'd3-color';
import { RenderModel } from './renderModel';
import { LineChartRenderer } from './lineChartRenderer';
import { CanvasLayer } from './canvasLayer';
import { SVGLayer } from './svgLayer';
import { ChartZoom } from './chartZoom';
const defaultOptions = {
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
};
const defaultSeriesOptions = {
    color: rgb(0, 0, 0, 1),
    name: '',
};
export default class TimeChart {
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
//# sourceMappingURL=index.js.map