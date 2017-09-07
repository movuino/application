"use strict";

const fs = require("fs");

const clips = fs.readdirSync("./audio");

clips.forEach(clip => {
  module.exports[clip.split(".")[0]] = function() {
    new Audio(`./audio/${clip}`).play();
  };
});
