"use strict";
var defined = function (a) {
    return a !== undefined;
};
var Vec2 = (function () {
    function Vec2(x, y) {
        var _this = this;
        if (y === void 0) { y = null; }
        this.observers = [];
        this.set = function (x, y, notify) {
            if ('number' != typeof x) {
                notify = y;
                y = x.y;
                x = x.x;
            }
            if (_this.x === x && _this.y === y) {
                return _this;
            }
            var orig = null;
            if (notify !== false && _this.observers && _this.observers.length) {
                orig = _this.clone();
            }
            _this.x = Vec2.clean(x);
            _this.y = Vec2.clean(y);
            if (notify !== false) {
                return _this.change(orig);
            }
        };
        if (!(this instanceof Vec2)) {
            return new Vec2(x, y);
        }
        if (Array.isArray(x)) {
            y = x[1];
            x = x[0];
        }
        else if ('object' === typeof x && x) {
            y = x.y;
            x = x.x;
        }
        this.x = Vec2.clean(x || 0);
        this.y = Vec2.clean(y || 0);
    }
    Vec2.prototype.change = function (fn) {
        if (typeof fn === 'function') {
            if (this.observers) {
                this.observers.push(fn);
            }
            else {
                this.observers = [fn];
            }
        }
        else if (this.observers && this.observers.length) {
            for (var i = this.observers.length - 1; i >= 0; i--) {
                this.observers[i](this, fn);
            }
        }
        return this;
    };
    Vec2.prototype.ignore = function (fn) {
        if (this.observers) {
            if (!fn) {
                this.observers = [];
            }
            else {
                var o = this.observers, l = o.length;
                while (l--) {
                    o[l] === fn && o.splice(l, 1);
                }
            }
        }
        return this;
    };
    // reset x and y to zero
    Vec2.prototype.zero = function () {
        return this.set(0, 0);
    };
    // return a new vector with the same component values
    // as this one
    Vec2.prototype.clone = function () {
        return new Vec2(this.x, this.y);
    };
    // negate the values of this vector
    Vec2.prototype.negate = function (returnNew) {
        if (returnNew === void 0) { returnNew = undefined; }
        if (returnNew) {
            return new Vec2(-this.x, -this.y);
        }
        else {
            return this.set(-this.x, -this.y);
        }
    };
    // Add the incoming `vec2` vector to this vector
    Vec2.prototype.add = function (x, y, returnNew) {
        if (y === void 0) { y = undefined; }
        if (returnNew === void 0) { returnNew = undefined; }
        if (typeof x != 'number') {
            returnNew = y;
            if (Array.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            else {
                y = x.y;
                x = x.x;
            }
        }
        x += this.x;
        y += this.y;
        if (!returnNew) {
            return this.set(x, y);
        }
        else {
            // Return a new vector if `returnNew` is truthy
            return new Vec2(x, y);
        }
    };
    // Subtract the incoming `vec2` from this vector
    Vec2.prototype.subtract = function (x, y, returnNew) {
        if (y === void 0) { y = undefined; }
        if (returnNew === void 0) { returnNew = undefined; }
        if (typeof x != 'number') {
            returnNew = y;
            if (Array.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            else {
                y = x.y;
                x = x.x;
            }
        }
        x = this.x - x;
        y = this.y - y;
        if (!returnNew) {
            return this.set(x, y);
        }
        else {
            // Return a new vector if `returnNew` is truthy
            return new Vec2(x, y);
        }
    };
    // Multiply this vector by the incoming `vec2`
    Vec2.prototype.multiply = function (x, y, returnNew) {
        if (y === void 0) { y = undefined; }
        if (returnNew === void 0) { returnNew = undefined; }
        if (typeof x != 'number') {
            returnNew = y;
            if (Array.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            else {
                y = x.y;
                x = x.x;
            }
        }
        else if (typeof y != 'number') {
            returnNew = y;
            y = x;
        }
        x *= this.x;
        y *= this.y;
        if (!returnNew) {
            return this.set(x, y);
        }
        else {
            return new Vec2(x, y);
        }
    };
    // Rotate this vector. Accepts a `Rotation` or angle in radians.
    //
    // Passing a truthy `inverse` will cause the rotation to
    // be reversed.
    //
    // If `returnNew` is truthy, a new
    // `Vec2` will be created with the values resulting from
    // the rotation. Otherwise the rotation will be applied
    // to this vector directly, and this vector will be returned.
    Vec2.prototype.rotate = function (r, inverse, returnNew) {
        var x = this.x, y = this.y, cos = Math.cos(r), sin = Math.sin(r), rx, ry;
        inverse = (inverse) ? -1 : 1;
        rx = cos * x - (inverse * sin) * y;
        ry = (inverse * sin) * x + cos * y;
        if (returnNew) {
            return new Vec2(rx, ry);
        }
        else {
            return this.set(rx, ry);
        }
    };
    // Calculate the length of this vector
    Vec2.prototype.length = function () {
        var x = this.x, y = this.y;
        return Math.sqrt(x * x + y * y);
    };
    // Get the length squared. For performance, use this instead of `Vec2#length` (if possible).
    Vec2.prototype.lengthSquared = function () {
        var x = this.x, y = this.y;
        return x * x + y * y;
    };
    // Return the distance betwen this `Vec2` and the incoming vec2 vector
    // and return a scalar
    Vec2.prototype.distance = function (vec2) {
        var x = this.x - vec2.x;
        var y = this.y - vec2.y;
        return Math.sqrt(x * x + y * y);
    };
    // Given Array of Vec2, find closest to this Vec2.
    Vec2.prototype.nearest = function (others) {
        var shortestDistance = Number.MAX_VALUE, nearest = null, currentDistance;
        for (var i = others.length - 1; i >= 0; i--) {
            currentDistance = this.distance(others[i]);
            if (currentDistance <= shortestDistance) {
                shortestDistance = currentDistance;
                nearest = others[i];
            }
        }
        return nearest;
    };
    // Convert this vector into a unit vector.
    // Returns the length.
    Vec2.prototype.normalize = function (returnNew) {
        var length = this.length();
        // Collect a ratio to shrink the x and y coords
        var invertedLength = (length < Number.MIN_VALUE) ? 0 : 1 / length;
        if (!returnNew) {
            // Convert the coords to be greater than zero
            // but smaller than or equal to 1.0
            return this.set(this.x * invertedLength, this.y * invertedLength);
        }
        else {
            return new Vec2(this.x * invertedLength, this.y * invertedLength);
        }
    };
    // Determine if another `Vec2`'s components match this one's
    // also accepts 2 scalars
    Vec2.prototype.equal = function (v, w) {
        if (typeof v != 'number') {
            if (Array.isArray(v)) {
                w = v[1];
                v = v[0];
            }
            else {
                w = v.y;
                v = v.x;
            }
        }
        return (Vec2.clean(v) === this.x && Vec2.clean(w) === this.y);
    };
    // Return a new `Vec2` that contains the absolute value of
    // each of this vector's parts
    Vec2.prototype.abs = function (returnNew) {
        if (returnNew === void 0) { returnNew = undefined; }
        var x = Math.abs(this.x), y = Math.abs(this.y);
        if (returnNew) {
            return new Vec2(x, y);
        }
        else {
            return this.set(x, y);
        }
    };
    // Return a new `Vec2` consisting of the smallest values
    // from this vector and the incoming
    //
    // When returnNew is truthy, a new `Vec2` will be returned
    // otherwise the minimum values in either this or `v` will
    // be applied to this vector.
    Vec2.prototype.min = function (v, returnNew) {
        if (returnNew === void 0) { returnNew = undefined; }
        var tx = this.x, ty = this.y, vx = v.x, vy = v.y, x = tx < vx ? tx : vx, y = ty < vy ? ty : vy;
        if (returnNew) {
            return new Vec2(x, y);
        }
        else {
            return this.set(x, y);
        }
    };
    // Return a new `Vec2` consisting of the largest values
    // from this vector and the incoming
    //
    // When returnNew is truthy, a new `Vec2` will be returned
    // otherwise the minimum values in either this or `v` will
    // be applied to this vector.
    Vec2.prototype.max = function (v, returnNew) {
        var tx = this.x, ty = this.y, vx = v.x, vy = v.y, x = tx > vx ? tx : vx, y = ty > vy ? ty : vy;
        if (returnNew) {
            return new Vec2(x, y);
        }
        else {
            return this.set(x, y);
        }
    };
    // Clamp values into a range.
    // If this vector's values are lower than the `low`'s
    // values, then raise them.  If they are higher than
    // `high`'s then lower them.
    //
    // Passing returnNew as true will cause a new Vec2 to be
    // returned.  Otherwise, this vector's values will be clamped
    Vec2.prototype.clamp = function (low, high, returnNew) {
        var ret = this.min(high, true).max(low);
        if (returnNew) {
            return ret;
        }
        else {
            return this.set(ret.x, ret.y);
        }
    };
    // Perform linear interpolation between two vectors
    // amount is a decimal between 0 and 1
    Vec2.prototype.lerp = function (vec, amount, returnNew) {
        return this.add(vec.subtract(this, true).multiply(amount), returnNew);
    };
    // Get the skew vector such that dot(skew_vec, other) == cross(vec, other)
    Vec2.prototype.skew = function (returnNew) {
        if (!returnNew) {
            return this.set(-this.y, this.x);
        }
        else {
            return new Vec2(-this.y, this.x);
        }
    };
    // calculate the dot product between
    // this vector and the incoming
    Vec2.prototype.dot = function (b) {
        return Vec2.clean(this.x * b.x + b.y * this.y);
    };
    // calculate the perpendicular dot product between
    // this vector and the incoming
    Vec2.prototype.perpDot = function (b) {
        return Vec2.clean(this.x * b.y - this.y * b.x);
    };
    // Determine the angle between two vec2s
    Vec2.prototype.angleTo = function (vec) {
        return Math.atan2(this.perpDot(vec), this.dot(vec));
    };
    // Divide this vector's components by a scalar
    Vec2.prototype.divide = function (x, y, returnNew) {
        if (typeof x != 'number') {
            returnNew = y;
            if (Array.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            else {
                y = x.y;
                x = x.x;
            }
        }
        else if (typeof y != 'number') {
            returnNew = y;
            y = x;
        }
        if (x === 0 || y === 0) {
            throw new Error('division by zero');
        }
        if (isNaN(x) || isNaN(y)) {
            throw new Error('NaN detected');
        }
        if (returnNew) {
            return new Vec2(this.x / x, this.y / y);
        }
        return this.set(this.x / x, this.y / y);
    };
    Vec2.prototype.isPointOnLine = function (start, end) {
        return (start.y - this.y) * (start.x - end.x) ===
            (start.y - end.y) * (start.x - this.x);
    };
    Vec2.prototype.toArray = function () {
        return [this.x, this.y];
    };
    Vec2.prototype.fromArray = function (array) {
        return this.set(array[0], array[1]);
    };
    Vec2.prototype.toJSON = function () {
        return { x: this.x, y: this.y };
    };
    Vec2.prototype.toString = function () {
        return '(' + this.x + ', ' + this.y + ')';
    };
    Vec2.fromArray = function (array, ctor) {
        return new (ctor || Vec2)(array[0], array[1]);
    };
    Vec2.clean = function (val) {
        if (isNaN(val)) {
            throw new Error('NaN detected');
        }
        if (!isFinite(val)) {
            throw new Error('Infinity detected');
        }
        if (Math.round(val) === val) {
            return val;
        }
        return val;
    };
    ;
    return Vec2;
}());
;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Vec2;
