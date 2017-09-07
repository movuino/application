const m = require("movuino.js");

const behaviors = {
  x: function(data) {
    return data[0] > 0.01 || data[0] < -0.01;
  },
  "x+": function(data) {
    return data[0] > 0.01;
  },
  "x-": function(data) {
    return data[0] < -0.01;
  },
  y: function(data) {
    return data[1] > 0.01 || data[1] < -0.01;
  },
  "y+": function(data) {
    return data[1] > 0.01;
  },
  "y-": function(data) {
    return data[1] < -0.01;
  },
  z: function(data) {
    return data[2] > 0.01 || data[2] < -0.01;
  },
  "z+": function(data) {
    return data[2] > 0.01;
  },
  "z-": function(data) {
    return data[2] < -0.01;
  }
};

const outputs = {
  play: function() {
    song.play();
  },
  pause: function() {
    song.pause();
  }
};

let inputs = [];
let output;

document
  .querySelector("#behaviorModal button.add")
  .addEventListener("click", () => {
    $("#behaviorModal").modal("hide");

    window.movuino.behaviors.push([inputs, output, false]);
  });

const form = document.querySelector("#behaviorModal form");
form.querySelectorAll("select").forEach(select => {
  select.addEventListener("change", update);
});
function update() {
  inputs = [...form.elements.input.options]
    .filter(option => option.selected)
    .map(option => option.value);
  output = form.elements.output.value;
}

const song = new Audio("./audio/song.mp3");

m.on("movuino", movuino => {
  movuino.on("data", data => {
    movuino.behaviors.forEach(([inputs, output]) => {
      let active = false;
      const match = inputs.map(input => behaviors[input]).some(func => {
        return func(data) === true;
      });

      if (match && !active) {
        outputs[output]();
        active = true;
      } else {
        active = false;
      }
    });

    let active = false;
    if (inputs.length === 0 || !output) return;

    const match = inputs.map(input => behaviors[input]).some(func => {
      return func(data) === true;
    });

    if (match && !active) {
      outputs[output]();
      active = true;
    } else {
      // out();
      active = false;
    }
  });
});
