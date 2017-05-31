    function Tree(){
        // 根
        var root = null;

        var Node = function (key){
            this.key = key;
            this.left = null;
            this.right = null;
        }
        this.search=function(key){
            if(root==null)
                return false;
            var node=root;
            while(node!=null){
                if(key<node.key)
                    node=node.left;
                else if (key>node.key)
                    node=node.right;
                else
                    return true
            }
            return false;
        }

        var search = function (key){
             if(root==null)
                return false;
            var node=root;
            while(node!=null){
                if(key<node.key)
                    node=node.left;
                else if (key>node.key)
                    node=node.right;
                else
                    return true
            }
            return false;       	
        }
                 // 添加节点
               /*
                *  第3个数指 left || right 用于辨别 左边不平衡还是右边不平衡
                    */
        var insertNode = function (node,newDode,direction){
        if(!search(newDode.key)){
            if( newDode.key < node.key ){//修改，如果没有比较key就不用调用edge
                if( node.left == null ){
                    // 左边为空添加
                    node.left = newDode;

                    // 判断 是否平衡  取出那个不平衡的节点，下面旋转
                    var balanceNode = new isBalance(root);//返回了node 0

                    if(  balanceNode.key >-1){
                        //console.log( balanceNode.key , 'node -- not balance' );
                        // 旋转平衡
                        rotate(balanceNode,direction);
                    }

                }
                else{
                    // 左边存在的话就递归到为 node.left = null 为止
                    // 递归  left
                    var left = direction || 'left';
                    insertNode(node.left,newDode,left);

                }
            }
            else{
                if( node.right == null ){
                    // 添加
                    node.right = newDode;

                    // 判断 是否平衡
                    var balanceNode = new isBalance(root);
                    if( balanceNode.key >-1){
                        //console.log( balanceNode.key , 'node -- not balance' );
                        // 旋转平衡
                        rotate(balanceNode,direction);
                    }

                }
                else{
                    // 递归 right
                    var right = direction || 'right';
                    insertNode(node.right,newDode,right);

                    }

                }
            }
            }

        // 旋转 方式   逆时针旋转  顺时
        var rotate = function(balanceNode,direction){
            //console.log(direction);
            if(getNodeHeight(balanceNode.left)>getNodeHeight(balanceNode.right))
            	direction='left';
            else
            	direction='right';
            //console.log(direction,'rotate',balanceNode);
            var nextNode = balanceNode[direction];//
            var nextNodeLeft = nextNode.left;
            var nextNodeRight = nextNode.right;

            if( direction == 'right' ){//右旋，就是顺时针转
            	//可能是7.8情况，先转成3.4
                if( nextNodeLeft && !nextNodeRight ){//有左子树而没有右子树？改成没有左子树，是情况7，转为情况3

                    nextNode.left = null;   
                    balanceNode[direction] = nextNodeLeft;
                    nextNodeLeft.right = nextNode;

                }
                else if( nextNodeLeft && nextNodeRight && getNodeHeight(nextNodeLeft) > getNodeHeight(nextNodeRight) ){//情况8

                    nextNode.left = nextNodeRight.right;
                    balanceNode[direction] = nextNodeLeft;
                    nextNodeLeft.right = nextNode;

                }

                nextNode = balanceNode[direction];

                if( nextNode.left == null ){//情况3

                    nextNode.left = balanceNode;
                    balanceNode.right = null;
                }
                else{//情况4
                	//console.log(nextNode);
                    balanceNode.right = nextNode.left;
                    nextNode.left = balanceNode;
                }
            }
            else if( direction == 'left' ){
            //可能是情况5.6，先转成2.1
                if( !nextNodeLeft && nextNodeRight ){//情况5

                    nextNode.right = null;  
                    balanceNode[direction] = nextNodeRight;
                    nextNodeRight.left = nextNode;

                }
                else if( nextNodeLeft && nextNodeRight && getNodeHeight(nextNodeLeft) < getNodeHeight(nextNodeRight)){//情况6

                    //nextNode.right = null;
                    nextNode.right=nextNodeRight.left;
                    balanceNode[direction] = nextNodeRight;
                    nextNodeRight.left = nextNode;


                }
                // 将根节点下面一个节点更新位置
                nextNode = balanceNode[direction];

                if( nextNode.right == null ){   // 情况1
                    nextNode.right = balanceNode;
                    balanceNode.left = null;
                }else{                          // 情况2      
                    balanceNode.left = nextNode.right;
                    nextNode.right = balanceNode;
                }   
            }

            // 设置成根节点
            if( root == balanceNode ){
                  root = nextNode;
            }
            else{ 
            	var BeforeNode = findBeforeNode(root,balanceNode); 
                if(BeforeNode['right']==balanceNode)
                   BeforeNode['right'] = nextNode;
                else
                   BeforeNode['left']=nextNode;
            }

            // 判断是否还存在不平衡
            var twoBalanceNode = new isBalance(root);
            while( twoBalanceNode.key ){
                //console.log( twoBalanceNode.key , 'node second -- not balance' );
                rotate(twoBalanceNode,direction);
                twoBalanceNode = new isBalance(root);
            }

        }

        // 当前节点 找到上面一个节点  ->先序算法
        var findBeforeNode = function (Root,node){
            if( Root.left == node || Root.right == node ){
                return Root;
            }else{
                if( Root.left ){
                    var resultL = findBeforeNode(Root.left,node);
                    if( resultL != null ){
                        return resultL;
                    }
                }
                if( Root.right ){
                    var resultR = findBeforeNode(Root.right,node);
                    if( resultR != null ){
                        return resultR;
                    }
                }
                return null;    
            }
        }

        // 判断 是否平衡 返回那个不平衡节点 ( >=2则不平衡)，应该找到最后一个不平衡的？
        var isBalance = function(node){
            var leftTree = getNodeHeight(node.left);                        
            var rightTree = getNodeHeight(node.right);

            var remainder = leftTree - rightTree;
            if( remainder == -2 ){
                // 右子树不平衡
                //console.log('right tree not balance');
                var last=isBalance(node.right);
                
                if(!last){
                    return node;
                }
                else
                	return last;
            }
            else if( remainder == 2 ){
                // 左子树不平衡
                //console.log('left tree not balance');
                var last=isBalance(node.left);
                if(!last)
                    return node;
                else
                	return last;
            }
            else{
                // 平衡，继续检查左右子树是否平衡

                var balanceLeft = !node.left ? null : isBalance(node.left);
                var balanceRight = !node.right ? null : isBalance(node.right);//继续检查右子树是否平衡

                if( balanceLeft ){
                    return balanceLeft;
                }
                else if( balanceRight ){
                    return balanceRight;
                }
                else{
                    return null;    
                }
            }

        }
        // 求出一个节点的高度
        var getNodeHeight = function (node){ 
            if( node == null ){
                return 0;
            }

            var oLeft = getNodeHeight(node.left);

            var oRight = getNodeHeight(node.right);

            return 1+Math.max(oLeft,oRight);
        }

        this.insert = function (key){

            var newNode = new Node(key);

            if( root == null ){
                root = newNode;
            }
            else{
                insertNode(root,newNode);
            }
        }

        this.delete=function(start_node,key){
            if(start_node==null){
           //console.log("no node");//没有值是key的结点
            return ;
            }
            if(key<start_node.key){

                this.delete(start_node.left,key);//在左子树中删除
                if((getNodeHeight(start_node.right)-getNodeHeight(start_node.left)==2))
                    if(start_node.right.left!=null && (getNodeHeight(start_node.right.left)>getNodeHeight(start_node.right.right)))
                       rotate(start_node,'left');
                    else 
                       rotate(start_node,'right');
               
            }
            else if(key>start_node.key){

                this.delete(start_node.right,key);//在右子树中删除
                if((getNodeHeight(start_node.left)-getNodeHeight(start_node.right)==-2))
                    if(start_node.left.right!=null && (getNodeHeight(start_node.left.right)>getNodeHeight(start_node.left.left)))
                       rotate(start_node,'right');
                    else
                       rotate(start_node,'left');
            }
            else{//找到个结点，删除
                if(start_node.left&&start_node.right){//这个结点有两个孩子
                    //console.log("left&&right");
                    var temp=start_node.right;
                    while(temp.left!=null)//找到这个右子树中最小的结点
                        temp=temp.left;
                    start_node.key=temp.key;//替换当前节点的值

                    //start_node.right=
                    this.delete(start_node.right,temp.key);//删除右子树的最小结点
                    if((getNodeHeight(start_node.right)-getNodeHeight(start_node.right)==2))//检查平衡
                      if(start_node.left.right!=null && (getNodeHeight(start_node.left.right)>getNodeHeight(start_node.left.left)))
                         rotate(start_node,'right');
                      else 
                         rotate(start_node,'left');                     
                }
                else if(start_node.left||start_node.right){//只有一个孩子
                    //console.log("one");
                    var BeforeNode = findBeforeNode(root,start_node);
                    var direction = null;
                    if(BeforeNode!=null){
                    if (BeforeNode['left']==start_node) 
                        direction='left';
                    else
                        direction='right'; 
                    }

                    if(start_node.left==null){
                        var temp=start_node.right;
                        start_node.key=temp.key;
                        start_node.left=temp.left;
                        start_node.right=temp.right;
                        if (direction!=null) 
                          BeforeNode[direction]=start_node;
                    }
                    else if(start_node.right==null){
                        var temp=start_node.left;
                        start_node.key=temp.key;
                        start_node.left=temp.left;
                        start_node.right=temp.right;
                        if (direction!=null) 
                          BeforeNode[direction]=start_node;
                    }
                }
                else{//没有孩子，可能是单个节点作为根结点，也可能是叶子结点
                    if(start_node==root){
                        root=null;
                    }
                    else{
                    var temp=start_node;
                    var BeforeNode = findBeforeNode(root,start_node);
                    var direction;
                    if(BeforeNode!=null){
                    if (BeforeNode['left']==start_node) 
                        direction='left';
                    else
                        direction='right';  
                        }                  	
                    start_node=null;
                    if(direction!=null)
                      BeforeNode[direction]=start_node;
                }
                    
                }
            }
            return start_node;

        }

        // 中
        this.inOrderTraverse = function(callback){
            inOrderTraverseNode(root,callback);             
        }

        var inOrderTraverseNode = function (node,callback){
            if( node != null ){
                inOrderTraverseNode(node.left,callback);
                callback(node);
                //callback(node);
                inOrderTraverseNode(node.right,callback);
            }
        }

        this.printRoot = function (){
            console.log("root node:");
            console.log( root );
            console.log( "left Tree -- "+getNodeHeight(root.left) ,'height  right Tree -- '+getNodeHeight(root.right) +"height");
        }
        this.getRoot=function(){
            return root;
        }

        this.prints=function(){
        console.log(getNodeHeight(tree.getRoot().left));
        console.log(getNodeHeight(tree.getRoot().right));
    }

    }
    var printNode = function(value){
        console.log(value,'inOrderTraverse');  
    }

        //var tree = new Tree();  
        //var arr = [0,58,25,9,28,41,13,45,37,47];
        //for( var i = 0 ; i < arr.length; i++ ){
        //    console.log(arr[i],"insert --");
        //    tree.insert(arr[i]);
        //}

        /*for(var i=0;i<10;i++){
        	var test=Math.floor(Math.random()*20);//0-23 
        	console.log("insert--",test);
        	tree.insert(test);
        }

        tree.inOrderTraverse(printNode);
        tree.prints();*/
    
