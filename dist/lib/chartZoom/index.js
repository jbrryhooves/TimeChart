import { ChartZoomTouch } from './touch';
import { ChartZoomWheel } from './wheel';
import { ChartZoomBoundary } from './boundary';
import { EventDispatcher } from '../utils';
import { ChartZoomMouse } from './mouse';
const defaultAxisOptions = {
    minDomain: -Infinity,
    maxDomain: Infinity,
    minDomainExtent: 0,
    maxDomainExtent: Infinity,
};
export class ChartZoom {
    constructor(el, options) {
        this.el = el;
        this.scaleUpdated = new EventDispatcher();
        options = (options !== null && options !== void 0 ? options : {});
        this.options = {
            x: options.x && Object.assign(Object.assign({}, defaultAxisOptions), options.x),
            y: options.y && Object.assign(Object.assign({}, defaultAxisOptions), options.y),
        };
        this.touch = new ChartZoomTouch(el, this.options);
        this.mouse = new ChartZoomMouse(el, this.options);
        this.wheel = new ChartZoomWheel(el, this.options);
        this.boundary = new ChartZoomBoundary(this.options);
        const cb = () => this.dispatchScaleUpdated();
        this.touch.scaleUpdated.on(cb);
        this.mouse.scaleUpdated.on(cb);
        this.wheel.scaleUpdated.on(cb);
    }
    dispatchScaleUpdated() {
        this.boundary.enforceBondary();
        this.scaleUpdated.dispatch();
    }
    onScaleUpdated(callback) {
        this.scaleUpdated.on(callback);
    }
    /** Call this when scale updated outside */
    update() {
        this.touch.update();
    }
}
//# sourceMappingURL=index.js.map