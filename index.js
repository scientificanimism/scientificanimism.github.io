const buttons = document.querySelectorAll("header button");

const audioFiles = [
  "0 sci.mp3",
  "1 en.mp3",
  "2 ti.mp3",
  "3 fic.mp3",
  "4 a.mp3",
  "5 ni.mp3",
  "6 mis.mp3",
  "7 m.mp3",
];

// Pre-fetch raw audio data on page load
const rawDataPromises = audioFiles.map((file) =>
  fetch(`audio/${file}`).then((r) => r.arrayBuffer())
);

let ctx;
const buffers = new Array(audioFiles.length);
let ctxReady;

function ensureContext() {
  if (ctxReady) return ctxReady;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  ctxReady = Promise.all(rawDataPromises)
    .then((rawData) =>
      Promise.all(rawData.map((buf) => ctx.decodeAudioData(buf)))
    )
    .then((decoded) => {
      decoded.forEach((buf, i) => (buffers[i] = buf));
    });
  return ctxReady;
}

function play(index) {
  if (!ctx || !buffers[index]) return;
  const source = ctx.createBufferSource();
  source.buffer = buffers[index];
  source.connect(ctx.destination);
  source.start(0);
}

buttons.forEach((button, i) => {
  button.addEventListener("mouseenter", () => play(i));
  button.addEventListener("click", async () => {
    await ensureContext();
    play(i);
  });
  button.addEventListener("touchstart", async (e) => {
    e.preventDefault();
    await ensureContext();
    play(i);
  });
});

document.addEventListener("click", () => ensureContext());
document.addEventListener("touchstart", () => ensureContext());

document.addEventListener("keydown", async (e) => {
  const index = parseInt(e.key) - 1;
  if (index >= 0 && index < audioFiles.length) {
    buttons[index].focus();
    await ensureContext();
    play(index);
  }
});
