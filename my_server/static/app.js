$(document).ready(function () {
    $("#main-container").hide();
    $("#hand-picker").hide();
    let name;
    let uid;
    let activePlayers = [];
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
                    console.log(response);
                    uid = response["player_info"]["uid"];
                    console.log(uid);
                    fetchInfo();
                }
            });
        }
    });

    function updatePlayers(response) {
        let currPlayers = response["curr_players"];
        if (arraysMatch(currPlayers, activePlayers)) {
        } else {
            console.log("Updating HTML");
            activePlayers = currPlayers;
            $("#middle-circle").html("");
            degreeIncrements = 360/currPlayers.length;
            for (let index = 0; index < currPlayers.length; index++) {
                const player = response["roster"][currPlayers[index]];
                $(`
                    <div class="outer-card">
                        <div class="rot-buffer">
                            <div class="inner-card">
                                <div class="card"><i class="fas"></i></div>
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
                updatePlayers(response);
                updateTimer(parseInt(response["timer"]), response["round_state"]);
            }
        });   
    }

    function updateTimer(time, state) {
        if ($("#timer").text() != time) {
            if (state != 0) {
                setTimeout(() => $("#timer").html((time-1)), 1000);
                if (state == 1) {
                    $("#timer-text").text("Starting....");
                } else if(state == 2 && $("#timer-text").text() != "Choose what to throw") {
                    $("#timer-text").text("Choose what to throw");
                    $("#hand-picker").slideToggle(500);
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
        console.log("Classes: "+ $(this).attr("class"));
        let hand = $(this).attr("class").replace("hand ", "");
        console.log(hand);
        $.ajax({
            type: "POST",
            url: "/_chose_hand",
            data: {
                uid: uid,
                hand: hand
            },
            success: function (response) {
                console.log(response);
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