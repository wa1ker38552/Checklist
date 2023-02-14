from flask import render_template
from flask import make_response
from flask import request
from flask import Flask
from replit import db
import random
import json

app = Flask(__name__)

def generate_random_id(digits=10):
  id = ''.join([str(random.randint(0, 9)) for i in range(digits)])
  while id in db['users']:
    id = ''.join([str(random.randint(0, 9)) for i in range(digits)])
  return id

@app.route('/')
def index():
  if request.cookies.get('auth') is None:
    id = str(generate_random_id())
    db['users'][id] = {
      'tasks': [],
      'finished': [],
      'starred': []
    }
    response = make_response(render_template('index.html'))
    response.set_cookie('auth', id)
    return response
  return render_template('index.html')

@app.route('/create/<id>', methods=['POST'])
def create(id):
  data = json.loads(request.data.decode('utf-8'))
  db['users'][request.cookies.get('auth')]['tasks'].append({
    'id': id,
    'color': data['color'],
    'message': data['message']
  })
  return {'success': True}

@app.route('/delete/<id>')
def delete(id):
  for i, task in enumerate(db['users'][request.cookies.get('auth')]['tasks']):
    if task['id'] == id:
      db['users'][request.cookies.get('auth')]['tasks'].pop(i)
      break
  for i, task in enumerate(db['users'][request.cookies.get('auth')]['starred']):
    if task['id'] == id:
      db['users'][request.cookies.get('auth')]['starred'].pop(i)
      break
  for i, task in enumerate(db['users'][request.cookies.get('auth')]['finished']):
    if task['id'] == id:
      db['users'][request.cookies.get('auth')]['finished'].pop(i)
      break
  return {'success': True}

@app.route('/star/<id>')
def star(id):
  for i, task in enumerate(db['users'][request.cookies.get('auth')]['tasks']):
    if task['id'] == id:
      db['users'][request.cookies.get('auth')]['tasks'].pop(i)
      db['users'][request.cookies.get('auth')]['starred'].append(task)
      break
  return {'success': True}

@app.route('/unstar/<id>')
def unstar(id):
  for i, task in enumerate(db['users'][request.cookies.get('auth')]['starred']):
    if task['id'] == id:
      db['users'][request.cookies.get('auth')]['starred'].pop(i)
      db['users'][request.cookies.get('auth')]['tasks'].append(task)
      break
  return {'success': True}

@app.route('/check/<id>')
def check(id):
  for i, task in enumerate(db['users'][request.cookies.get('auth')]['tasks']):
    if task['id'] == id:
      db['users'][request.cookies.get('auth')]['tasks'].pop(i)
      db['users'][request.cookies.get('auth')]['finished'].append(task)
      break
  for i, task in enumerate(db['users'][request.cookies.get('auth')]['starred']):
    if task['id'] == id:
      db['users'][request.cookies.get('auth')]['starred'].pop(i)
      db['users'][request.cookies.get('auth')]['finished'].append(task)
      break
  return {'success': True}

@app.route('/tasks/<type>')
def tasks(type):
  if request.cookies.get('auth') in db['users']:
    clean_list = []
    for item  in db['users'][request.cookies.get('auth')][type]:
      temp_dict = {}
      for key in item:
        temp_dict[key] = item[key]
      clean_list.append(temp_dict)
  else: clean_list = []
  clean_list.reverse()
  return clean_list


# db['users'] = {}
app.run(host='0.0.0.0', port=8080)