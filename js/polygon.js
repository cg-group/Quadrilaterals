var ALL_POLYGON = [];

function Polygon() {
    this.regions = [];
    this.type = "Polygon";
    this.id = ALL_POLYGON.length;
    ALL_POLYGON.push(this);
}

Object.assign(Polygon.prototype, {
    setRegions: function(regions) {
        for (var i = 0; i < regions.length; i++) {
            regions[i].parent = this.id;
        }
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
        region.parent = this.id;
        return this;
    },

    draw: function(context) {
        for (var i = 0; i < this.regions.length; i++) {
            this.regions[i].draw(context);
        }
    },

    print: function(do_not_print, html) {
        var str = '';
        for (var i = 0; i < this.regions.length; i++) {
            // str += 'Region ' + i + ':\n';
            str += this.regions[i].print(true, html);
        }
        if (html) {
            str = '<polygon data-id="' + this.id + '">' + str + '</polygon>';
        }
        if (!do_not_print) {
            console.log(str);
        }
        return str;
    }
});

var ALL_REGION = [];

function Region() {
    this.outerRing = [];
    this.innerRings = [];
    this.edges=[];
    this.type = "Region";
    this.id = ALL_REGION.length;
    ALL_REGION.push(this);
}

Object.assign(Region.prototype, {
    setOuterRing: function(ring) {
        ring.parent = this.id;
        this.outerRing = [ring];
        return this;
    },

    setInnerRings: function(rings) {
        for (var i = 0; i < rings.length; i++) {
            rings[i].parent = this.id;
        }
        this.innerRings = rings;
        return this;
    },

    getVertices: function () {
        var list = [];
        this.innerRings.forEach(function (r) {
            list = list.concat(r.getVertices());
        });
        this.outerRing.forEach(function (r) {
            list = list.concat(r.getVertices());
        });
        return list;
    },

    get_edges: function () {
        var edges = [];
        var j = 0;
        for (; j < this.outerRing[0].vertices.length - 1; j++) {
            var edge = new Edge();
            edge.setRegion(this);
            edge.setPoints(this.outerRing[0].vertices[j], this.outerRing[0].vertices[j + 1]);
            edges.push(edge);
        }
        var edge = new Edge();
        edge.setRegion(this);
        edge.setPoints(this.outerRing[0].vertices[j], this.outerRing[0].vertices[0]);
        edges.push(edge);

        for (var i = 0; i < this.innerRings.length; i++) {
            var j = 0;
            for (; j < this.innerRings[i].vertices.length - 1; j++) {
                var edge = new Edge();
                edge.setRegion(this);
                edge.setPoints(this.innerRings[i].vertices[j], this.innerRings[i].vertices[j + 1]);
                edges.push(edge);
            }
            var edge = new Edge();
            edge.setRegion(this);
            edge.setPoints(this.innerRings[i].vertices[j], this.innerRings[i].vertices[0]);
            edges.push(edge);
        }
        this.edges = edges;
        return edges;
        //console.log(this.edges);//这个区域的边
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
        ring.parent = this.id;
        this.innerRings.push(ring);
        return this;
    },

    includingPoint: function(x, y) {
        // 判断是否包含某个坐标点，返回 in out 或者 boundary
        // 如果在任意一个内环内，那么就是外部
        // 否则，如果在外环内，那么是内部
        for (var i = 0; i < this.innerRings.length; i++) {
            if (this.innerRings[i].includingPoint(x, y) == "in") {
                return "out";
            }
        }
        if (this.outerRing[0].includingPoint(x, y) == "in") {
            return "in";
        }
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
        // this.outerRing[0].drawVertices(context);
        // for (var i = 0; i < this.innerRings.length; i++) {
        //     this.innerRings[i].drawVertices(context);
        // }
    },

    print: function(do_not_print, html) {
        var str = 'Outer Ring:\n';
        str += '\t' + this.outerRing[0].print(true, html) + '\n';
        if (this.innerRings.length) {
            str += 'Inner Rings:\n';
        }
        for (var i = 0; i < this.innerRings.length; i++) {
            str += '\t' + this.innerRings[i].print(true, html) + '\n';
        }
        if (html) {
            str = '<region data-id="' + this.id + '">' + str + '</region>';
        }
        if (!do_not_print) {
            console.log(str);
        }
        return str;
    }
});

