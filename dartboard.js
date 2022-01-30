var points = 0;
var gameInProgress = false;
var currentPlayerNum = 0;
var currentPlayerThrow = 0;
var currentPlayerRemaining = 0;
var currentPlayerPoints = 0;
var currentRound = 0;
var playersTotal = 2;

var $currentPlayer = null;
var $activePlayer = null;


/* 9 27 45 63 81 99 117 135 153 171 189 207 225 243 261 279 297 315 333 351 */
var ptSlice = [
    [ 1, 153, 171],
    [ 2,  27,  45],
    [ 3, 351, 360],
    [ 3,   0,   9],
    [ 4, 117, 135],
    [ 5, 189, 207],
    [ 6, 81,   99],
    [ 7, 315, 333],
    [ 8, 279, 297],
    [ 9, 225, 243],
    [10, 63,   81],
    [11, 261, 279],
    [12, 207, 225],
    [13,  99, 117],
    [14, 243, 261],
    [15,  45,  63],
    [16, 297, 315],
    [17,   9,  27],
    [18, 135, 153],
    [19, 333, 351],
    [20, 171, 189] 
];

/* Distance check */
/* 3% 7.5% 44% 47% 71,5 75,5 */
var prRanges = [
    [0, 50,  0.0,   3.0],
    [0, 25,  3.0,   7.5],
    [1,  0,  7.5,  44.0],
    [3,  0, 44.0,  47.0],
    [1,  0, 47.0,  71.5],
    [2,  0, 71.5,  75.5],
    [0,  0, 75.5, 150.0]
];

function onBoardMove(e)
{
    if( e.target.getAttribute('id') == "scheibe") {
        var lims = e.target.getBoundingClientRect();
    
        var cxval = e.x - lims.left - lims.width/2; 
        var cyval = e.y - lims.top - lims.height/2;
        
        var angleval = (Math.atan2(cxval, cyval) * 180) / Math.PI;
        if (angleval < 0)
            angleval += 360;
    
        var distval = Math.sqrt(cxval * cxval + cyval * cyval);
        distval = (distval / (lims.width/2)) * 100; /* in prercent */
    
    
        for (let index = 0; index < ptSlice.length; index++) {
            if( (angleval > ptSlice[index][1]) && (angleval <= ptSlice[index][2]) ) {
                points = ptSlice[index][0];
                break;
            }
        }
    
    
        for (let index = 0; index < prRanges.length; index++) {
            if( (distval > prRanges[index][2]) && (distval <= prRanges[index][3]) ) {
                points = (points * prRanges[index][0]) + prRanges[index][1];
                break;
            }
        }
        document.getElementById("points").textContent = points;
    }
}


function onBoardClick(e){
    if(!gameInProgress)
        return;

    if( e.target.getAttribute('id') == "scheibe") {
        var playerContainer = document.getElementById("player"+currentPlayerNum);
        var playerRemaining = document.getElementById("remaining"+currentPlayerNum);
        var playerScore = document.getElementById("score"+currentPlayerNum);
        var playerThrow = document.getElementById("throw"+currentPlayerNum+currentPlayerThrow);
        
        currentPlayerRemaining = parseInt(playerRemaining.innerText);
        currentPlayerPoints = parseInt(playerScore.innerText);

        if(currentPlayerRemaining >= points)
        {
            currentPlayerRemaining -= points;
            currentPlayerPoints += points;

            playerRemaining.innerText = currentPlayerRemaining;
            playerScore.innerText = currentPlayerPoints;
            playerThrow.innerText = points;

            if(currentPlayerRemaining == 0) {
                /* end of game */
                playerContainer.className = "player winner";
            } else if(++currentPlayerThrow > 2) {
                currentPlayerThrow = 0;
                switchPlayer();
            }
        }
        else {
            switchPlayer();
        }
    }
    function switchPlayer() {
        /* modifiy current player class */
        playerContainer.className = "player";
        /* switch player */
        currentPlayerNum++;
        currentPlayerNum %= playersTotal;
    
        /* next player class */
        playerContainer = document.getElementById("player"+currentPlayerNum);
        playerContainer.className = "player current";

        for(var i=0; i<=2; i++) {
            playerThrow = document.getElementById("throw"+currentPlayerNum+i);
            playerThrow.innerText = "";
        }
    }
}


function startGame() {

    var startButton = document.getElementById("cta-start");
    var playerslist = document.getElementById("players-area");
    if(gameInProgress == true)
    {
        playerslist.innerHTML = "";
    }
    gameInProgress = true;
    startButton.textContent = "ReStart"
    playersTotal = document.getElementById("players-total").value;

    for (var i = 0; i < playersTotal; i++) {
        bl2ins = document.createElement('div');
        bl2ins.className = "player";
        bl2ins.id = "player"+i;
        bl2ins.innerHTML = '<div class="container">\
                    <div class="throws">\
                        <div class="throw throw1" id="throw'+i+'0"></div>\
                        <div class="throw throw2" id="throw'+i+'1"></div>\
                        <div class="throw throw3" id="throw'+i+'2"></div>\
                    </div>\
                    <div class="name">\
                        <input type="text"/>\
                        <span></span>\
                    </div>\
                    <div class="scores-container">\
                        <div class="remaining" id="remaining'+i+'">501</div>\
                        <div class="scores" id="score'+i+'">0</div>\
                    </div>\
                </div>';
        console.log(bl2ins);
        playerslist.appendChild(bl2ins);
    }
    currentPlayerNum = 0;
    currentPlayerThrow = 0;
    /* set active player */
    var currentPlayerDiv = document.getElementById("player"+currentPlayerNum);
    currentPlayerDiv.className = "player current";
}
