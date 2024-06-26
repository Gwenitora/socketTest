var socket = io();

var timeBeforeNext = new Date().getTime();
var activities = [];
var msgTimeout = undefined;

const iframe = document.getElementById("channel-iframe");

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
    document.getElementById("Timer").classList = "hidden";
    return;
  } else if (timestamp < 0) {
    document.getElementById("Timer").classList = "negative";
    timestamp = -timestamp;
  } else {
    document.getElementById("Timer").classList = "positive";
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

async function setActivity() {
  var activityA = document.getElementsByClassName("Activity actual");
  if (activities[0] === "" || activities[0] === undefined) {
    document.getElementsByClassName("Activity actual")[0].classList =
      "Activity actual hidden";
    activityA[0].innerHTML = "";
  } else {
    document.getElementsByClassName("Activity actual")[0].classList =
      "Activity actual";
    activityA[0].innerHTML =
      "<span>En ce moment:</span>" +
      activities[0].replaceAll("\n", "<br/>").replaceAll("\\n", "<br/>");
  }
  var activityN = document.getElementsByClassName("Activity next");
  if (activities[1] === "" || activities[1] === undefined) {
    document.getElementsByClassName("Activity next")[0].classList =
      "Activity next hidden";
    activityN[0].innerHTML = "";
  } else {
    document.getElementsByClassName("Activity next")[0].classList =
      "Activity next";
    activityN[0].innerHTML =
      "<span>Ensuite:</span>" +
      activities[1]
        .replaceAll("\\n", "<br/>")
        .replaceAll("\\", "<br/>")
        .replaceAll("\n", "<br/>");
  }
}

socket.on("nextTimestamp", function (timestamp) {
  timeBeforeNext = timestamp;
});
socket.on("activities", function (act) {
  activities = act;
});

socket.on("message", function (msg) {
  var msgBox = document.getElementById("MsgBox");
  var classicView = document.getElementById("ClassicView");
  var msgView = document.getElementById("MsgView");
  msgBox.innerText = msg;
  classicView.classList = "hidden totHeight totWidth";
  msgView.classList = "totHeight totWidth";

  setTimeout(() => {
    classicView.classList = "totHeight totWidth";
    msgView.classList = "hidden totHeight totWidth";
    msgBox.innerText = "";
  }, Math.max(5_000, 120 * msg.length));
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
setInterval(setActivity, 50);
setInterval(setAutoCol, 50);

if (
  window.location.href.split("/")[
    window.location.href.split("/").length - 2
  ] === "channel"
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
