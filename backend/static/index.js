function range(start, end) {
  if (start === end) return [start];
  return [start, ...range(start + 1, end)];
}

function createWaterCicleProgressbar(percent, liters) {
  let progressCount = document.getElementById("water-count");
  let $circle = $(document).find(".water-circle");

  //Calcule la circonférence du cercle
  let radius = $circle.attr("r");
  let diameter = radius * 2;
  let circumference = Math.round(Math.PI * diameter);

  //Calcule le pourcentage d'avancement
  let percentage = (circumference * (100 - percent)) / 100;

  $circle.css({
    "stroke-dasharray": circumference,
    "stroke-dashoffset": percentage,
  });

  $circle
    .css({
      "stroke-dashoffset": circumference,
    })
    .animate(
      {
        "stroke-dashoffset": percentage,
      },
      3000
    );

  $({ Counter: 0 }).animate(
    { Counter: liters },
    {
      duration: 3000,
      step: function () {
        progressCount.innerText = `💧\n${Math.ceil(this.Counter)}mL`;
      },
    }
  );
}

labels = ["", "", "", "", "", "", "", "", "Yesterday", "Today"];
data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

function updateChart() {
  let barChartData = {
    labels: labels,
    datasets: [
      {
        fillColor: "rgba(0,60,100,1)",
        strokeColor: "black",
        data: data,
      },
    ],
  };

  let ctx = document.getElementById("canvas").getContext("2d");
  new Chart(ctx).Bar(barChartData, {
    responsive: true,
    barValueSpacing: 2,
  });
}

function getDayBack(offset) {
  let xhttp = new XMLHttpRequest();
  let index = 9 - offset;
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let liters = parseInt(xhttp.responseText);
      data[index] = liters;
      console.log(`Day ${index}: ${liters}mL`);
      updateChart();
    }
  };
  let start = new Date();
  start.setUTCHours(0, start.getTimezoneOffset(), 0, 0);
  start = new Date(start.getTime() - 60 * 60 * 24 * offset * 1000);
  labels[index] = start.toLocaleDateString();
  let end = new Date(start.getTime() + 60 * 60 * 24 * 1000);

  xhttp.open(
    "GET",
    `api/water/${start.toISOString()}/${end.toISOString()}`,
    true
  );
  xhttp.send();
}

// GET WEEKS WATER
for (const x of range(1, 9)) {
  getDayBack(x);
}

// GET TODAYS WATER
let todays_water_request = new XMLHttpRequest();
todays_water_request.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    console.log(todays_water_request.responseText);
    let liters = parseInt(todays_water_request.responseText);
    data[9] = liters;
    updateChart();

    let percent = (liters / 2000) * 100;
    console.log(`Todays water: ${liters} (${percent}%)`);
    createWaterCicleProgressbar(percent, liters);
  }
};
let start = new Date();
start.setUTCHours(0, start.getTimezoneOffset(), 0, 0);
let end = new Date(start.getTime() + 60 * 60 * 24 * 1000);

todays_water_request.open(
  "GET",
  `api/water/${start.toISOString()}/${end.toISOString()}`,
  true
);
todays_water_request.send();

// GET LATEST PANODIL

/*--------------------------------------------------------------
 ## HTML Elements
--------------------------------------------------------------*/
var secondsCircle = document.getElementById("seconds_circle");
var minutesCircle = document.getElementById("minutes_circle");
var minuteText = document.getElementById("minute_text");
var secondText = document.getElementById("second_text");
var sub = document.getElementById("sub");
var plus = document.getElementById("plus");

/*NOTE: Move into CSS*/
secondsCircle.style.strokeDashoffset = 0;
minutesCircle.style.strokeDashoffset = 500;

/*--------------------------------------------------------------
 # Variables
--------------------------------------------------------------*/
var timerValue = 0; // User customizible timer value
var activeTimer; // Assigned to setTimeout later
var timerIsActive = false; // Currently counting down?

/*--------------------------------------------------------------
 ## Functions >>   ### timerCountdown()
--------------------------------------------------------------*/
function timerCountdown(goal, initMinutes) {
  var now = new Date().getTime();
  var timeLeft = goal - now;
  var seconds = Math.floor((timeLeft / 1000) % 60);
  var minutes = Math.floor(timeLeft / 1000 / 60);

  if (timeLeft <= 0) {
    // Time's up!!
    minuteText.innerHTML = "";
    secondText.style.fontSize = "100px";
    secondText.innerHTML = "✔";
    secondText.setAttribute("x", "0.6em");
    secondText.setAttribute("y", "1.4em");
    secondsCircle.style.strokeDashoffset = 0;
    secondsCircle.style.stroke = "green";
    minutesCircle.style.strokeDashoffset = 0;
    minutesCircle.style.stroke = "green";
    clearTimeout(activeTimer);
    return;
  }
  // Otherwise countdown
  activeTimer = setTimeout(function () {
    timerIsActive = true;
    secondText.innerHTML = ":" + zeroPad(seconds); // Update seconds
    minuteText.innerHTML = `${Math.floor(minutes / 60)}:${zeroPad(
      minutes % 60
    )}`; // Update minutes
    if (seconds === 0) {
      seconds = 60;
    } // Complete the circle
    // The total length of the circles is 500
    var secondsCircle_length = 500 - (seconds / 60) * 500;
    var minutesCircle_length = ((initMinutes - minutes) / initMinutes) * 500;
    secondsCircle.style.strokeDashoffset = secondsCircle_length;
    minutesCircle.style.strokeDashoffset = minutesCircle_length;
    timerCountdown(goal, initMinutes);
  }, 1000);
}

/*--------------------------------------------------------------
 ## Functions >>   ### zeroPad() | Pad single-digit numbers with "0"
--------------------------------------------------------------*/
function zeroPad(n) {
  n = n + "";
  return n.length >= 2 ? n : new Array(2 - n.length + 1).join(0) + n;
}

let panodil_request = new XMLHttpRequest();
panodil_request.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    let date_str = panodil_request.responseText.replace(/\"/g, "");
    let last = new Date(date_str);
    let next = last.getTime() + 6 * 60 * 60 * 1000;
    timerCountdown(next, 6 * 60);
  }
};
panodil_request.open("GET", "api/panodil", true);
panodil_request.send();
