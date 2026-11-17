# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Reproducible isolated Blender candidate. No render, downloads, or provider calls."""
import bpy as bpy_chirho
import math as math_chirho
import random as random_chirho
import json as json_chirho
import hashlib as hashlib_chirho
from pathlib import Path as PathChirho
import argparse as argparse_chirho
import sys as sys_chirho
from mathutils import Vector as VectorChirho
from bpy_extras.object_utils import world_to_camera_view as worldToCameraViewChirho

SOURCE_ROOT_CHIRHO = PathChirho(__file__).resolve().parent
arguments_chirho=sys_chirho.argv[sys_chirho.argv.index('--')+1:] if '--' in sys_chirho.argv else []
parser_chirho=argparse_chirho.ArgumentParser(description='Build the editable Audio Bible Radio listening room.')
parser_chirho.add_argument('--output-chirho',type=PathChirho,default=SOURCE_ROOT_CHIRHO/'output-chirho')
ROOT_CHIRHO=parser_chirho.parse_args(arguments_chirho).output_chirho.expanduser().resolve()
ROOT_CHIRHO.mkdir(parents=True,exist_ok=True)
random_chirho.seed(161126)
bpy_chirho.ops.wm.read_factory_settings(use_empty=True)
scene_chirho = bpy_chirho.context.scene
scene_chirho.render.engine = 'CYCLES'
scene_chirho.cycles.samples = 32
scene_chirho.cycles.device = 'CPU'
scene_chirho.cycles.use_denoising = True
scene_chirho.cycles.use_adaptive_sampling = True
scene_chirho.cycles.adaptive_threshold = .06
scene_chirho.cycles.adaptive_min_samples = 8
scene_chirho.cycles.max_bounces = 8
scene_chirho.cycles.diffuse_bounces = 3
scene_chirho.cycles.glossy_bounces = 4
scene_chirho.cycles.transmission_bounces = 6
scene_chirho.cycles.sample_clamp_indirect = 4
scene_chirho.render.threads_mode = 'FIXED'
scene_chirho.render.threads = 2
scene_chirho.render.resolution_x = 800
scene_chirho.render.resolution_y = 550
scene_chirho.render.resolution_percentage = 100
scene_chirho.world = bpy_chirho.data.worlds.new('night_world_chirho')
# Blender5.2 creates node trees directly; use_nodes is deprecated and unnecessary.
assert scene_chirho.world.node_tree is not None
scene_chirho.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.13, 0.17, 0.25, 1)
scene_chirho.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .25
scene_chirho.view_settings.view_transform = 'AgX'
scene_chirho.view_settings.exposure = .15


def group_chirho(name_chirho, parent_chirho=None):
    object_chirho = bpy_chirho.data.objects.new(name_chirho, None)
    scene_chirho.collection.objects.link(object_chirho)
    object_chirho.parent = parent_chirho
    return object_chirho


room_chirho = group_chirho('room_chirho')
radio_chirho = group_chirho('radio_chirho')
wax_root_chirho = group_chirho('lamp_wax_chirho', room_chirho)
rain_root_chirho = group_chirho('window_rain_chirho', room_chirho)
lights_chirho = group_chirho('light_chirho')


def texture_chirho(name_chirho, kind_chirho, size_chirho=256):
    image_chirho = bpy_chirho.data.images.new(name_chirho, width=size_chirho, height=size_chirho, alpha=False)
    pixels_chirho = []
    for row_chirho in range(size_chirho):
        for column_chirho in range(size_chirho):
            x_chirho, y_chirho = column_chirho / size_chirho, row_chirho / size_chirho
            noise_chirho = random_chirho.random()
            if kind_chirho == 'wood_chirho':
                grain_chirho = .5 + .5 * math_chirho.sin(x_chirho * 230 + math_chirho.sin(y_chirho * 9) * 4 + math_chirho.sin(x_chirho * 27) * 3)
                value_chirho = .48 + .32 * grain_chirho + .1 * noise_chirho
                rgb_chirho = (.36 * value_chirho, .15 * value_chirho, .065 * value_chirho)
            elif kind_chirho == 'fabric_chirho':
                weave_chirho = .52 + .18 * (column_chirho % 4 < 2) + .16 * (row_chirho % 4 < 2) + .08 * noise_chirho
                rgb_chirho = (.62 * weave_chirho, .39 * weave_chirho, .24 * weave_chirho)
            elif kind_chirho == 'leather_chirho':
                value_chirho = .24 + .6 * noise_chirho + .1 * math_chirho.sin(x_chirho * 83) * math_chirho.sin(y_chirho * 91)
                rgb_chirho = (.09 * value_chirho, .058 * value_chirho, .039 * value_chirho)
            elif kind_chirho == 'marble_chirho':
                veins_chirho = abs(math_chirho.sin(x_chirho * 20 + math_chirho.sin(y_chirho * 19) * 2.5 + math_chirho.sin(x_chirho * 7 + y_chirho * 6) * 4))
                value_chirho = max(0, 1 - veins_chirho * 8) ** 2
                fine_chirho = max(0, 1 - abs(math_chirho.sin(x_chirho*63+y_chirho*11+math_chirho.sin(y_chirho*41)))*18)
                rgb_chirho = (.045 + value_chirho * .40 + fine_chirho*.06 + noise_chirho * .012, .036 + value_chirho * .28 + fine_chirho*.03, .033 + value_chirho * .17)
            else:
                value_chirho = .62 + .015 * noise_chirho + .025 * math_chirho.sin(y_chirho * 620)
                rgb_chirho = (value_chirho, value_chirho * .98, value_chirho * .96)
            pixels_chirho.extend((*rgb_chirho, 1))
    image_chirho.pixels.foreach_set(pixels_chirho)
    image_chirho.filepath_raw = str(ROOT_CHIRHO / (name_chirho + '.png'))
    image_chirho.file_format = 'PNG'
    image_chirho.save()
    image_chirho.pack()
    return image_chirho


def material_chirho(name_chirho, color_chirho, rough_chirho=.4, metal_chirho=0, texture_value_chirho=None, emission_chirho=0, transmission_chirho=0):
    result_chirho = bpy_chirho.data.materials.new(name_chirho)
    result_chirho.diffuse_color = (*color_chirho, 1)
    assert result_chirho.node_tree is not None
    shader_chirho = result_chirho.node_tree.nodes.get('Principled BSDF')
    shader_chirho.inputs['Base Color'].default_value = (*color_chirho, 1)
    shader_chirho.inputs['Roughness'].default_value = rough_chirho
    shader_chirho.inputs['Metallic'].default_value = metal_chirho
    shader_chirho.inputs['Transmission Weight'].default_value = transmission_chirho
    shader_chirho.inputs['IOR'].default_value = 1.46
    if emission_chirho:
        shader_chirho.inputs['Emission Color'].default_value = (*color_chirho, 1)
        shader_chirho.inputs['Emission Strength'].default_value = emission_chirho
    if texture_value_chirho:
        node_chirho = result_chirho.node_tree.nodes.new('ShaderNodeTexImage')
        node_chirho.image = texture_value_chirho
        result_chirho.node_tree.links.new(node_chirho.outputs['Color'], shader_chirho.inputs['Base Color'])
        # Real packed tangent normal/roughness maps, not render-only Noise/Bump shader nodes.
        size_chirho=texture_value_chirho.size[0]
        source_chirho=list(texture_value_chirho.pixels[:])
        strength_chirho=.4 if 'upholstery' in name_chirho else .3 if 'leather' in name_chirho else .005 if 'aluminum' in name_chirho else .008 if 'marble' in name_chirho else .06
        normal_pixels_chirho=[]
        rough_pixels_chirho=[]
        for row_chirho in range(size_chirho):
            for column_chirho in range(size_chirho):
                offset_chirho=(row_chirho*size_chirho+column_chirho)*4
                height_chirho=source_chirho[offset_chirho]
                dx_chirho=(source_chirho[(row_chirho*size_chirho+(column_chirho+1)%size_chirho)*4]-height_chirho)*strength_chirho*8
                dy_chirho=(source_chirho[(((row_chirho+1)%size_chirho)*size_chirho+column_chirho)*4]-height_chirho)*strength_chirho*8
                normal_chirho=VectorChirho((-dx_chirho,-dy_chirho,1)).normalized()
                normal_pixels_chirho.extend((normal_chirho.x*.5+.5,normal_chirho.y*.5+.5,normal_chirho.z*.5+.5,1))
                variation_chirho=.035 if 'aluminum' in name_chirho or 'marble' in name_chirho else .12
                rough_value_chirho=max(.06,min(.98,rough_chirho*(1+variation_chirho*(((column_chirho*37+row_chirho*11)%71)/35-1))))
                rough_pixels_chirho.extend((rough_value_chirho,rough_value_chirho,rough_value_chirho,1))
        for suffix_chirho,pixels_chirho in [('normal_chirho',normal_pixels_chirho),('roughness_chirho',rough_pixels_chirho)]:
            image_chirho=bpy_chirho.data.images.new(name_chirho+'_'+suffix_chirho,width=size_chirho,height=size_chirho,alpha=False)
            image_chirho.colorspace_settings.name='Non-Color'
            image_chirho.pixels.foreach_set(pixels_chirho)
            image_chirho.pack()
            detail_chirho=result_chirho.node_tree.nodes.new('ShaderNodeTexImage')
            detail_chirho.image=image_chirho
            if suffix_chirho=='normal_chirho':
                normal_node_chirho=result_chirho.node_tree.nodes.new('ShaderNodeNormalMap')
                result_chirho.node_tree.links.new(detail_chirho.outputs['Color'],normal_node_chirho.inputs['Color'])
                result_chirho.node_tree.links.new(normal_node_chirho.outputs['Normal'],shader_chirho.inputs['Normal'])
            else:
                result_chirho.node_tree.links.new(detail_chirho.outputs['Color'],shader_chirho.inputs['Roughness'])
    return result_chirho


