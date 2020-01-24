import { scaleTime, scaleLinear } from "d3-scale";
export class RenderModel {
    constructor(options) {
        this.options = options;
        this.xScale = scaleTime();
        this.yScale = scaleLinear();
        this.xAutoInitized = false;
        this.yAutoInitized = false;
        this.series = [];
        if (options.xRange !== 'auto') {
            this.xScale.domain([options.xRange.min, options.xRange.max]);
        }
        if (options.yRange !== 'auto') {
            this.yScale.domain([options.yRange.min, options.yRange.max]);
        }
    }
    onResize(width, height) {
        const op = this.options;
        this.xScale.range([op.paddingLeft, width - op.paddingRight]);
        this.yScale.range([op.paddingTop, height - op.paddingBottom]);
    }
    update() {
        const series = this.series.filter(s => s.data.length > 0);
        if (series.length === 0) {
            return;
        }
        if (this.options.xRange === 'auto') {
            const maxDomain = this.options.baseTime + Math.max(...series.map(s => s.data[s.data.length - 1].x));
            const minDomain = this.xAutoInitized ?
                this.xScale.domain()[0] :
                this.options.baseTime + Math.min(...series.map(s => s.data[0].x));
            this.xScale.domain([minDomain, maxDomain]);
            this.xAutoInitized = true;
        }
        if (this.options.yRange === 'auto') {
            let minDomain = Math.min(...series.map(s => Math.min(...s.data.slice(s.yRangeUpdatedIndex).map(d => d.y))));
            let maxDomain = Math.max(...series.map(s => Math.max(...s.data.slice(s.yRangeUpdatedIndex).map(d => d.y))));
            if (this.yAutoInitized) {
                const origDomain = this.yScale.domain();
                minDomain = Math.min(origDomain[1], minDomain);
                maxDomain = Math.max(origDomain[0], maxDomain);
            }
            this.yScale.domain([maxDomain, minDomain]).nice();
            this.yAutoInitized = true;
            for (const s of this.series) {
                s.yRangeUpdatedIndex = s.data.length;
            }
        }
    }
}
//# sourceMappingURL=renderModel.js.map