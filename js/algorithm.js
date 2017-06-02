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
    var tree=new Tree();
    points=sort_points_by_x(region);

    var left_edges=[];

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
        console.log(points[i].id,"type is");
        if(sin>0&&cos>=0){
            if((pre_edge.tilted+pre_edge.left+next_edge.tilted+next_edge.left)%2!=0){
               console.log("b");//设置一些点的右邻居为v,v本身没有右邻居
               //tree.delete(tree.getRoot(),pre_edge.id);
               //tree.delete(tree.getRoot(),next_edge.id);
               //tree.inOrderTraverse(printNode)
                check_right(points[i],left_edges);
            }
            else{
                console.log("d");//v在等待设置右邻居
                //tree.insert(pre_edge.id);
                //tree.insert(next_edge.id);
                //tree.inOrderTraverse(printNode);
            }
        }
        else if(cos<=0&&sin!=-1){
            console.log("a");//设置一些点的右邻居为v,v在等待设置右邻居
            if(tree.search(pre_edge.id)){
                console.log("find",pre_edge.id);
                //tree.delete(tree.getRoot(),pre_edge.id);
                //tree.insert(next_edge.id);
                //tree.inOrderTraverse(printNode);
            }
            else{
                console.log("find",next_edge.id);
                //tree.delete(tree.getRoot(),next_edge.id);
                //tree.insert(pre_edge.id);    
                //tree.inOrderTraverse(printNode);
            
            }
               check_right(points[i],left_edges);
        }
        else if(sin==-1&&cos==0){
            console.log("c");//设置一些点的右邻居为v,v在等待设置右邻居
            //tree.insert(pre_edge.id);
            //tree.insert(next_edge.id);
            //tree.inOrderTraverse(printNode);
            check_right(points[i],left_edges);
        }
        else{//no interior angle is greater than 270
            console.log("angle is greater than 270");
            alert("not valid");
            return;
        }

        //添加当前所有的左边
        if(!tree.search(pre_edge.id) && pre_edge.left){
            left_edges.push(pre_edge);
        }
        if(!tree.search(next_edge.id) && next_edge.left){
            left_edges.push(next_edge);
        }
        tree.insert(pre_edge.id);
        tree.insert(next_edge.id);
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

function find_above(points,index){//上面的且y最接近当前点的
    var above=-1;
    var count=0;
    for(var i=0;i<index;i++)
        if(points[i].y<points[index].y){//y坐标轴相反，要不要算等于
            count++;
            if(above<0 )
                above=i;
            else if(points[i].x>points[above].x || ((points[i].x == points[above].x)&&(points[i].y > points[above].y)))
                above=i;

        }
    if(above>-1)
    console.log('above',points[above].id);
    
    if(count%2==0 )
        return null;
    else if(!points[above].right_neighbour)
        return above;
    else if(points[above].right_neighbour.x > points[index].x)
        return above;
    else
        return null;
}
function find_below(points,index){//下面的且y最大的
    var below=-1;
    var count=0;
    for(var i=0;i<index;i++)
        if(points[i].y>points[index].y){//y坐标轴相反
            count++;
            if(below<0 )
                below=i;
            else if(points[i].x > points[below].x || ((points[i].x == points[below].x)&&(points[i].y < points[below].y)))
                below=i;
            
        }
    if(below>-1)
    console.log('below',points[below].id);
    if(count%2==0 )
        return null;
    else if(!points[below].right_neighbour )//如果这个点原先没有初始化右邻居
        return below;
    else if(points[below].right_neighbour.x > points[index].x)//有右邻居但是当前点更近
        return below;
    else
        return null;
}
function check_right(p,edges){//右边上一个点对于所有左边点是否能够更新他们的右邻居
    console.log("check_right",p.id,'edges.length',edges.length);
    for(var i=0;i<edges.length;i++){
        if(edges[i].start.right_neighbour!=null && edges[i].start.right_neighbour.x > p.x)
        {
            if(check_valid(edges[i].start,p,edges[i].region))//点所在环所在的区域
                edges[i].start.updateRight_neighbour(p);
        }
        
        else if(!edges[i].start.right_neighbour && edges[i].end.x<p.x)
        {
            if(check_valid(edges[i].start,p,edges[i].region))//边不与所在的区域边相交
                edges[i].start.updateRight_neighbour(p);           
        }

        if(edges[i].end.right_neighbour!=null && edges[i].end.right_neighbour.x > p.x)
        {
            {if(check_valid(edges[i].end,p,edges[i].region))//点所在环所在的区域
                edges[i].end.updateRight_neighbour(p);}
        }
        else if(!edges[i].end.right_neighbour && edges[i].end.x<p.x)
        {
            if(check_valid(edges[i].end,p,edges[i].region))//边不与所在的区域边相交
                edges[i].end.updateRight_neighbour(p);          
        }
    }
}
function check_valid(p1,p2,region){
    console.log(region);
    for(var i=0;i<region.edges.length;i++){
        var start=region.edges[i].start;
        var end=region.edges[i].end;
        if(start==p1||start==p2||end==p1||end==p2)
            continue;
        else if(intersectionTest(p1,p2,region.edges[i].start,region.edges[i].end)=='intersect')
            return false;
    }
    return true;
}