"""Build three painted miniature pedestrians. Run with Blender --background -P."""
from pathlib import Path
import bpy

out = Path(__file__).resolve().parents[1] / "public/models"
colors = {"skin": (.88,.58,.38), "hair": (.13,.075,.05), "silver": (.55,.58,.52),
          "cream": (.94,.78,.48), "denim": (.12,.24,.29), "rose": (.73,.29,.23),
          "jade": (.24,.46,.32), "leather": (.27,.14,.08), "eye": (.045,.035,.025)}
for role, coat, hair in [('student','denim','hair'),('gardener','jade','hair'),('neighbor','rose','silver')]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mats = {}
    for name, rgb in colors.items():
        m = bpy.data.materials.new(name)
        m.diffuse_color = (*rgb,1)
        m.use_nodes = True
        surface = m.node_tree.nodes.get("Principled BSDF")
        surface.inputs["Base Color"].default_value = (*rgb, 1)
        surface.inputs["Roughness"].default_value = 0.84
        mats[name] = m
    def oval(name, pos, scale, color):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, location=pos)
        obj = bpy.context.object
        obj.name, obj.scale = name, scale
        obj.data.materials.append(mats[color])
        for face in obj.data.polygons: face.use_smooth=True
        return obj
    oval("coat",(0,0,.61),(.215,.15,.28),coat)
    oval("face",(0,-.01,.98),(.217,.201,.228),"skin")
    oval("hair",(0,.025,1.085),(.222,.202,.15),hair)
    for sign in [-1,1]:
        oval("eye",(sign*.082,-.194,1.0),(.017,.014,.024),"eye")
        oval("cheek",(sign*.132,-.164,.949),(.034,.016,.018),"rose")
        oval("ear",(sign*.213,0,.979),(.042,.042,.061),"skin")
        oval("sleeve",(sign*.211,0,.63),(.068,.074,.164),coat)
        oval("hand",(sign*.221,-.008,.499),(.052,.056,.066),"skin")
        oval("trousers",(sign*.092,0,.28),(.084,.088,.184),"denim")
        oval("shoe",(sign*.094,-.037,.09),(.09,.139,.078),"leather")
    if role=="student":
        oval("beret",(0,.015,1.205),(.226,.203,.084),coat)
        oval("backpack",(0,.153,.64),(.154,.09,.17),"cream")
    elif role=="gardener":
        oval("brim",(0,0,1.183),(.31,.289,.034),"cream")
        oval("straw_crown",(0,.014,1.23),(.187,.167,.113),"cream")
        oval("apron",(0,-.132,.59),(.157,.041,.178),"cream")
    else:
        oval("bun",(0,.168,1.17),(.115,.105,.111),hair)
        oval("scarf",(0,-.012,.819),(.178,.146,.064),"cream")
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.join()
    bpy.ops.export_scene.gltf(filepath=str(out / ('walker-'+role+'.glb')),export_format='GLB')

