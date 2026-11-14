import { addLandscape } from './landscape.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export async function createWorld(host,onPick,progress){
const scene=new THREE.Scene();addLandscape(scene);const camera=new THREE.PerspectiveCamera(35,1,.1,150);camera.position.set(25,24,31);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));host.appendChild(renderer.domElement);renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;scene.add(new THREE.HemisphereLight(0xffffff,0x8b9470,2.8));let sun=new THREE.DirectionalLight(0xffefd4,3);sun.position.set(-12,20,10);scene.add(sun);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.maxPolarAngle=Math.PI*.43;controls.minDistance=15;controls.maxDistance=65;controls.enableDamping=true;
function box(w,h,d,x,y,z,color){let o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:1}));o.position.set(x,y,z);scene.add(o);return o;}
box(34,.7,15,0,-.4,0,'#b7855c');box(34,.1,3.2,0,.02,1,'#8e9473');let tiles=[];for(let x=-15;x<=15;x+=2)for(let z of [-6,-4,-2,4,6])box(1.97,.15,1.97,x,.03,z,'#e9dcb3');for(let z of [-.55,2.55])box(34,.02,.07,0,.1,z,'#fff2c9');for(let x of [-14,14])for(let z=0;z<2.4;z+=.6)box(1.4,.02,.3,x,.12,z,'#fff2c9');
for(let i=0;i<8;i++){let t=box(3.8,.12,4.5,-14+i*4,.12,-4.5,'#d0d99b');t.userData.slot=i;tiles.push(t);}
const loader=new GLTFLoader(),models={};const walkers=['walker-student','walker-gardener','walker-neighbor'];let names=[...walkers,'ramen','bookshop','florist','onsen','townhouse','treehouse','garden','tree','bench','pole','bicycle','hedge'];let count=0;await Promise.all(names.map(async n=>{try{models[n]=(await loader.loadAsync(`./models/${n}.glb`)).scene;}catch(e){console.error(n,e);}progress(++count,names.length);}));
function model(n,x,z,width){let original=models[n];if(!original)return null;let o=original.clone(true),bounds=new THREE.Box3().setFromObject(o),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),k=width/Math.max(size.x,size.z);o.scale.setScalar(k);o.position.set(x-center.x*k,.22-bounds.min.y*k,z-center.z*k);scene.add(o);return o;}
for(let x of [-12,-4,4,12])model('tree',x,5.5,1.7);for(let x of [-8,0,8]){model('bench',x,4.5,1.8);model('hedge',x+1.8,6,1.5);}model('bicycle',10,4,1.2);for(let x of [-15,1,15])model('pole',x,3.4,1.2);
let storefronts=[];
let buildings=[],people=[];function sync(state,selected){storefronts=state.slots.flatMap((b,i)=>b?.price?[-14+i*4]:[]);for(let o of buildings)if(o)scene.remove(o);buildings=state.slots.map((b,i)=>b?model(b.type,-14+i*4,-4.5,3.4):null);tiles.forEach((t,i)=>t.material.color.set(i===selected?'#f2bd67':state.slots[i]?'#d0d99b':'#e4d4a5'));}
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;let r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);let hit=ray.intersectObjects(tiles)[0];if(hit)onPick(hit.object.userData.slot);});
function animateCustomers(active) {
  people.forEach(person => scene.remove(person));
  people = [];
  if (!active) return;
  for (let i = 0; i < 24; i++) {
    const person = models[walkers[i % walkers.length]].clone(true);
    const direction = i % 2 ? -1 : 1;
    person.rotation.y = direction * Math.PI / 2;
    const visits = direction > 0 && storefronts.length > 0 && i % 4 === 0;
    const door = visits ? storefronts[(i / 4) % storefronts.length] : null;
    const start = visits ? Math.max(-16, door - 1.4 - (i % 7) * .55) : -16 + i * 1.33;
    person.position.set(start, .12, direction > 0 ? -1.35 : 3.12);
    person.userData.walk = { direction, pace: .78 + (i % 5) * .09, phase: i, door, stage: door === null ? null : 'approach', wait: .65 + (i % 3) * .3 };
    scene.add(person);
    people.push(person);
  }
}
let previousTime;
function moveCustomers(time) {
  const delta = Math.min(.1, (time - (previousTime ?? time)) / 1000);
  previousTime = time;
  for (const person of people) {
    const walk = person.userData.walk;
    if (walk.stage === 'approach' && person.position.x >= walk.door - .06) {
      person.position.x = walk.door;
      person.rotation.y = Math.PI;
      walk.stage = 'browse';
    }
    if (walk.stage === 'browse' || walk.stage === 'inside') {
      walk.wait -= delta;
      if (walk.wait <= 0) {
        walk.stage = walk.stage === 'browse' ? 'enter' : 'exit';
        person.visible = true;
        person.rotation.y = walk.stage === 'enter' ? Math.PI : 0;
      }
      continue;
    }
    if (walk.stage === 'enter' || walk.stage === 'exit') {
      const entering = walk.stage === 'enter';
      const target = entering ? -4.25 : -1.35;
      const step = delta * 2.25;
      if (Math.abs(target - person.position.z) <= step) {
        person.position.z = target;
        walk.stage = entering ? 'inside' : null;
        person.visible = !entering;
        walk.wait = 1.05 + (walk.phase % 1.4);
        if (!entering) person.rotation.y = walk.direction * Math.PI / 2;
      } else {
        person.position.z += entering ? -step : step;
      }
    } else {
      person.position.x += delta * walk.pace * walk.direction;
    }
    if (Math.abs(person.position.x) > 16.5) person.position.x = -16.49 * walk.direction;
    walk.phase += delta * walk.pace * 8;
    person.position.y = .12 + .035 * Math.abs(Math.sin(walk.phase));
    person.rotation.z = .034 * Math.sin(walk.phase);
  }
}
new ResizeObserver(()=>{let w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}).observe(host);renderer.setAnimationLoop(time=>{moveCustomers(time);controls.update();renderer.render(scene,camera);});return {sync,animateCustomers,missing:names.filter(n=>!models[n])};}
