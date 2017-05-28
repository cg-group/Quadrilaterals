var current_polygon;
var current_region;
var current_ring;
var current_vertex;
var current_direction;
var in_tilt_mode;
var current_moving_vertex_id;
var current_neighbor_vertex_id;
var last_time_stamp;

function resetAll() {
    ALL_POLYGON = [];
    ALL_REGION = [];
    ALL_RING = [];
    ALL_POINT2D = [];

    current_polygon = new Polygon();
    current_region = new Region();
    current_ring = new Ring();
    current_vertex = null;
    current_direction = null;
    triggerTiltMode(false);
    current_ring.isOuterRing = true;
    current_polygon.pushRegion(current_region);
    current_region.setOuterRing(current_ring);
    clearCanvas(ctx);
    clearCanvas(ctx_mask);
    updateTextInfo();
}

function canvasMouseMove(e) {
    // console.log(1);
    var tmp = coordWindowToReal(e);
    var x = tmp.x;
    var y = tmp.y;
    if (in_tilt_mode) {
        if (current_moving_vertex_id >= 0) {
            drawMoveVertexPreview(x, y);
        }
    } else {
        drawIndicateInfo(x, y);
    }
}

function canvasMouseUp(e) {
    // console.log(e);
    var tmp = coordWindowToReal(e);
    var x = tmp.x;
    var y = tmp.y;
    if (in_tilt_mode) {
        if (last_time_stamp != e.timeStamp) {
            if (e.which == 1) {
                endMoveVertex(x, y);
            } else {
                cancelMoveVertex();
            }
        }
        // canvasMouseMove(e);
    } else {
        var c = candidateVertex(x, y);
        if (e.which == 1) {
            // 左键添加顶点
            addVertex(c.x, c.y);
        } else {
            // 其他按键封闭环
            closeRing(c.x, c.y);
        }
        canvasMouseMove(e);
    }
}

function canvasMouseOut(e) {
    // console.log(e);
    if (in_tilt_mode) return;
    if (e.screenX == 0 && e.screenY == 0) return;
    clearCanvas(ctx_mask);
}

function keyEvent(e) {
    // console.log(e.which);
    switch (e.which) {
        case 32: // space
            triggerTiltMode();
            break;
        case 82: // R
            $('#reset-btn').addClass('active');
            setTimeout(function() {
                $('#reset-btn').removeClass('active');
                resetAll();
            }, 800);
            break;
    }
}

function addRandomPoint() {
    do {
        var x = Math.floor(Math.random() * CANVAS_SIZE.width);
        var y = Math.floor(Math.random() * CANVAS_SIZE.height);
        var c = candidateVertex(x, y);
        var valid = checkCandidateVertexValid(x, y);
    } while (!valid[0]);
    addVertex(c.x, c.y);
}

function addVertex(x, y) {
    // 输入是待添加顶点，已经计算好确保是垂直、水平的
    // 如果当前环封闭，那么创建新环

    var valid = checkCandidateVertexValid(x, y);
    if (!valid[0]) {
        return false;
    }

    clearCanvas(ctx);
    if (current_ring == null) {
        createNewRing(x, y);
    }
    current_ring.pushVertex(x, y);
    current_polygon.draw(ctx);
    if (current_vertex != null) {
        if (current_direction == null) {
            current_direction = Math.abs(x - current_vertex.x) >= Math.abs(y - current_vertex.y) ? "vertical" : "horizontal";
            current_ring.direction = current_direction; // 奇数号顶点出发的边是current_direction方向
        } else {
            current_direction = current_direction == "horizontal" ? "vertical" : "horizontal";
        }
    }
    current_vertex = current_ring.lastVertex();
    updateTextInfo();
    return true;
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
        ring.isOuterRing = true;
        r.setOuterRing(ring);
        current_ring = ring;
    } else {
        // 在某区域内
        var ring = new Ring();
        ring.isOuterRing = false;
        current_region = regions[is_in];
        current_region.pushInnerRing(ring);
        current_ring = ring;
    }
}

