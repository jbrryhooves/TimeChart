import { rgb } from 'd3-color';
import { RenderModel } from './renderModel';
import { LineChartRenderer } from './lineChartRenderer';
import { CanvasLayer } from './canvasLayer';
import { SVGLayer } from './svgLayer';
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
        this.el = el;
        const resolvedOptions = Object.assign(Object.assign({}, defaultOptions), options);
        this.options = resolvedOptions;
        this.renderModel = new RenderModel(resolvedOptions);
        this.canvasLayer = new CanvasLayer(el, resolvedOptions);
        this.svgLayer = new SVGLayer(el, resolvedOptions, this.renderModel);
        this.lineChartRenderer = new LineChartRenderer(this.renderModel, this.canvasLayer.gl, resolvedOptions);
        this.onResize();
        window.addEventListener('resize', () => this.onResize());
    }
    onResize() {
        const canvas = this.canvasLayer.canvas;
        this.renderModel.onResize(canvas.clientWidth, canvas.clientHeight);
        this.svgLayer.onResize();
        this.canvasLayer.onResize();
        this.lineChartRenderer.onResize(canvas.clientWidth, canvas.clientHeight);
    }
    update() {
        this.canvasLayer.clear();
        this.renderModel.update();
        this.svgLayer.update();
        this.lineChartRenderer.drawFrame();
    }
    addDataSeries(data, options) {
        const resolvedOptions = Object.assign(Object.assign({}, defaultSeriesOptions), options);
        this.renderModel.series.push({
            data,
            options: resolvedOptions,
            yRangeUpdatedIndex: 0,
        });
    }
}
//# sourceMappingURL=index.js.map