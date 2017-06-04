function toLeftTest(p, q, s) {
    // s在pq向量的
    // 左边: <0
    // 右边: >0
    // 上面: =0
    return p.x * q.y - p.y * q.x +
        q.x * s.y - q.y * s.x +
        s.x * p.y - s.y * p.x;
}

function vector_from_to(p, q) {
    return {
        x: q.x - p.x,
        y: q.y - p.y
    };
}

function dot_product(v1, v2) {
    return v1.x * v2.x + v1.y + v2.y;
}

function intersectionTest(p, q, s, t) {
    // 判断线段pq与st相交情况

    // @TODO: (严格地)检验正确性，特别是边界情况，重合什么的
    var a = toLeftTest(p, q, s);
    var b = toLeftTest(p, q, t);
    var c = toLeftTest(s, t, p);
    var d = toLeftTest(s, t, q);
    if (a * b < 0 && c * d < 0) {
        // 严格相交
        return 'intersect';
    }
    if ((a * b == 0 && a + b != 0 && c * d <= 0) || (c * d == 0 && c + d != 0 && a * b <= 0)) {
        // 端点触碰
        return 'touch';
    }
    if (a == 0 && b == 0 && c == 0 && d == 0) {
        // 共线
        var ps = vector_from_to(p, s);
        var pt = vector_from_to(p, t);
        var qs = vector_from_to(q, s);
        var qt = vector_from_to(q, t);
        if (dot_product(ps, pt) * dot_product(qs, qt) <= 0) {
            // 且有公共部分
            // @TODO: 如何判断线段有公共部分 (无法用toLeftTest判断)
            return 'collinear';
        }
    }
    return 'apart';
}

function scanline(region) {
    var points = [];
    var tree = new Tree();
    points = sort_points_by_x(region);

    var left_edges = [];

    var set_right = 0;

    var sum_tilt_edge = 0;
    for (var i = 0; i < points.length - 1; i++) {//用时o(n)
        var pre_edge = ALL_EDGE[points[i].pre_edge_id];
        var next_edge = ALL_EDGE[points[i].next_edge_id];
        if (pre_edge.is_tilt() == next_edge.is_tilt()) {
            //test alternate edges
            $('footer').text("倾斜边交替错误");
            return false;
        }
        var id1, id2;
        id1 = points[i].id;
        if (pre_edge.is_tilt()) {
            id2 = pre_edge.start.id;
            if (id2 == id1) id2 = pre_edge.end.id;
        } else {
            id2 = next_edge.start.id;
            if (id2 == id1) id2 = next_edge.end.id;
        }
        if (id2 == points[i + 1].id) {
            sum_tilt_edge++;
        }
    }
    // console.log(sum_tilt_edge);
    if (sum_tilt_edge * 2 != points.length) {
        $('footer').text("倾斜边不合法");
        return false;
    }

    for (var i = 0; i < points.length; i++) {//用时o(n)
        var pre_edge = ALL_EDGE[points[i].pre_edge_id];//left edge can be identified during the scan
        //pre_edge.tilted_or_not();
        var next_edge = ALL_EDGE[points[i].next_edge_id];
        //next_edge.tilted_or_not();

        var sin = crossMul(next_edge, pre_edge);//由于坐标轴问题，逆时针旋转实际是顺时针
        if (ALL_RING[points[i].parent].isOuterRing)
            sin = -sin;
        var cos = dotMul(next_edge, pre_edge);
        // console.log(points[i].id, "type is");
        if (sin > 0 && cos >= 0) {
            if ((pre_edge.is_tilt() + pre_edge.is_left() + next_edge.is_tilt() + next_edge.is_left()) % 2 != 0) {
                // console.log("b");//设置一些点的右邻居为v,v本身没有右邻居
                //tree.delete(tree.getRoot(),pre_edge.id);
                //tree.delete(tree.getRoot(),next_edge.id);
                //tree.inOrderTraverse(printNode)
                check_right(points[i], left_edges);
            }
            else {
                // console.log("d");//v在等待设置右邻居
                //tree.insert(pre_edge.id);
                //tree.insert(next_edge.id);
                //tree.inOrderTraverse(printNode);
            }
        }
        else if (cos <= 0 && sin != -1) {
            // console.log("a");//设置一些点的右邻居为v,v在等待设置右邻居
            if (tree.search(pre_edge.id)) {
                // console.log("find", pre_edge.id);
                //tree.delete(tree.getRoot(),pre_edge.id);
                //tree.insert(next_edge.id);
                //tree.inOrderTraverse(printNode);
            }
            else {
                // console.log("find", next_edge.id);
                //tree.delete(tree.getRoot(),next_edge.id);
                //tree.insert(pre_edge.id);
                //tree.inOrderTraverse(printNode);

            }
            check_right(points[i], left_edges);
        }
        else if (sin == -1 && cos == 0) {
            // console.log("c");//设置一些点的右邻居为v,v在等待设置右邻居
            //tree.insert(pre_edge.id);
            //tree.insert(next_edge.id);
            //tree.inOrderTraverse(printNode);
            check_right(points[i], left_edges);
        }
        else {//no interior angle is greater than 270
            $('footer').text("内角大于270°");
            // alert("not valid");
            return false;
        }

        //添加当前所有的左边
        if (!tree.search(pre_edge.id) && pre_edge.is_left()) {
            left_edges.push(pre_edge);
        }
        if (!tree.search(next_edge.id) && next_edge.is_left()) {
            left_edges.push(next_edge);
        }
        tree.insert(pre_edge.id);
        tree.insert(next_edge.id);
    }
    // console.log(points);
    $('footer').html('&nbsp;');
    return true;
}

