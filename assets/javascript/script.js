var canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext("2d");
var collidables = [];
var getables = [];
var phase = 1;
var spritesheet = new Image();
var floor;
var entry1, entry2, entry3, entry4;
var birthdayShow = false;
spritesheet.src = "assets/images/spritesheet.png";
spritesheet.addEventListener("load", function() {
    floor = new Image();
    floor.src = "assets/images/floor.png";
    floor.addEventListener("load", function() {
        entry1 = new Image();
        entry1.src = "assets/images/entry1.png";
        entry1.addEventListener("load", function() {
            entry2 = new Image();
            entry2.src = "assets/images/entry2.png";
            entry2.addEventListener("load", function() {
                entry3 = new Image();
                entry3.src = "assets/images/entry3.png";
                entry3.addEventListener("load", function() {
                    entry4 = new Image();
                    entry4.src = "assets/images/entry4.png";
                    entry4.addEventListener("load", function() {
                        animate();
                    })
                })
            })
        })
    });
})

function pointWithin(x, y, obj){
    var x_intersection = x <= obj.x + obj.width && x >= obj.x;
    var y_intersection = y <= obj.y + obj.height && y >= obj.y;
    return x_intersection && y_intersection;
}

function objIntersect(obj1, obj2){
    var firstCorner = pointWithin(obj1.x, obj1.y, obj2);
    var secondCorner = pointWithin(obj1.x + obj1.width, obj1.y + obj1.height, obj2);
    var thirdCorner = pointWithin(obj1.x, obj1.y + obj1.height, obj2);
    var fourthCorner = pointWithin(obj1.x + obj1.width, obj1.y, obj2);
    return firstCorner || secondCorner || thirdCorner || fourthCorner;
}

function objIntersectBoth(obj1, obj2){
    var firstTest = objIntersect(obj1, obj2);
    var secondTest = objIntersect(obj2, obj1);
    return firstTest || secondTest;
}

