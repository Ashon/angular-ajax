from flask import Flask
from flask import render_template

import time
import random

app = Flask(__name__, static_folder='static')

sleep = 2
@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/dummyA')
def get_dummy_a():
    waits = random.random() * sleep
    time.sleep(waits)

    return '{"exec":' + str(waits) + '}'

@app.route('/dummyB')
def get_dummy_b():
    waits = random.random() * sleep
    time.sleep(waits)

    return '{"exec":' + str(waits) + '}'

@app.route('/dummyC')
def get_dummy_c():
    waits = random.random() * sleep
    time.sleep(waits)

    return '{"exec":' + str(waits) + '}'

@app.route('/dummyD')
def get_dummy_d():
    waits = random.random() * sleep
    time.sleep(waits)

    return '{"exec":' + str(waits) + '}'

@app.route('/dummyE')
def get_dummy_e():
    waits = random.random() * sleep
    time.sleep(waits)

    return '{"exec":' + str(waits) + '}'
if __name__ == '__main__':
    app.run()