wood_chirho = material_chirho('walnut_grain_chirho', (.15, .06, .02), .33, texture_value_chirho=texture_chirho('walnut_grain_chirho', 'wood_chirho'))
fabric_chirho = material_chirho('woven_upholstery_chirho', (.3, .15, .08), .9, texture_value_chirho=texture_chirho('woven_fabric_chirho', 'fabric_chirho'))
leather_chirho = material_chirho('bible_leather_chirho', (.02, .015, .01), .42, texture_value_chirho=texture_chirho('bible_leather_chirho', 'leather_chirho'))
marble_chirho = material_chirho('dark_marble_chirho', (.025, .023, .03), .21, texture_value_chirho=texture_chirho('marble_veins_chirho', 'marble_chirho'))
silver_chirho = material_chirho('brushed_aluminum_chirho', (.65, .66, .69), .42, .78, texture_chirho('brushed_metal_chirho', 'metal_chirho'))
face_steel_chirho = material_chirho('satin_anodized_face_chirho',(.34,.36,.38),.48,.60)
chrome_chirho = material_chirho('polished_chrome_chirho', (.72, .75, .8), .22, .93)
black_chirho = material_chirho('black_abs_chirho', (.025, .031, .034), .48)
rubber_chirho = material_chirho('rubber_cone_chirho', (.048, .049, .043), .72)
grille_chirho = material_chirho('graphite_steel_grille_chirho',(.12,.135,.14),.34,.65)
cap_chirho = material_chirho('woofer_dustcap_satin_chirho',(.16,.17,.17),.28,.55)
cavity_chirho = material_chirho('cavity_chirho', (.002, .003, .004), .98)
gold_chirho = material_chirho('antique_gold_chirho', (.67, .33, .065), .27, .8)
paper_chirho = material_chirho('warm_paper_chirho', (.76, .66, .43), .93)
paper_chirho.node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value=.18
black_chirho.node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value=.28
cream_chirho = material_chirho('cream_legends_chirho', (.82, .79, .68), .55)
amber_chirho = material_chirho('warm_indicator_chirho', (1, .3, .035), .35, emission_chirho=.55)
meter_face_chirho = material_chirho('warm_meter_face_chirho',(.39,.145,.025),.48,emission_chirho=1.4)
orange_chirho = material_chirho('warm_bulb_chirho', (1, .38, .07), .25, emission_chirho=6)
red_chirho = material_chirho('oxide_red_chirho', (.5, .025, .018), .39)
pink_chirho = material_chirho('lava_wax_chirho', (.58, .018, .055), .24, emission_chirho=1.2,transmission_chirho=.08)
teal_chirho = material_chirho('teal_chirho', (.025, .19, .23), .5)
blue_chirho = material_chirho('night_blue_chirho', (.018, .035, .09), .8)
leaf_chirho = material_chirho('leaf_green_chirho', (.07, .19, .027), .4)
leaf_vein_chirho = material_chirho('leaf_vein_chirho', (.32, .39, .055), .55)
glass_chirho = material_chirho('glass_transmission_chirho', (.97, .97, 1), .07, transmission_chirho=1)
window_glass_chirho = material_chirho('rain_softened_window_chirho',(.94,.97,1),.11,transmission_chirho=1)
cassette_glass_chirho = material_chirho('cassette_plexiglass_chirho',(.97,.98,.96),.025,transmission_chirho=1)
oxide_shell_chirho = material_chirho('cassette_oxide_shell_chirho',(.22,.026,.02),.57)
teal_shell_chirho = material_chirho('cassette_teal_shell_chirho',(.02,.09,.12),.57)
tape_chirho = material_chirho('wound_magnetic_tape_chirho',(.055,.026,.012),.6)
rain_mat_chirho = material_chirho('rain_glints_chirho', (.25, .4, .5), .16, .15, emission_chirho=.05)
textile_red_chirho=material_chirho('woven_rust_yarn_chirho',(.38,.055,.032),.94)
for textile_chirho in [textile_red_chirho]:
    texture_node_chirho=textile_chirho.node_tree.nodes.new('ShaderNodeTexImage')
    texture_node_chirho.image=bpy_chirho.data.images['woven_upholstery_chirho_normal_chirho']
    normal_node_chirho=textile_chirho.node_tree.nodes.new('ShaderNodeNormalMap')
    textile_chirho.node_tree.links.new(texture_node_chirho.outputs['Color'],normal_node_chirho.inputs['Color'])
    textile_chirho.node_tree.links.new(normal_node_chirho.outputs['Normal'],textile_chirho.node_tree.nodes['Principled BSDF'].inputs['Normal'])


def finish_chirho(object_chirho, name_chirho, mat_chirho, parent_chirho=room_chirho, smooth_chirho=False):
    object_chirho.name = name_chirho
    object_chirho.parent = parent_chirho
    object_chirho.data.materials.append(mat_chirho)
    if object_chirho.type=='MESH' and not object_chirho.data.uv_layers:
        uv_chirho=object_chirho.data.uv_layers.new(name='surface_uv_chirho')
        for polygon_chirho in object_chirho.data.polygons:
            for loop_index_chirho in polygon_chirho.loop_indices:
                vertex_chirho=object_chirho.data.vertices[object_chirho.data.loops[loop_index_chirho].vertex_index].co
                if abs(polygon_chirho.normal.y)>.5:
                    uv_chirho.data[loop_index_chirho].uv=(vertex_chirho.x*.5,vertex_chirho.z*.5)
                else:
                    uv_chirho.data[loop_index_chirho].uv=(vertex_chirho.x*.5,vertex_chirho.y*.5)
    if object_chirho.type=='MESH' and ('woven_' in mat_chirho.name or 'leather' in mat_chirho.name):
        repeats_chirho=6 if 'woven_' in mat_chirho.name else 3
        for uv_loop_chirho in object_chirho.data.uv_layers.active.data:
            uv_loop_chirho.uv*=repeats_chirho
    if smooth_chirho:
        for polygon_chirho in object_chirho.data.polygons:
            polygon_chirho.use_smooth = True
    return object_chirho


def box_chirho(name_chirho, position_chirho, size_chirho, mat_chirho, bevel_chirho=0, parent_chirho=room_chirho):
    bpy_chirho.ops.mesh.primitive_cube_add(size=1, location=position_chirho)
    object_chirho = bpy_chirho.context.object
    object_chirho.dimensions = size_chirho
    bpy_chirho.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish_chirho(object_chirho, name_chirho, mat_chirho, parent_chirho)
    if bevel_chirho:
        modifier_chirho = object_chirho.modifiers.new('edge_bevel_chirho', 'BEVEL')
        modifier_chirho.width = bevel_chirho
        modifier_chirho.segments = 3
    return object_chirho


def cylinder_chirho(name_chirho, position_chirho, radius_chirho, depth_chirho, mat_chirho, front_chirho=False, parent_chirho=room_chirho, vertices_chirho=48):
    bpy_chirho.ops.mesh.primitive_cylinder_add(vertices=vertices_chirho, radius=radius_chirho, depth=depth_chirho, location=position_chirho)
    object_chirho = finish_chirho(bpy_chirho.context.object, name_chirho, mat_chirho, parent_chirho, True)
    if front_chirho:
        object_chirho.rotation_euler.x = math_chirho.pi / 2
    return object_chirho


def sphere_chirho(name_chirho, position_chirho, scale_chirho, mat_chirho, parent_chirho=room_chirho):
    bpy_chirho.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, radius=1, location=position_chirho)
    object_chirho = finish_chirho(bpy_chirho.context.object, name_chirho, mat_chirho, parent_chirho, True)
    object_chirho.scale = scale_chirho
    return object_chirho


def torus_chirho(name_chirho, position_chirho, radius_chirho, tube_chirho, mat_chirho, front_chirho=False, parent_chirho=room_chirho):
    bpy_chirho.ops.mesh.primitive_torus_add(major_segments=64, minor_segments=8, location=position_chirho, major_radius=radius_chirho, minor_radius=tube_chirho)
    object_chirho = finish_chirho(bpy_chirho.context.object, name_chirho, mat_chirho, parent_chirho, True)
    if front_chirho:
        object_chirho.rotation_euler.x = math_chirho.pi / 2
    return object_chirho


def rod_chirho(name_chirho, start_chirho, end_chirho, radius_chirho, mat_chirho, parent_chirho=room_chirho, vertices_chirho=12):
    delta_chirho = VectorChirho(end_chirho) - VectorChirho(start_chirho)
    middle_chirho = (VectorChirho(end_chirho) + VectorChirho(start_chirho)) / 2
    object_chirho = cylinder_chirho(name_chirho, middle_chirho, radius_chirho, delta_chirho.length, mat_chirho, parent_chirho=parent_chirho, vertices_chirho=vertices_chirho)
    object_chirho.rotation_euler = delta_chirho.to_track_quat('Z', 'Y').to_euler()
    return object_chirho


