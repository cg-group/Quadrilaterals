function toLeftTest(p, q, s) {
    // s在pq向量的
    // 左边: <0
    // 右边: >0
    // 上面: =0
    return p.x * q.y - p.y * q.x +
        q.x * s.y - q.y * s.x +
        s.x * p.y - s.y * p.x;
}

function vector_from_to (p, q) {
    return {
        x: q.x - p.x,
        y: q.y - p.y
    };
}

function dot_product (v1, v2) {
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
function scanline(region){
    var points=[];
    var tree=new Tree();
    points=sort_points_by_x(region);
    var set_right=0;
    for(var i=0;i<points.length;i++){//用时o(n)
        var pre_edge=ALL_EDGE[points[i].pre_edge_id];//left edge can be identified during the scan
        pre_edge.tilted_or_not();
        var next_edge=ALL_EDGE[points[i].next_edge_id];
        next_edge.tilted_or_not();
        if(pre_edge.tilted==next_edge.tilted){
        //test alternate edges
            console.log("alternate error");
            alert("not valid");
            return;
        }
        var sin=crossMul(next_edge,pre_edge);//由于坐标轴问题，逆时针旋转实际是顺时针
        if(ALL_RING[points[i].parent].isOuterRing)
            sin=-sin;
        var cos=dotMul(next_edge,pre_edge);
        console.log("set_right is",set_right);
        console.log(points[i].id,"type is");
        if(sin>0&&cos>=0){
            if((pre_edge.tilted+pre_edge.left+next_edge.tilted+next_edge.left)%2!=0){
               console.log("b");//设置一些点的右邻居为v
               tree.delete(tree.getRoot(),pre_edge.id);
               tree.delete(tree.getRoot(),next_edge.id);
               tree.inOrderTraverse(printNode);
               for(;set_right<i;set_right++)
                  if(!points[set_right].updateRight_neighbour(points[i]))
                    break;
            }
            else{
                console.log("d");//v在等待设置右邻居
                tree.insert(pre_edge.id);
                tree.insert(next_edge.id);
                tree.inOrderTraverse(printNode);
            }
        }
        else if(cos<=0&&sin!=-1){
            console.log("a");//设置一些点的右邻居为v,v在等待设置右邻居
            if(tree.search(pre_edge.id)){
                console.log("find",pre_edge.id);
                tree.delete(tree.getRoot(),pre_edge.id);
                tree.insert(next_edge.id);
                tree.inOrderTraverse(printNode);
            }
            else{
                console.log("find",next_edge.id);
                tree.delete(tree.getRoot(),next_edge.id);
                tree.insert(pre_edge.id);    
                tree.inOrderTraverse(printNode);
            
            }
            for(;set_right<i;set_right++)
                if(!points[set_right].updateRight_neighbour(points[i]))
                    break;
        }
        else if(sin==-1&&cos==0){
            console.log("c");//设置一些点的右邻居为v,v在等待设置右邻居
            tree.insert(pre_edge.id);
            tree.insert(next_edge.id);
            tree.inOrderTraverse(printNode);
            for(;set_right<i;set_right++)
                if(!points[set_right].updateRight_neighbour(points[i]))
                    break;

        }
        else{//no interior angle is greater than 270
            console.log("angle is greater than 270");
            alert("not valid");
            return;
        }

    }
    console.log(points);
}
function sort_points_by_x(region){
    var points=[];
    for(var i=0;i<region.outerRing[0].vertices.length;i++)
        points.push(region.outerRing[0].vertices[i]);
    for(var j=0;j<region.innerRings.length;j++)
        for(var i=0;i<region.innerRings[j].vertices.length;i++)
            points.push(region.innerRings[j].vertices[i]);
    points.sort(function(a,b){
        if(a.x==b.x)
            //return a.y-b.y;
            return b.y-a.y;//由于坐标系问题修改了这个比较
        else
            return a.x-b.x;

    });
    console.log(points);
    return points;

}
function sort_leftEdges_by_rightmost(region){
    var leftEdges=[];
    for (var i = 0; i < region.edges.length; i++) {
        if(region.edges[i].left)
            leftEdges.push(region.edges[i]);
    };
    leftEdges.sort(function(a,b){
        var a_rightmost,a_rightmost;
        if(a.start.x>a.end.x)
            a_rightmost=a.start;
        else
            a_rightmost=a.end;
        if(b.start.x>b.end.x)
            b_rightmost=b.start;
        else
            b_rightmost=b.end;        
        if(a_rightmost.x==b_rightmost.x)
            return b_rightmost.y-a_rightmost.y;//由于坐标系问题修改了这个比较
        else
            return a_rightmost.x-b_rightmost.x;
    });
    console.log(leftEdges);

}
function dotMul(next_edge,pre_edge){

    var a_x=next_edge.end.x-next_edge.start.x;
    var a_y=next_edge.end.y-next_edge.start.y;
    var b_x=pre_edge.start.x-pre_edge.end.x;
    var b_y=pre_edge.start.y-pre_edge.end.y;
    return a_x*b_x+a_y*b_y;
 }
function crossMul(next_edge,pre_edge){
    var a_x=next_edge.end.x-next_edge.start.x;
    var a_y=next_edge.end.y-next_edge.start.y;
    var b_x=pre_edge.start.x-pre_edge.end.x;
    var b_y=pre_edge.start.y-pre_edge.end.y;
    var mod=Math.sqrt(a_x*a_x+a_y*a_y)*Math.sqrt(b_x*b_x+b_y*b_y);
    return (a_x*b_y-b_x*a_y)/mod;
 }
