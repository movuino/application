"use strict";

const h = require("hyperscript");
const randomColor = require("randomcolor");
const faker = require("faker");
const wifiPassword = require("wifi-password");
const m = require("movuino.js");
const os = require("os");

const sounds = require("./lib/sounds");
const graph = require("./graph");

window.onerror = function(err) {
  sounds.fart();
  console.error(err);
};

require("./behaviors");

const movuinos = [];

m.on("movuino", async movuino => {
  movuino.behaviors = [];

  movuino.color = randomColor({
    luminosity: "light",
    format: "rgba",
    alpha: 0.9,
    seed: movuino.id
  });
  movuino.name = (() => {
    faker.locale = "fr";
    faker.seed(movuino.id);
    return faker.name.firstName();
  })();

  console.log("movuino", movuino.name);

  drawMovuino(movuino);

  movuino.on("plugged", async () => {
    sounds.on();
    movuino.plugged = true;
    movuino.el.querySelector(".plugged").hidden = false;
    console.log("plugged", movuino.name);

    movuino.el.style.opacity = 1;
  });

  movuino.on("unplugged", async () => {
    sounds.off();
    movuino.plugged = false;
    movuino.el.querySelector(".plugged").hidden = true;
    console.log("unplugged", movuino.name);

    if (!movuino.plugged && !movuino.online) {
      movuino.el.style.opacity = 0;
    }
  });

  movuino.on("online", async () => {
    sounds.youpi();
    movuino.online = true;
    movuino.el.querySelector(".online").hidden = false;
    console.log("online", movuino.name);

    movuino.el.style.opacity = 1;
  });

  movuino.on("offline", async () => {
    sounds.aw();
    movuino.online = false;
    movuino.el.querySelector(".online").hidden = true;
    console.log("offline", movuino.name);

    if (!movuino.plugged && !movuino.online) {
      movuino.el.style.opacity = 0;
    }
  });

  movuino.on("vibrator-on", () => {
    console.log("vibrator on", movuino.name);
  });

  movuino.on("vibrator-off", () => {
    console.log("vibrator off", movuino.name);
  });

  movuino.on("button-up", () => {
    console.log("button-up", movuino.name);
  });

  movuino.on("button-down", () => {
    console.log("button-down", movuino.name);
  });

  movuinos.push(movuino);
});

m
  .detectWifi()
  .then(({ ssid, host }) => {
    console.log(ssid, host);
    const savedSsid = localStorage.getItem("ssid");
    const savedPassword = localStorage.getItem("password");
    const savedHost = localStorage.getItem("host");
    const savedHide = localStorage.getItem("hide") === "true";

    const form = document.querySelector(".configuration");

    form.elements.password.type = savedHide ? "password" : "text";

    form.elements.ssid.value = ssid || savedSsid || "";
    form.elements.hide.checked = savedHide;
    form.elements.host.value = host;

    function end() {
      form.querySelector("fieldset").disabled = false;
    }

    if (!savedSsid) {
      form.elements.host.value = host;
      end();
    } else if (!ssid || ssid === savedSsid) {
      form.elements.password.value = savedPassword;
      form.elements.host.value = savedHost;
      end();
    } else if (["darwin", "win32"].includes(os.platform())) {
      // Linux requires sudo
      wifiPassword(ssid)
        .then(password => {
          form.elements.password.value = password;
          end();
        })
        .catch(err => {
          console.error(err);
          end();
        });
    } else {
      end();
    }

    form.addEventListener("submit", evt => {
      evt.preventDefault();

      const ssid = form.elements.ssid.value;
      const password = form.elements.password.value;
      const host = form.elements.host.value;
      const hide = form.elements.hide.checked;

      localStorage.setItem("ssid", ssid);
      localStorage.setItem("password", password);
      localStorage.setItem("host", host);
      localStorage.setItem("hide", hide);

      m.movuinos.forEach(async movuino => {
        if (!movuino.plugged) {
          return;
        }
        try {
          await movuino.setWifi({
            ssid,
            password,
            host
          });
        } catch (err) {
          console.error(err);
        }
      });
    });

    form.elements.hide.addEventListener("change", () => {
      const checked = form.elements.hide.checked;
      form.elements.password.type = checked ? "password" : "text";
    });
  })
  .catch(err => {
    console.error(err);
  });

