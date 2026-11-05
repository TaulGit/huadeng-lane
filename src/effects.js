const durations = { build: 1150, upgrade: 1150, profit: 1150 };

export function playEffect(kind, host) {
  if (!host || !Object.hasOwn(durations, kind) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  host.querySelector('.shop-effect')?.remove();
  const image = new Image();
  image.className = 'shop-effect';
  image.alt = '';
  image.setAttribute('aria-hidden', 'true');
  image.onload = () => setTimeout(() => image.remove(), durations[kind]);
  image.onerror = () => image.remove();
  image.src = './fx/' + kind + '.gif';
  host.appendChild(image);
}
