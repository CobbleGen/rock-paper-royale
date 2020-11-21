from my_server import app, game
from flask import request, url_for, flash, redirect, session, render_template, abort
import json, uuid

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/_create_connection')
def createConnection():
    name = request.args['name']
    uid = uuid.uuid1().hex
    player = {
        'uid' : uid, 
        'name' : name
    }
    game.addPlayer(player)
    outDic = {
        'player_info': player
    }
    outStr = json.dumps(outDic)
    return outStr

@app.route('/_get_game_state')
def getGameState():
    state = game.getGameState(request.args['uid'])
    return json.dumps(state)

@app.route('/_chose_hand', methods=['POST', 'GET'])
def setChoseHand():
    uid = request.form['uid']
    hand = request.form['hand']
    r = str(game.handChosen(uid, hand))
    return r