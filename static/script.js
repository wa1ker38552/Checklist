function createDummyTask(c, message, locx, locy) {
  var task = document.createElement("div")
  var indicator = document.createElement("div")
  var circle = document.createElement("div")
  var text = document.createElement("div")

  task.className = "task-creation"
  indicator.classList.add("task-color")
  circle.className = "color "+c
  text.className = "task-input display-input"

  indicator.appendChild(circle)
  text.innerHTML = message

  indicator.style.width = "30%"
  text.style.width = "70%"

  task.appendChild(indicator)
  task.appendChild(text)

  task.style.background = "#ffffff"
  task.style.position = "absolute"
  task.style.left = locx+"vw"
  task.style.top = locy+"vh"
  task.style.width = "15vw"
  task.style.borderStyle = "solid"
  task.style.borderRadius = "1vh"
  task.style.borderColor = "#dbdbdb"
  task.style.borderWidth = "0.1vh"
  return task
}

function showCreateTask() {
  var createTask = document.getElementById("createTask")
  var self = document.getElementById("showCreateTask")
  createTask.classList.remove("hidden")
  self.classList.add("hidden")
}

function closeCreateTask() {
  var self = document.getElementById("createTask")
  var showCreateTask = document.getElementById("showCreateTask")
  self.classList.add("hidden")
  showCreateTask.classList.remove("hidden")
}

function changeColor() {
  var element = document.getElementById("taskColor")
  element.classList.remove(colors[color])
  if (color == 5) {color = 0}
  else {color += 1}
  element.classList.add(colors[color])
}

function createId() {
  var id = ""
  for (var i=0; i<16; i++) {
    id = id+Math.floor(Math.random()*10)
  }
  return id
}

function createTaskElement(c, message, id, type) {
  var task = document.createElement("div")
  var indicator = document.createElement("div")
  var circle = document.createElement("div")
  var text = document.createElement("div")
  var selection = document.createElement("div")

  // buttons
  var starButton = document.createElement("button")
  var checkButton = document.createElement("button")
  var deleteButton = document.createElement("button")

  // icons
  var starIcon = document.createElement("img")
  var checkIcon = document.createElement("img")
  var deleteIcon = document.createElement("img")

  starIcon.className = "selection-icon"
  checkIcon.className = "selection-icon"
  deleteIcon.className = "selection-icon"

  if (type == 1) {starIcon.src = "static/assets/filled-star-icon.png"}
  else {starIcon.src = "static/assets/star-icon.png"}
  checkIcon.src = "static/assets/done-icon.png"
  deleteIcon.src = "static/assets/delete-icon.png"

  starButton.className = "selection-wrapper"
  checkButton.className = "selection-wrapper"
  deleteButton.className = "selection-wrapper trash-task"

  if (type == 1) {starButton.onclick = function() {unstarTask(id)}}
  else {starButton.onclick = function() {starTask(id)}}
  checkButton.onclick = function() {checkTask(id)}
  deleteButton.onclick = function() {deleteTask(id)}

  starButton.appendChild(starIcon)
  checkButton.appendChild(checkIcon)
  deleteButton.appendChild(deleteIcon)

  if (type == 1) {task.className = "task-creation thick-border "+c+"Border"}
  else {
    if (type == 2) {task.className = "task-creation completed-task"}
    else {task.className = "task-creation"}
  }
  indicator.classList.add("task-color")
  circle.className = "color "+c

  if (type == 2) {text.className = "task-input display-input completed-text"}
  else {text.className = "task-input display-input"}
  selection.className = "selection-bar"

  selection.appendChild(deleteButton)
  selection.appendChild(checkButton)
  selection.appendChild(starButton)

  indicator.appendChild(circle)
  text.innerHTML = message

  task.appendChild(indicator)
  task.appendChild(text)

  if (type != 2) {task.appendChild(selection)}
  else {
    starButton.remove()
    checkButton.remove()
    task.appendChild(selection)
  }
  task.id = id

  return task
}

function createTask() {
  var container = document.getElementById("activeTaskContainer")
  var message = document.getElementById("taskName").value
  var id = createId()

  if (currentView == 0) {
    var element = createTaskElement(colors[color], message, id)
    container.prepend(element)
  }

  document.getElementById("taskName").value = ""
  closeCreateTask()

  fetch('/create/'+id, {
    method: 'POST',
    headers: {
      Accept: 'application.json',
              'Content-Type': 'application/json'
    },
    body: JSON.stringify({"color": color, "message": message})
  })
}

