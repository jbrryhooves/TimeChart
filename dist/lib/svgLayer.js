import { axisBottom, axisLeft } from "d3-axis";
import { select, event } from "d3-selection";
import { zoom } from "d3-zoom";
export class SVGLayer {
    constructor(el, options, model) {
        this.options = options;
        this.model = model;
        this.xAxis = axisBottom(this.model.xScale);
        this.yAxis = axisLeft(this.model.yScale);
        model.onUpdate(() => this.update());
        el.style.position = 'relative';
        const svg = select(el).append('svg')
            .style('position', 'absolute')
            .style('width', '100%')
            .style('height', '100%');
        this.svgNode = svg.node();
        this.xg = svg.append('g');
        this.yg = svg.append('g');
        const xBeforeZoom = model.xScale;
        const zoomed = () => {
            const trans = event.transform;
            xBeforeZoom.range(model.xScale.range());
            model.xScale = trans.rescaleX(xBeforeZoom);
            this.xAxis.scale(model.xScale);
            options.xRange = null;
            options.realTime = false;
            model.requestRedraw();
        };
        if (options.zoom) {
            const z = zoom()
                .on('zoom', zoomed);
            svg.call(z); // TODO: Workaround type check.
        }
    }
    update() {
        this.xg.call(this.xAxis);
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
//# sourceMappingURL=svgLayer.js.map