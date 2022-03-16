console.log("chat.js file loaded!");

var socket = io.connect();

const username = prompt("Welcome! Please enter your name:");

socket.emit("new-connection", { username });

socket.on("welcome-message", (data) => {
  console.log("received welcome-message >>", data);
});

socket.on("welcome-message", (data) => {
  console.log("received welcome-message >>", data);
  addMessage(data, false);
});

function addMessage(data, isSelf = false) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  if (isSelf) {
    messageElement.classList.add("self-message");
    messageElement.innerText = `${data.message}`;
  } else {
    if (data.user === "server") {
      messageElement.innerText = `${data.message}`;
    } else {
      messageElement.classList.add("others-message");
      messageElement.innerText = `${data.user}: ${data.message}`;
    }
  }
  const chatContainer = document.getElementById("chatContainer");

  chatContainer.append(messageElement);
}

const messageForm = document.getElementById("messageForm");

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const messageInput = document.getElementById("messageInput");

  if (messageInput.value !== "") {
    let newMessage = messageInput.value;
    socket.emit("new-message", { user: socket.id, message: newMessage });
    addMessage({ message: newMessage }, true);
    messageInput.value = "";
  } else {
    messageInput.classList.add("error");
  }
});

socket.on("broadcast-message", (data) => {
  console.log("📢 broadcast-message event >> ", data);
  addMessage(data, false);
});