function sort_points_by_x(region) {
    var points = [];
    for (var i = 0; i < region.outerRing[0].vertices.length; i++)
        points.push(region.outerRing[0].vertices[i]);
    for (var j = 0; j < region.innerRings.length; j++)
        for (var i = 0; i < region.innerRings[j].vertices.length; i++)
            points.push(region.innerRings[j].vertices[i]);
    points.sort(function (a, b) {
        if (a.x == b.x)
        //return a.y-b.y;
            return b.y - a.y;//由于坐标系问题修改了这个比较
        else
            return a.x - b.x;

    });
    // console.log(points);
    return points;

}

function leftEdge_comparator(a, b) {
    var a_rightmost, b_rightmost;
    if (a.start.x > a.end.x)
        a_rightmost = a.start;
    else
        a_rightmost = a.end;
    if (b.start.x > b.end.x)
        b_rightmost = b.start;
    else
        b_rightmost = b.end;
    if (a_rightmost.x == b_rightmost.x)
        return b_rightmost.y - a_rightmost.y;//由于坐标系问题修改了这个比较
    else
        return a_rightmost.x - b_rightmost.x;
}

function sort_leftEdges_by_rightmost(edges) {
    var leftEdges = [];
    for (var i = 0; i < edges.length; i++) {
        if (edges[i].is_left())
            leftEdges.push(edges[i]);
    }
    leftEdges.sort(leftEdge_comparator);
    //console.log(leftEdges);
    return leftEdges;
}

function dotMul(next_edge, pre_edge) {

    var a_x = next_edge.end.x - next_edge.start.x;
    var a_y = next_edge.end.y - next_edge.start.y;
    var b_x = pre_edge.start.x - pre_edge.end.x;
    var b_y = pre_edge.start.y - pre_edge.end.y;
    return a_x * b_x + a_y * b_y;
}
function crossMul(next_edge, pre_edge) {
    var a_x = next_edge.end.x - next_edge.start.x;
    var a_y = next_edge.end.y - next_edge.start.y;
    var b_x = pre_edge.start.x - pre_edge.end.x;
    var b_y = pre_edge.start.y - pre_edge.end.y;
    var mod = Math.sqrt(a_x * a_x + a_y * a_y) * Math.sqrt(b_x * b_x + b_y * b_y);
    return (a_x * b_y - b_x * a_y) / mod;
}

function find_above(points, index) {//上面的且y最接近当前点的
    var above = -1;
    var count = 0;
    for (var i = 0; i < index; i++)
        if (points[i].y < points[index].y) {//y坐标轴相反，要不要算等于
            count++;
            if (above < 0)
                above = i;
            else if (points[i].x > points[above].x || ((points[i].x == points[above].x) && (points[i].y > points[above].y)))
                above = i;

        }
    if (above > -1)
        console.log('above', points[above].id);

    if (count % 2 == 0)
        return null;
    else if (!points[above].right_neighbour)
        return above;
    else if (points[above].right_neighbour.x > points[index].x)
        return above;
    else
        return null;
}
function find_below(points, index) {//下面的且y最大的
    var below = -1;
    var count = 0;
    for (var i = 0; i < index; i++)
        if (points[i].y > points[index].y) {//y坐标轴相反
            count++;
            if (below < 0)
                below = i;
            else if (points[i].x > points[below].x || ((points[i].x == points[below].x) && (points[i].y < points[below].y)))
                below = i;

        }
    if (below > -1)
        // console.log('below', points[below].id);
    if (count % 2 == 0)
        return null;
    else if (!points[below].right_neighbour)//如果这个点原先没有初始化右邻居
        return below;
    else if (points[below].right_neighbour.x > points[index].x)//有右邻居但是当前点更近
        return below;
    else
        return null;
}
function check_right(p, edges) {//右边上一个点对于所有左边点是否能够更新他们的右邻居
    // console.log("check_right", p.id, 'edges.length', edges.length);
    for (var i = 0; i < edges.length; i++) {

        if(p.id==edges[i].start.id || p.id==edges[i].end.id)
            continue;
        if (edges[i].start.right_neighbour != null && edges[i].start.right_neighbour.x > p.x) {
            if (check_valid(edges[i].start, p, edges[i].region))//点所在环所在的区域
                edges[i].start.updateRight_neighbour(p);
        }

        else if (!edges[i].start.right_neighbour && edges[i].start.x < p.x) {
            if (check_valid(edges[i].start, p, edges[i].region))//边不与所在的区域边相交
                edges[i].start.updateRight_neighbour(p);
        }

        if (edges[i].end.right_neighbour != null && edges[i].end.right_neighbour.x > p.x) {
            {
                if (check_valid(edges[i].end, p, edges[i].region))//点所在环所在的区域
                    edges[i].end.updateRight_neighbour(p);
            }
        }
        else if (!edges[i].end.right_neighbour && edges[i].end.x < p.x) {
            if (check_valid(edges[i].end, p, edges[i].region))
                edges[i].end.updateRight_neighbour(p);
        }
    }
}
function check_valid(p1, p2, region) {
    for (var i = 0; i < region.edges.length; i++) {
        var start = region.edges[i].start;
        var end = region.edges[i].end;
        // console.log('test',start.id,end.id);
        if (start.id == p1.id || start.id == p2.id || end.id == p1.id || end.id == p2.id)
            continue;
        if (intersectionTest(p1, p2, region.edges[i].start, region.edges[i].end) == 'intersect'){
            console.log("intersect");
            return false;
        }
    }
    if(region.includingPoint((p1.x+p2.x)/2,(p1.y+p2.y)/2)=="in")
        return true;
    else
        return false;
}

