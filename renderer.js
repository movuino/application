"use strict";

const h = require("hyperscript");
const randomColor = require("randomcolor");
const faker = require("faker");
const wifiPassword = require("wifi-password");
const m = require("movuino.js");
const os = require("os");
const debounce = require("debounce");

const sounds = require("./lib/sounds");
const motions = require("./lib/motions");

window.onerror = function (err) {
  sounds.fart();
  console.error(err);
};

const movuinos = [];

m.on("movuino", async movuino => {
  movuino.once("data", () => {
    let n = 0

    const listener = () => {
      n++
    }

    movuino.on("data", listener)

    setInterval(() => {
      // movuino.removeListener("data", listener)
      console.log(`${n} messages per second`);
      console.log(`${1000 / n}ms latency`);
      n = 0
    }, 1000)
  })


  movuino.behaviors = {
    online: [],
    offline: [],
    plugged: [],
    unplugged: []
  };

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

  movuinos.push(movuino);

  const clap = debounce(() => {
    sounds.clap();
  }, 100, true);

  const clap2 = debounce(() => {
    sounds.clap2();
  }, 100, true);

  if (movuino.name === 'Axel') {
    movuino.on("data", (data) => {
      if (data[2] < -0.6 || data[2] > 0.6) {
        clap();
      }
    });
  } else if (movuino.name === 'Eva') {
    movuino.on("data", (data) => {
      if (data[2] < -0.6 || data[2] > 0.6) {
        clap2();
      }
    });
  }
});

m.detectWifi().then(({ssid, host}) => {
  const savedSsid = localStorage.getItem("ssid");
  const savedPassword = localStorage.getItem("password");
  const savedHost = localStorage.getItem("host");

  const form = document.querySelector(".configuration");
  form.elements.ssid.value = ssid || savedSsid || "";

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
    wifiPassword(ssid).then(password => {
      form.elements.password.value = password;
      end();
    }).catch(err => {
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

    localStorage.setItem("ssid", ssid);
    localStorage.setItem("password", password);
    localStorage.setItem("host", host);

    m.movuinos.forEach(async movuino => {
      if (!movuino.plugged) {
        return;
      }
      try {
        await movuino.attachSerial();
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

  form.elements.show.addEventListener("change", () => {
    const checked = form.elements.show.checked;
    form.elements.password.type = checked ? "text" : "password";
  });
}).catch(err => {
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

  const el = (
    h("div.movuino", {onclick: open, style},
      h("img.close-button", {onclick: close, src: "./images/close.png", hidden: true}),
      h("div.status", {},
        h("h1.title", movuino.name),
        h("div.status", {},
          h("img.plugged", {src: "./images/usb.png", hidden: true}),
          h("img.online", {src: "./images/wifi.png", hidden: true}),
        ),
      )
    )
  );

  function close(evt) {
    evt.stopPropagation();
    sounds.pop();
    el.classList.remove("big");
  }

  function open() {
    if (el.classList.contains("big")) {
      return;
    }
    movuinos.forEach(movuino => {
      movuino.el.style.zIndex = "0";
    });
    el.style.zIndex = "99";
    sounds.inflate();
    el.classList.add("big");
  }

  movuino.el = el;
  document.querySelector(".circle").appendChild(el);
}