def tube_path_chirho(name_chirho,points_chirho,radius_chirho,mat_chirho,parent_chirho=room_chirho,sides_chirho=8):
    vertices_chirho,faces_chirho=[],[]
    for index_chirho,position_chirho in enumerate(points_chirho):
        previous_chirho=VectorChirho(points_chirho[max(0,index_chirho-1)])
        next_chirho=VectorChirho(points_chirho[min(len(points_chirho)-1,index_chirho+1)])
        tangent_chirho=(next_chirho-previous_chirho).normalized()
        axis_chirho=VectorChirho((1,0,0)) if abs(tangent_chirho.z)>.9 else VectorChirho((0,0,1))
        first_chirho=tangent_chirho.cross(axis_chirho).normalized()
        second_chirho=tangent_chirho.cross(first_chirho).normalized()
        for corner_chirho in range(sides_chirho):
            angle_chirho=corner_chirho*math_chirho.tau/sides_chirho
            vertex_chirho=VectorChirho(position_chirho)+radius_chirho*(first_chirho*math_chirho.cos(angle_chirho)+second_chirho*math_chirho.sin(angle_chirho))
            vertices_chirho.append(tuple(vertex_chirho))
    for index_chirho in range(len(points_chirho)-1):
        for corner_chirho in range(sides_chirho):
            next_chirho=(corner_chirho+1)%sides_chirho
            faces_chirho.append((index_chirho*sides_chirho+corner_chirho,index_chirho*sides_chirho+next_chirho,(index_chirho+1)*sides_chirho+next_chirho,(index_chirho+1)*sides_chirho+corner_chirho))
    mesh_chirho=bpy_chirho.data.meshes.new(name_chirho)
    mesh_chirho.from_pydata(vertices_chirho,[],faces_chirho)
    mesh_chirho.update()
    object_chirho=bpy_chirho.data.objects.new(name_chirho,mesh_chirho)
    scene_chirho.collection.objects.link(object_chirho)
    return finish_chirho(object_chirho,name_chirho,mat_chirho,parent_chirho,True)


def lathe_chirho(name_chirho, position_chirho, profile_chirho, mat_chirho, parent_chirho=room_chirho, front_chirho=False, count_chirho=64):
    verts_chirho, faces_chirho = [], []
    for radius_chirho, z_chirho in profile_chirho:
        for index_chirho in range(count_chirho):
            angle_chirho = index_chirho / count_chirho * 2 * math_chirho.pi
            verts_chirho.append((radius_chirho * math_chirho.cos(angle_chirho), radius_chirho * math_chirho.sin(angle_chirho), z_chirho))
    for ring_chirho in range(len(profile_chirho) - 1):
        for index_chirho in range(count_chirho):
            next_chirho = (index_chirho + 1) % count_chirho
            faces_chirho.append((ring_chirho * count_chirho + index_chirho, ring_chirho * count_chirho + next_chirho, (ring_chirho + 1) * count_chirho + next_chirho, (ring_chirho + 1) * count_chirho + index_chirho))
    mesh_chirho = bpy_chirho.data.meshes.new(name_chirho)
    mesh_chirho.from_pydata(verts_chirho, [], faces_chirho)
    mesh_chirho.update()
    object_chirho = bpy_chirho.data.objects.new(name_chirho, mesh_chirho)
    scene_chirho.collection.objects.link(object_chirho)
    object_chirho.location = position_chirho
    finish_chirho(object_chirho, name_chirho, mat_chirho, parent_chirho, True)
    if front_chirho:
        object_chirho.rotation_euler.x = math_chirho.pi / 2
    return object_chirho


def text_chirho(name_chirho, words_chirho, position_chirho, size_chirho, mat_chirho, front_chirho=True, parent_chirho=room_chirho):
    curve_chirho = bpy_chirho.data.curves.new(name_chirho, 'FONT')
    curve_chirho.body = words_chirho
    curve_chirho.size = size_chirho
    curve_chirho.align_x = 'CENTER'
    curve_chirho.extrude = .0007
    curve_chirho.resolution_u = 3
    object_chirho = bpy_chirho.data.objects.new(name_chirho, curve_chirho)
    scene_chirho.collection.objects.link(object_chirho)
    object_chirho.location = position_chirho
    if front_chirho:
        object_chirho.rotation_euler.x = math_chirho.pi / 2
    object_chirho.parent = parent_chirho
    curve_chirho.materials.append(mat_chirho)
    # Real letter geometry, not a photograph or runtime font dependency.
    bpy_chirho.context.view_layer.objects.active = object_chirho
    object_chirho.select_set(True)
    bpy_chirho.ops.object.convert(target='MESH')
    object_chirho.select_set(False)
    return object_chirho


batch_chirho = {}


def small_box_chirho(key_chirho, position_chirho, size_chirho, mat_chirho, parent_chirho=room_chirho):
    bucket_chirho = batch_chirho.setdefault(key_chirho, [[], [], mat_chirho, parent_chirho])
    offset_chirho = len(bucket_chirho[0])
    for x_chirho, y_chirho, z_chirho in [(-1,-1,-1), (1,-1,-1), (1,1,-1), (-1,1,-1), (-1,-1,1), (1,-1,1), (1,1,1), (-1,1,1)]:
        bucket_chirho[0].append((position_chirho[0] + x_chirho * size_chirho[0] / 2, position_chirho[1] + y_chirho * size_chirho[1] / 2, position_chirho[2] + z_chirho * size_chirho[2] / 2))
    for face_chirho in [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]:
        bucket_chirho[1].append(tuple(offset_chirho + index_chirho for index_chirho in face_chirho))


# Detail builders share this isolated recipe namespace; no separate scene/process.
helper_path_chirho=SOURCE_ROOT_CHIRHO/'model_details_chirho.py'
exec(compile(helper_path_chirho.read_text(),str(helper_path_chirho),'exec'),globals())

# Hero radio: 8.8 wide x 4.3 high, designed independently of HTML text expansion.
box_chirho('radio_shell_chirho', (0,.13,3.59), (8.8,1.4,4.3), black_chirho,.11, radio_chirho)
box_chirho('radio_front_chirho', (0,-.59,3.59), (8.66,.12,4.16), face_steel_chirho,.045, radio_chirho)
for z_chirho in [1.57,5.59,4.53,4.05]:
    box_chirho('chrome_front_rail_chirho',(0,-.69,z_chirho),(8.55,.09,.045),chrome_chirho,.018,radio_chirho)
for x_chirho in [-4.3,4.3]:
    box_chirho('chrome_side_rail_chirho',(x_chirho,-.7,3.6),(.06,.1,3.95),chrome_chirho,.018,radio_chirho)
for x_chirho in [-3.2,3.2]:
    for y_chirho in [-.3,.6]:
        box_chirho('radio_foot_chirho',(x_chirho,y_chirho,1.38),(.82,.4,.18),rubber_chirho,.04,radio_chirho)
for x_chirho in [-3.55,3.55]:
    box_chirho('handle_pivot_chirho',(x_chirho,.2,5.78),(.25,.35,.19),chrome_chirho,.035,radio_chirho)
    box_chirho('handle_upright_chirho',(x_chirho,.2,6.13),(.13,.16,.75),silver_chirho,.035,radio_chirho)
box_chirho('handle_bar_chirho',(0,.2,6.48),(7.24,.24,.2),black_chirho,.05,radio_chirho)
for x_chirho in [-3.55,3.55]:
    box_chirho('handle_chrome_endcap_chirho',(x_chirho,.2,6.48),(.14,.27,.22),chrome_chirho,.035,radio_chirho)
for rib_chirho in range(6):
    small_box_chirho('handle_ribs_chirho',(0,.065,6.415 + rib_chirho*.025),(6.95,.018,.007),rubber_chirho,radio_chirho)
rod_chirho('aerial_chirho',(3.6,.56,5.76),(-1.4,.56,7.8),.024,chrome_chirho,radio_chirho)
for fraction_chirho in [.0,.33,.66,1]:
    sphere_chirho('aerial_collar_chirho',(3.6-5*fraction_chirho,.56,5.76+2.04*fraction_chirho),(.034,.034,.034),chrome_chirho,radio_chirho)
for x_chirho in [-4.405,4.405]:
    for rib_chirho in range(48):
        small_box_chirho('case_side_ribs_chirho',(x_chirho,.18,1.7+rib_chirho*.078),(.025,1.06,.018),rubber_chirho,radio_chirho)


def screw_chirho(x_chirho,z_chirho):
    cylinder_chirho('phillips_screw_chirho',(x_chirho,-.795,z_chirho),.041,.02,chrome_chirho,True,radio_chirho,16)
    for size_chirho in [(.052,.008,.009),(.009,.008,.052)]:
        small_box_chirho('phillips_slots_chirho',(x_chirho,-.81,z_chirho),size_chirho,cavity_chirho,radio_chirho)