const circle = document.querySelector(".circle");
const diameter = circle.clientHeight;

// Movuino square size
const movuinoSide = 100;

// Grid in circle size
// https://fr.vikidia.org/wiki/Racine_carr%C3%A9e_de_2
// diameter is the hypotenuse
const gridSide = diameter / Math.sqrt(2);
const rest = (diameter - gridSide) / 2;

// Debug
// const div = document.createElement('div')
// div.style.width = `${gridSide}px`
// div.style.height = `${gridSide}px`
// div.style['background-color'] = 'red'
// div.style.position = 'fixed'
// div.style.left = `${rest + circle.offsetLeft}px`
// div.style.top = `${rest}px`
// document.body.appendChild(div)

const slices = Math.floor(gridSide / movuinoSide);
const height = circle.clientHeight;
const square = height / slices;

const positions = [];

let row = 0;
let col = 0;
let n = 0;

for (let i = 0; i < slices * slices; i++) {
  const x = col * movuinoSide;
  const y = row * movuinoSide;

  col++;

  if (++n === slices) {
    row++;
    col = 0;
    n = 0;
  }

  positions.push([x, y]);
}

function shuffle(a) {
  for (let i = a.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
}

shuffle(positions);

// Debug
// positions.forEach(([x, y]) => {
//   const div = document.createElement('div')
//   div.style.width = `${movuinoSide}px`
//   div.style.height = `${movuinoSide}px`
//   div.style['background-color'] = 'black'
//   div.style.position = 'fixed'
//   div.style.left = `${rest + circle.offsetLeft + x}px`
//   div.style.top = `${rest + y}px`
//   document.body.appendChild(div)
// })

function drawMovuino(movuino) {
  const [x, y] = positions.shift();

  const style = {
    "background-color": movuino.color,
    top: `${rest + y}px`,
    left: `${rest + circle.offsetLeft + x}px`
  };

  // Const inputs = [
  //   "online",
  //   "offline",
  //   "plugged",
  //   "unplugged"
  // ];

  // const outputs = [
  //   "audio"
  // ];

  const el = h(
    "div.movuino",
    { onclick: open, style },
    h("img.add-button", {
      onclick: add,
      src: "./images/add.png",
      hidden: true
    }),
    h("img.close-button", {
      onclick: close,
      src: "./images/close.png",
      hidden: true
    }),
    h(
      "div.status",
      {},
      h("h1.title", movuino.name),
      h(
        "div.status",
        {},
        h("img.plugged", { src: "./images/usb.png", hidden: true }),
        h("img.online", { src: "./images/wifi.png", hidden: true }),
        h("span.rate")
      ),
      h(
        "div.behaviors",
        {}
        // h("h2", "Behaviors")
      )
    )
  );

  let rate = 0;
  movuino.on("data", () => rate++);
  setInterval(() => {
    el.querySelector(".rate").textContent = `${rate}m/s`;
    rate = 0;
  }, 1000);

  function add() {
    $("#behaviorModal").modal();
  }

  function close(evt) {
    evt.stopPropagation();
    sounds.pop();
    el.classList.remove("big");
    graph.stop(movuino);

    movuino.startVibro();
    setTimeout(() => {
      movuino.stopVibro();
    }, 100);
  }

  function open() {
    window.movuino = movuino;

    if (el.classList.contains("big")) {
      return;
    }

    movuino.startVibro();
    setTimeout(() => {
      movuino.stopVibro();
    }, 100);

    movuinos.forEach(movuino => {
      movuino.el.style.zIndex = "0";
    });
    el.style.zIndex = "99";
    sounds.inflate();
    el.classList.add("big");
    graph.start(movuino);
  }

  movuino.el = el;
  document.querySelector(".circle").appendChild(el);
}

// // buttons
// (() => {
//   const audio = document.querySelector(".audio");
//   const muted = !!localStorage.getItem("muted");
//   if (muted) {
//     audio.querySelector("img")
//   }
//   audio.addEventListener("click", () => {

//   })
// })();

require("./lib/demo");
