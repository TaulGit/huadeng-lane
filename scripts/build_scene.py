import bpy, math, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def mat(n,c):
 m=bpy.data.materials.new(n); m.diffuse_color=(*c,1); m.use_nodes=True; m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*c,1); return m
cream=mat('Warm limestone',(0.76,.68,.45)); road=mat('Olive asphalt',(.30,.32,.20)); earth=mat('Terracotta edge',(.58,.32,.17)); white=mat('Ivory markings',(.98,.91,.69)); green=mat('Garden grass',(.59,.67,.28))
def box(n,p,s,m):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p); o=bpy.context.object;o.name=n;o.dimensions=s;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m); b=o.modifiers.new('Soft edges','BEVEL');b.width=.035;b.segments=2;return o
box('Floating street foundation',(0,0,-.35),(30,16,.7),earth)
box('Road',(0,-1,.025),(30,3.6,.08),road)
for x in range(-14,15,2):
 for y in [-6,-4,2,4,6]:box('Paving tile',(x,y,.08),(1.97,1.97,.18),cream)
for y in [-2.65,.65]:
 box('Road edge',(0,y,.08),(30,.07,.025),white)
 for x in range(-15,15):
  box('Drain',(x,y+.18,.12),(.92,.16,.035),earth)
  for k in range(5):box('Drain slot',(x-.35+k*.17,y+.18,.145),(.055,.11,.015),road)
for x in range(-14,15,2):
 for y in [-3.05,1.05]:
  bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=.065,depth=.65,location=(x,y,.47));bpy.context.object.name='Street bollard';bpy.context.object.data.materials.append(earth)
for x in [-12,12]:
 for y in [-2,-1.3,-.6,.1]:box('Crosswalk',(x,y,.08),(1.5,.35,.025),white)
placements={'bookshop':(-12,4,3.5),'treehouse':(-7,4,4.7),'ramen':(-2,4,3.7),'onsen':(3,4,4.6),'florist':(8,4,3.7),'townhouse':(12,4,3.6),'garden':(-12,-5,3.4),'tree':(-6,-5,2),'bench':(-2,-5,2),'pole':(3,-5,1.5),'bicycle':(7,-4,1.6),'hedge':(11,-5,2)}
report=[]
for name,(x,y,width) in placements.items():
 files=list((ROOT/'assets'/'tripo-out').glob(('treehouse-colored' if name=='treehouse' else name)+'-*/model.glb'))
 if not files and (ROOT/'public'/'models'/(name+'.glb')).exists(): files=[ROOT/'public'/'models'/(name+'.glb')]
 if not files: raise FileNotFoundError('Missing asset: '+name)
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(files[-1])); obs=list(set(bpy.data.objects)-before)
 mesh=[o for o in obs if o.type=='MESH'];bpy.context.view_layer.update()
 pts=[o.matrix_world@Vector(v) for o in mesh for v in o.bound_box]
 lo=Vector(tuple(min(p[i] for p in pts) for i in range(3)));hi=Vector(tuple(max(p[i] for p in pts) for i in range(3)));scale=width/max(hi.x-lo.x,hi.y-lo.y)
 col=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(col)
 for o in obs:
  for c in list(o.users_collection):c.objects.unlink(o)
  col.objects.link(o)
 root=bpy.data.objects.new(name+'_pivot',None);col.objects.link(root)
 for o in obs:
  if o.parent is None:o.parent=root
 root.scale=(scale,)*3;root.location=(x-(hi.x+lo.x)*.5*scale,y-(hi.y+lo.y)*.5*scale,.2-lo.z*scale)
 col.asset_mark();col.asset_data.description='Reusable Tripo street asset; grid placement, source GLB in assets/tripo-out'
 report.append({'name':name,'source':str(files[-1]),'grid_position':[x,y],'width':width})
# Reuse assets through collection instances.
for asset,locations in {'tree':[(-10,-5),(1,-5),(9,-5)],'hedge':[(-7,-6),(5,-6),(13,-6)],'bench':[(-4,-4),(6,-4)],'pole':[(-11,-3),(11,-3)]}.items():
 col=bpy.data.collections.get(asset)
 if col:
  original=placements[asset]
  for x,y in locations:
   instance=bpy.data.objects.new(asset+'_linked',None);instance.instance_type='COLLECTION';instance.instance_collection=col;instance.location=(x-original[0],y-original[1],0);bpy.context.scene.collection.objects.link(instance)
scene=bpy.context.scene
bpy.ops.object.camera_add(location=(27,-36,29));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.5))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=37;scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(-8,-10,20));bpy.context.object.data.energy=2400;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=15
scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.65,.78,.68,1);scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.view_settings.view_transform='Standard';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(ROOT/'output'/'street.png')
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'output'/'street.blend'));bpy.ops.render.render(write_still=True)
(ROOT/'output'/'asset-manifest.json').write_text(json.dumps(report,indent=2),encoding='utf8')