def grille_mesh_chirho(x_chirho,z_chirho):
    vertices_chirho,faces_chirho=[],[]
    radius_chirho=.052
    for column_chirho in range(-16,17):
        for row_chirho in range(-15,16):
            center_x_chirho=column_chirho*radius_chirho*1.5
            center_z_chirho=(row_chirho+(column_chirho%2)*.5)*radius_chirho*math_chirho.sqrt(3)
            if center_x_chirho**2+center_z_chirho**2>1.10**2:
                continue
            offset_chirho=len(vertices_chirho)
            for y_chirho,ring_radius_chirho in [(-.99,radius_chirho),(-.99,.0465),(-.977,radius_chirho),(-.977,.0465)]:
                for corner_chirho in range(6):
                    angle_chirho=corner_chirho*math_chirho.pi/3
                    vertices_chirho.append((x_chirho+center_x_chirho+math_chirho.cos(angle_chirho)*ring_radius_chirho,y_chirho,z_chirho+center_z_chirho+math_chirho.sin(angle_chirho)*ring_radius_chirho))
            for corner_chirho in range(6):
                next_chirho=(corner_chirho+1)%6
                for face_chirho in [(corner_chirho,next_chirho,6+next_chirho,6+corner_chirho),(12+corner_chirho,18+corner_chirho,18+next_chirho,12+next_chirho),(corner_chirho,12+corner_chirho,12+next_chirho,next_chirho),(6+corner_chirho,6+next_chirho,18+next_chirho,18+corner_chirho)]:
                    faces_chirho.append(tuple(offset_chirho+index_chirho for index_chirho in face_chirho))
    mesh_chirho=bpy_chirho.data.meshes.new('perforated_honeycomb_grille_chirho')
    mesh_chirho.from_pydata(vertices_chirho,[],faces_chirho)
    mesh_chirho.update()
    object_chirho=bpy_chirho.data.objects.new('perforated_honeycomb_grille_chirho',mesh_chirho)
    scene_chirho.collection.objects.link(object_chirho)
    finish_chirho(object_chirho,'perforated_honeycomb_grille_chirho',grille_chirho,radio_chirho)


for x_chirho in [-3.05,3.05]:
    z_chirho = 2.8
    # The backing disk is BEHIND the complete cone, not a solid occluder in front of it.
    cylinder_chirho('woofer_recess_chirho',(x_chirho,-.64,z_chirho),1.25,.025,cavity_chirho,True,radio_chirho)
    torus_chirho('woofer_chrome_rim_chirho',(x_chirho,-.96,z_chirho),1.22,.055,chrome_chirho,True,radio_chirho)
    torus_chirho('woofer_inner_bead_chirho',(x_chirho,-.99,z_chirho),1.16,.017,silver_chirho,True,radio_chirho)
    torus_chirho('woofer_rubber_surround_chirho',(x_chirho,-.84,z_chirho),1.1,.055,rubber_chirho,True,radio_chirho)
    lathe_chirho('woofer_paper_cone_chirho',(x_chirho,-.83,z_chirho),[(1.1,.02),(.98,.075),(.78,-.01),(.5,-.12),(.25,.04),(0,.13)],rubber_chirho,radio_chirho,True)
    for radius_chirho in [.47,.62,.78,.92]:
        torus_chirho('cone_circular_ridge_chirho',(x_chirho,-.82,z_chirho),radius_chirho,.007,black_chirho,True,radio_chirho)
    sphere_chirho('woofer_dustcap_chirho',(x_chirho,-.87,z_chirho),(.26,.09,.26),cap_chirho,radio_chirho)
    grille_mesh_chirho(x_chirho,z_chirho)
    for offset_x_chirho in [-1.18,1.18]:
        for offset_z_chirho in [-1.16,1.16]:
            screw_chirho(x_chirho+offset_x_chirho,z_chirho+offset_z_chirho)
    box_chirho('horn_frame_chirho',(x_chirho,-.71,4.28),(1.35,.16,.37),chrome_chirho,.035,radio_chirho)
    box_chirho('horn_throat_chirho',(x_chirho,-.81,4.28),(1.13,.02,.21),cavity_chirho,.02,radio_chirho)
    rod_chirho('horn_phase_bar_chirho',(x_chirho-.52,-.84,4.28),(x_chirho+.52,-.84,4.28),.025,silver_chirho,radio_chirho)

box_chirho('upper_black_band_chirho',(0,-.69,5.04),(8.1,.07,.88),black_chirho,.025,radio_chirho)
for x_chirho in [-3.3,-2.38]:
    box_chirho('vu_meter_chrome_chirho',(x_chirho,-.75,5.03),(.81,.09,.63),chrome_chirho,.03,radio_chirho)
    box_chirho('vu_meter_black_chirho',(x_chirho,-.81,5.03),(.72,.025,.54),black_chirho,.015,radio_chirho)
    box_chirho('vu_meter_amber_face_chirho',(x_chirho,-.83,5.03),(.66,.012,.47),meter_face_chirho,.012,radio_chirho)
    for tick_chirho in range(15):
        angle_chirho = -.9 + tick_chirho*1.8/14
        start_chirho=(x_chirho+math_chirho.sin(angle_chirho)*.28,-.846,4.84+math_chirho.cos(angle_chirho)*.28)
        end_chirho=(x_chirho+math_chirho.sin(angle_chirho)*.32,-.846,4.84+math_chirho.cos(angle_chirho)*.32)
        rod_chirho('meter_scale_tick_chirho',start_chirho,end_chirho,.004,cream_chirho,radio_chirho,6)
    rod_chirho('meter_needle_chirho',(x_chirho,-.86,4.85),(x_chirho-.1,-.86,5.12),.006,cream_chirho,radio_chirho,6)
    text_chirho('vu_legend_chirho','VU',(x_chirho,-.86,4.9),.07,cream_chirho,parent_chirho=radio_chirho)
    box_chirho('vu_meter_clear_glass_chirho',(x_chirho,-.885,5.03),(.66,.006,.47),cassette_glass_chirho,.005,radio_chirho)
box_chirho('tuning_glass_chirho',(.7,-.76,5.03),(4.7,.06,.68),cavity_chirho,.01,radio_chirho)
for z_chirho in [4.9,5.14]:
    small_box_chirho('tuning_scale_chirho',(.7,-.802,z_chirho),(4.45,.012,.012),red_chirho,radio_chirho)
    for tick_chirho in range(76):
        small_box_chirho('tuning_ticks_chirho',(-1.5+tick_chirho*.058,-.81,z_chirho+.04),(.008,.008,.065 if tick_chirho%5==0 else .028),cream_chirho,radio_chirho)
text_chirho('fm_frequencies_chirho','FM   88   90   92   94   96   98   100   102   104   106   108',(0.7,-.82,5.25),.094,cream_chirho,parent_chirho=radio_chirho)
text_chirho('am_frequencies_chirho','AM   530    600    700    800    1000    1200    1400    1600',(.7,-.82,4.76),.08,cream_chirho,parent_chirho=radio_chirho)
small_box_chirho('tuning_cursor_chirho',(.62,-.83,5.02),(.018,.018,.5),amber_chirho,radio_chirho)


def knob_chirho(x_chirho,z_chirho,radius_chirho):
    cylinder_chirho('knob_socket_chirho',(x_chirho,-.77,z_chirho),radius_chirho*1.13,.07,cavity_chirho,True,radio_chirho)
    cylinder_chirho('knob_knurl_chirho',(x_chirho,-.87,z_chirho),radius_chirho,.22,black_chirho,True,radio_chirho)
    cylinder_chirho('knob_metal_cap_chirho',(x_chirho,-1.0,z_chirho),radius_chirho*.92,.035,silver_chirho,True,radio_chirho)
    torus_chirho('knob_chrome_lip_chirho',(x_chirho,-1.025,z_chirho),radius_chirho*.92,.012,chrome_chirho,True,radio_chirho)
    for tick_chirho in range(32):
        angle_chirho=tick_chirho*math_chirho.tau/32
        small_box_chirho('knob_ribs_chirho',(x_chirho+math_chirho.cos(angle_chirho)*radius_chirho,-.88,z_chirho+math_chirho.sin(angle_chirho)*radius_chirho),(.011,.18,.011),silver_chirho,radio_chirho)


def push_button_chirho(control_name_chirho,x_chirho,z_chirho,width_chirho,height_chirho,cap_material_chirho):
    root_chirho=group_chirho(control_name_chirho+'_pushbutton_chirho',radio_chirho)
    root_chirho.location=(x_chirho,0,z_chirho)
    root_chirho['control_kind_chirho']='pushbutton'
    root_chirho['press_travel_chirho']=.025
    root_chirho['press_direction_gltf_chirho']=[0,0,-1]
    box_chirho(control_name_chirho+'_pushbutton_socket_chirho',(0,-.79,0),(width_chirho+.10,.12,height_chirho+.10),cavity_chirho,.018,root_chirho)
    box_chirho(control_name_chirho+'_pushbutton_frame_chirho',(0,-.865,0),(width_chirho+.075,.095,height_chirho+.075),silver_chirho,.018,root_chirho)
    box_chirho(control_name_chirho+'_pushbutton_recess_chirho',(0,-.92,0),(width_chirho+.028,.035,height_chirho+.028),black_chirho,.014,root_chirho)
    cap_chirho=box_chirho(control_name_chirho+'_pushbutton_cap_chirho',(0,-.976,0),(width_chirho,.076,height_chirho),cap_material_chirho,.018,root_chirho)
    cap_chirho['control_kind_chirho']='pushbutton_cap'
    return root_chirho


knob_chirho(3.65,5.04,.35)
text_chirho('station_knob_legend_chirho','STATION',(3.65,-.77,4.60),.075,cream_chirho,parent_chirho=radio_chirho)
box_chirho('equalizer_band_chirho',(0,-.7,4.29),(3.8,.08,.41),black_chirho,.015,radio_chirho)
for x_chirho,label_chirho in [(-1.55,'BOOK'),(-.78,'CHAPTER'),(0,'POSITION')]:
    knob_chirho(x_chirho,4.24,.12)
    text_chirho('knob_label_chirho',label_chirho,(x_chirho,-.77,4.43),.055,cream_chirho,parent_chirho=radio_chirho)