function is_turn_left (p, q, r) {
    return (q.x - p.x) * (r.y - q.y) - (q.y - p.y) * (r.x - q.x) < 0;
}

function is_convex(p, q, r, s) {
    var a = is_turn_left(p, q, r);
    var b = is_turn_left(q, r, s);
    var c = is_turn_left(r, s, p);
    var d = is_turn_left(s, p, q);
    return a == b && b == c && c == d;
}

function decompose() {
    var edges = current_region.get_edges();

    var valid = scanline(current_region);
    if (!valid) {
        console.log("invalid");
        return {
            "status": false
        };
    }
    var left_chord = sort_leftEdges_by_rightmost(edges).map(function (e) {
        return new Chord().from_edge(e);
    });

    var chords = ALL_EDGE.map(function (e) {
        var c = new Chord().from_edge(e);
        if (!e.is_outer()) {
            c.reverse();
        }
        return c;
    });

    var next_chord_map = {};
    var pre_chord_map = {};
    edges.forEach(function (e) {
        if (e.is_outer()) {
            next_chord_map[e.start.id] = chords[e.start.next_edge_id];
            pre_chord_map[e.end.id] = chords[e.end.pre_edge_id];
        } else {
            next_chord_map[e.start.id] = chords[e.start.pre_edge_id];
            pre_chord_map[e.end.id] = chords[e.end.next_edge_id];
        }
    });

    var quadrilaterals = [];
    var history = [];
    var brake = false;
    var iteration_count = 0;
    var result = {
        "status": false,
        "quadrilateral": quadrilaterals,
        "history": history
    };
    while (left_chord.length > 0) {
        var last_leftEdge = left_chord.pop();
        var u = last_leftEdge.start, v = last_leftEdge.end;
        if (u.x > v.x) {
            var t = u;
            u = v;
            v = t;
        }
        var r = v.get_right_neighbour();
        if (r == null) {
            return result;
        }
        var next_chord = next_chord_map[r.id];
        var prev_chord = pre_chord_map[r.id];
        var s;
        //console.log('debug decompose',left_chord.length);

        if (next_chord.is_tilt()) {
            s = next_chord.end;
        }
        else if (prev_chord.is_tilt()) {
            s = prev_chord.start;
        }

        //if (!is_convex(u, v, r, s)) {
        //    return result;
        //}

        history.push([u, v, r, s]);
        //history.push([u, s, r, v]);
        if (v.y > u.y) {
            var t = u;
            u = v;
            v = t;
        }
        if (s.y > r.y) {
            var t = s;
            s = r;
            r = t;
        }
        var ring = new Ring().setVertices([v, u, r, s]);
        quadrilaterals.push(ring);
        if (DEBUG) {
            //ring.drawPath_closed(animation_ctx);
        }

        var e1 = new Chord().setPoints(r, u);
        next_chord_map[r.id] = e1;
        pre_chord_map[u.id] = e1;
        var e1_added = false;
        if (e1.is_tilt()) {
            if (u.y > r.y) {
                left_chord.push(e1);
                e1_added = true;
            }
        }
        var e2 = new Chord().setPoints(v, s);
        next_chord_map[v.id] = e2;
        pre_chord_map[s.id] = e2;
        if (e2.is_tilt()) {
            if (v.y < s.y) {
                if (s.x < r.x && e1_added) {
                    var e = left_chord.pop();
                    left_chord.push(e2);
                    left_chord.push(e);
                } else {
                    left_chord.push(e2);
                }
            }
        }
        iteration_count ++;
        if (iteration_count > 100) {
            break;
        }
        if (brake) {
            break;
        }
    }

    result["status"] = true;
    return result;
}

var interpolate = function (s, e, t) {
    return {
        x: s.x * (1 - t) + e.x * t,
        y: s.y * (1 - t) + e.y * t
    };
}

var interpolate2 = function(st, ed, x) {
    var d = ed.x - st.x;
    var t = 1;
    if (d) {
        t = (x - st.x) / d;
    }
    t = Math.min(1, t);
    t = Math.max(0, t);
    return interpolate(st, ed, t);
}
