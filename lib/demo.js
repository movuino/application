"use strict";

const m = require("movuino.js");
const robot = require("robotjs");

m.on("movuino", movuino => {
  // Sensibility
  const s = 0.1;
  const gravity = 0.06;

  if (movuino.name !== "Gabriel") {
    return;
  }

  movuino.on("button-down", () => {
    console.log("button");
    robot.keyTap("space");
  });

  function test([x, , z]) {
    if (x > s) {
      console.log("left");
      // robot.keyTap("left");
      unlisten();
      setTimeout(listen, 500);
    } else if (x < -s) {
      console.log("right");
      // robot.keyTap("right");
      unlisten();
      setTimeout(listen, 500);
    } else if (z > s - gravity) {
      console.log("down");
      // robot.keyTap("space");
      unlisten();
      setTimeout(listen, 500);
    } else if (z < -s + -gravity) {
      console.log("up");
      // robot.keyTap("up");
      unlisten();
      setTimeout(listen, 500);
    }
  }

  function listen() {
    movuino.on("data", test);
  }

  function unlisten() {
    movuino.removeListener("data", test);
  }

  listen();
});

m.on("movuino", movuino => {
  if (movuino.name !== "Axel") {
    return;
  }

  // Sensibility
  const s = 0.075;

  const song = new Audio("./audio/song.mp3");
  let move = false;

  movuino.on("data", data => {
    const moving =
      data[0] > s ||
      s < -s ||
      data[1] > s ||
      s < -s ||
      data[2] > s ||
      s < -s ||
      data[3] > s ||
      s < -s ||
      data[4] > s ||
      s < -s ||
      data[5] > s ||
      s < -s;

    if (moving && !move) {
      song.play();
      move = true;
    } else if (!moving && move) {
      song.pause();
      move = false;
    }
  });
});