button_roots_chirho=[]
for control_name_chirho,x_chirho,width_chirho,height_chirho,cap_material_chirho,label_chirho in [('sounds',.78,.32,.19,silver_chirho,'SOUNDS'),('power',1.55,.26,.24,red_chirho,'POWER')]:
    button_roots_chirho.append(push_button_chirho(control_name_chirho,x_chirho,4.24,width_chirho,height_chirho,cap_material_chirho))
    text_chirho('button_label_chirho',label_chirho,(x_chirho,-.77,4.43),.055,cream_chirho,parent_chirho=radio_chirho)
box_chirho('brand_plaque_chirho',(0,-.71,3.84),(3.82,.08,.3),black_chirho,.02,radio_chirho)
text_chirho('radio_name_chirho','AUDIO BIBLE RADIO',(0,-.77,3.79),.16,cream_chirho,parent_chirho=radio_chirho)

for x_chirho,label_chirho,color_chirho in [(-.94,'PSALMS',oxide_shell_chirho),(.94,'GOSPEL',teal_shell_chirho)]:
    # The chamber, cassette and reels sit behind a separate plexiglass window.
    # Four perimeter rails leave a genuine opening; no opaque front plate hides the depth.
    box_chirho('cassette_deck_back_chirho',(x_chirho,-.70,2.7),(1.8,.10,1.85),black_chirho,.035,radio_chirho)
    for offset_chirho in [-.865,.865]:
        box_chirho('cassette_vertical_trim_chirho',(x_chirho+offset_chirho,-.84,2.7),(.055,.22,1.83),chrome_chirho,.018,radio_chirho)
    for z_chirho in [1.80,3.60]:
        box_chirho('cassette_horizontal_trim_chirho',(x_chirho,-.84,z_chirho),(1.76,.22,.045),chrome_chirho,.012,radio_chirho)
    for offset_chirho in [-.80,.80]:
        box_chirho('cassette_window_side_chirho',(x_chirho+offset_chirho,-.86,2.81),(.12,.20,1.12),black_chirho,.015,radio_chirho)
    box_chirho('cassette_door_top_chirho',(x_chirho,-.86,3.47),(1.65,.20,.23),black_chirho,.018,radio_chirho)
    box_chirho('cassette_door_bottom_chirho',(x_chirho,-.86,2.02),(1.65,.20,.44),black_chirho,.018,radio_chirho)
    box_chirho('cassette_chamber_chirho',(x_chirho,-.77,2.81),(1.52,.025,1.12),cavity_chirho,.03,radio_chirho)
    box_chirho('cassette_body_chirho',(x_chirho,-.82,2.76),(1.38,.045,.91),color_chirho,.055,radio_chirho)
    box_chirho('cassette_reel_window_chirho',(x_chirho,-.85,2.69),(1.12,.008,.39),cavity_chirho,.055,radio_chirho)
    box_chirho('cassette_label_chirho',(x_chirho,-.85,3.0),(1.25,.003,.24),paper_chirho,.006,radio_chirho)
    handwritten_cassette_chirho('cassette_words_chirho',label_chirho,(x_chirho,-.856,2.94),.17,cavity_chirho,radio_chirho)
    for offset_chirho in [-.36,.36]:
        cylinder_chirho('cassette_tape_spool_chirho',(x_chirho+offset_chirho,-.865,2.69),.195,.015,tape_chirho,True,radio_chirho)
        for radius_chirho in [.145,.165,.185]:
            torus_chirho('cassette_wound_tape_edge_chirho',(x_chirho+offset_chirho,-.88,2.69),radius_chirho,.003,black_chirho,True,radio_chirho)
        torus_chirho('cassette_spool_rim_chirho',(x_chirho+offset_chirho,-.885,2.69),.125,.009,silver_chirho,True,radio_chirho)
        cylinder_chirho('cassette_hub_chirho',(x_chirho+offset_chirho,-.895,2.69),.065,.01,cream_chirho,True,radio_chirho)
        for spoke_chirho in range(6):
            angle_chirho=spoke_chirho*math_chirho.tau/6
            small_box_chirho('cassette_hub_teeth_chirho',(x_chirho+offset_chirho+math_chirho.cos(angle_chirho)*.075,-.904,2.69+math_chirho.sin(angle_chirho)*.075),(.024,.006,.024),cavity_chirho,radio_chirho)
    box_chirho('cassette_plexiglass_window_chirho',(x_chirho,-.97,2.81),(1.48,.009,1.08),cassette_glass_chirho,.006,radio_chirho)
    text_chirho('cassette_deck_legend_chirho','STEREO CASSETTE  /  AUTO STOP',(x_chirho,-.966,3.46),.062,cream_chirho,parent_chirho=radio_chirho)
    box_chirho('cassette_door_latch_chirho',(x_chirho,-.98,1.98),(.28,.04,.05),silver_chirho,.012,radio_chirho)
    for key_chirho in range(6):
        key_x_chirho=x_chirho+(key_chirho-2.5)*.274
        key_object_chirho=box_chirho('cassette_transport_key_chirho',(key_x_chirho,-.85,1.7),(.24,.28,.17),red_chirho if key_chirho==0 else silver_chirho,.018,radio_chirho)
        key_object_chirho.rotation_euler.x=-.2
        text_chirho('transport_symbol_chirho',['O','>','<<','>>','[]','II'][key_chirho],(key_x_chirho,-1.002,1.675),.07,cavity_chirho,parent_chirho=radio_chirho)

mount_chirho=group_chirho('live_control_mount_chirho',radio_chirho)
mount_chirho.location=(0,-1.045,4.82)
mount_chirho.rotation_euler.x=math_chirho.pi/2
mount_chirho['width_chirho']=7.8
mount_chirho['height_chirho']=1.28
mount_chirho['purpose_chirho']='Compact live HTML instrument bands; upper edge5.46/lower4.18 in Blender Z. glTF plane center[0,4.82,1.045]. Mount transforms local X/Y into face horizontal/vertical.'
control_anchors_chirho={}
for name_chirho,x_chirho,z_chirho,width_chirho,height_chirho in [
    ('live_front_plane_chirho',0,3.59,8.8,4.3),
    ('live_language_display_chirho',.7,5.03,4.65,.68),
    ('live_book_knob_chirho',-1.55,4.24,.6,.6),
    ('live_chapter_knob_chirho',-.78,4.24,.6,.6),
    ('live_on_off_chirho',1.55,4.24,.6,.6),
    ('live_station_knob_chirho',3.65,5.04,.82,.82),
    ('live_sound_switch_chirho',.78,4.24,.6,.6),
    ('live_volume_chirho',0,4.24,.6,.6),
    ('live_position_chirho',0,4.24,.6,.6),
    ('live_narration_chirho',1.55,4.24,.6,.6),
    ('live_book_display_chirho',-.94,3.46,1.65,.19),
    ('live_chapter_display_chirho',.94,3.46,1.65,.19)
]:
    anchor_chirho=group_chirho(name_chirho,radio_chirho)
    anchor_chirho.location=(x_chirho,-1.075,z_chirho)
    anchor_chirho.rotation_euler.x=math_chirho.pi/2
    anchor_chirho['width_chirho']=width_chirho
    anchor_chirho['height_chirho']=height_chirho
    anchor_chirho['depth_chirho']=.03
    if name_chirho in ['live_on_off_chirho','live_sound_switch_chirho']:
        anchor_chirho['control_kind_chirho']='button'
    elif name_chirho=='live_station_knob_chirho':
        anchor_chirho['control_kind_chirho']='station_dial'
    anchor_chirho['axis_contract_chirho']='Local XY is usable face rectangle; local+Z faces listener. Coordinates exported via glTF Y-up.'
    control_anchors_chirho[name_chirho]={'center_gltf_chirho':[x_chirho,z_chirho,1.075],'width_chirho':width_chirho,'height_chirho':height_chirho,'depth_chirho':.03}

# Full room shell and a tabletop extended only toward the listener.
ROOM_FLOOR_Z_CHIRHO=-7.0
box_chirho('room_floor_chirho',(0,0,ROOM_FLOOR_Z_CHIRHO-.12),(40,40,.24),wood_chirho,.025)
build_room_shell_chirho()
poster_root_chirho=build_left_poster_chirho(SOURCE_ROOT_CHIRHO/'inputs-chirho'/'be_still_poster_chirho.png','b3cc02455dd554839fbd9bf63a1f0e4dbf927b2b97a2466b269c857a4ffc77f9')
for position_chirho,size_chirho in [((-7.5,3.6,1.0),(4.8,.25,16)),((8.4,3.6,1.0),(3.36,.25,16)),((.8,3.6,9.5),(11.85,.25,1.2)),((.8,3.6,-2.775),(11.85,.25,8.45))]:
    box_chirho('window_wall_surround_chirho',position_chirho,size_chirho,wood_chirho,.025)
box_chirho('table_top_chirho',(0,-.75,1.14),(13,7.9,.3),marble_chirho,.2)
box_chirho('table_wood_edge_chirho',(0,-.75,.98),(12.95,7.85,.12),wood_chirho,.12)
for x_chirho in [-5.3,5.3]:
    for y_chirho in [-2.6,2.0]:
        box_chirho('table_leg_chirho',(x_chirho,y_chirho,-2.99),(.23,.23,7.86),gold_chirho,.02)
        box_chirho('table_leveling_foot_chirho',(x_chirho,y_chirho,-6.96),(.28,.28,.08),rubber_chirho,.015)

