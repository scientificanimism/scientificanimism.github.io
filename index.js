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

let ctx;
const buffers = new Array(audioFiles.length);

async function loadBuffers() {
  const decoded = await Promise.all(
    audioFiles.map((file) =>
      fetch(`audio/${file}`)
        .then((r) => r.arrayBuffer())
        .then((buf) => ctx.decodeAudioData(buf))
    )
  );
  decoded.forEach((buf, i) => (buffers[i] = buf));
}

function ensureContext() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  loadBuffers();
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
  button.addEventListener("click", () => {
    ensureContext();
    play(i);
  });
  button.addEventListener("touchstart", (e) => {
    e.preventDefault();
    ensureContext();
    play(i);
  });
});

document.addEventListener("click", ensureContext);
document.addEventListener("touchstart", ensureContext);

document.addEventListener("keydown", (e) => {
  const index = parseInt(e.key) - 1;
  if (index >= 0 && index < sounds.length) {
    buttons[index].focus();
    ensureContext();
    play(index);
  }
});