var pichu = {
    mode: "default",
    direction: "down",
    motion: false,
    x: 100,
    y: 500,
    height: 100,
    width: 100,
    speed: 5,
    i: 0,
    motionDelay: 0,
    desiredDelay: 10,
    idle_i: 0,
    idleDelay: 0,
    idleDesiredDelay: 60,
    spriteMultiplier: 1,
    downArrays: [[0, 0, 215, 215], [230, 0, 215, 215], [0, 0, 215, 215], [467, 0, 215, 215]], //first is default, second is left foot out, fourth is right foot out (third is default)
    upArrays: [[0, 290, 215, 215], [240, 293, 215, 215], [0, 290, 215, 215], [480, 290, 215, 215]], //same as above
    leftArrays: [[0, 610, 215, 215], [230, 610, 215, 215], [0, 610, 215, 215], [467, 610, 215, 215]],
    rightArrays: [[0, 900, 215, 215], [230, 900, 215, 215], [0, 900, 215, 215], [467, 900, 215, 215]],
    downIdleArrays: [[0, 0, 215, 215], [947, 0, 215, 215]],
    upIdleArrays: [[0, 290, 215, 215]],
    leftIdleArrays: [[0, 610, 215, 215], [955, 610,215, 215]],
    rightIdleArrays: [[0, 900, 215, 215], [944, 900, 215, 215]],
    myArray: undefined,
    intersect: function() {
        var answer = false;
        var pichuTest = {
            x: this.x + 25,
            y: this.y,
            width: this.width - 25,
            height: this.height
        }
        for(var i = 0;i < collidables.length;i++){
            if(objIntersectBoth(pichuTest, collidables[i])){
                answer = true;
            }
        }
        return answer;
    },
    hitWall: function() {
        var pichuTest = {
            x: this.x + 25,
            y: this.y,
            width: this.width - 25,
            height: this.height
        }
        var test1 = pichuTest.x < 0 || (pichuTest.x + pichuTest.width) >= canvas.width;
        var test2 = pichuTest.y < 0 || (pichuTest.y + pichuTest.height) >= canvas.height;
        return test1 || test2;
    },
    draw: function() {
       if(this.motion){
        i = this.i;
        this.myArray = this.myArray ? this.myArray : this.downArrays; //as myArray starts off undefined, this will change it to be equal to the down array by default
        steps = this.myArray;
        c.drawImage(spritesheet, steps[i][0], steps[i][1], steps[i][2], steps[i][3], this.x, this.y, this.width * this.spriteMultiplier, this.height * this.spriteMultiplier);
       } else {
           idle_i = this.idle_i;
           this.myArray = this.myArray ? this.myArray : this.downIdleArrays;
           steps = this.myArray;
           c.drawImage(spritesheet, steps[idle_i][0], steps[idle_i][1], steps[idle_i][2], steps[idle_i][3], this.x, this.y, this.width * this.spriteMultiplier, this.height * this.spriteMultiplier);
       }
    },
    turnUp: function() {
        this.direction = "up";
        this.myArray = this.upArrays;
    },
    turnLeft: function() {
        this.direction = "left";
        this.myArray = this.leftArrays;
    },
    turnRight: function() {
        this.direction = "right";
        this.myArray = this.rightArrays;
    },
    turnDown: function() {
        this.direction = "down";
        this.myArray = this.downArrays;
    },
    startMoving: function() {
        this.motion = true;
        this.idle_i = 0;
        this.idleDelay = 0;
        switch(this.direction){
            case "up":
                this.myArray = this.upArrays;
                break;
            case "down":
                this.myArray = this.downArrays;
                break;
            case "left":
                this.myArray = this.leftArrays;
                break;
            case "right":
                this.myArray = this.rightArrays;
                break;
            default:
                break;
        }
    },
    stopMoving: function() {
        this.motion = false;
        this.i = 1;
        this.motionDelay = 0;
        switch(this.direction){
            case "up":
                this.myArray = this.upIdleArrays;
                break;
            case "down":
                this.myArray = this.downIdleArrays;
                break;
            case "left":
                this.myArray = this.leftIdleArrays;
                break;
            case "right":
                this.myArray = this.rightIdleArrays;
                break;
            default:
                break;
        }
    },
    update: function() {
        if(this.motion){
            this.motionDelay++;
            if(this.motionDelay >= this.desiredDelay){
                this.i++;
                this.motionDelay = 0;
                if(this.i >= this.myArray.length){
                    this.i = 0;
                }
            }
            switch(this.direction){
                case "up":
                    this.y -= this.speed;
                    if(this.intersect() || this.hitWall()){
                        this.y += this.speed;
                    }
                    break;
                case "down":
                    this.y += this.speed;
                    if(this.intersect() || this.hitWall()){
                        this.y -= this.speed;
                    }
                    break;
                case "left":
                    this.x -= this.speed;
                    if(this.intersect() || this.hitWall()){
                        this.x += this.speed;
                    }
                    break;
                case "right":
                    this.x += this.speed;
                    if(this.intersect() || this.hitWall()){
                        this.x -= this.speed;
                    }
                    break;
                default:
                    break;
            }
        } else {
            this.idleDelay++;
            if(this.idleDelay >= this.idleDesiredDelay){
                this.idle_i++;
                this.idleDelay = 0;
                this.idleDesiredDelay = 10;
                if(this.idle_i >= this.myArray.length){
                    this.idle_i = 0;
                    this.idleDesiredDelay = 100;
                }
            }
        }
        // getBox();
        if(objIntersectBoth(pichu, entry)){
            phaseCheck();
        }
        this.draw();
    }
}

function getBox() {
    if(objIntersectBoth(pichu, boxBoy)){
        alert("you win");
        pichu.x = 0;
        pichu.y = 0;
        pichu.stopMoving();
    }
}
var boxBoy = {
    x: 300,
    y: 300,
    height: 95,
    width: 95,
    draw: function() {
        c.fillRect(this.x, this.y, this.width, this.height);
    }
}
var entry = {
    x: 1000,
    y: 10,
    height: 186,
    width: 145,
    stateIndex: 1,
    stateDelay: 0,
    stateDesiredDelay: 5,
    stateArray: [entry1, entry2, entry3, entry4],
    draw: function() {
        var state;
        switch(this.stateIndex){
            case 1:
                state = entry1;
                break;
            case 2:
                state = entry2;
                break;
            case 3:
                state = entry3;
                break;
            case 4:
                state = entry4;
                break;
        }
        c.drawImage(state, this.x, this.y, this.width, this.height);
    },
    update: function() {
        this.stateDelay++;
        if(this.stateDelay >= this.stateDesiredDelay){
            this.stateIndex++;
            this.stateDelay = 0;
            if(this.stateIndex > 4){
                this.stateIndex = 1;
            }
        }
        this.draw();
    }
}