# Original owner-approved skyline matte is distant only; room, window and rain stay geometric.
city_path_chirho=SOURCE_ROOT_CHIRHO/'inputs-chirho'/'city_night_chirho.png'
assert hashlib_chirho.sha256(city_path_chirho.read_bytes()).hexdigest()=='a02f607cd1458a60c4ef163a2226669f78bd02490104a0c753a23de0a8cc2c80'
city_image_chirho=bpy_chirho.data.images.load(str(city_path_chirho),check_existing=True)
city_image_chirho.name='original_city_night_matte_chirho'
city_image_chirho.pack()
city_material_chirho=material_chirho('distant_city_matte_chirho',(0,0,0),1)
city_shader_chirho=city_material_chirho.node_tree.nodes['Principled BSDF']
city_texture_chirho=city_material_chirho.node_tree.nodes.new('ShaderNodeTexImage')
city_texture_chirho.image=city_image_chirho
city_material_chirho.node_tree.links.new(city_texture_chirho.outputs['Color'],city_shader_chirho.inputs['Emission Color'])
city_shader_chirho.inputs['Emission Strength'].default_value=.75
city_width_chirho=24
city_height_chirho=city_width_chirho*city_image_chirho.size[1]/city_image_chirho.size[0]
city_mesh_chirho=bpy_chirho.data.meshes.new('distant_city_matte_chirho')
city_mesh_chirho.from_pydata([(-city_width_chirho/2,0,-city_height_chirho/2),(city_width_chirho/2,0,-city_height_chirho/2),(city_width_chirho/2,0,city_height_chirho/2),(-city_width_chirho/2,0,city_height_chirho/2)],[],[(0,1,2,3)])
city_mesh_chirho.update()
city_uv_chirho=city_mesh_chirho.uv_layers.new(name='city_matte_uv_chirho')
for index_chirho,uv_chirho in enumerate([(0,0),(1,0),(1,1),(0,1)]):
    city_uv_chirho.data[index_chirho].uv=uv_chirho
city_object_chirho=bpy_chirho.data.objects.new('distant_city_matte_chirho',city_mesh_chirho)
scene_chirho.collection.objects.link(city_object_chirho)
city_object_chirho.location=(.8,7,6.2)
finish_chirho(city_object_chirho,'distant_city_matte_chirho',city_material_chirho)
city_object_chirho['source_sha256_chirho']='a02f607cd1458a60c4ef163a2226669f78bd02490104a0c753a23de0a8cc2c80'
city_object_chirho['role_chirho']='Distant original skyline matte only; near room and rain are actual geometry.'
box_chirho('window_glass_pane_chirho',(.8,2.8,5.2),(11.5,.012,7.2),window_glass_chirho)
for x_chirho in [-5.12,6.72]:
    box_chirho('window_wood_jamb_chirho',(x_chirho,2.83,5.2),(.24,.44,7.45),wood_chirho,.035)
for z_chirho in [1.5,8.9]:
    box_chirho('window_horizontal_frame_chirho',(.8,2.83,z_chirho),(12.1,.44,.23),wood_chirho,.035)
for x_chirho in [-1.1,2.8]:
    box_chirho('window_mullion_chirho',(x_chirho,2.9,5.2),(.08,.11,7.2),black_chirho,.015)
for blind_chirho in range(8):
    box_chirho('venetian_blind_chirho',(.8,2.56,8.8-blind_chirho*.19),(11.7,.24,.08),wood_chirho,.018)
for drop_chirho in range(460):
    x_chirho=random_chirho.uniform(-4.9,6.5)
    z_chirho=random_chirho.uniform(1.7,8.7)
    length_chirho=random_chirho.uniform(.10,.29) if drop_chirho%3==0 else random_chirho.uniform(.025,.1)
    small_box_chirho('window_rain_streaks_chirho',(x_chirho,2.76,z_chirho),(.009,.008,length_chirho),rain_mat_chirho,rain_root_chirho)
for drop_chirho in range(18):
    sphere_chirho('window_rain_bead_chirho',(random_chirho.uniform(-4.9,6.5),2.75,random_chirho.uniform(2,8.4)),(.018,.011,.045),glass_chirho,rain_root_chirho)
# Walnut record shelf, original typographic praise sleeve, and trailing foliage.
for z_chirho in [1.1,4.8,8.1]:
    box_chirho('walnut_shelf_chirho',(-6.25,2.22,z_chirho),(2.5,1.65,.18),wood_chirho,.03)
for x_chirho in [-7.5,-5.0]:
    box_chirho('shelf_side_chirho',(x_chirho,2.22,.6),(.16,1.65,15.2),wood_chirho,.03)
box_chirho('bookcase_floor_plinth_chirho',(-6.25,2.22,-6.85),(2.66,1.65,.30),wood_chirho,.025)
for shelf_z_chirho in [-3.3,-6.6]:
    box_chirho('bookcase_lower_shelf_chirho',(-6.25,2.22,shelf_z_chirho),(2.5,1.65,.16),wood_chirho,.025)
for index_chirho in range(12):
    object_chirho=box_chirho('record_spine_chirho',(-7.3+index_chirho*.083,1.85,6.1),(.07,.61,2.45),[red_chirho,teal_chirho,black_chirho,paper_chirho][index_chirho%4],.008)
    object_chirho.rotation_euler.y=.07
record_paper_chirho=build_record_paper_material_chirho()
box_chirho('praise_record_sleeve_chirho',(-6.15,1.41,6.16),(1.7,.06,2.42),record_paper_chirho,.015)
for x_chirho in [-6.95,-5.35]:
    box_chirho('record_gold_border_chirho',(x_chirho,1.365,6.16),(.013,.01,2.3),gold_chirho)
for z_chirho in [5.02,7.3]:
    box_chirho('record_gold_border_chirho',(-6.15,1.365,z_chirho),(1.6,.01,.013),gold_chirho)
text_chirho('praise_record_title_chirho','SONGS OF\nPRAISE',(-6.15,1.35,6.73),.27,gold_chirho)
box_chirho('record_cross_vertical_chirho',(-6.15,1.35,5.81),(.075,.018,.83),gold_chirho,.008)
box_chirho('record_cross_bar_chirho',(-6.15,1.35,6.0),(.45,.018,.07),gold_chirho,.008)
text_chirho('record_scripture_chirho','SING UNTO THE LORD',(-6.15,1.35,5.22),.072,paper_chirho)

plant_root_chirho=build_houseplant_chirho()

# Lamp is1.5times candidate4, with true local interior metadata for runtime wax motion.
TABLE_SUPPORT_Z_CHIRHO=1.29
lava_root_chirho=build_lava_lamp_chirho()
lava_x_chirho,lava_y_chirho,lava_z_chirho=tuple(lava_root_chirho.location)

# The owner removed the sofa, cushion and throw entirely.

# Foreground Bible with gilded page block, embossed lettering and raised border.
bible_chirho=group_chirho('holy_bible_chirho',room_chirho)
bible_chirho.location=(2.65,-2.94,1.35)
bible_chirho.rotation_euler.z=-.16
for z_chirho in [.04,.39]:
    box_chirho('bible_cover_chirho',(0,0,z_chirho),(2.2,2.85,.09),leather_chirho,.055,bible_chirho)
box_chirho('bible_gilded_pages_chirho',(0,.02,.21),(2.1,2.68,.26),gold_chirho,.035,bible_chirho)
box_chirho('bible_rounded_spine_chirho',(-1.07,0,.22),(.15,2.77,.42),leather_chirho,.065,bible_chirho)
for y_chirho in [-.95,-.5,0,.5,.95]:
    box_chirho('bible_spine_raised_band_chirho',(-1.145,y_chirho,.22),(.018,.065,.31),leather_chirho,.007,bible_chirho)
for page_chirho in range(18):
    small_box_chirho('gilded_page_edges_chirho',(0,-1.326,.09+page_chirho*.014),(2.03,.008,.003),paper_chirho,bible_chirho)
for x_chirho in [-1.0,1.0]:
    box_chirho('bible_cover_gold_rule_chirho',(x_chirho,0,.445),(.012,2.62,.006),gold_chirho,parent_chirho=bible_chirho)
for y_chirho in [-1.31,1.31]:
    box_chirho('bible_cover_gold_rule_chirho',(0,y_chirho,.445),(2.0,.012,.006),gold_chirho,parent_chirho=bible_chirho)
text_chirho('holy_bible_title_chirho','HOLY\nBIBLE',(0,.3,.45),.3,gold_chirho,False,bible_chirho)
box_chirho('bible_gold_cross_chirho',(0,-.56,.45),(.045,.6,.006),gold_chirho,parent_chirho=bible_chirho)
box_chirho('bible_gold_cross_arm_chirho',(0,-.42,.45),(.32,.045,.006),gold_chirho,parent_chirho=bible_chirho)

# Two transparent-edged cassette cases and a pen provide grounded foreground scale.
for index_chirho,label_chirho in enumerate(['HYMNS','PRAISE']):
    case_chirho=group_chirho('cassette_case_%02d_chirho'%index_chirho,room_chirho)
    case_chirho.location=(-.7+index_chirho*.28,-2.0-index_chirho*.42,1.36+index_chirho*.16)
    case_chirho.rotation_euler.z=.14-index_chirho*.08
    box_chirho('cassette_case_bottom_chirho',(0,0,.015),(1.9,1.22,.1),black_chirho,.025,case_chirho)
    box_chirho('cassette_case_insert_chirho',(0,0,.08),(1.79,1.1,.025),paper_chirho,.012,case_chirho)
    text_chirho('cassette_case_title_chirho',label_chirho,(0,-.14,.103),.19,cavity_chirho,False,case_chirho)
    for x_chirho in [-.93,.93]:
        box_chirho('cassette_case_clear_edge_chirho',(x_chirho,0,.11),(.035,1.2,.2),glass_chirho,.012,case_chirho)
