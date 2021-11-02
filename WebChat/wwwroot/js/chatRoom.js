"use strict";

var connection = new signalR.HubConnectionBuilder()
    .withAutomaticReconnect()
    .withUrl("https://localhost:44348/hubs/chat")
    .build();

document.getElementById("sendToRoom").disabled = true;

//Send to all user
connection.on("SendToAll", function (user, message, timeStamp) {
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    console.log(msg);

    var encodedMsg = `[${timeStamp}] ` + user + " says " + msg;
    if (user == "System") {
        encodedMsg = `[${timeStamp}] ${msg}`;
    }
    var li = document.createElement("li");
    li.textContent = encodedMsg;

    var currentUser = $('#userName').data('username');
    if (currentUser.trim() == user.trim()) {
        li.setAttribute("style", "color: dodgerblue;");
        li.style.float = "right";
        //li.setAttribute("style", "float: right;");
    } else {
        if (user == "System") {
            li.setAttribute("style", "color: red;");
        } else {
            li.setAttribute("style", "color: green;");
        }
        li.style.float = "left";
    }
    document.getElementById("ulmessages").appendChild(li);
});


//send to group
connection.on("SendToGroup", function (message) {
    var msg = message.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var timeStamp = message.timeStamp;
    var receiver = message.reciever;
    var sender = message.sender;

    console.log(msg);
    var encodedMsg = `[${timeStamp}] ` + sender + " says " + msg;
    if (sender == "System") {
        encodedMsg = `[${timeStamp}] ${msg}`;
    }
    var li = document.createElement("li");
    li.textContent = encodedMsg;
    var currentUser = $('#userName').data('username');
    if (currentUser.trim() == sender.trim()) {
        li.setAttribute("style", "color: dodgerblue;");
        li.style.float = "right";
        //li.setAttribute("style", "float: right;");
    } else {
        if (sender == "System") {
            li.setAttribute("style", "color: red;");
        } else {
            li.setAttribute("style", "color: green;");
        }
        li.style.float = "left";
    }
    document.getElementById("ulmessages").appendChild(li);
});

//connection start
connection.start().then(function () {
    document.getElementById("sendToRoom").disabled = false;


}).catch(function (err) {
    return console.error(err.toString());
});


//event add group

document.getElementById("addgroup").addEventListener("click", function (event) {
    //var currentUser = $('#userName').data('username');
    var groupName = document.getElementById("roomSelect").value;
    if (groupName.trim() !== '' && groupName.trim().indexOf('Select') < 0) {
        connection.invoke("AddToGroup", groupName).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
});

document.getElementById("leavegroup").addEventListener("click", function (event) {
    //var currentUser = $('#userName').data('username');
    var groupName = document.getElementById("roomSelect").value;
    if (groupName.trim() !== '' && groupName.trim().indexOf('Select')) {
        connection.invoke("RemoveFromGroup", groupName).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
});

//event send message
document.getElementById("sendToRoom").addEventListener("click", function (event) {
    var message = document.getElementById("txtmessage").value;
    var groupName = document.getElementById("roomSelect").value;
    if (groupName.trim() !== '' && groupName.trim().indexOf('Select')) {
        connection.invoke("SendMessageToGroup", groupName, message).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
});