function closeRing(x, y) {
    // 封闭当前多边形环
    if (current_ring == null || current_ring.vertices.length <= 1 || (current_ring.vertices.length == 2 && x == undefined)) {
        return;
    }
    var valid = checkCandidateVertexValid(x, y);
    // console.log(valid);
    if (!valid[1]) {
        return;
    }

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
        // console.log('边数是奇数，不能封闭');
        if (y == undefined) {
            current_ring.vertices.pop();
            current_vertex = current_ring.lastVertex();
            current_direction = current_direction == "horizontal" ? "vertical" : "horizontal";
            closeRing();
        } else {
            if (addVertex(x, y)) {
                closeRing();
            }
        }
    }
    updateTextInfo();
    clearCanvas(ctx_mask);
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

    var valid = checkCandidateVertexValid(c.x, c.y);

    if (current_ring != null && current_ring.vertices.length >= 2) {
        ctx_mask.save();
        ctx_mask.lineWidth = line_width;
        ctx_mask.strokeStyle = valid[1] ? '#e0e0e0' : '#ffccbc';
        ctx_mask.beginPath();
        var p = current_vertex;
        var p0 = current_ring.vertices[0];
        if (current_ring.vertices.length % 2 == 0) {
            p = c;
        }
        var p1 = candidateVertex2(c.x, c.y);
        ctx_mask.moveTo(p.x, p.y);
        ctx_mask.lineTo(p1.x, p1.y);
        ctx_mask.lineTo(p0.x, p0.y);
        ctx_mask.stroke();
        ctx_mask.restore();
    }

    if (current_vertex != null) {
        ctx_mask.save();
        ctx_mask.lineWidth = line_width;
        ctx_mask.strokeStyle = valid[0] ? '#558b2f' : '#d84315';
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

function candidateVertex2(x, y) {
    // 输入的是经过candidateVertex计算的坐标
    // 输入插入的坐标点(自动补全的灰色线的拐弯点)
    if (y == undefined) {
        var p = current_ring.vertices[current_ring.vertices.length - 2];
        var q = current_ring.vertices[0];
        if (current_direction == "horizontal") {
            return {
                x: p.x,
                y: q.y
            };
        } else {
            return {
                x: q.x,
                y: p.y
            }
        }
    } else {
        var p = current_vertex;
        var p0 = current_ring.vertices[0];
        var direction = current_direction;
        if (current_ring.vertices.length % 2 == 0) {
            p = {
                x: x,
                y: y
            };
            direction = current_direction == "horizontal" ? "vertical" : "horizontal";
        }
        if (direction == "horizontal") {
            return {
                x: p0.x,
                y: p.y
            };
        } else {
            return {
                x: p.x,
                y: p0.y
            };
        }
    }
}

function checkCandidateVertexValid(x, y) {
    // 输入: candidateVertex函数计算后的坐标
    // 不能与当前多边形内已有任何边严格相交，触碰、重合可以
    if (current_vertex == null) {
        return [true, true];
    }
    if (y == undefined) {
        x = current_vertex.x;
        y = current_vertex.y;
    }
    var r1 = true,
        r2 = true;
    var c = {
        x: x,
        y: y
    }

    var p = current_vertex;
    var p0 = current_ring.vertices[0];
    if (current_ring.vertices.length % 2 == 0) {
        p = c;
    }
    var p1 = candidateVertex2(c.x, c.y);
    // p0: ring的起点
    // p1: 封闭多边形前最后一个顶点
    // p: 当前已经确认的最后一个顶点(黑色)
    // c: 鼠标绿点

    // current_ring.vertices.length % 2 == 0的时候，首先从ring最后一点连到p，再从p连到p1，再从p1连到p0
    for (var i = 0; i < current_polygon.regions.length; i++) {
        var region = current_polygon.regions[i];
        var rings = region.outerRing.concat(region.innerRings);
        for (var j = 0; j < rings.length; j++) {
            var ring = rings[j];
            for (var k = 0; k < ring.vertices.length - 1; k++) {
                if (intersectionTest(current_vertex, c, ring.vertices[k], ring.vertices[k + 1]) == 'intersect') {
                    r1 = false;
                    if (current_ring.vertices.length % 2 == 0) {
                        r2 = false;
                    }
                }
                if (intersectionTest(p, p1, ring.vertices[k], ring.vertices[k + 1]) == 'intersect' || intersectionTest(p0, p1, ring.vertices[k], ring.vertices[k + 1]) == 'intersect') {
                    r2 = false;
                }
            }
            if (ring.closed) {
                if (intersectionTest(current_vertex, c, ring.vertices[0], ring.lastVertex()) == 'intersect') {
                    r1 = false;
                    if (current_ring.vertices.length % 2 == 0) {
                        r2 = false;
                    }
                }
                if (intersectionTest(p, p1, ring.vertices[0], ring.lastVertex()) == 'intersect' || intersectionTest(p0, p1, ring.vertices[0], ring.lastVertex()) == 'intersect') {
                    r2 = false;
                }
            }
        }
    }
    return [r1, r2];
}

function saveImage() {
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    window.location.href = image;
}

function updateTextInfo() {
    var str = current_polygon.print(true, true);
    str = str.split('\n').join('<br>');
    str = str.split('\t').join('&nbsp;&nbsp;');
    str = str.split('Region').join('<orange>Region</orange>');
    str = str.split('Outer Ring').join('<green>Outer Ring</green>');
    str = str.split('Inner Rings').join('<green>Inner Rings</green>');
    str = str.split('->').join('<red>-&gt;</red>');
    str = str.split('closed').join('<indigo>closed</indigo>');

    $('#info').html(str);
}


function triggerTiltMode(enable) {
    if (!(current_ring === null) && !(enable === false)) {
        // 必须是封闭的状态
        $('#tilt-mode-btn').addClass('active');
        Materialize.toast('当前环未封闭', 800);
        setTimeout(function() {
            $('#tilt-mode-btn').removeClass('active');
        }, 800);
        return;
    }
    if (enable == undefined) {
        in_tilt_mode ^= true;
    } else {
        in_tilt_mode = enable;
    }
    if (in_tilt_mode) {
        $('#tilt-mode-btn').addClass('active');
        clearCanvas(ctx_mask);
        showVertices();
        current_moving_vertex_id = -1;
    } else {
        $('#tilt-mode-btn').removeClass('active');
        hideVertices();
        current_moving_vertex_id = -1;
    }
}

function showVertices() {
    ALL_POINT2D.forEach(function(e, i) {
        var left = 100 * e.x / CANVAS_SIZE.width + '%';
        var top = 100 * e.y / CANVAS_SIZE.height + '%';
        var div = $('<div>')
            .attr('id', 'vertex_' + i)
            .addClass('vertex')
            .css('left', left)
            .css('top', top);
        div.mouseup(function(e) {
            last_time_stamp = e.timeStamp;
            startMoveVertex($(e.target));
        });
        $('#vertices-container').append(div);
    });
    $('canvas').css('cursor', 'default');
}

function hideVertices() {
    $('.vertex').remove();
    $('canvas').css('cursor', 'crosshair');
}

function startMoveVertex($t) {
    // console.log(id);
    if (current_moving_vertex_id == -1) {
        $('#mask').css('z-index', '1').css('cursor', 'move');
        $('.vertex').removeClass('active');
        $t.addClass('active');
        current_moving_vertex_id = $t.attr('id').split('_')[1];
        current_neighbor_vertex_id = getNeighborVertex(current_moving_vertex_id);
    }
}

function endMoveVertex(x, y) {
    var id = current_moving_vertex_id;
    if (id >= 0) {
        var id_neighbor = getNeighborVertex(id);
        var v = ALL_POINT2D[id];
        var v_neighbor = ALL_POINT2D[id_neighbor];
        var c = {
            x: x,
            y: v.y
        }

        var valid = true; // @TODO

        if (valid) {
			v.x = x;
        }

		clearCanvas(ctx);
        current_polygon.draw(ctx);
		updateTextInfo();
    }

    current_moving_vertex_id = -1;
    $('#mask').css('z-index', '0').css('cursor', 'default');
    $('.vertex').removeClass('active');
	clearCanvas(ctx_mask);
}

function cancelMoveVertex() {
    var id = current_moving_vertex_id;
    if (id >= 0) {
        var v = ALL_POINT2D[id];
        $('#vertex_' + id).css('left', 100 * v.x / CANVAS_SIZE.width + '%').css('top', 100 * v.y / CANVAS_SIZE.height + '%');
    }
    current_moving_vertex_id = -1;
    $('#mask').css('z-index', '0').css('cursor', 'default');
    $('.vertex').removeClass('active');
	clearCanvas(ctx_mask);
}

function drawMoveVertexPreview(x, y) {
    clearCanvas(ctx_mask);

    var radius = CANVAS_SCALE * 2;
    var line_width = CANVAS_SCALE;

    var id = current_moving_vertex_id;
    var id_neighbor = getNeighborVertex(id);
    var v = ALL_POINT2D[id];
    var v_neighbor = ALL_POINT2D[id_neighbor];
    var c = {
        x: x,
        y: v.y
    }

    $('#vertex_' + id).css('left', 100 * c.x / CANVAS_SIZE.width + '%').css('top', 100 * c.y / CANVAS_SIZE.height + '%');
    $('#vertex_' + id_neighbor).addClass('active');

    var valid = true;
	// @TODO: 实现一个函数，判断当前移动这个顶点到这个位置是否合法。
	// 注意，多边形的其他部分都是已经固定了的，只有这个顶点在移动，所以目测只需要拿着这个顶点去遍历其他顶点（or边）就行
	// 预期的复杂度是O(N)
	// f(current_polygon, v, c); //注意，现在顶点、环、区域都有parent属性，parent记录了它parent的id，
	//							// 比如，顶点v的parent id是23，那么ALL_RING[23]就是对应的环。



    // 三个点: v、c、v_neighbor，在mask层绘制半透明三角形
    ctx_mask.save();
    ctx_mask.lineWidth = line_width;
    ctx_mask.strokeStyle = valid ? 'rgba(100, 100, 100, 0.3)' : 'rgba(100, 50, 50, 0.3)';
    ctx_mask.fillStyle = valid ? 'rgba(200, 200, 200, 0.3)' : 'rgba(200, 100, 100, 0.3)';
    ctx_mask.beginPath();
    ctx_mask.moveTo(v.x, v.y);
    ctx_mask.lineTo(c.x, c.y);
    ctx_mask.lineTo(v_neighbor.x, v_neighbor.y);
    ctx_mask.lineTo(v.x, v.y);
    ctx_mask.fill();
    ctx_mask.stroke();
    ctx_mask.restore();
}

function getNeighborVertex(id) {
    // 返回与第id个点相连的倾斜边的另一个端点

    // 复杂度与环大小成正比，不要频繁使用此函数
    var v = ALL_POINT2D[id];
    var r = ALL_RING[v.parent];
    var n = r.vertices.length;
    var idx;
    for (var i = 0; i < n; i++) {
        if (r.vertices[i].id == v.id) {
            idx = i;
            break;
        }
    }
    if ((idx % 2 == 1) ^ (r.direction == 'vertical')) {
        return r.vertices[(idx + n - 1) % n].id;
    } else {
        return r.vertices[(idx + 1) % n].id;
    }
}
function scan(){
    current_region.setEdges();
    //sort_points_by_x(current_region);
    scanline(current_region);
    sort_leftEdges_by_rightmost(current_region);

}
