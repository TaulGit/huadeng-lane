import * as THREE from 'three';

export function streetWalk(canvas, orbit, overview) {
  const eye = new THREE.PerspectiveCamera(68, 1, 0.04, 150);
  eye.rotation.order = 'YXZ';
  const button = document.querySelector('#walk');
  const pad = document.querySelector('#walk-pad');
  const keys = new Set();
  const touches = new Map();
  const directions = { KeyW:'forward', ArrowUp:'forward', KeyS:'back', ArrowDown:'back',
    KeyA:'left', ArrowLeft:'left', KeyD:'right', ArrowRight:'right' };
  let active = false;
  let drag = null;
  let lastTime = 0;
  function reset() {
    keys.clear();
    touches.clear();
    drag = null;
  }
  function toggle() {
    active = !active;
    reset();
    orbit.enabled = !active;
    document.body.classList.toggle('walking', active);
    button.textContent = active ? '返回经营' : '第一人称逛街';
    button.setAttribute('aria-pressed', String(active));
    if (active) {
      eye.position.set(-15.6, 1.32, 1.6);
      eye.rotation.set(-0.035, -1.12, 0, 'YXZ');
    }
  }
  button.disabled = false;
  button.onclick = toggle;
  window.addEventListener('keydown', event => {
    if (!active || document.querySelector('dialog[open]')) return;
    if (event.code === 'Escape') {toggle(); return;}
    if (directions[event.code]) {event.preventDefault(); keys.add(event.code);}
  });
  window.addEventListener('keyup', event => keys.delete(event.code));
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', reset);
  canvas.addEventListener('pointerdown', event => {
    if (!active || drag || event.button !== 0) return;
    drag = {id:event.pointerId, x:event.clientX, y:event.clientY};
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    eye.rotation.y -= (event.clientX - drag.x) * 0.004;
    eye.rotation.x = THREE.MathUtils.clamp(eye.rotation.x - (event.clientY - drag.y)*0.004,-1.1,1.1);
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  canvas.addEventListener('lostpointercapture', () => {drag = null;});
  pad.addEventListener('pointerdown', event => {
    const direction = event.target.dataset.direction;
    if (!active || !direction) return;
    event.preventDefault();
    pad.setPointerCapture(event.pointerId);
    touches.set(event.pointerId, direction);
  });
  pad.addEventListener('lostpointercapture', event => touches.delete(event.pointerId));
  return {
    get active() { return active; },
    camera(time) {
      const step = Math.min(0.06, (time-lastTime)/1000) * 3.2;
      lastTime = time;
      if (!active) return overview;
      if (eye.aspect !== overview.aspect) {eye.aspect = overview.aspect; eye.updateProjectionMatrix();}
      if (document.querySelector('dialog[open]')) {reset(); return eye;}
      const down = new Set([...touches.values(), ...Array.from(keys, key => directions[key])]);
      const forward = Number(down.has('forward')) - Number(down.has('back'));
      const right = Number(down.has('right')) - Number(down.has('left'));
      const stride = step / (Math.hypot(forward,right) || 1);
      const yaw = eye.rotation.y;
      eye.position.x = THREE.MathUtils.clamp(eye.position.x + (right*Math.cos(yaw)-forward*Math.sin(yaw))*stride,-16.6,16.6);
      eye.position.z = THREE.MathUtils.clamp(eye.position.z - (forward*Math.cos(yaw)+right*Math.sin(yaw))*stride,-2.35,2.65);
      return eye;
    }
  };
}
