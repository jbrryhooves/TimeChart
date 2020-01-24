import { axisBottom, axisLeft } from "d3-axis";
import { select } from "d3-selection";
export class SVGLayer {
    constructor(el, options, model) {
        this.options = options;
        this.model = model;
        this.xAxis = axisBottom(this.model.xScale);
        this.yAxis = axisLeft(this.model.yScale);
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