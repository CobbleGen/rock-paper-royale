from my_server import app
from flask import render_template

@app.errorhandler(404)
def not_found_error(error):
    return 'File not found, 404'

@app.errorhandler(401)
def not_found_error(error):
    return 'Unauthorized request, 401'

@app.errorhandler(400)
def not_found_error(error):
    return 'Bad request, 400'