//collidables.push(boxBoy);
//getables.push(boxBoy);

function collidableDraw() {
    for(var i = 0;i < collidables.length;i++){
        collidables[i].draw();
    }
}

function getableDraw()  {
    for(var i = 0;i < getables.length;i++){
        getables[i].draw();
    }
}



function phaseCheck() {
    if(phase === 1){
        entry.x = 100;
        entry.y = 50;
        pichu.y = 600;
        phase++;
    } else if(phase === 2){
        entry.x = 500;
        entry.y = 500;
        pichu.y = 600;
        phase++;
    } else {
        birthdayTime();
    }
}

function movement() {
    var i_array = pichu.myArray;
    var i_index = 0;
    interval = setInterval(function() {
        i_index++;
        if(i_index >= i_array.length){
            i_index = 0;
        }
        pichu.i = i_index;
    }, 250)
}

window.addEventListener("keydown", function(event) {
    event.preventDefault();
    if(!birthdayShow){
        switch(event.key){
            case "ArrowUp":
                if(pichu.direction != "up"){
                    pichu.turnUp();
                }
                pichu.startMoving();
                break;
            case "ArrowDown":
                if(pichu.direction != "down"){
                    pichu.i = 1;
                    pichu.turnDown();
                }
                pichu.startMoving();
                break;
            case "ArrowLeft":
                if(pichu.direction != "left"){
                    pichu.i = 1;
                    pichu.turnLeft();
                }
                pichu.startMoving();
                break;
            case "ArrowRight":
                if(pichu.direction != "right"){
                    pichu.i = 1;
                    pichu.turnRight();
                }
                pichu.startMoving();
                break;
            default:
                break;
        }
    }
})

window.addEventListener("keyup", function(event){
    if(!birthdayShow){
        var possibleDirection = event.key.slice(5).toLowerCase();
    if(pichu.direction === possibleDirection){
        pichu.stopMoving();
    }
    }
});

// function defaultMove() {
//     var i_array = [pichu.downArrays, pichu.upArrays, pichu.leftArrays, pichu.rightArrays];
//     i_array = [pichu.leftArrays, pichu.rightArrays];
//     var i_index = 0;
//     var interval = setInterval(function() {
//         i_index++;
//         if(i_index >= i_array.length){
//             i_index = 0;
//         }
//         pichu.myArray = i_array[i_index];
//     }, 500)
// }

// //defaultMove();

