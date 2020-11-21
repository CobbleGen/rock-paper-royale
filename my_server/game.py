import time
from threading import Timer

roster =  {}
current_players = {}
round_state = 0
current_timer = 0

print("Starting Game.py")

def addPlayer(player):
    #TODO: Make sure you can only join on roundstate 0
    current_players[player['uid']] = None
    roster[player['uid']] = {
        'uid'       : player['uid'],
        'name'      : player['name'],
        'last-time' : current_timer
    }

def handChosen(uid, chosen):
    if round_state == 2:
        current_players[uid] = chosen
        return True
    return False

def getGameState(uid):
    roster[uid]['last-time'] = current_timer
    return {
        'round_state'   : round_state,
        'timer'         : current_timer,
        'roster'        : roster,
        'curr_players'  : list(current_players.keys())
    }

def countTimer():
    global current_timer
    global round_state
    global current_timer
    if len(current_players) < 2:
        round_state = 0
        current_timer = 30
    else:
        if round_state == 0:
            round_state = 1
        if current_timer <= 0:
            if round_state == 0:
                current_timer = 30
            elif round_state == 1:
                current_timer = 15
                round_state = 2
            elif round_state == 2:
                round_state = 3
                current_timer = 10
            elif round_state == 3:
                pass
                
        else:
            current_timer -= 1
        #print(f'Time: {current_timer}')
    if current_timer % 5 == 0:
        poplist = []
        for key in roster.keys():
            if roster[key]['last-time'] > current_timer+5:
                poplist.append(key)
        for key in poplist:
            roster.pop(key)
            del current_players[key]
    Timer(1, countTimer).start()

Timer(1, countTimer).start()