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
            str += 'Region ' + i + ':\n';
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
    setEdges: function(){
        var j=0;
        for(;j<this.outerRing[0].vertices.length-1;j++)
        {
            var edge=new Edge();
            edge.setRegion(this);
            edge.setPoints(this.outerRing[0].vertices[j],this.outerRing[0].vertices[j+1]);
            this.edges.push(edge);
        }
        var edge=new Edge();
        edge.setRegion(this);
        edge.setPoints(this.outerRing[0].vertices[j],this.outerRing[0].vertices[0]);
        this.edges.push(edge); 
        
        for(var i=0;i<this.innerRings.length;i++){
            var j=0;
            for(;j<this.innerRings[i].vertices.length-1;j++)
            {
                var edge=new Edge();
                edge.setRegion(this);
                edge.setPoints(this.innerRings[i].vertices[j],this.innerRings[i].vertices[j+1]);
                this.edges.push(edge);
            }
            var edge=new Edge();
            edge.setRegion(this);
            edge.setPoints(this.innerRings[i].vertices[j],this.innerRings[i].vertices[0]);
            this.edges.push(edge);            
        }
  
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
        var str = '\tOuter Ring:\n';
        str += '\t' + this.outerRing[0].print(true, html) + '\n';
        if (this.innerRings.length) {
            str += '\tInner Rings:\n';
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
            vertices[i].parent = this.id;
        }
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
        v.parent = this.id;
        this.vertices.splice(position, 0, v);
        return this;
    },

    pushVertex: function(x, y) {
        var v = new Point2D(x, y);
        v.parent = this.id;
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
        this.vertices[0].pre_edge_id=this.lastVertex().id;
        // this.sort();
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
        if(this.right_neighbour!=null){
            if(point.x<this.right_neighbour.x && this.id!=point.next_edge_id && this.id!=point.pre_edge_id 
            && this.pre_edge_id!=point.id && this.next_edge_id!=point.id){//不以斜边相连
                this.right_neighbour=point;
                return true;
            }
            else if((ALL_EDGE[this.id].left+ALL_EDGE[this.id].tilted)%2==1 || 
            (ALL_EDGE[point.id].left+ALL_EDGE[point.id].tilted)%2==1)//是右边则跳过这个点的右邻居更新
                return true;
            else
                return false;//没有更新
        }
        else{
            if(this.id!=point.next_edge_id && this.id!=point.pre_edge_id
                && this.pre_edge_id !=point.id && this.next_edge_id!=point.id){
                this.right_neighbour=point;
                return true;
            }
            else
                return false;//目前的右邻居还是null
        }
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

var ALL_EDGE=[];
function Edge(){
    this.id=0;
    this.start=null;
    this.end=null;
    this.region=null;
    this.tilted=false;
    this.left=false;
}

Object.assign(Edge.prototype,{
    setPoints:function(start,end){//传进来的是点
        this.id=start.id;
        this.start=start;
        this.end=end;
        this.tilted_or_not();
        if(!this.tilted)
            //水平边时直接定义右邻居，直接存点
            if (this.start.x<this.end.x) {
                this.start.right_neighbour=this.end;
            }
            else
                this.end.right_neighbour=this.start;
        ALL_EDGE.push(this);
        return this;
    },

    setRegion:function (region) {
        this.region=region;
        return this;
    },
    tilted_or_not: function(){
        if(this.start.x!=this.end.x && this.start.y==this.end.y){//水平边
            this.tilted=false;
            this.left=false;
        }
        else{
            this.tilted=true;
            this.left=this.left_or_not();
        }
        return this.tilted;
    },
    is_tilt: function () {
        return !(this.start.x!=this.end.x && this.start.y==this.end.y);
    },
    left_or_not:function(){
        if(this.start.id<this.region.outerRing[0].vertices.length){//外环上的点
          if(this.start.y>this.end.y)//由于坐标系的问题，修改了比较
              return false;
          else
              return true;
        }
        else{
          if(this.start.y>this.end.y)
              return true;
          else
              return false;        
      }
    }
});

