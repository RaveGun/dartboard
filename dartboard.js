var points = 0;
var double = false;
var gameInProgress = false;
var currentPlayerNum = 0;
var currentPlayerThrow = 0;
var currentPlayerRemaining = 0;
var currentPlayerPoints = 0;
var currentRound = 1;
var startTime = 0;
var playingTimeout = 0;
var playersTotal = 2;
var bustRollback = 0;

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
    [1,  0,  7.5,  38.0],
    [3,  0, 38.0,  47.3],
    [1,  0, 47.3,  65.2],
    [2,  0, 65.2,  75.5],
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
                if(prRanges[index][0] == 2) {
                    double = true;
                } else {
                    double = false;
                }
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
        var finishesArea = document.getElementById("finishes");

        currentPlayerRemaining = parseInt(playerRemaining.innerText);
        currentPlayerPoints = parseInt(playerScore.innerText);

        /** Calculate scoring */
        if(currentPlayerRemaining >= points)
        {
            currentPlayerRemaining -= points;
            currentPlayerPoints += points;

            playerRemaining.innerText = currentPlayerRemaining;
            playerScore.innerText = currentPlayerPoints;
            playerThrow.innerText = points;

            findFinishes(currentPlayerRemaining);

            if((currentPlayerRemaining == 0) && (double == true)){
                /** END OF GAME */
                playerContainer.className = "player winner";
				gameInProgress = false;
                stopClockOnFinish();
            } else if(currentPlayerRemaining <= 1) {
                /** BUST */
                playerRemaining.innerText = bustRollback;
                currentPlayerThrow = 0;
                switchPlayer();
            } else if(++currentPlayerThrow > 2) {
                /** NEXT PLAYER */
                currentPlayerThrow = 0;
                switchPlayer();
            }
        }
        else {
            /** BUST */
            playerRemaining.innerText = bustRollback;
            currentPlayerThrow = 0;
            switchPlayer();
        }

    }
    
    function switchPlayer() {
        /* modifiy current player class */
        playerContainer.className = "player";
        /* switch player */
        currentPlayerNum++;
        currentPlayerNum %= playersTotal;
        
        if(currentPlayerNum == 0) {
            currentRound++;
            var roundsPlayed = document.getElementById("roundsplayed");
            roundsPlayed.innerText = currentRound;
        }

        /* next player class */
        playerContainer = document.getElementById("player"+currentPlayerNum);
        playerContainer.className = "player current";
        
        var playerRemaining = document.getElementById("remaining"+currentPlayerNum);
        bustRollback = parseInt(playerRemaining.innerText);
        
        for(var i=0; i<=2; i++) {
            playerThrow = document.getElementById("throw"+currentPlayerNum+i);
            playerThrow.innerText = "";
        }

        /** possible finishes  */
        currentPlayerRemaining = parseInt(playerRemaining.innerText);
        findFinishes(currentPlayerRemaining);
    }
    
    function findFinishes(points) {

        finishesArea.innerHTML = "";

        /** Find possible finishes */
        finishes.forEach(combination => {
            if(combination[0] == points) {
                console.log(combination);
                bl2ins = document.createElement('div');
                bl2ins.className = "finishes";
                bl2ins.innerHTML = '<div>' + 
                    combination[1].toString().padStart(10) + '   '+
                    combination[2].toString().padStart(10) + '   '+
                    combination[3].toString().padStart(10) + '   '+
                    '</div>';
                finishesArea.appendChild(bl2ins);
            } else {
                //console.log(combination[0]);
            }
        });
    }

    
    
}

function displayClock() {
    var playTime = new Date().getTime() - startTime;
    var timeplayed = document.getElementById("timeplayed");
    timeplayed.innerText = msToTime(playTime);
    playingTimeout = setTimeout(displayClock, 1000); 
}

function stopClockOnFinish() {
    console.log("This shall stop");
    clearTimeout(playingTimeout);
}

function msToTime(duration) {
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + ":" + minutes + ":" + seconds;
  }

function startGame() {

    var startButton = document.getElementById("cta-start");
    var playerslist = document.getElementById("players-area");
    playerslist.innerHTML = "";
    gameInProgress = true;

    var today = new Date();
    startTime = today.getTime();
    console.log(startTime);
    displayClock();

    currentRound = 1;
    var roundsPlayed = document.getElementById("roundsplayed");
    roundsPlayed.innerText = currentRound;

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
