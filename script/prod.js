var socket = io();

var timeBeforeNext = new Date().getTime();

const iframe = document.getElementById("channel-iframe");

async function editTs(timestamp, editBox = true) {
  timeBeforeNext = timestamp;
  var ts = timestamp < 0 ? new Date(new Date().getTime()) : new Date(timestamp);
  if (editBox) {
    try {
      document.getElementById("daterStamp").value =
        ts.getFullYear() +
        "-" +
        (ts.getMonth() + 1 < 10 ? "0" : "") +
        (ts.getMonth() + 1) +
        "-" +
        (ts.getDate() < 10 ? "0" : "") +
        ts.getDate();
    } catch (err) {}
    try {
      document.getElementById("timerStamp").value =
        (ts.getHours() < 10 ? "0" : "") +
        ts.getHours() +
        ":" +
        (ts.getMinutes() < 10 ? "0" : "") +
        ts.getMinutes();
    } catch (err) {}
  } else {
    var date = document.getElementById("daterStamp").value;
    var time = document.getElementById("timerStamp").value;

    timeBeforeNext = new Date(date + "T" + time).getTime();
  }

  if (timestamp < 0) {
    document.getElementById("timStamp").classList = [
      "timStamp flex row space-between gap10 hidden",
    ];
    document.getElementById("secondTimer").checked = false;
  } else {
    document.getElementById("timStamp").classList = [
      "timStamp flex row space-between gap10",
    ];
    document.getElementById("secondTimer").checked = true;
  }
}

async function setHour() {
  var timestamp = new Date().getTime();
  var date = new Date(timestamp);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var ms = date.getMilliseconds();
  var hours = hours < 10 ? "0" + hours : hours;
  var minutes = minutes < 10 ? "0" + minutes : minutes;
  var seconds = seconds < 10 ? "0" + seconds : seconds;
  var ms = Math.floor(ms / 100);
  var time = hours + ":" + minutes + ":" + seconds + ":" + ms;
  document.getElementById("Hour").innerText = time;
}

async function setTimer() {
  var timestamp = timeBeforeNext - new Date().getTime();
  if (timeBeforeNext < 0) {
    document.getElementById("Timer").classList = ["hidden"];
    return;
  } else if (timestamp < 0) {
    document.getElementById("Timer").classList = ["negative"];
    timestamp = -timestamp;
  } else {
    document.getElementById("Timer").classList = ["positive"];
  }
  var date = new Date(timestamp);
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var ms = date.getMilliseconds();
  var hours = Math.floor(date.getTime() / 3_600_000);
  var hours = hours < 10 ? "0" + hours : hours;
  var minutes = minutes < 10 ? "0" + minutes : minutes;
  var seconds = seconds < 10 ? "0" + seconds : seconds;
  var ms = Math.floor(ms / 100);
  var time = hours + ":" + minutes + ":" + seconds + ":" + ms;
  document.getElementById("Timer").innerText = time;
}

async function buttonMessagePressed() {
  var msg = document.getElementById("messageToSend").value;
  if (msg === "") {
    return;
  }
  socket.emit("message", msg);
  document.getElementById("messageToSend").value = "";
}

async function checkBoxChange() {
  var checkBox = document.getElementById("secondTimer");
  if (checkBox.checked) {
    document.getElementById("timStamp").classList = [
      "timStamp flex row space-between gap10",
    ];
    timeBeforeNext = new Date().getTime() + 60_000;
    var _timeBeforeNext = new Date(timeBeforeNext);
    _timeBeforeNext.setSeconds(0);
    _timeBeforeNext.setMilliseconds(0);
    timeBeforeNext = _timeBeforeNext.getTime();
    editTs(timeBeforeNext);
  } else {
    document.getElementById("timStamp").classList = [
      "timStamp flex row space-between gap10 hidden",
    ];
    timeBeforeNext = -1;
    editTs(timeBeforeNext);
  }
}

async function swapActivities() {
  var activity0 = document.getElementById("activitySelect0").value;
  var activity1 = document.getElementById("activitySelect1").value;

  document.getElementById("activitySelect0").value = activity1;
  document.getElementById("activitySelect1").value = activity0;
}

async function updateDatas() {
  var checkBox = document.getElementById("secondTimer");
  if (checkBox.checked) {
    var date = document.getElementById("daterStamp").value;
    var time = document.getElementById("timerStamp").value;
    var timestamp = new Date(date + "T" + time).getTime();
    socket.emit("editNextTimestamp", timestamp);
  } else {
    socket.emit("editNextTimestamp", -1);
  }

  var act0 = document.getElementById("activitySelect0").value;
  var act1 = document.getElementById("activitySelect1").value;
  socket.emit("editActivities", [act0, act1]);
}

socket.on("nextTimestamp", editTs);

socket.on("activities", function (act) {
  if (act[0] === undefined) {
    document.getElementById("activitySelect0").value = "";
    document.getElementById("activitySelect1").value = "";
  } else if (act[1] === undefined) {
    document.getElementById("activitySelect0").value = act[0];
    document.getElementById("activitySelect1").value = "";
  } else {
    document.getElementById("activitySelect0").value = act[0];
    document.getElementById("activitySelect1").value = act[1];
  }
});

const setAutoCol = () => {
  const elements = document.getElementsByClassName("auto-col");

  for (var i = 0; i < elements.length; i++) {
    const element = elements[i];
    var classes = element.classList;
    if (document.body.clientWidth > document.body.clientHeight) {
      classes.remove("col");
      iframe.width = "500px";
      iframe.height = "auto";
    } else {
      classes.add("col");
      iframe.width = "auto";
      iframe.height = "4000px";
    }
  }
};

setInterval(setHour, 50);
setInterval(setTimer, 50);
setInterval(setAutoCol, 50);

if (
  window.location.href.split("/")[
    window.location.href.split("/").length - 2
  ] === "prod"
) {
  iframe.src = `https://www.twitch.tv/embed/${window.location.href
    .split("/")
    [window.location.href.split("/").length - 1].toLowerCase()
    .replaceAll("-", "_")}/chat?parent=localhost`;
  iframe.title = `${window.location.href
    .split("/")
    [window.location.href.split("/").length - 1].toLowerCase()
    .replaceAll("-", "_")
    .split("_")
    .map((e) => {
      return e.charAt(0).toUpperCase() + e.slice(1);
    })
    .join("")}Chat`;
} else {
  iframe.style.width = "0";
  iframe.style.height = "0";
}
