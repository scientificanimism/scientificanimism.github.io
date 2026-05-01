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

const sounds = audioFiles.map((file) => {
  const audio = new Audio(`audio/${file}`);
  audio.preload = "auto";
  return audio;
});

let audioUnlocked = false;

function unlock(skipIndex) {
  if (audioUnlocked) return;
  audioUnlocked = true;
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

function play(index) {
  const sound = sounds[index];
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

buttons.forEach((button, i) => {
  button.addEventListener("mouseenter", () => play(i));
  button.addEventListener("click", () => {
    unlock(i);
    play(i);
  });
  button.addEventListener("touchstart", (e) => {
    e.preventDefault();
    unlock(i);
    play(i);
  });
});

document.addEventListener("click", () => unlock(-1));
document.addEventListener("touchstart", () => unlock(-1));
