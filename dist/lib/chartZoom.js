import { zip } from './utils';
var DIRECTION;
(function (DIRECTION) {
    DIRECTION[DIRECTION["UNKNOWN"] = 0] = "UNKNOWN";
    DIRECTION[DIRECTION["X"] = 1] = "X";
    DIRECTION[DIRECTION["Y"] = 2] = "Y";
})(DIRECTION || (DIRECTION = {}));
;
const defaultAxisOptions = {
    minDomain: -Infinity,
    maxDomain: Infinity,
    minDomainExtent: 0,
    maxDomainExtent: Infinity,
};
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
export class ChartZoom {
    constructor(el, options) {
        this.el = el;
        this.majorDirection = DIRECTION.UNKNOWN;
        this.previousPoints = new Map();
        this.enabled = {
            [DIRECTION.X]: false,
            [DIRECTION.Y]: false,
        };
        this.updateCallbacks = [];
        el.addEventListener('touchstart', e => this.onTouchStart(e));
        el.addEventListener('touchend', e => this.onTouchEnd(e));
        el.addEventListener('touchcancel', e => this.onTouchEnd(e));
        el.addEventListener('touchmove', e => this.onTouchMove(e));
        options = (options !== null && options !== void 0 ? options : {});
        this.options = {
            x: options.x && Object.assign(Object.assign({}, defaultAxisOptions), options.x),
            y: options.y && Object.assign(Object.assign({}, defaultAxisOptions), options.y),
        };
        this.update();
    }
    update() {
        this.syncEnabled();
        this.syncTouchAction();
    }
    syncEnabled() {
        const dirs = [
            ['x', DIRECTION.X],
            ['y', DIRECTION.Y],
        ];
        for (const [opDir, dir] of dirs) {
            const op = this.options[opDir];
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
    touchPoints(touches) {
        const boundingBox = this.el.getBoundingClientRect();
        const ts = new Map([...touches].map(t => [t.identifier, {
                [DIRECTION.X]: t.clientX - boundingBox.left,
                [DIRECTION.Y]: t.clientY - boundingBox.top,
            }]));
        let changed = false;
        for (const dir of [DIRECTION.X, DIRECTION.Y]) {
            const op = this.dirOptions(dir);
            if (op === undefined) {
                continue;
            }
            const scale = op.scale;
            const temp = [...ts.entries()].map(([id, p]) => ({ current: p[dir], previousPoint: this.previousPoints.get(id) }))
                .filter(t => t.previousPoint !== undefined)
                .map(({ current, previousPoint }) => ({ current, domain: scale.invert(previousPoint[dir]) }));
            if (temp.length === 0) {
                continue;
            }
            let k, b;
            if (dir === this.majorDirection && temp.length >= 2) {
                const res = linearRegression(temp.map(t => ({ x: t.current, y: t.domain })));
                k = res.k;
                b = res.b;
            }
            else {
                // Pan only
                const domain = scale.domain();
                const range = scale.range();
                k = (domain[1] - domain[0]) / (range[1] - range[0]);
                b = temp.map(t => t.domain - k * t.current).reduce((a, b) => a + b) / temp.length;
            }
            const domain = scale.range().map(r => b + k * r);
            if (this.applyNewDomain(dir, domain)) {
                changed = true;
            }
        }
        this.previousPoints = ts;
        if (changed) {
            for (const cb of this.updateCallbacks) {
                cb();
            }
        }
        return changed;
    }
    /**
     * @returns If domain changed
     */
    applyNewDomain(dir, domain) {
        const op = this.dirOptions(dir);
        const inExtent = domain[1] - domain[0];
        const extent = Math.min(op.maxDomainExtent, Math.max(op.minDomainExtent, inExtent));
        const deltaE = (extent - inExtent) / 2;
        domain[0] -= deltaE;
        domain[1] += deltaE;
        const deltaO = Math.min(Math.max(op.minDomain - domain[0], 0), op.maxDomain - domain[1]);
        domain[0] += deltaO;
        domain[1] += deltaO;
        const eps = extent * 1e-6;
        const previousDomain = op.scale.domain();
        op.scale.domain(domain);
        if (zip(domain, previousDomain).some(([d, pd]) => Math.abs(d - pd) > eps)) {
            return true;
        }
        return false;
    }
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
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
        if (event.touches.length === 0) {
            this.majorDirection = DIRECTION.UNKNOWN;
        }
        this.touchPoints(event.touches);
    }
    onTouchMove(event) {
        this.touchPoints(event.touches);
    }
}
//# sourceMappingURL=chartZoom.js.map