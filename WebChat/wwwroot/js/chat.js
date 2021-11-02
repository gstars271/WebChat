"use strict";

var connection = new signalR.HubConnectionBuilder()
    .withAutomaticReconnect()
    .withUrl("https://localhost:44348/hubs/chat")
    .build();

 document.getElementById("sendBtn").disabled = true;

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

//send to specific user
connection.on("SendToUser", function (message) {
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
    document.getElementById("sendBtn").disabled = false;


}).catch(function (err) {
    return console.error(err.toString());
});

//event send message
if (document.getElementById("sendBtn") != null) {
    document.getElementById("sendBtn").addEventListener("click", function (event) {
        var message = document.getElementById("txtmessage").value;
        var receiver = document.getElementById("txtReceiver").value;
        if (receiver.trim() === '') {
            connection.invoke("SendAll", message).catch(function (err) {
                return console.error(err.toString());
            });
        } else {
            connection.invoke("SendPrivate", receiver, message).catch(function (err) {
                return console.error(err.toString());
            });
        }
        event.preventDefault();
    });
}
