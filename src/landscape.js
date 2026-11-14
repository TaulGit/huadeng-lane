import * as THREE from 'three';

export function addLandscape(scene) {
  scene.background = new THREE.Color('#ffddb6');
  scene.fog = new THREE.FogExp2('#f0dfc2', 0.012);
  const meadow = new THREE.Mesh(new THREE.CircleGeometry(105, 72),
    new THREE.MeshStandardMaterial({ color: '#b2c59b', roughness: 1 }));
  meadow.rotation.x = -Math.PI / 2;
  meadow.position.y = -0.86;
  scene.add(meadow);

  const hill = new THREE.IcosahedronGeometry(1, 2);
  for (const [radius, count, color] of [[77, 27, '#91a9a5'], [54, 23, '#a2b893']]) {
    const ridge = new THREE.InstancedMesh(hill,
      new THREE.MeshStandardMaterial({ color, flatShading: true }), count);
    for (let i = 0; i < count; i++) {
      const angle = i * Math.PI * 2 / count;
      const peak = new THREE.Object3D();
      peak.position.set(Math.cos(angle) * radius, -5, Math.sin(angle) * radius);
      peak.scale.set(13 + 3 * Math.cos(i), 9 + 4 * Math.sin(i * 2.3), 12);
      peak.updateMatrix();
      ridge.setMatrixAt(i, peak.matrix);
    }
    scene.add(ridge);
  }
}