async function deleteTask(id) {
  document.getElementById(id).classList.add("red")
  document.getElementById(id).style.opacity = 0
  await new Promise(resolve => setTimeout(resolve, 1000));
  await fetch("/delete/"+id)
  document.getElementById(id).remove()
}

async function starTask(id) {
  document.getElementById(id).classList.add("yellow")
  document.getElementById(id).style.opacity = 0
  await new Promise(resolve => setTimeout(resolve, 1000));
  await fetch("/star/"+id)
  document.getElementById(id).remove()
}

async function unstarTask(id) {
  document.getElementById(id).style.opacity = 0
  await new Promise(resolve => setTimeout(resolve, 1000));
  await fetch("/unstar/"+id)
  document.getElementById(id).remove()
}

async function checkTask(id) {
  document.getElementById(id).classList.add("green")
  document.getElementById(id).style.opacity = 0
  await new Promise(resolve => setTimeout(resolve, 1000));
  await fetch("/check/"+id)
  document.getElementById(id).remove()
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

async function setView(type) {
  var container = document.getElementById("activeTaskContainer")
  var subtitle = document.getElementById("subtitle")
    
  document.getElementById(currentView).classList.remove("selected")
  document.getElementById(type).classList.add("selected")
  currentView = type

  removeAllChildNodes(container)

  if (type == 0) {subtitle.innerHTML = "Active Tasks"}
  else if (type == 1) {subtitle.innerHTML = "Starred Tasks"}
  else {subtitle.innerHTML = "Completed Tasks"}

  var sync = document.createElement("div")
  var icon = document.createElement("img")

  sync.className = "sync-container"
  sync.id = "pending"
  icon.className = "sync-icon"
  icon.src = "static/assets/sync-icon.png"

  sync.appendChild(icon)
  container.appendChild(sync)
  
  if (type == 0) {getTasks(container, "tasks", 0)}
  else if (type == 1) {getTasks(container, "starred", 1)}
  else {getTasks(container, "finished", 2)}
}

async function getTasks(parent, type, t) {
  const promise = await fetch('/tasks/'+type)
  const data = await promise.json()

  try {
    document.getElementById("pending").remove()
  } catch (Exception) {}
  
  for (const item of data) {
    var e = createTaskElement(colors[item['color']], item['message'], item['id'], t)
    parent.appendChild(e)
  }
}

async function surprise() {
  var parent = document.getElementsByTagName("body")[0]
  var elements = []
  var x = 2;
  var y = 1;

  for (var i=0; i<6; i++) {
    for (var j=0; j<10; j++) {
      var element = createDummyTask(colors[5], "happy birthday", x, y) 
      parent.append(element)  
      elements.push(element)
      await new Promise(resolve => setTimeout(resolve, 100-(i*16)))
      y += 10
    }
    x += 16
    y = 1
  }

  var background = document.createElement("div")
  background.className = "purple"
  background.style.width = "100vw"
  background.style.height = "100vh"
  background.style.position = "absolute"
  background.style.top = "-99vh"
  background.style.width = "100vw"
  background.style.height = "100vh"
  parent.append(background)

  for (var i=-100; i<=0; i++) {
    background.style.top = i+"vh"
    await new Promise(resolve => setTimeout(resolve, 1))
  }

  for (var i=0; i<elements.length; i++) {
    elements[i].remove()
  }

  var center = document.createElement("center")
  background.append(center)

  var happy = document.createElement("div")
  var birthday = document.createElement("div")
  happy.innerHTML = "HAPPY"
  birthday.innerHTML = "BIRTHDAY"
  
  happy.className = "birthday-text"
  birthday.className = "birthday-text"
  happy.style.top = "2vh"
  birthday.style.top = "5vh"
  
  center.append(happy)
  await new Promise(resolve => setTimeout(resolve, 500))
  center.append(birthday)
  await new Promise(resolve => setTimeout(resolve, 1000))
  background.remove()
}

const colors = ["red", "orange", "yellow", "green", "blue", "purple"]
var color = 4
var currentView = 0

window.onload = async function() {
  var container = document.getElementById("activeTaskContainer")
  getTasks(container, "tasks")
}
