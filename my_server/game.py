import time
from threading import Timer

roster =  {}
current_players = {}
round_state = 0
current_timer = 0
winner = ''

print("Starting Game.py")

def addPlayer(player):
    if round_state == 0 or round_state == 1:
        current_players[player['uid']] = None
    roster[player['uid']] = {
        'uid'       : player['uid'],
        'name'      : player['name'],
        'last-time' : current_timer
    }

def handChosen(uid, chosen):
    if round_state == 2 and uid in current_players.keys():
        current_players[uid] = chosen
        return True
    return False

def getGameState(uid):
    if uid in roster.keys():
        roster[uid]['last-time'] = time.time()
    else:
        return 'crash'
    if round_state == 3:
        return {
            'round_state'   : round_state,
            'timer'         : current_timer,
            'roster'        : roster,
            'curr_players'  : current_players,
            'winner'        : winner
        }
    return {
        'round_state'   : round_state,
        'timer'         : current_timer,
        'roster'        : roster,
        'curr_players'  : list(current_players.keys())
    }

def checkRoundOutcome():
    global current_players
    hands = list(current_players.values())
    counts = {
        'rock'      : hands.count('rock'),
        'scissors'  : hands.count('scissors'),
        'paper'     : hands.count('paper')
    }
    if counts['rock'] == counts['scissors'] and counts['rock'] == counts['paper']:
        return 'tie'
    minHand = {'def' : 99999}
    for key in counts.keys():
        if counts[key] < list(minHand.values())[0] and counts[key] != 0:
            minHand = {key : counts[key]}
        elif counts[key] == list(minHand.values())[0]:
            minHand[key] = counts[key]
    if len(minHand.keys()) < 2:
        return list(minHand.keys())[0]
    if findLoser(list(minHand.keys())[0]) == list(minHand.keys())[1]:
        return list(minHand.keys())[0]
    else:
        return list(minHand.keys())[1]

def findLoser(hand):
    if hand == 'rock':
        return 'scissors'
    if hand == 'paper':
        return 'rock'
    if hand == 'scissors':
        return 'paper'
    return 'error'

def eliminateLosers(winner):
    loser = findLoser(winner)
    amount = 0
    for key, value in current_players.copy().items():
        if value == loser or value == None:
            amount += 1
            del current_players[key]
    return amount

def countTimer():
    global current_timer
    global round_state
    global winner
    global current_players
    #If less than 2 players, wait for more players
    if len(current_players) < 2:
        round_state = 0
        current_timer = 30
    else:
        if round_state == 0:
            round_state = 1
        #When timer hits zero, change round state
        if current_timer <= 0:
            if round_state == 0:
                current_timer = 30
            elif round_state == 1:
                #Start the game from lobby
                current_timer = 10
                round_state = 2
            elif round_state == 2:
                #Everyone has picked a hand to throw, now check who won
                round_state = 3
                current_timer = 5
                winner = checkRoundOutcome()
                print(winner)
            elif round_state == 3:
                #Eliminate losers, either start new round or announce winner of game
                eliminated = eliminateLosers(winner)
                print(f'{eliminated} players eliminated.')
                if len(current_players) < 2:
                    current_players = {x: None for x in list(roster.keys())}
                    round_state = 1
                    current_timer = 20
                else:  
                    current_players = {x: None for x in current_players}
                    round_state = 2
                    current_timer = 10
        else:
            current_timer -= 1
            print("Time: " + str(current_timer))
    Timer(1, countTimer).start()
    #Every 5 seconds, eliminate AFK people (people who have not sent a request for 5 seconds)
    if current_timer % 5 == 2:
        #TODO: Folk blir inte längre kickade av någon anledning
        for key in roster.copy().keys():
            if roster[key]['last-time'] < time.time()-5:
                roster.pop(key)
                if key in current_players.keys():
                    del current_players[key]
                print(key + " got kicked for inactivity.")
    

Timer(1, countTimer).start()