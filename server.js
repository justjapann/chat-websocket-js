var http = require("http");
var fs = require("fs");
var path = require("path");
const APP_PORT = process.env.APP_PORT || 3000;
const app = http.createServer(requestHandler);

app.listen(APP_PORT);
console.log(`🖥 HTTP Server running at ${APP_PORT}`);

function requestHandler(request, response) {
  console.log(`🖥 Received request for ${request.url}`);

  var filePath = "./client" + request.url;
  if (filePath == "./client/") {
    filePath = "./client/index.html";
  }
  var extname = String(path.extname(filePath)).toLowerCase();
  console.log(`🖥 Serving ${filePath}`);
  var mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  var contentType = mimeTypes[extname] || "application/octet-stream";
  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code == "ENOENT") {
        fs.readFile("./client/404.html", function (error, content) {
          response.writeHead(404, { "Content-Type": contentType });
          response.end(content, "utf-8");
        });
      } else {
        response.writeHead(500);
        response.end("Sorry, there was an error: " + error.code + " ..\n");
      }
    } else {
      response.writeHead(200, { "Content-Type": contentType });
      response.end(content, "utf-8");
    }
  });
}

const io = require("socket.io")(app, {
  path: "/socket.io",
});

io.attach(app, {
  cors: {
    origin: "http://localhost",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

io.on("connection", (socket) => {
  console.log("👾 New socket connected! >>", socket.id);
});

var users = {};

io.on("connection", (socket) => {
  console.log("👾 New socket connected! >>", socket.id);

  socket.on("new-connection", (data) => {
    console.log(`new-connection event received`, data);

    users[socket.id] = data.username;
    console.log("users :>> ", users);

    socket.emit("welcome-message", {
      user: "server",
      message: `Welcome to this Socket.io chat ${data.username}. There are ${
        Object.keys(users).length
      } users connected`,
    });
  });

  socket.on("new-message", (data) => {
    console.log(`👾 new-message from ${data.user}`);

    socket.broadcast.emit("broadcast-message", {
      user: users[data.user],
      message: data.message,
    });
  });
});
