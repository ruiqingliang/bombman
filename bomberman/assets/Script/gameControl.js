// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        player: {
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },
        enemyPrefab: {
            default: null,
            type: cc.Prefab,
        },
        map: {
            default: null,
            type: cc.TiledMap,
        },
        brick: {
            default: null,
            type: cc.TiledLayer,
        },
        bombPrefab: {
            default: null,
            type: cc.Prefab
        },
        playerPrefab: {
            default: null,
            type: cc.Prefab
        },
        gameEndNode: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.state = 1;             // 1 running ，2 end
        this.scope = 1;             // 标识炸弹的范围
        this.bombCnt = 2;           // 标识可以放置的炸弹数量
        this.bombArr = new Array(); // 炸弹数组
        this.enemyCnt = 3;          // 怪物数量
        this.initEnemy(this.enemyCnt);
        this.node.on("exploded", this.exploded, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.keyDownHandler, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.keyUpHandler, this);
        cc.director.setClearColor(new cc.Color(19,193,25));
    },

    // 初始化怪物
    initEnemy: function() {
        this.enemyArr = new Array(this.enemyCnt);
        for(var i = 0; i < this.enemyCnt; i ++){
            var enemyEntry = cc.instantiate(this.enemyPrefab);
            this.node.addChild(enemyEntry);
            this.enemyArr[i] = enemyEntry;
        }
    },

    onDestroy() {
        this.node.off("exploded", this.exploded, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.keyDownHandler, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.keyUpHandler, this);
    },

    // 处理键盘按下事件
    keyDownHandler: function(event){
        if(this.state != 1)
            return;
        var keyCode = event.keyCode;
        switch(keyCode){
            case cc.macro.KEY.w: this.moveHandler('up', 'start'); break;
            case cc.macro.KEY.s: this.moveHandler('down', 'start');break;
            case cc.macro.KEY.a: this.moveHandler('left', 'start');break;
            case cc.macro.KEY.d: this.moveHandler('right', 'start');break;
            case cc.macro.KEY.p: this.putBomb(); return;
            default: return;
        }
        // this.newTile = cc.v2(x, y);
        // this.moveHandler(this.newTile, 0);
    },

    keyUpHandler: function(event){
        if(this.state != 1)
            return;

        var keyCode = event.keyCode;
        switch(keyCode){
            case cc.macro.KEY.w: this.moveHandler('up', 'stop'); break;
            case cc.macro.KEY.s: this.moveHandler('down', 'stop');break;
            case cc.macro.KEY.a: this.moveHandler('left', 'stop');break;
            case cc.macro.KEY.d: this.moveHandler('right', 'stop');break;
            default: return;
        }
        // this.moveHandler(this.newTile, 1);
    },

    // 处理移动
    moveHandler: function(direction, stop){
        // var newPostion = cc.v2(this.currTile.x + newTile.x, this.currTile.y + newTile.y);
        // var checkResult = this.checkCrash(newPostion);
        // if(checkResult == false)
        //     return;
        
        // this.currTile = newPostion;
        if(stop == 'stop')
            this.player.getComponent("playerControl").stopMove();
        else
            this.player.getComponent("playerControl").startMove(direction);
    },

    // 碰撞检测
    checkCrash: function(newPostion){
        // 检测地图边界
        var mapSize = this.map.getMapSize();
        if(newPostion.x <0 || newPostion.y<0 || newPostion.x > mapSize.width || newPostion.y > mapSize.height-1){
            // cc.log('碰撞检测-移动到达边界');
            return false;
        }
        // 检测地形碰撞
        var gid = this.barrier.getTileGIDAt(newPostion)
        if (gid) {
            // cc.log('碰撞检测-石头地形碰撞' + newPostion.toString());
            return false;
        }
        var tiledTile = this.brick.getTiledTileAt(newPostion.x, newPostion.y, true);
        if(tiledTile.gid){
            // cc.log('碰撞检测-砖头地形碰撞' + newPostion.toString());
            return false;
        }
        // 炸弹碰撞
        if(this.bombArr.length > 0){
            for(var index in this.bombArr){
                var tiledPos = this.bombArr[index].getComponent('bombControl').tiledPosition;
                if(tiledPos.x == newPostion.x && tiledPos.y == newPostion.y)
                    return false;
            }
        }
        return true;
    },

    start () {
        this.currTile = cc.v2(1, 3);
        this.barrier = this.map.getLayer('barrier');
        // this.brick = this.map.getLayer('brick');
    },

    putBomb: function(){
        if(this.bombArr.length >= this.bombCnt || this.state != 1)
            return;
        var bomb = cc.instantiate(this.bombPrefab);
        bomb.setAnchorPoint(0, 0);
        bomb.setPosition(this.player.node.getPosition());
        this.node.addChild(bomb);
        bomb.getComponent(cc.Animation).play('explode');
        bomb.getComponent('bombControl').tiledPosition = this.currTile;
        this.bombArr.push(bomb);
    },

    // 爆炸后处理
    exploded: function(){
        var bomb = this.bombArr.shift();
        if(!bomb){
            cc.log('没有找到对应炸弹位置信息');
            return;
        }
        cc.log('bombArrLen:'+this.bombArr.length);
        var tiledPosition = bomb.getComponent('bombControl').tiledPosition;
        // 消除障碍，或者游戏结束TODO
        var tiledTileArr = this.getTiledTileArr(tiledPosition);
        for(var key in tiledTileArr){
            if(tiledTileArr[key].gid != 0)
                tiledTileArr[key].gid = 0;
            if(tiledTileArr[key].x == this.currTile.x && tiledTileArr[key].y == this.currTile.y)
                this.gameOver();
            for(var index in this.enemyArr){
                let enemyPosition = this.enemyArr[index].getComponent('enemyControl').currTile;
                if(enemyPosition.x == tiledTileArr[key].x && enemyPosition.y == tiledTileArr[key].y){
                    this.enemyArr[index].getComponent('enemyControl').startPlayDiedAnim();
                    // this.enemyArr[index].active = false;
                }
            }
            // var enemyControl = this.enemy.getComponent('enemyControl');
            // if(enemyControl.currTile.x == tiledTileArr[key].x && enemyControl.currTile.y == tiledTileArr[key].y){
            //     enemyControl.startPlayDiedAnim();
            // }
        }
        // this.node.removeChild(bomb, false);
        bomb.destroy();
    },

    gameOver: function(){
        cc.log('GAME OVER');
        this.state = 2;         // 设置游戏状态为结束
        this.gameEndNode.x = 0; // 将结束界面移步屏幕中心
        this.player.node.active = false;
        var playerAnim = cc.instantiate(this.playerPrefab);
        playerAnim.setAnchorPoint(0, 0);
        playerAnim.setPosition(this.player.node.getPosition());
        playerAnim.getComponent(cc.Animation).play('playerDied');
        this.node.addChild(playerAnim);

    },

    getTiledTileArr: function(position){
        var arr= {
            "center": this.brick.getTiledTileAt(position.x, position.y, true)
        };
        var mapSize = this.map.getMapSize();
        // cc.log('getTileTileArr position:' + position.x + position.y);
        if(position.x > 0)
            arr["left"] = this.brick.getTiledTileAt(position.x - 1, position.y, true);
        if(position.x < mapSize.width - 1)
            arr["right"] = this.brick.getTiledTileAt(position.x + 1, position.y, true);
        if(position.y > 0)
            arr["up"] = this.brick.getTiledTileAt(position.x, position.y - 1, true);
        if(position.y < mapSize.height - 1)
            arr["down"] = this.brick.getTiledTileAt(position.x, position.y + 1, true);
        return arr;
    },
    // update (dt) {},
});
