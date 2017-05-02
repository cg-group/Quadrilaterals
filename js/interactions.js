var current_polygon;
var current_region;
var current_ring;
var current_vertex;
var current_direction;

(function resetAll() {
    current_polygon = new Polygon();
    current_region = new Region();
    current_ring = new Ring();
    current_vertex = null;
    current_direction = null;
    current_polygon.pushRegion(current_region);
    current_region.setOuterRing(current_ring);
})();

function canvasMouseMove(e) {
    var tmp = coordWindowToReal(e);
    var x = tmp.x;
    var y = tmp.y;
    drawIndicateInfo(x, y);
}

function canvasMouseUp(e) {
    // console.log(e);
    var tmp = coordWindowToReal(e);
    var x = tmp.x;
    var y = tmp.y;

    if (e.which == 1) {
        var c = candidateVertex(x, y);
        clearCanvas(ctx);
        current_ring.pushVertex(c.x, c.y);
        current_polygon.draw(ctx);
        if (current_vertex != null) {
            if (current_direction == null) {
                current_direction = Math.abs(x - current_vertex.x) >= Math.abs(y - current_vertex.y) ? "vertical" : "horizontal";
            } else {
                current_direction = current_direction == "horizontal" ? "vertical" : "horizontal";
            }
        }
        current_vertex = current_ring.vertices[current_ring.vertices.length - 1];
        canvasMouseMove(e);
    } else {
        // 封闭多边形
        if (current_direction == "horizontal") {
            current_ring.pushVertex(current_ring.vertices[0].x, current_vertex.y);
        } else {
            current_ring.pushVertex(current_vertex.x, current_ring.vertices[0].y);
        }
        current_ring.close();

        clearCanvas(ctx);
        current_polygon.draw(ctx);

        current_vertex = null;
        current_direction = null;
    }
}

function coordWindowToReal(e) {
    // console.log(e);
    var x = e.offsetX;
    var y = e.offsetY;
    x /= $canvas.width() / CANVAS_SIZE.width;
    y /= $canvas.height() / CANVAS_SIZE.height;
    x = Math.min(x, CANVAS_SIZE.width);
    y = Math.min(y, CANVAS_SIZE.height);
    x = Math.max(x, 0);
    y = Math.max(y, 0);
    return {
        x: Math.round(x),
        y: Math.round(y)
    };
}

function clearCanvas(context) {
    context.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
}

function generateRandomColor() {
    var colors = ['#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775', '#fff176', '#ffd54f', '#ffb74d', '#ff8a65'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawIndicateInfo(x, y) {
    var radius = CANVAS_SCALE * 2;
    var line_width = CANVAS_SCALE;

    clearCanvas(ctx_mask);
    var c = candidateVertex(x, y);
    if (current_vertex != null) {
        ctx_mask.save();
        ctx_mask.lineWidth = line_width;
        ctx_mask.strokeStyle = '#e0e0e0';
        ctx_mask.beginPath();
        ctx_mask.moveTo(current_vertex.x, current_vertex.y);
        ctx_mask.lineTo(c.x, c.y);
        ctx_mask.stroke();
        ctx_mask.restore();
    }
    ctx_mask.save();
    ctx_mask.fillStyle = '#607d8b';
    ctx_mask.fillRect(c.x - radius, c.y - radius, 2 * radius + 1, 2 * radius + 1);
    ctx_mask.restore();
}

function candidateVertex(x, y) {
    if (current_vertex == null) {
        return {
            x: x,
            y: y
        };
    } else {
        var direction = current_direction;
        if (current_direction == null) {
            direction = Math.abs(x - current_vertex.x) < Math.abs(y - current_vertex.y) ? "vertical" : "horizontal";
        }
        if (direction == "horizontal") {
            direction = "vertical";
            return {
                x: x,
                y: current_vertex.y
            };
        } else {
            direction = "horizontal";
            return {
                x: current_vertex.x,
                y: y
            };
        }
    }
}