var altColors = ["orange", "yellow"];
var candles = [];
var bigCandles = [];
var delay = 0;
var lightTime = false;
var candleLocations = [{x:442, y:241}, {x:247, y:550}, {x:284, y:290}, {x:467, y:48}, {x:91, y:77}, {x:342, y:30}, {x:540, y:605}, {x:318, y:323}, {x:338, y:113}, {x:337, y:623}, {x:605, y:151}, {x:701, y:299}, {x:636, y:109}, {x:619, y:305}, {x:696, y:259}, {x:543, y:344}, {x:435, y:268}, {x:772, y:354}, {x:167, y:287}, {x:464, y:498}, {x:634, y:359}, {x:638, y:344}, {x:448, y:655}, {x:703, y:320}, {x:57, y:222}, {x:250, y:87}, {x:200, y:443}, {x:706, y:367}, {x:587, y:39}, {x:53, y:328}, {x:234, y:485}, {x:792, y:299}, {x:875, y:260}, {x:541, y:515}, {x:184, y:338}, {x:540, y:364}, {x:915, y:256}, {x:315, y:244}, {x:258, y:190}, {x:309, y:492}, {x:541, y:551}, {x:773, y:253}, {x:1112, y:223}, {x:305, y:207}, {x:985, y:421}, {x:298, y:260}, {x:192, y:219}, {x:348, y:459}, {x:541, y:471}, {x:327, y:343}, {x:585, y:658}, {x:530, y:46}, {x:389, y:654}, {x:457, y:77}, {x:128, y:63}, {x:272, y:84}, {x:101, y:303}, {x:634, y:306}, {x:280, y:121}, {x:51, y:525}, {x:434, y:329}, {x:449, y:208}, {x:137, y:339}, {x:969, y:404}, {x:925, y:278}, {x:953, y:334}, {x:528, y:69}, {x:434, y:530}, {x:408, y:462}, {x:368, y:457}, {x:335, y:141}, {x:129, y:84}, {x:647, y:90}, {x:252, y:246}, {x:541, y:529}, {x:547, y:303}, {x:719, y:214}, {x:767, y:232}, {x:592, y:165}, {x:33, y:184}, {x:278, y:102}, {x:190, y:109}, {x:792, y:279}, {x:121, y:485}, {x:1023, y:266}, {x:258, y:205}, {x:310, y:569}, {x:48, y:246}, {x:660, y:70}, {x:616, y:658}, {x:541, y:582}, {x:642, y:244}, {x:415, y:655}, {x:230, y:90}, {x:252, y:272}, {x:917, y:332}, {x:1056, y:344}, {x:934, y:290}, {x:705, y:385}, {x:61, y:501}, {x:261, y:605}, {x:81, y:322}, {x:306, y:310}, {x:27, y:629}, {x:8, y:255}, {x:312, y:474}, {x:53, y:182}, {x:183, y:136}, {x:268, y:642}, {x:960, y:351}, {x:384, y:76}, {x:431, y:653}, {x:897, y:335}, {x:837, y:370}, {x:516, y:81}, {x:339, y:357}, {x:433, y:208}, {x:323, y:604}, {x:541, y:483}, {x:468, y:215}, {x:435, y:282}, {x:165, y:327}, {x:7, y:284}, {x:449, y:521}, {x:634, y:376}, {x:540, y:622}, {x:49, y:94}, {x:212, y:422}, {x:165, y:219}, {x:941, y:310}, {x:470, y:18}, {x:162, y:519}, {x:318, y:323}, {x:48, y:124}, {x:598, y:299}, {x:559, y:218}, {x:1044, y:292}, {x:471, y:648}, {x:253, y:222}, {x:211, y:88}, {x:403, y:542}, {x:552, y:253}, {x:155, y:532}, {x:876, y:239}, {x:241, y:509}, {x:339, y:95}, {x:263, y:621}, {x:742, y:221}, {x:41, y:565}, {x:819, y:409}, {x:497, y:13}, {x:251, y:296}, {x:1044, y:429}, {x:620, y:136}, {x:603, y:658}, {x:1050, y:410}, {x:65, y:196}, {x:12, y:179}, {x:259, y:592}, {x:1032, y:275}, {x:830, y:388}, {x:682, y:15}, {x:1054, y:390}, {x:541, y:497}, {x:861, y:300}, {x:1057, y:367}, {x:878, y:331}, {x:165, y:249}, {x:450, y:129}, {x:1001, y:234}, {x:729, y:396}, {x:290, y:134}, {x:71, y:479}, {x:8, y:306}, {x:922, y:267}, {x:273, y:659}, {x:283, y:286}, {x:166, y:505}, {x:542, y:326}, {x:886, y:219}, {x:1072, y:269}, {x:169, y:237}, {x:413, y:66}, {x:360, y:78}, {x:214, y:434}, {x:1015, y:248}, {x:469, y:512}, {x:223, y:13}, {x:401, y:210}, {x:91, y:276}, {x:1090, y:248}, {x:474, y:92}, {x:251, y:570}, {x:167, y:270}, {x:207, y:36}, {x:699, y:213}, {x:109, y:451}, {x:1122, y:214}, {x:258, y:46}, {x:845, y:350}, {x:32, y:341}, {x:310, y:552}, {x:102, y:420}, {x:11, y:234}, {x:642, y:214}, {x:108, y:77}, {x:755, y:377}, {x:332, y:556}, {x:866, y:284}, {x:189, y:463}, {x:704, y:347}, {x:51, y:72}, {x:434, y:345}, {x:309, y:532}, {x:125, y:44}, {x:445, y:488}, {x:43, y:539}, {x:578, y:301}, {x:699, y:276}, {x:356, y:638}, {x:972, y:390}, {x:130, y:105}, {x:865, y:327}, {x:77, y:456}, {x:370, y:12}, {x:247, y:530}, {x:70, y:209}, {x:934, y:333}, {x:558, y:296}, {x:11, y:320}, {x:574, y:15}, {x:277, y:192}, {x:393, y:460}, {x:176, y:490}, {x:443, y:224}, {x:132, y:525}, {x:539, y:434}, {x:503, y:212}, {x:641, y:265}, {x:487, y:215}, {x:1100, y:231}, {x:435, y:304}, {x:180, y:474}, {x:230, y:472}, {x:245, y:318}, {x:314, y:223}, {x:274, y:266}, {x:427, y:473}, {x:555, y:232}, {x:517, y:24}, {x:68, y:262}, {x:309, y:514}, {x:227, y:452}, {x:457, y:103}, {x:248, y:551}, {x:18, y:654}, {x:33, y:237}, {x:318, y:584}, {x:121, y:16}, {x:945, y:319}, {x:964, y:375}, {x:105, y:431}, {x:1136, y:188}, {x:1061, y:278}, {x:489, y:87}, {x:377, y:545}, {x:692, y:243}, {x:197, y:63}, {x:159, y:344}, {x:432, y:360}, {x:383, y:647}, {x:715, y:399}, {x:334, y:81}, {x:1055, y:299}, {x:343, y:53}, {x:165, y:219}, {x:143, y:218}, {x:785, y:325}, {x:124, y:505}, {x:632, y:663}, {x:541, y:567}, {x:11, y:205}, {x:638, y:328}, {x:447, y:156}, {x:558, y:660}, {x:83, y:438}, {x:548, y:278}, {x:382, y:208}, {x:137, y:130}, {x:633, y:125}, {x:33, y:584}, {x:241, y:510}, {x:606, y:68}, {x:392, y:21}, {x:781, y:259}, {x:250, y:29}, {x:292, y:197}, {x:55, y:50}, {x:1057, y:323}, {x:542, y:453}, {x:539, y:650}, {x:331, y:469}, {x:618, y:92}, {x:114, y:467}, {x:350, y:553}, {x:637, y:287}, {x:341, y:18}, {x:851, y:324}, {x:31, y:606}, {x:674, y:45}, {x:600, y:54}, {x:417, y:41}, {x:7, y:340}, {x:51, y:22}, {x:986, y:208}, {x:165, y:312}, {x:195, y:83}, {x:416, y:210}, {x:266, y:62}, {x:238, y:344}, {x:899, y:236}, {x:141, y:542}, {x:69, y:77}, {x:728, y:573}, {x:746, y:572}, {x:762, y:573}, {x:783, y:574}, {x:796, y:575}, {x:858, y:485}, {x:859, y:502}, {x:861, y:522}, {x:861, y:544}, {x:879, y:548}, {x:901, y:549}, {x:918, y:549}, {x:953, y:543}, {x:945, y:525}, {x:946, y:504}, {x:965, y:493}, {x:982, y:493}, {x:998, y:517}, {x:997, y:541}, {x:976, y:550}, {x:1036, y:495}, {x:1045, y:509}, {x:1050, y:527}, {x:1052, y:540}, {x:1069, y:561}, {x:1090, y:550}, {x:1101, y:537}, {x:1112, y:518}, {x:1117, y:488}, {x:1194, y:481}, {x:1180, y:483}, {x:1164, y:483}, {x:1156, y:498}, {x:1156, y:520}, {x:1157, y:534}, {x:1157, y:556}, {x:1157, y:577}, {x:1178, y:578}, {x:1192, y:582}, {x:1209, y:579}, {x:1178, y:528}, {x:1207, y:532}, {x:809, y:710}, {x:817, y:695}, {x:820, y:679}, {x:823, y:661}, {x:830, y:647}, {x:841, y:618}, {x:847, y:602}, {x:834, y:636}, {x:862, y:601}, {x:873, y:635}, {x:880, y:646}, {x:880, y:666}, {x:886, y:691}, {x:896, y:715}, {x:848, y:684}, {x:934, y:702}, {x:936, y:680}, {x:941, y:657}, {x:959, y:652}, {x:983, y:648}, {x:995, y:665}, {x:999, y:692}, {x:1000, y:713}, {x:1092, y:607}, {x:1093, y:623}, {x:1095, y:643}, {x:1095, y:653}, {x:1096, y:665}, {x:1098, y:691}, {x:1101, y:719}, {x:1088, y:721}, {x:1053, y:715}, {x:1068, y:713}, {x:1042, y:698}, {x:1039, y:683}, {x:1047, y:665}, {x:1055, y:660}, {x:1067, y:660}, {x:1140, y:660}, {x:1140, y:674}, {x:1144, y:703}, {x:1147, y:721}, {x:1144, y:661}, {x:1165, y:650}, {x:1179, y:649}, {x:1195, y:649}, {x:1289, y:716}, {x:1277, y:718}, {x:1261, y:718}, {x:1241, y:715}, {x:1231, y:699}, {x:1230, y:679}, {x:1233, y:665}, {x:1246, y:636}, {x:1264, y:630}, {x:1282, y:628}, {x:1294, y:637}, {x:1290, y:655}, {x:1276, y:661}, {x:1254, y:664}, {x:1238, y:648}, {x:1341, y:638}, {x:1344, y:647}, {x:1352, y:662}, {x:1355, y:673}, {x:1357, y:688}, {x:1364, y:701}, {x:1372, y:716}, {x:1381, y:727}, {x:1389, y:703}, {x:1395, y:694}, {x:1399, y:683}, {x:1408, y:667}, {x:1418, y:657}, {x:1429, y:671}, {x:1439, y:679}, {x:1442, y:689}, {x:1449, y:704}, {x:1464, y:719}, {x:1470, y:720}, {x:1476, y:695}, {x:1480, y:683}, {x:1485, y:669}, {x:1489, y:650}, {x:1495, y:638}, {x:1497, y:624}, {x:1256, y:558}, {x:1256, y:570}, {x:1252, y:584}];
function Candle(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.color = "yellow";
    this.draw = function() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.strokeStyle = "yellow";
        c.stroke();
        c.fillStyle = "yellow";
        c.fill();
    }
}

