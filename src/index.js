const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const { json } = require("@gscript/gtools");

const app = express();
const server = createServer(app);
const io = new Server(server);

var timeBeforeNext = json.Load("timStamp") ? json.Load("timStamp") : -1;
var activities = json.Load("activities") ? json.Load("activities") : [];
json.Save("timStamp", timeBeforeNext);
json.Save(
  "activities",
  [activities[0], activities[1]].filter((a) => a !== undefined)
);
if (json.Load("msgs") === undefined) {
  json.Save("msgs", {});
}

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../html/index.html"));
});

app.get("/prod", (req, res) => {
  res.sendFile(join(__dirname, "../html/prod.html"));
});

app.get("/style", (req, res) => {
  res.sendFile(join(__dirname, "../style/index.css"));
});

app.get("/prod/script", (req, res) => {
  res.sendFile(join(__dirname, "../script/prod.js"));
});

app.get("/script", (req, res) => {
  res.sendFile(join(__dirname, "../script/index.js"));
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.emit("nextTimestamp", timeBeforeNext);
  socket.emit(
    "activities",
    [activities[0], activities[1]].filter((a) => a !== undefined)
  );

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("message", (msg) => {
    console.log("message: " + msg);
    io.emit("message", msg);
    var added = json.Load("msgs");
    added[new Date().toISOString()] = msg;
    added = json.sort(added, true);
    json.Save("msgs", added);
  });

  socket.on("editNextTimestamp", (timestamp) => {
    timeBeforeNext = timestamp;
    io.emit("nextTimestamp", timestamp);
    json.Save("timStamp", timeBeforeNext);
  });

  socket.on("editActivities", (act) => {
    activities = act;
    io.emit(
      "activities",
      [activities[0], activities[1]].filter((a) => a !== undefined)
    );
    json.Save(
      "activities",
      [activities[0], activities[1]].filter((a) => a !== undefined)
    );
  });
});

server.listen(80, () => {
  console.log("server running at http://localhost and http://localhost/prod");
});