rod_chirho('fountain_pen_chirho',(4.1,-2.8,1.37),(4.6,-1.65,1.37),.055,black_chirho)
rod_chirho('fountain_pen_gold_tip_chirho',(4.08,-2.85,1.37),(4.17,-2.65,1.37),.035,gold_chirho)

# A ceramic mug, copper desk lamp and headphones complete the right/left foreground.
lathe_chirho('ceramic_mug_chirho',(5.1,-1.7,1.3),[(.34,0),(.4,.06),(.43,.88),(.4,.9),(.36,.87),(.34,.1)],cream_chirho)
torus_chirho('mug_handle_chirho',(5.49,-1.7,1.78),.25,.06,cream_chirho,True)
for z_chirho,mat_chirho in [(1.57,teal_chirho),(1.74,red_chirho)]:
    torus_chirho('mug_color_band_chirho',(5.1,-1.7,z_chirho),.401,.035,mat_chirho)
cylinder_chirho('desk_lamp_base_chirho',(5.2,.52,1.38),.58,.14,gold_chirho)
rod_chirho('desk_lamp_stem_chirho',(5.2,.52,1.45),(5.2,.52,4.3),.07,gold_chirho)
lathe_chirho('desk_lamp_copper_shade_chirho',(5.2,.52,4.22),[(.88,0),(.87,.14),(.77,.48),(.53,.72),(.2,.83),(.09,.84)],gold_chirho)
cylinder_chirho('desk_lamp_luminous_inner_chirho',(5.2,.52,4.25),.78,.025,orange_chirho)
sphere_chirho('desk_lamp_bulb_chirho',(5.2,.52,4.1),(.18,.18,.25),orange_chirho)
# Opposing pads, one continuous proportioned headband, and a connected quarter-inch lead.
headphone_chirho,headphone_contact_parts_chirho=build_headphones_chirho()
headphone_cable_chirho,cable_contract_chirho=build_headphone_cable_chirho(headphone_chirho)

# Exportable punctual lighting: warm key, cool window fill, pink practical and rim.
def light_chirho(name_chirho,position_chirho,color_chirho,power_chirho,radius_chirho):
    data_chirho=bpy_chirho.data.lights.new(name_chirho,'POINT')
    data_chirho.color=color_chirho
    data_chirho.energy=power_chirho
    data_chirho.normalize=True
    data_chirho.shadow_soft_size=radius_chirho
    data_chirho['source_radius_chirho']=radius_chirho
    data_chirho['energy_watts_chirho']=power_chirho
    data_chirho['intensity_contract_chirho']='Normalized point energy; glTF SPEC converts watts to candela using683/(4*pi). Blender emitter radius is retained in extras for runtime lighting-parity work.'
    object_chirho=bpy_chirho.data.objects.new(name_chirho,data_chirho)
    scene_chirho.collection.objects.link(object_chirho)
    object_chirho.location=position_chirho
    object_chirho.parent=lights_chirho
    return object_chirho


light_chirho('light_warm_desk_chirho',(5.15,-.05,3.95),(1,.52,.22),520,.9)
light_chirho('light_lava_chirho',(lava_x_chirho,lava_y_chirho-.08,lava_z_chirho+.78),(1,.06,.11),45,.18)
light_chirho('light_window_blue_chirho',(1.2,1.7,7.4),(.24,.46,1),620,2.2)
# The former high key missed the frontal chrome's reflection angle. This broad low fill
# lies opposite the elevated camera and catches the face, grille wire, page edges and knobs.
light_chirho('light_front_soft_chirho',(-3,-7,2.7),(1,.85,.72),1200,3.5)
light_chirho('light_top_soft_chirho',(-1,-3,8.0),(1,.77,.53),500,2.8)
light_chirho('light_right_rim_chirho',(5.4,-1.9,4.8),(1,.32,.09),330,1.1)
light_chirho('light_left_reflection_chirho',(-5,-2,4.2),(1,.22,.3),90,1.1)

for name_chirho,(vertices_chirho,faces_chirho,mat_chirho,parent_chirho) in batch_chirho.items():
    mesh_chirho=bpy_chirho.data.meshes.new(name_chirho)
    mesh_chirho.from_pydata(vertices_chirho,[],faces_chirho)
    mesh_chirho.update()
    object_chirho=bpy_chirho.data.objects.new(name_chirho,mesh_chirho)
    scene_chirho.collection.objects.link(object_chirho)
    finish_chirho(object_chirho,name_chirho,mat_chirho,parent_chirho)

bpy_chirho.ops.object.camera_add(location=(3.8,-17.4,7.0))
camera_chirho=bpy_chirho.context.object
camera_chirho.name='hero_camera_chirho'
camera_chirho.rotation_euler=(VectorChirho((-.1,.1,3.85))-camera_chirho.location).to_track_quat('-Z','Y').to_euler()
camera_chirho.data.lens=50
camera_chirho.data.sensor_width=36
camera_chirho.data.dof.use_dof=False
scene_chirho.camera=camera_chirho

# One support plane, evaluated from actual modified mesh vertices before save/export.
def assembly_chirho(name_chirho,prefixes_chirho):
    root_object_chirho=group_chirho(name_chirho,room_chirho)
    for object_chirho in list(scene_chirho.objects):
        if object_chirho.type=='MESH' and object_chirho.parent==room_chirho and any(object_chirho.name.startswith(prefix_chirho) for prefix_chirho in prefixes_chirho):
            object_chirho.parent=root_object_chirho
    return root_object_chirho


desk_lamp_root_chirho=assembly_chirho('desk_lamp_assembly_chirho',['desk_lamp_'])
mug_root_chirho=assembly_chirho('ceramic_mug_assembly_chirho',['ceramic_mug_','mug_handle_','mug_color_band_'])
pen_root_chirho=assembly_chirho('fountain_pen_assembly_chirho',['fountain_pen_'])
notepad_root_chirho=group_chirho('notepad_stack_chirho',room_chirho)
for index_chirho in range(2):
    bpy_chirho.data.objects['cassette_case_%02d_chirho'%index_chirho].parent=notepad_root_chirho
notepad_anchor_chirho=group_chirho('live_notepad_credit_chirho',bpy_chirho.data.objects['cassette_case_01_chirho'])
notepad_anchor_chirho.location=(0,0,.108)
notepad_anchor_chirho['width_chirho']=1.65
notepad_anchor_chirho['height_chirho']=.86
notepad_anchor_chirho['depth_chirho']=.01
notepad_anchor_chirho['normal_gltf_chirho']=[0,1,0]
notepad_anchor_chirho['purpose_chirho']='Metadata-only paper-plane anchor for future live credit projection; no visible credit text is added.'
bpy_chirho.context.view_layer.update()
table_bounds_chirho=world_bounds_chirho(bpy_chirho.data.objects['table_top_chirho'])
table_z_chirho=table_bounds_chirho['max_chirho'][2]
assert abs(table_z_chirho-TABLE_SUPPORT_Z_CHIRHO)<.00001
prop_roots_chirho=[radio_chirho,lava_root_chirho,headphone_chirho,bible_chirho,desk_lamp_root_chirho,mug_root_chirho,pen_root_chirho,notepad_root_chirho]
vertical_adjustments_chirho={}
for root_object_chirho in prop_roots_chirho:
    delta_chirho=table_z_chirho-world_bounds_chirho(root_object_chirho)['min_chirho'][2]
    assert abs(delta_chirho)<.075,(root_object_chirho.name,delta_chirho)
    vertical_adjustments_chirho[root_object_chirho.name]=delta_chirho
    root_object_chirho.location.z+=delta_chirho
bpy_chirho.context.view_layer.update()
prop_bounds_chirho={root_object_chirho.name:world_bounds_chirho(root_object_chirho) for root_object_chirho in prop_roots_chirho}
for name_chirho,bounds_chirho in prop_bounds_chirho.items():
    assert abs(bounds_chirho['min_chirho'][2]-table_z_chirho)<.0002,(name_chirho,'table contact')
    for axis_chirho in [0,1]:
        assert bounds_chirho['min_chirho'][axis_chirho]>=table_bounds_chirho['min_chirho'][axis_chirho]-.0002,(name_chirho,'outside table minimum')
        assert bounds_chirho['max_chirho'][axis_chirho]<=table_bounds_chirho['max_chirho'][axis_chirho]+.0002,(name_chirho,'outside table maximum')
headphone_bounds_chirho=prop_bounds_chirho[headphone_chirho.name]
radio_bounds_chirho=prop_bounds_chirho[radio_chirho.name]
lamp_bounds_chirho=prop_bounds_chirho[lava_root_chirho.name]
radio_gap_chirho=radio_bounds_chirho['min_chirho'][1]-headphone_bounds_chirho['max_chirho'][1]
assert radio_gap_chirho>.25,('headphones must be wholly in front of radio',radio_gap_chirho)
assert radio_bounds_chirho['min_chirho'][0]-lamp_bounds_chirho['max_chirho'][0]>.3
assert lamp_bounds_chirho['max_chirho'][1]<1.0,('lamp must be clear of bookshelf',lamp_bounds_chirho)
bible_bounds_chirho=prop_bounds_chirho[bible_chirho.name]
bible_radio_gap_chirho=radio_bounds_chirho['min_chirho'][1]-bible_bounds_chirho['max_chirho'][1]
assert bible_radio_gap_chirho>.25,('Bible must be wholly in front of radio',bible_radio_gap_chirho)
headphone_prop_gaps_chirho={}
for other_root_chirho in [bible_chirho,notepad_root_chirho,lava_root_chirho]:
    other_bounds_chirho=prop_bounds_chirho[other_root_chirho.name]
    separation_chirho=max(max(other_bounds_chirho['min_chirho'][axis_chirho]-headphone_bounds_chirho['max_chirho'][axis_chirho],headphone_bounds_chirho['min_chirho'][axis_chirho]-other_bounds_chirho['max_chirho'][axis_chirho]) for axis_chirho in [0,1])
    assert separation_chirho>.20,('headphones intersect another prop',other_root_chirho.name,separation_chirho)
    headphone_prop_gaps_chirho[other_root_chirho.name]=separation_chirho
