$(document).ready(function () {
    $("#main-container").hide();
    $("#hand-picker").hide();
    $("#announce").hide();
    let name;
    let uid;
    let activePlayers = [];
    let revealed = false;
    $("#enter").click(function (e) { 
        name = $("#user-enter").val();
        if (name === "") {
            
        } else {
            $("#starter").hide();
            $("#main-container").show();
            $.ajax({
                type: "GET",
                url: "/_create_connection",
                dataType: "json",
                data: {
                    name: name
                },
                success: function (response) {
                    uid = response["player_info"]["uid"];
                    fetchInfo();
                }
            });
        }
    });

    function inGame() {
        if (activePlayers.includes(uid)) {
            return true;
        }
        return false;
    }

    function updatePlayers(response, hardReset) {
        let currPlayers = response["curr_players"];
        if (arraysMatch(currPlayers, activePlayers) && !hardReset) {
        } else {
            activePlayers = currPlayers;
            $("#middle-circle").html("");
            degreeIncrements = 360/currPlayers.length;
            for (let index = 0; index < currPlayers.length; index++) {
                const player = response["roster"][currPlayers[index]];
                $(`
                    <div class="outer-card">
                        <div class="rot-buffer">
                            <div class="inner-card" style="transform: rotateY(0deg);">
                                <div class="card"><i class="far fa-3x"></i></div>
                                <div class="backside"><i class="fas fa-question fa-3x"></i></div>
                            </div>
                            <b>${player["name"]}</b>
                        </div>
                    </div>
                    `).appendTo("#middle-circle").css("transform", `rotate(${degreeIncrements*index}deg) translateX(350px)`)
                    .children(".rot-buffer").css("transform", `rotate(-${degreeIncrements*index}deg)`);
            }
        }
    }

    function revealPlayers(currPlayers, winner) {
        let loser = "";
        switch (winner) {
            case "rock":
                loser = "scissors";
                break;
            case "paper":
                loser = "rock";
                break;
            case "scissors":
                loser = "paper";
                break;
            default:
                break;
        }
        if (!revealed) {
            revealed = true;
            let players = Object.entries(currPlayers);
            let children = $("#middle-circle").children().toArray();
            for (let i = 0; i < players.length; i++) {
                const e = players[i];
                let extra = "tie";
                if (e[1] == winner) {
                    extra = "winner";
                } else if (e[1] == loser || e[1] == null) {
                    extra = "loser";
                }
                $(children[i]).find(".card").addClass(extra).children("i").attr("class", "far fa-3x fa-hand-" + e[1]);
                $(children[i]).find(".inner-card").css("transform", "rotateY(180deg)");
            }
        }
    }

    function fetchInfo() {
        $.ajax({
            type: "GET",
            url: "/_get_game_state",
            dataType: "json",
            data: {
                uid: uid
            },
            success: function (response) {
                console.log(response);
                setTimeout(fetchInfo, 2000);
                if (response["round_state"] != 3) {
                    if (revealed) {
                        revealed = false;
                        updatePlayers(response, true);
                    }
                    updatePlayers(response, false);
                    updateTimer(parseInt(response["timer"]), response["round_state"], "");
                } else {
                    revealPlayers(response['curr_players'], response["winner"]);
                    updateTimer(parseInt(response["timer"]), response["round_state"], response["winner"]);
                }
                
            }
        });   
    }

    function updateTimer(time, state, winner) {
        if(inGame()) {
            $("#announce").hide();
        } else {
            $("#announce").show();
        }
        if ($("#timer").text() != time) {
            if (state != 0) {
                setTimeout(() => $("#timer").html((time-1)), 1000);
                if (state == 1) {
                    $("#timer-text").text("Starting....");
                } else if(state == 2 && $("#timer-text").text() != "Choose what to throw") {
                    $("#timer-text").text("Choose what to throw");
                    if(inGame()) {
                        $("#hand-picker").slideToggle(500);
                    }
                } else if(state == 3) {
                    if(winner == "tie") {
                        $("#timer-text").text("Tie!");
                    } else {
                        const capWinner = winner.charAt(0).toUpperCase() + winner.slice(1);
                        $("#timer-text").text(capWinner + " wins!");
                    }
                }
            } else {
                $("#timer-text").text("Waiting for players.")
                $("#hand-picker").hide();
            }
            $("#timer").html(time);
        }
    }

    $(".hand").click(function() {
        $("#hand-picker").slideToggle(500);
        let hand = $(this).attr("class").replace("hand ", "");
        $.ajax({
            type: "POST",
            url: "/_chose_hand",
            data: {
                uid: uid,
                hand: hand
            },
            success: function (response) {
                //console.log(response);
            }
        });
    });
});

var arraysMatch = function (arr1, arr2) {
	if (arr1.length !== arr2.length) return false;
	for (var i = 0; arr1.length < i; i++) {
		if (arr1[i] !== arr2[i]) return false;
    }
    
    return true;
};