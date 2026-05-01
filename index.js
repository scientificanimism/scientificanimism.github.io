const buttons = document.querySelectorAll("header button");

const audioFiles = [
  "0 sci.ogg",
  "1 en.ogg",
  "2 ti.ogg",
  "3 fic.ogg",
  "4 a.ogg",
  "5 ni.ogg",
  "6 mis.ogg",
  "7 m.ogg",
];

// HTML5 Audio fallback
const sounds = audioFiles.map((file) => {
  const audio = new Audio(`audio/${file}`);
  audio.preload = "auto";
  audio.load();
  return audio;
});

let htmlUnlocked = false;

function unlockHtml(skipIndex) {
  if (htmlUnlocked) return;
  htmlUnlocked = true;
  sounds.forEach((s, i) => {
    if (i === skipIndex) return;
    s.muted = true;
    s.play().then(() => {
      s.pause();
      s.muted = false;
      s.currentTime = 0;
    });
  });
}

// Web Audio API for low-latency playback
let ctx;
const buffers = new Array(audioFiles.length);
let webAudioReady = false;

function initWebAudio() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    Promise.all(
      audioFiles.map((file) =>
        fetch(`audio/${file}`)
          .then((r) => r.arrayBuffer())
          .then((buf) => ctx.decodeAudioData(buf))
      )
    )
      .then((decoded) => {
        decoded.forEach((buf, i) => (buffers[i] = buf));
        webAudioReady = true;
      })
      .catch(() => {});
  } catch (e) {}
}

function play(index) {
  if (webAudioReady) {
    if (ctx.state === "suspended") ctx.resume();
    const source = ctx.createBufferSource();
    source.buffer = buffers[index];
    source.connect(ctx.destination);
    source.start(0);
  } else {
    const sound = sounds[index];
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

buttons.forEach((button, i) => {
  button.addEventListener("mouseenter", () => play(i));
  button.addEventListener("click", () => {
    initWebAudio();
    unlockHtml(i);
    play(i);
  });
  button.addEventListener("touchstart", (e) => {
    e.preventDefault();
    initWebAudio();
    unlockHtml(i);
    play(i);
  });
});

document.addEventListener("click", () => {
  initWebAudio();
  unlockHtml(-1);
});
document.addEventListener("touchstart", () => {
  initWebAudio();
  unlockHtml(-1);
});

document.addEventListener("keydown", (e) => {
  const index = parseInt(e.key) - 1;
  if (index >= 0 && index < audioFiles.length) {
    buttons[index].focus();
    initWebAudio();
    unlockHtml(index);
    play(index);
  }
});