var ALL_RING = [];

function Ring() {
    this.vertices = [];
    this.closed = false;
    this.color = generateRandomColor();
    this.isOuterRing = true;
    this.type = "Ring";
    this.id = ALL_RING.length;
    ALL_RING.push(this);
}

Object.assign(Ring.prototype, {
    setVertices: function(vertices) {
        for (var i = 0; i < vertices.length; i++) {
            if (this.parent == undefined) break;
            vertices[i].parent = this.id;
        }
        this.vertices = vertices;
        return this;
    },

    getVertices: function () {
        return this.vertices;
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
        if (this.parent != undefined) {
            v.parent = this.id;
        }
        this.vertices.splice(position, 0, v);
        return this;
    },

    pushVertex: function(x, y) {
        var v = new Point2D(x, y);
        if (this.parent != undefined) {
            v.parent = this.id;
        }
        this.vertices.push(v);
        return this;
    },

    includingPoint: function(x, y) {

        var crossings = 0;
        var n = this.vertices.length;
        for (var i = 0; i < n; i++) {
            var slope = (this.vertices[(i + 1) % n].y - this.vertices[i].y) / (this.vertices[(i + 1) % n].x - this.vertices[i].x);
            var cond1 = (this.vertices[i].x <= x) && (x < this.vertices[(i + 1) % n].x);
            var cond2 = (this.vertices[(i + 1) % n].x <= x) && (x < this.vertices[i].x);
            var above = (y < slope * (x - this.vertices[i].x) + this.vertices[i].y);
            if ((cond1 || cond2) && above) crossings++;
        }
        if (crossings % 2 != 0)
            return "in";
        else
            return "out";
    },

    close: function() {
        this.closed = true;
        this.sort();
        this.vertices[0].pre_edge_id=this.lastVertex().id;
    },

    sort: function() {
        // 将顶点排为逆时针
        var sum = 0;
        var n = this.vertices.length;
        for (var i = 0; i < n; i++) {
            var v1 = this.vertices[i];
            var v2 = this.vertices[(i + 1) % n];
            sum += (v2.x - v1.x) * (v2.y + v1.y);
        }
        if (sum < 0) {
            // 顺时针
            console.log('顺时针');
            for (var i = 0; i < n / 2; i++) {
                var j = n - i - 1;
                var c;
                c = this.vertices[i].x;
                this.vertices[i].x = this.vertices[j].x;
                this.vertices[j].x = c;
                c = this.vertices[i].y;
                this.vertices[i].y = this.vertices[j].y;
                this.vertices[j].y = c;
            }
        } else {
            console.log('逆时针');
        }
    },

    lastVertex: function() {
        if (this.vertices.length) {
            return this.vertices[this.vertices.length - 1];
        }
    },

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

    drawPath_closed: function (context, fill, lineWidth) {
        if (!this.vertices.length) {
            return;
        }

        if (!this.closed) {
            context.save();
            context.lineWidth = lineWidth ? lineWidth : CANVAS_SCALE;
            context.fillStyle = fill ? fill : "gray";
            context.strokeStyle = "black";
            context.beginPath();
            var l = this.vertices.length;
            context.moveTo(this.vertices[l - 1].x, this.vertices[l - 1].y);
            for (var i = 0; i < this.vertices.length; i++) {
                context.lineTo(this.vertices[i].x, this.vertices[i].y);
            }
            context.stroke();
            context.fill();
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

    print: function(do_not_print, html) {
        var str = '';
        for (var i = 0; i < this.vertices.length; i++) {
            str += this.vertices[i].print(true, html);
            if (i != this.vertices.length - 1) {
                str += '->';
            }
        }
        if (this.closed) {
            str += ' closed';
        }
        if (html) {
            str = '<ring data-id="' + this.id + '">' + str + '</ring>';
        }
        if (!do_not_print) {
            console.log(str);
        }
        return str;
    }
});

var ALL_POINT2D = [];

function Point2D(x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.type = "Point2D";
    this.id = ALL_POINT2D.length;
    this.next_edge_id=this.id;
    this.pre_edge_id=this.id-1||0;
    this.right_neighbour=null;//有的顶点可能没有右邻居，
    ALL_POINT2D.push(this);
}

Object.assign(Point2D.prototype, {
    set: function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    },
    updateRight_neighbour: function(point){
        this.right_neighbour=point;
    },

    get_right_neighbour: function () {
        return this.right_neighbour;
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

    print: function(do_not_print, html) {
        var str = '(' + this.x + ', ' + this.y + ')';
        if (html) {
            str = '<point2d data-id="' + this.id + '">' + str + '</point2d>';
        }
        if (!do_not_print) {
            console.log(str);
        }
        return str;
    }
});

var ALL_EDGE = [];

function Edge() {
    this.id = 0;
    this.start = null;
    this.end = null;
    this.region = null;
    this.tilted = false;
    this.left = false;
}

Object.assign(Edge.prototype, {
    setPoints: function (start, end) {//传进来的是点
        this.id = start.id;
        this.start = start;
        this.end = end;
        if (!this.is_tilt())
        //水平边时直接定义右邻居，直接存点
            if (this.start.x < this.end.x) {
                this.start.right_neighbour = this.end;
            }
            else
                this.end.right_neighbour = this.start;
        ALL_EDGE.push(this);
        return this;
    },

    setRegion: function (region) {
        this.region = region;
        return this;
    },
    //tilted_or_not: function(){
    //    if(this.start.x!=this.end.x && this.start.y==this.end.y){//水平边
    //        this.tilted=false;
    //        //this.left=false;
    //    }
    //    else{
    //        this.tilted=true;
    //        //this.left=this.left_or_not();
    //    }
    //    return this.tilted;
    //},
    is_tilt: function () {
        return !(this.start.x != this.end.x && this.start.y == this.end.y);
    },
    is_left: function () {
        if (!this.is_tilt()) return false;
        if (this.start.id < this.region.outerRing[0].vertices.length) {//外环上的点
            return this.start.y <= this.end.y; //由于坐标系的问题，修改了比较
        }
        else {
            return this.start.y > this.end.y;
        }
    },

    is_outer: function () {
        return this.start.id < this.region.outerRing[0].vertices.length;
    },

    to_string: function () {
        return this.start.x + "-" + this.start.y + "\t" + this.end.x + "-" + this.end.y;
    },
    print: function () {
        console.log(this.to_string());
    }
});


var ALL_CHORD = [];

function Chord() {
    this.id = -1;
    this.start = null;
    this.end = null;
    this.region = null;
}

Object.assign(Chord.prototype, {
    from_edge: function (edge) {
        return this.setPoints(edge.start, edge.end);
    },
    setPoints: function (start, end) {
        this.id = start.id + "-" + end.id;
        this.start = start;
        this.end = end;
        return this;
    },

    reverse: function () {
        this.setPoints(this.end, this.start);
        return this;
    },

    setRegion: function (region) {
        this.region = region;
        return this;
    },
    is_tilt: function () {
        return !(this.start.x != this.end.x && this.start.y == this.end.y);
    },
    is_left: function () {
        if (!this.is_tilt()) return false;
        if (this.start.id < this.region.outerRing[0].vertices.length) {//外环上的点
            return this.start.y <= this.end.y; //由于坐标系的问题，修改了比较
        }
        else {
            return this.start.y > this.end.y;
        }
    },

    to_string: function () {
        return this.start.x + "-" + this.start.y + "\t" + this.end.x + "-" + this.end.y;
    },
    print: function () {
        console.log(this.to_string());
    }
});
