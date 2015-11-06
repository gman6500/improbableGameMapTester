/**
* Created with improb game map testing.
* User: gman6500
* Date: 2015-11-06
* Time: 07:25 PM
* To change this template use Tools | Templates.
*/
(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();
var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = 1120,
    height = 590,
    player = {
        x:parseInt(prompt("what x would you like to start at? (1120 max)")),
        y: parseInt(prompt("what y would you like to start at? (590 down)")),
        width: 10,
        height: 10,
        speed: 4,
        velX: 0,
        velY: 0,
        startX:0,
        startY:0,
        startX: width/2,
        startY: height - 55,
        level:1,
        checkpoint:1,
        jumping: false,
        doubleJump:true,
        grounded: false
    },
    keys = [],
    friction = 0.8,
    gravity = 0.3;
canvas.width = width;
canvas.height = height;
var mute=false;
var boxes;
var lava;
var goal;
var jumpPow;
var ghosts=[];
var levelString=prompt("Please input copy of level text:");
var levelObject= JSON.parse(levelString);
lava= levelObject.allLava;
boxes=levelObject.allBlocks;
jumpPow=levelObject.allJumps;
goal=levelObject.allGoals;
player.startX=player.x;
player.startY=player.y;

function update() {
    
    // check keys
    if (keys[38] || keys[32]||keys[87]) {
        // up arrow or space
        
        if (!player.jumping && player.grounded) {
            player.jumping = true;
            player.grounded = false;
            player.velY = -player.speed * 2;
            
        }
        
    }
    if (keys[39]||keys[68]) {
        // right arrow
        if (player.velX < player.speed) {
            player.velX++;
        }
    }
    if (keys[37]||keys[65]) {
        // left arrow
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }
 
    player.velX *= friction;
    player.velY += gravity;
 
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.beginPath();
    //console.log("drawing player")
    player.grounded = false;
    for (var i = 0; i < boxes.length; i++) {
        
            ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
            var dir = colCheck(player, boxes[i]);
            if (dir === "l" || dir === "r") {
                player.velX = 0;
                player.jumping = false;
                if(player.doubleJump){
                    player.grounded=true;
                    if (keys[38] || keys[32]||keys[87]) {
                        player.jumping = true;
                        player.grounded = false;
                        player.doubleJump=false;
                        player.velY = - player.speed * 2;
                        if(dir==="l"){
                            player.velX=player.speed* 2;
                            
                        }else{
                            player.velX=player.speed* -2;
                            
                        }
                    }
                }else{
                    player.grounded=false;
                }
            } else if (dir === "b") {
                player.grounded = true;
                player.jumping = false;
                player.doubleJump=true;
            } else if (dir === "t") {
                player.velY *= -0.5;
            }
        
 
    }
    ctx.fill();
    //console.log("Drawing lava")
    ctx.beginPath();
    ctx.fillStyle="red";
    for(var i=0;i<lava.length; i++){
        
            ctx.rect(lava[i].x, lava[i].y, lava[i].width, lava[i].height);
            var dir=colCheck(player,lava[i]);
            if(dir==="l"||dir==="r"||dir==="b"||dir==="t"){
                reset();
            }
        
    }
    ctx.fill();
    ctx.beginPath();
    //console.log("drawing goal")
    ctx.fillStyle="green";
    for(var i=0;i<goal.length; i++){
        
            ctx.rect(goal[i].x, goal[i].y, goal[i].width, goal[i].height);
            var dir=colCheck(player,goal[i]);
            if(dir==="l"||dir==="r"||dir==="b"||dir==="t"){
                player.level++;
            }
        
    }
    ctx.fill();
    ctx.beginPath();
    //console.log("drawing jump pows")
    ctx.fillStyle="yellow";
    for(var i=0; i<jumpPow.length;i++){
        
            ctx.rect(jumpPow[i].x, jumpPow[i].y,jumpPow[i].width,jumpPow[i].height);
            var dir=colCheck(player,jumpPow[i]);
            if(dir==="l"||dir==="r"||dir==="b"||dir==="t"){
                player.doubleJump=true
                jumpPow[i].x*=-1;
            }
        
    }
    ctx.fill();
    if(player.grounded){
         player.velY = 0;
    }
 
    player.x += player.velX;
    player.y += player.velY;
    ctx.beginPath();
    ctx.fillStyle="blue"
    //console.log("drawing player")
    ctx.rect(player.x,player.y,player.width,player.height)
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle="pink";
    //console.log("drawing ghosts")
    ctx.globalAlpha=0.5;
    for(i=0;i<ghosts.length;i++){
        ctx.fillRect(ghosts[i].x,ghosts[i].y,ghosts[i].width,ghosts[i].height);
    }
    ctx.globalAlpha=1;
    ctx.fill();
    requestAnimationFrame(update);
}
 
function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;
 
    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {         
        // figures out on which side we are colliding (top, bottom, left, or right)
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                shapeA.y += oY;
            } else {
                colDir = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
//     console.log(colDir)
    return colDir;
}
function reset(){
    ghosts.push({
        x:player.x,
        y:player.y,
        width:player.width,
        height:player.height
    });
    player.x=player.startX;
    player.y=player.startY;
    player.velX=0;
    player.velY=0;
    for(var i=0;i<jumpPow.length;i++){
        jumpPow[i].x=Math.abs(jumpPow[i].x);
    }
}
document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
 
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});
window.addEventListener("load", function () {
    
    
    update();
});
setInterval(function(){
    for(var i=0;i<jumpPow.length;i++){
        jumpPow[i].x=Math.abs(jumpPow[i].x);
    }
    console.log("x: "+player.x);
    console.log("y: "+player.y)
},4000)
// update();