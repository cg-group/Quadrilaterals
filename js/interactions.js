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
		// 左键添加顶点
		var c = candidateVertex(x, y);
		addVertex(c.x, c.y);
    } else {
		// 其他按键封闭环
        closeRing();
    }
    canvasMouseMove(e);
}

function addVertex(x, y) {
	// 输入是待添加顶点，已经计算好确保是垂直、水平的
	// 如果当前环封闭，那么创建新环
	clearCanvas(ctx);
	if (current_ring == null) {
		createNewRing(x, y);
	}
	current_ring.pushVertex(x, y);
	current_polygon.draw(ctx);
	if (current_vertex != null) {
		if (current_direction == null) {
			current_direction = Math.abs(x - current_vertex.x) >= Math.abs(y - current_vertex.y) ? "vertical" : "horizontal";
		} else {
			current_direction = current_direction == "horizontal" ? "vertical" : "horizontal";
		}
	}
	current_vertex = current_ring.vertices[current_ring.vertices.length - 1];
}

function createNewRing(x, y) {
	// 判断坐标x y在哪里，
	// 如果在某个区域内部，那么创建一个内环，
	// 如果不在任何一个区域内，那么创建一个区域及外环
	// 在边界上暂时作为区域外处理
	var regions = current_polygon.regions;
	var is_in = -1;
	for (var i = 0; i < regions.length; i++) {
		var status = regions[i].includingPoint(x, y);
		if (status == "in") {
			is_in = i;
			break;
		}
	}
	if (is_in == -1) {
		// 不在任何区域内，或在边界上
		var r = new Region();
		current_polygon.pushRegion(r);
		current_region = r;
		var ring = new Ring();
		r.setOuterRing(ring);
		current_ring = ring;
	} else {
		// 在某区域内
		var ring = new Ring();
		current_region.pushInnerRing(ring);
		current_ring = ring;
	}
}

function closeRing() {
	// 封闭当前多边形环
	if (current_ring.vertices.length % 2 == 1) {
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
		current_ring = null;
	} else {
		console.log('边数是奇数，不能封闭');
	}
}

function coordWindowToReal(e) {
	// 将鼠标在canvas上的偏移量转换成canvas中实际的坐标
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
	// 输入当前鼠标坐标
	// 在mask层绘制提示的线、顶点
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
	// 输入当前鼠标坐标
	// 输出一个坐标，如果现在按下鼠标，那么创建的点就是这个坐标点
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
