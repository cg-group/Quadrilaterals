function Polygon() {
    this.regions = [];
    this.type = "Polygon";
}

Object.assign(Polygon.prototype, {
    setRegions: function(regions) {
        this.regions = regions;
        return this;
    },

    clone: function() {
        var polygon = new Polygon();
        polygon.copy(this);
        return polygon;
    },

    copy: function(polygon) {
        this.regions = [];
        for (var i = 0; i < polygon.regions.length; i++) {
            this.regions.push(polygon.regions[i].clone());
        }
        return this;
    },

    pushRegion: function(region) {
        this.regions.push(region);
        return this;
    },

    draw: function(context) {
        for (var i = 0; i < this.regions.length; i++) {
            this.regions[i].draw(context);
        }
    },

    print: function(do_not_print) {
        var str = '';
        for (var i = 0; i < this.regions.length; i++) {
            str += 'Region ' + i + ':\n';
            str += this.regions[i].print(true);
        }
        if (!do_not_print) {
            console.log(str);
        }
        return str;
    }
});

function Region() {
    this.outerRing = [];
    this.innerRings = [];
    this.type = "Region";
}

Object.assign(Region.prototype, {
    setOuterRing: function(ring) {
        this.outerRing = [ring];
        return this;
    },

    setInnerRings: function(rings) {
        this.innerRings = rings;
        return this;
    },

    clone: function() {
        var region = new Region();
        region.copy(this);
        return region;
    },

    copy: function(region) {
        this.outerRing = [];
        for (var i = 0; i < region.outerRing.length; i++) {
            this.outerRing.push(region.outerRing[i].clone());
        }
        this.innerRings = [];
        for (var i = 0; i < region.innerRings.length; i++) {
            this.innerRings.push(region.innerRings[i].clone());
        }
        return this;
    },

    pushInnerRing: function(ring) {
        this.innerRings.push(ring);
        return this;
    },

    includingPoint: function(x, y) {
        // 判断是否包含某个坐标点，返回 in out 或者 boundary
        // 如果在任意一个内环内，那么就是外部
        // 否则，如果在外环内，那么是内部
        // @TODO

        return "out";
    },

    draw: function(context) {
        if (this.outerRing.length == 0) {
            return;
        }
        // 1. fill
        context.save();
        context.shadowColor = "rgba(0,0,0,0.3)";
        context.shadowOffsetY = 2 * CANVAS_SCALE;
        context.shadowOffsetX = 1 * CANVAS_SCALE;
        context.shadowBlur = 5 * CANVAS_SCALE;
        context.fillStyle = this.outerRing[0].color;

        context.beginPath();

        this.outerRing[0].draw(context);
        for (var i = 0; i < this.innerRings.length; i++) {
            this.innerRings[i].draw(context);
        }

        context.fill('evenodd');
        context.restore();

        // 2. stroke
        this.outerRing[0].drawPath(context);
        for (var i = 0; i < this.innerRings.length; i++) {
            this.innerRings[i].drawPath(context);
        }

        // 3. vertices
        this.outerRing[0].drawVertices(context);
        for (var i = 0; i < this.innerRings.length; i++) {
            this.innerRings[i].drawVertices(context);
        }
    },

    print: function(do_not_print) {
        var str = '\tOuter Ring:\n';
        str += '\t' + this.outerRing[0].print(true) + '\n';
        if (this.innerRings.length) {
            str += '\tInner Rings:\n';
        }
        for (var i = 0; i < this.innerRings.length; i++) {
            str += '\t' + this.innerRings[i].print(true) + '\n';
        }
        if (!do_not_print) {
            console.log(str);
        }
        return str;
    }
});

function Ring() {
    this.vertices = [];
    this.closed = false;
    this.color = generateRandomColor();
    this.isOuterRing = true;
    this.type = "Ring";
}

Object.assign(Ring.prototype, {
    setVertices: function(vertices) {
        this.vertices = vertices;
        return this;
    },

    clone: function() {
        var ring = new Ring();
        ring.copy(this);
        return ring;
    },

    copy: function(ring) {
        this.vertices = [];
        for (var i = 0; i < ring.vertices.length; i++) {
            this.vertices.push(ring.vertices[i].clone());
        }
        this.closed = ring.closed;
        return this;
    },

    insertVertex: function(position, x, y) {
        var v = new Point2D(x, y);
        this.vertices.splice(position, 0, v);
        return this;
    },

    pushVertex: function(x, y) {
        var v = new Point2D(x, y);
        this.vertices.push(v);
        return this;
    },

    includingPoint: function(x, y) {
        // @TODO
    },

    close: function() {
        this.closed = true;
        // this.sort();
    },

    lastVertex: function() {
        if (this.vertices.length) {
            return this.vertices[this.vertices.length - 1];
        }
    },

    // sort: function() {
    //     // 事实上，只需要判断当前是不是正确的顺序就行,因为如果多边形合法，那么相当于已经排好了
    //     // 如果顺序不正确，就使用this.vertices.reverse();颠倒一下数组
    //
    //     var isClockwise;// @TODO
    //
    //     if (!(this.isOuterRing ^ isClockwise)) {
    //         this.vertices.reverse();
    //     }
    // },

    draw: function(context) {
        if (!this.vertices.length) {
            return;
        }

        if (this.closed) {
            context.moveTo(this.vertices[0].x, this.vertices[0].y);
            for (var i = 1; i < this.vertices.length; i++) {
                context.lineTo(this.vertices[i].x, this.vertices[i].y);
            }
            context.closePath();
        }
    },

    drawPath: function(context) {
        if (!this.vertices.length) {
            return;
        }

        if (!this.closed) {
            context.save();
            context.lineWidth = CANVAS_SCALE;
            context.strokeStyle = "black";
            context.beginPath();
            context.moveTo(this.vertices[0].x, this.vertices[0].y);
            for (var i = 1; i < this.vertices.length; i++) {
                context.lineTo(this.vertices[i].x, this.vertices[i].y);
            }
            context.stroke();
            context.restore();
        }
    },

    drawVertices: function(context) {
        if (!this.vertices.length) {
            return;
        }

        for (var i = 0; i < this.vertices.length; i++) {
            this.vertices[i].draw(context, '#009688', 2);
        }
    },

    print: function(do_not_print) {
        var str = '';
        for (var i = 0; i < this.vertices.length; i++) {
            str += this.vertices[i].print(true);
            if (i != this.vertices.length - 1) {
                str += '->';
            }
        }
        if (this.closed) {
            str += ' closed';
        }
        if (!do_not_print) {
            console.log(str);
        }
        return str;
    }
});

function Point2D(x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.type = "Point2D";
}

Object.assign(Point2D.prototype, {
    set: function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    },

    clone: function() {
        return new this.constructor(this.x, this.y);
    },

    copy: function(point) {
        this.x = point.x;
        this.y = point.y;
        return this;
    },

    draw: function(context, color, radius) {
        radius *= CANVAS_SCALE;
        context.save();
        context.fillStyle = color;
        context.fillRect(this.x - radius, this.y - radius, 2 * radius + 1, 2 * radius + 1);
        context.restore();

    },

    print: function(do_not_print) {
        var str = '(' + this.x + ', ' + this.y + ')';
        if (!do_not_print) {
            console.log(str);
        }
        return str;
    }
});
