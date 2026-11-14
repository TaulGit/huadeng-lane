const track = new Audio('./audio/huadeng-lane.mp3');
track.preload = 'none';
track.loop = true;
track.volume = 0.32;

const toggle = document.querySelector('#music');
let enabled = true;
let interacted = false;
let adOpen = false;
function syncMusic() {
  if (enabled && interacted && !document.hidden && !adOpen) {
    track.play().catch(() => {});
  } else {
    track.pause();
  }
}
function startMusic(event) {
  if (!event.isTrusted || toggle.contains(event.target)) return;
  interacted = true;
  syncMusic();
  document.removeEventListener('click', startMusic);
}
document.addEventListener('click', startMusic);
toggle.addEventListener('click', () => {
  interacted = true;
  enabled = !enabled;
  toggle.textContent = enabled ? '音乐开' : '音乐关';
  toggle.setAttribute('aria-pressed', String(enabled));
  syncMusic();
});
document.addEventListener('visibilitychange', syncMusic);
export function setAdOpen(open) {
  adOpen = open;
  syncMusic();
}
