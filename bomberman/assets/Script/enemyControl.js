// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
function EnemyEntity(direction, position){
    return {
        "direction": direction,
        "position": position
    }
}

// 扩展数组行为
// Array.prototype.shuffle = function() {
//     for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
//     return this;
// };

// Array.prototype.remove = function(val) { 
//     var index = this.indexOf(val); 
//         if (index > -1) { 
//         this.splice(index, 1); 
//     } 
// }; 

function shuffle(arr){
    for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
}

cc.Class({
    extends: cc.Component,

    properties: {
        enemyDiedAnim: {
            default: null,
            type: cc.Prefab
        },
        enemySprite: {
            default: null,
            type: cc.Sprite
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.gameControl = this.node.parent.getComponent('gameControl');
        cc.log("###########:"+this.gameControl);
        // // 初始化怪物坐标
        this.direction = "left";
        this.currTile = cc.v2(13, 7);
        this.sumSec = 0;
    },

    update (dt) {
        this.sumSec += dt;
        if(this.sumSec > 0.5 && this.gameControl.state == 1){
            this.sumSec = 0;
            this.autoStep();
            this.node.setPosition(this.convertTileMapToWorldPosition(this.currTile));
            // cc.log(this.currTile.toString());
            this.checkGameOver();
        }
    },

    checkGameOver: function(){
        var playerTile = this.gameControl.currTile;
        if(this.currTile.x == playerTile.x && this.currTile.y == playerTile.y){
            this.gameControl.gameOver();
        }
    },
    // 转换tiledMap坐标到世界坐标
    convertTileMapToWorldPosition: function(currTile){
        var mapSize = this.gameControl.map.getMapSize();
        var tileSize = this.gameControl.map.getTileSize();
        var screenSize = cc.v2(960, 512);

        var x = currTile.x * tileSize.width;
        var y = screenSize.y - (currTile.y + 1) * tileSize.height;
        // cc.log(x + ':' + y + " position:" + currTile.toString());
        return cc.v2(x, y);
    },

    // 根据当先方向，返回下一个位置
    getNextPosition: function(){
        var x = 0, y = 0, step = 1;
        switch(this.direction){
            case "left": x = -step; break;
            case "right": x = step; break;
            case "top": y = step; break;
            case "down": y = -step; break;
        }
        return cc.v2(this.currTile.x + x, this.currTile.y + y);
    },
    // 怪物自动行走
    autoStep: function(){
        var newPostion = this.getNextPosition();
        if(this.gameControl.checkCrash(newPostion)){
            //var newPostion = this.getNextPosition();
            this.currTile = newPostion;
        }else{
            var arr = new Array("left", "right", "top", "down");
            // arr.remove(enemyEntity.direction);
            arr = shuffle(arr);
            for(var index in arr){
                this.direction = arr[index];
                newPostion = this.getNextPosition();
                if(this.gameControl.checkCrash(newPostion)){
                    // cc.log(newPostion.x+":"+newPostion.y);
                    this.currTile = newPostion;
                    return;
                }
            }
            cc.log('ERROR: autoStep not find new direction');
        }
    },

    startPlayDiedAnim: function(){
        // this.node.active = false;  
        this.enemySprite.node.active = false;
        var enemyAnim = cc.instantiate(this.enemyDiedAnim);
        enemyAnim.setAnchorPoint(0, 0);
        enemyAnim.setPosition(this.node.getPosition());
        enemyAnim.getComponent(cc.Animation).play('enemyDied');
        enemyAnim.zIndex = 100;
        this.node.addChild(enemyAnim);
    },

    enemyDiedEnd: function(){
        cc.log('#########fsfss');
    }
    
});