function shuffle(array){
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;
    var newArray = array;
    while(0 !== currentIndex){
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = newArray[currentIndex];
        newArray[currentIndex] = newArray[randomIndex];
        newArray[randomIndex] = temporaryValue;
    }

    return newArray;
}

var shuffleLocations = shuffle(candleLocations);
var shuffleIndex = 0;
var baby;

function BigCandle(x ,y) {
    this.x = x;
    this.y = y;
    this.radius = 25;
    this.color = "orange";
    this.draw = function() {
        c.beginPath();
        c.arc(this.x, this.y, 25, 0, Math.PI*2, false);
        c.strokeStyle = "orange";
        c.stroke();
        c.fillStyle = "orange";
        c.fill();
    }
}

function birthdayTime() {
    birthdayShow = true;
    document.title = "Happy Birthday Mel!!!";
    canvas.addEventListener("click", function(spot) {
        var newCandle = new Candle(spot.x, spot.y);
        console.log(newCandle);
        candles.push(newCandle);
        var newBigCandle = new BigCandle(spot.x, spot.y);
        bigCandles.push(newBigCandle);
    });
    
    window.addEventListener("keydown", function(event){
        event.preventDefault();
        if(event.key === "Backspace"){
            if(event.shiftKey){
                candles = [];
                bigCandles = [];
            } else {
                candles.pop();
                bigCandles.pop();
            }
        }
        if(event.key === "Enter"){
            var spots = "";
            for(var i = 0;i < candles.length;i++){
                spots += candles[i].x + "-" + candles[i].y
                if(i + 1 < candles.length){
                    spots += ", ";
                }
            }
            console.log(spots);
        }
    })

    baby = setInterval(function() {
        if(shuffleIndex < shuffleLocations.length){
            var newCandle = new Candle(shuffleLocations[shuffleIndex].x, shuffleLocations[shuffleIndex].y);
            candles.push(newCandle);
            var newBigCandle = new BigCandle(shuffleLocations[shuffleIndex].x, shuffleLocations[shuffleIndex].y);
            bigCandles.push(newBigCandle);
            shuffleIndex++;
        } else {
            clearInterval(baby);
        }
    }, 50);


}

function animate() {
    requestAnimationFrame(animate);
    if(birthdayShow){
        c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    for(var i = 0;i < candles.length;i++){
        // if(!this.lightTime){
        //     this.delay++;
        //     if(this.delay > 10){
        //         this.lightTime = true;
        //     }
        // } else {
        //     this.delay--;
        //     if(this.delay <= 0){
        //         this.lightTime = false;
        //     }
        // }
        if(lightTime){
            bigCandles[i].draw();
        }
        candles[i].draw();
    }
    if(!lightTime){
        delay++;
        if(delay > 10){
            lightTime = true;
        }
    } else {
        delay--;
        if(delay <= 0){
            lightTime = false;
        }
    }
    } else {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(floor, 0, 0, canvas.width, canvas.height);
    // collidableDraw();
    // getableDraw();
    entry.update();
    pichu.update();
    }


}