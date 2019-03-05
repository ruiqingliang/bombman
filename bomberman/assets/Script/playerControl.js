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
        game: {
            default: null,
            type: cc.Node
        },
        animotion: {
            default: null,
            type: cc.Animation
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.gameControl = this.game.getComponent("gameControl");
        this.anniArr = {
            "left": "playerLeft",
            "right": "playerRight",
            "up": "playerUp",
            "down": "playerDown"
        };
        this.state = "stop";
        this.speed = 1;

        this.animotion.node.setAnchorPoint(0, 0);
        this.animotion.node.setContentSize(32, 32);
        //this.animotion.setPosition(this.player.node.getPosition());
        // this.node.addChild(bomb);
        //this.animotion.getComponent(cc.Animation).play('playerLeft');

        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    convertTileMapToWorldPosition: function(currTile){
        var mapSize = this.gameControl.map.getMapSize();
        var tileSize = this.gameControl.map.getTileSize();
        var screenSize = cc.v2(960, 512);

        var x = currTile.x * tileSize.width;
        var y = screenSize.y - (currTile.y + 1) * tileSize.height;
        // cc.log(x + ':' + y + " position:" + currTile.toString());
        return cc.v2(x, y);
    },

    startMove: function(dicretion){
        if(this.state == dicretion) return;
        this.state = dicretion;
        this.animotion.getComponent(cc.Animation).stop()
        this.animotion.getComponent(cc.Animation).play(this.anniArr[dicretion]);
        //this.animotion.getComponent(cc.Animation).play('playerLeft');
    },

    stopMove: function(){
        this.state = "stop";
        this.animotion.getComponent(cc.Animation).stop()
    },

    

    checkCrash: function(){
        var newPostion = this.getNextPostion(this.state);
        cc.log('#######pso:'+newPostion.toString());
        return this.gameControl.checkCrash(newPostion);
    },

    getNextPostion(direction){
        var x = 0, y = 0;
        switch(direction){
            case "left": x = -1; break;
            case "right": x = 1; break;
            case "up": y = -1; break;
            case "down": y = 1; break;
        }
        var position = this.convertWorldPositionToTileMap(this.node.getPosition());
        return cc.v2(position.x + x, position.y + y);
    },

    // 将世界坐标转换到瓦片地图坐标
    convertWorldPositionToTileMap: function(position){
        var mapSize = this.gameControl.map.getMapSize();
        var tileSize = this.gameControl.map.getTileSize();
        var screenSize = cc.v2(960, 512);
        
        var currTileX = Math.round(position.x * 1.0 / tileSize.width);
        var currTileY = mapSize.height - Math.round((position.y * 1.0-32) / tileSize.height) - 1;
        return cc.v2(currTileX, currTileY);
    },

    update (dt) {
        if(this.state == "stop")
            return;
        if(this.checkCrash() == false)
            return;

        if(this.state == "left")
            this.node.x -= this.speed;
        if(this.state == "right")
            this.node.x += this.speed;
        if(this.state == "up")
            this.node.y += this.speed;
        if(this.state == "down")
            this.node.y -= this.speed;
        
        if(this.state != "stop")
            this.convertWorldPositionToTileMap(this.node.getPosition());
    },

    onCollisionEnter: function (other) {
        cc.log('3333333333333');
        this.gameControl.gameOver();
    }
});
