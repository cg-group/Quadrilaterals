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

