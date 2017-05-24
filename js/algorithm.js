function toLeftTest(p, q, s) {
    // s在pq向量的
    // 左边: <0
    // 右边: >0
    // 上面: =0
    return p.x * q.y - p.y * q.x +
        q.x * s.y - q.y * s.x +
        s.x * p.y - s.y * p.x;
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
        if (true) {
            // 且有公共部分
            // @TODO: 如何判断线段有公共部分 (无法用toLeftTest判断)
            return 'collinear';
        }
    }
    return 'apart';
}
function scanline(region){
    var points=[];
    points=sort_points_by_x(region);
    for(var i=0;i<points.length;i++){
        var pre_edge=ALL_EDGE[points[i].pre_edge_id];
        var next_edge=ALL_EDGE[points[i].next_edge_id];
        var sin=-crossMul(next_edge,pre_edge);
        var cos=dotMul(next_edge,pre_edge);
        console.log(points[i].id);
        console.log(sin);
        if(sin>0&&cos<=0)
            console.log("bord");
        else if(cos<=0&&sin!=-1)
            console.log("a");
        else if(sin==-1&&cos==0)
            console.log("c");
        else
            console.log("error");

    }
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
            return a.y-b.y;
        else
            return a.x-b.x;

    });
    console.log(points);
    return points;

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
