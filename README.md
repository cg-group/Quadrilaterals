# Quadrilaterals

Decomposing polygonal regions into convex quadrilaterals!



### todo list

* [x] (xjn/pyl)判断点是否在区域/环内，代码位于`polygon.js`里面`Region`、`Ring`下的`includingPoint`函数。预期效率是O(n)。返回值为字符串in/out/boundary。
* [x] (zbw)修改多边形内环画法，不能简单涂上白色。(polygon.js, draw函数)
* [x] (zbw)禁止环之间交叉、以及自交叉
* [ ] (xjn/pyl)检查`intersectionTest`函数正确与否，在`algorithm.js`里。
* [x] (zbw)增加设置倾斜边的交互方式
* [ ] (xjn)判断移动斜边是否合法（interaction.js line 497&532，有注释说明）