headphone_contacts_chirho={}
for part_chirho in headphone_contact_parts_chirho:
    contact_chirho=world_bounds_chirho(part_chirho,table_z_chirho)
    assert contact_chirho['contact_vertices_chirho'],(part_chirho.name,'no tabletop support')
    for point_chirho in contact_chirho['contact_vertices_chirho']:
        for axis_chirho in [0,1]:
            assert table_bounds_chirho['min_chirho'][axis_chirho]+.18<point_chirho[axis_chirho]<table_bounds_chirho['max_chirho'][axis_chirho]-.18
    headphone_contacts_chirho[part_chirho.name]={'min_z_chirho':contact_chirho['min_chirho'][2],'contact_vertex_count_chirho':len(contact_chirho['contact_vertices_chirho'])}
cable_support_chirho=world_bounds_chirho(headphone_cable_chirho,table_z_chirho)
assert cable_support_chirho['contact_vertices_chirho'],('coiled cable has no tabletop contact')
assert cable_support_chirho['min_chirho'][2]>=table_z_chirho-.0002,('cable penetrates table')
for axis_chirho in [0,1]:
    assert cable_support_chirho['min_chirho'][axis_chirho]>=table_bounds_chirho['min_chirho'][axis_chirho]
    assert cable_support_chirho['max_chirho'][axis_chirho]<=table_bounds_chirho['max_chirho'][axis_chirho]
pad_facing_chirho=[]
for part_chirho in headphone_contact_parts_chirho[:2]:
    normal_chirho=(part_chirho.matrix_world.to_3x3()@VectorChirho((0,0,1))).normalized()
    center_chirho=part_chirho.matrix_world.translation
    toward_center_chirho=VectorChirho((headphone_chirho.location.x-center_chirho.x,0,0)).normalized()
    facing_dot_chirho=normal_chirho.dot(toward_center_chirho)
    assert facing_dot_chirho>.99,('headphone pad faces outward',part_chirho.name)
    pad_facing_chirho.append(facing_dot_chirho)
wax_clearance_chirho=measure_wax_interior_chirho(lava_root_chirho)
lamp_frame_chirho=[]
for x_chirho in [lamp_bounds_chirho['min_chirho'][0],lamp_bounds_chirho['max_chirho'][0]]:
    for y_chirho in [lamp_bounds_chirho['min_chirho'][1],lamp_bounds_chirho['max_chirho'][1]]:
        for z_chirho in [lamp_bounds_chirho['min_chirho'][2],lamp_bounds_chirho['max_chirho'][2]]:
            point_chirho=worldToCameraViewChirho(scene_chirho,camera_chirho,VectorChirho((x_chirho,y_chirho,z_chirho)))
            assert .005<point_chirho.x<.995 and .005<point_chirho.y<.995 and point_chirho.z>0,('lamp clipped',tuple(point_chirho))
            lamp_frame_chirho.append(tuple(point_chirho))
anchor_world_chirho=notepad_anchor_chirho.matrix_world.translation
control_anchors_chirho['live_notepad_credit_chirho']={'center_gltf_chirho':[anchor_world_chirho.x,anchor_world_chirho.z,-anchor_world_chirho.y],'width_chirho':1.65,'height_chirho':.86,'depth_chirho':.01,'normal_gltf_chirho':[0,1,0]}
room_finish_proof_chirho=measure_room_finish_chirho(plant_root_chirho,table_z_chirho)
support_proof_chirho={'room_finish_chirho':room_finish_proof_chirho,'coordinate_system_chirho':'Blender XYZ, Z up','table_chirho':table_bounds_chirho,'tabletop_z_chirho':table_z_chirho,'props_chirho':prop_bounds_chirho,'vertical_contact_adjustments_chirho':vertical_adjustments_chirho,'headphone_radio_gap_chirho':radio_gap_chirho,'headphone_contact_parts_chirho':headphone_contacts_chirho,'headphone_other_prop_gaps_chirho':headphone_prop_gaps_chirho,'headphone_pad_facing_dots_chirho':pad_facing_chirho,'bible_radio_gap_chirho':bible_radio_gap_chirho,'wax_interior_clearance_chirho':wax_clearance_chirho,'cable_contract_chirho':cable_contract_chirho,'cable_support_chirho':cable_support_chirho,'lamp_projected_corners_chirho':lamp_frame_chirho,'passed_chirho':True}
proof_root_chirho=ROOT_CHIRHO/'evidence-chirho'
proof_root_chirho.mkdir(parents=True,exist_ok=True)
(proof_root_chirho/'support_bounds_chirho.json').write_text(json_chirho.dumps(support_proof_chirho,indent=2)+'\n')
scene_chirho['coordinate_contract_chirho']='Blender Z-up converts to glTF Y-up: [x,y,z] -> [x,z,-y]. Radio front faces glTF+Z. Table contact glTF Y1.29; floor glTF Y-7. Art-first radio case8.8x4.3x1.4.'
scene_chirho['runtime_chirho']='Animate lamp_wax_chirho descendants in bounded vessel; translate window_rain_chirho streaks and wrap within frame. Orbit is runtime-owned:18degree horizontal,14degree up,9degree down with resistance and slow spring return.'

blend_path_chirho=ROOT_CHIRHO/'christian_stereo_room_chirho.blend'
glb_path_chirho=ROOT_CHIRHO/'christian_stereo_room_chirho.glb'
# All lettering is mesh geometry; the two handwritten labels use original pen paths.
assert not any(object_chirho.type=='FONT' for object_chirho in scene_chirho.objects)
bpy_chirho.ops.wm.save_as_mainfile(filepath=str(blend_path_chirho))
previous_engine_chirho=scene_chirho.render.engine
try:
    # Supported direct-energy export path; saved master retains its Cycles setup.
    scene_chirho.render.engine='BLENDER_EEVEE'
    bpy_chirho.ops.export_scene.gltf(filepath=str(glb_path_chirho),export_format='GLB',export_apply=True,export_texcoords=True,export_normals=True,export_materials='EXPORT',export_cameras=True,export_lights=True,export_extras=True,export_import_convert_lighting_mode='SPEC')
finally:
    scene_chirho.render.engine=previous_engine_chirho
export_parity_chirho=verify_export_parity_chirho(glb_path_chirho,SOURCE_ROOT_CHIRHO/'export_baseline_chirho.json',proof_root_chirho/'export_parity_chirho.json')
depsgraph_chirho=bpy_chirho.context.evaluated_depsgraph_get()
triangles_chirho=0
meshes_chirho=0
for object_chirho in scene_chirho.objects:
    if object_chirho.type=='MESH':
        meshes_chirho+=1
        evaluated_chirho=object_chirho.evaluated_get(depsgraph_chirho)
        mesh_chirho=evaluated_chirho.to_mesh()
        mesh_chirho.calc_loop_triangles()
        triangles_chirho+=len(mesh_chirho.loop_triangles)
        evaluated_chirho.to_mesh_clear()
inventory_chirho={
    'candidate_revision_chirho':10,
    'recipe_sha256_chirho':hashlib_chirho.sha256(PathChirho(__file__).read_bytes()).hexdigest(),
    'helper_sha256_chirho':hashlib_chirho.sha256(helper_path_chirho.read_bytes()).hexdigest(),
    'blender_version_chirho':bpy_chirho.app.version_string,
    'objects_chirho':len(scene_chirho.objects),'mesh_objects_chirho':meshes_chirho,
    'evaluated_triangles_chirho':triangles_chirho,'materials_chirho':len(bpy_chirho.data.materials),
    'textures_chirho':[{'name_chirho':image_chirho.name,'width_chirho':image_chirho.size[0],'height_chirho':image_chirho.size[1]} for image_chirho in bpy_chirho.data.images],
    'blend_bytes_chirho':blend_path_chirho.stat().st_size,'glb_bytes_chirho':glb_path_chirho.stat().st_size,
    'rendered_chirho':False,'paid_provider_calls_chirho':0,
    'live_mount_gltf_chirho':{'center_chirho':[0,4.82,1.045],'width_chirho':7.8,'height_chirho':1.28},
    'control_anchors_chirho':control_anchors_chirho,
    'support_proof_chirho':support_proof_chirho,
    'limitations_chirho':['Export does not itself establish a rendered visual review.','Runtime wax/rain animation and constrained orbit return are not authored into GLB.','Original praise sleeve is geometric typography, not detailed cover painting.','Distant city is the owner-approved original photographic matte; room/window/rain remain geometry.','Current HTML controls require compact band layout to match this art-first radio.','GLB punctual lights omit Blender emitter radius; source_radius_chirho extras support runtime area/environment reflection parity.','Export-only EEVEE direct-energy path is checked against preserved C8 light and material records.']}
(ROOT_CHIRHO/'inventory_chirho.json').write_text(json_chirho.dumps(inventory_chirho,indent=2)+'\n')
print('INVENTORY_CHIRHO '+json_chirho.dumps(inventory_chirho))
