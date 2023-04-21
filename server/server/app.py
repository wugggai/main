from os import environ
import time
from flask import Flask, request
from requests import get

app = Flask(__name__)

@app.route("/api/time")
def getTime():
    return {'time': time.time()}
