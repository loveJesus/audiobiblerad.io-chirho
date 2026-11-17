# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Scene-detail builders loaded into the recipe's shared Blender authoring namespace."""
import numpy as numpy_chirho


def world_bounds_chirho(root_object_chirho, contact_z_chirho=None):
    """Measure evaluated world vertices, using bounded arrays instead of Python vertex loops."""
    minimum_chirho=numpy_chirho.full(3,numpy_chirho.inf)
    maximum_chirho=numpy_chirho.full(3,-numpy_chirho.inf)
    contacts_chirho=[]
    graph_chirho=bpy_chirho.context.evaluated_depsgraph_get()
    for object_chirho in [root_object_chirho,*root_object_chirho.children_recursive]:
        if object_chirho.type!='MESH':
            continue
        evaluated_chirho=object_chirho.evaluated_get(graph_chirho)
        mesh_chirho=evaluated_chirho.to_mesh()
        try:
            if not mesh_chirho.vertices:
                continue
            coordinates_chirho=numpy_chirho.empty(len(mesh_chirho.vertices)*3,dtype=numpy_chirho.float64)
            mesh_chirho.vertices.foreach_get('co',coordinates_chirho)
            matrix_chirho=numpy_chirho.asarray(evaluated_chirho.matrix_world,dtype=numpy_chirho.float64)
            world_chirho=coordinates_chirho.reshape((-1,3))@matrix_chirho[:3,:3].T+matrix_chirho[:3,3]
            assert numpy_chirho.isfinite(world_chirho).all(),object_chirho.name
            minimum_chirho=numpy_chirho.minimum(minimum_chirho,world_chirho.min(axis=0))
            maximum_chirho=numpy_chirho.maximum(maximum_chirho,world_chirho.max(axis=0))
            if contact_z_chirho is not None:
                contacts_chirho.extend(world_chirho[numpy_chirho.abs(world_chirho[:,2]-contact_z_chirho)<.0002].tolist())
        finally:
            evaluated_chirho.to_mesh_clear()
    assert numpy_chirho.isfinite(minimum_chirho).all(),root_object_chirho.name
    return {'min_chirho':minimum_chirho.tolist(),'max_chirho':maximum_chirho.tolist(),'contact_vertices_chirho':contacts_chirho}


def branch_point_chirho(controls_chirho,t_chirho):
    u_chirho=1-t_chirho
    return VectorChirho(controls_chirho[0])*(u_chirho**3)+VectorChirho(controls_chirho[1])*(3*u_chirho*u_chirho*t_chirho)+VectorChirho(controls_chirho[2])*(3*u_chirho*t_chirho*t_chirho)+VectorChirho(controls_chirho[3])*(t_chirho**3)


def tapered_branch_chirho(name_chirho,controls_chirho,base_radius_chirho,tip_radius_chirho,mat_chirho,parent_chirho):
    points_chirho=[branch_point_chirho(controls_chirho,index_chirho/32) for index_chirho in range(33)]
    vertices_chirho,faces_chirho=[],[]
    for index_chirho,point_chirho in enumerate(points_chirho):
        t_chirho=index_chirho/32
        tangent_chirho=(points_chirho[min(32,index_chirho+1)]-points_chirho[max(0,index_chirho-1)]).normalized()
        axis_chirho=VectorChirho((0,1,0))
        first_chirho=tangent_chirho.cross(axis_chirho).normalized()
        second_chirho=tangent_chirho.cross(first_chirho).normalized()
        radius_chirho=tip_radius_chirho+(base_radius_chirho-tip_radius_chirho)*(1-t_chirho)**1.3
        for side_chirho in range(10):
            angle_chirho=side_chirho*math_chirho.tau/10
            vertices_chirho.append(tuple(point_chirho+radius_chirho*(first_chirho*math_chirho.cos(angle_chirho)+second_chirho*math_chirho.sin(angle_chirho))))
    for index_chirho in range(32):
        for side_chirho in range(10):
            next_chirho=(side_chirho+1)%10
            faces_chirho.append((index_chirho*10+side_chirho,index_chirho*10+next_chirho,(index_chirho+1)*10+next_chirho,(index_chirho+1)*10+side_chirho))
    faces_chirho.extend([tuple(reversed(range(10))),tuple(range(320,330))])
    mesh_chirho=bpy_chirho.data.meshes.new(name_chirho)
    mesh_chirho.from_pydata(vertices_chirho,[],faces_chirho)
    mesh_chirho.update()
    object_chirho=bpy_chirho.data.objects.new(name_chirho,mesh_chirho)
    scene_chirho.collection.objects.link(object_chirho)
    return finish_chirho(object_chirho,name_chirho,mat_chirho,parent_chirho,True)


def build_houseplant_chirho():
    plant_root_chirho=group_chirho('right_floor_ficus_chirho',room_chirho)
    plant_root_chirho.location=(7.65,1.60,ROOM_FLOOR_Z_CHIRHO)
    ceramic_chirho=material_chirho('plant_glazed_stoneware_chirho',(.19,.16,.11),.34)
    foliage_chirho=[material_chirho('leaf_satin_%02d_chirho'%index_chirho,color_chirho,.58) for index_chirho,color_chirho in enumerate([(.009,.027,.012),(.015,.040,.018),(.020,.051,.022)])]
    for mat_chirho in foliage_chirho:
        mat_chirho.node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value=.20
    soil_chirho=material_chirho('plant_soil_chirho',(.022,.014,.008),.96)
    bark_chirho=material_chirho('ficus_bark_chirho',(.042,.027,.016),.89)
    lathe_chirho('plant_stoneware_pot_chirho',(0,0,0),[(.79,0),(.84,.08),(.96,1.80),(1.02,1.95),(1.02,2.10),(.95,2.14),(.90,1.96),(.74,.12)],ceramic_chirho,plant_root_chirho)
    cylinder_chirho('plant_soil_surface_chirho',(0,0,2.02),.93,.035,soil_chirho,parent_chirho=plant_root_chirho)
    trunk_controls_chirho=[(0,0,2.04),(.22,.12,5.0),(-1.15,.30,10.8),(-1.10,.30,14.1)]
    tapered_branch_chirho('ficus_tapered_curving_trunk_chirho',trunk_controls_chirho,.095,.014,bark_chirho,plant_root_chirho)
    branch_specs_chirho=[
        (trunk_controls_chirho,[.93,.98]),
        ([tuple(branch_point_chirho(trunk_controls_chirho,.70)),(-.90,.18,11.5),(-1.52,.10,12.7),(-1.65,.17,13.55)],[.84,.92,.98,.89,.96]),
        ([tuple(branch_point_chirho(trunk_controls_chirho,.78)),(-.55,.31,12.3),(-.30,.30,13.4),(-.40,.35,14.1)],[.82,.91,.97,.87,.99]),
        ([tuple(branch_point_chirho(trunk_controls_chirho,.86)),(-1.20,.31,13.1),(-1.50,.40,14.1),(-1.20,.36,14.65)],[.81,.88,.94,.98,.85,.96])]
    local_random_chirho=random_chirho.Random(71726)
    leaf_index_chirho=0
    for branch_index_chirho,(controls_chirho,fractions_chirho) in enumerate(branch_specs_chirho):
        if branch_index_chirho:
            tapered_branch_chirho('ficus_curved_crown_branch_chirho',controls_chirho,.048-branch_index_chirho*.004,.009,bark_chirho,plant_root_chirho)
        for fraction_chirho in fractions_chirho:
            attachment_chirho=branch_point_chirho(controls_chirho,fraction_chirho)
            angle_chirho=[-2.95,-.18,-1.25,.18,2.96,-2.25,-.65][leaf_index_chirho%7]+local_random_chirho.uniform(-.10,.10)
            direction_chirho=VectorChirho((math_chirho.cos(angle_chirho),math_chirho.sin(angle_chirho),local_random_chirho.uniform(-.14,.24))).normalized()
            across_base_chirho=VectorChirho((0,-1,0)).cross(direction_chirho).normalized()
            roll_chirho=local_random_chirho.uniform(-.72,.78)
            length_chirho=local_random_chirho.uniform(.65,1.04)
            maximum_width_chirho=length_chirho*local_random_chirho.uniform(.20,.27)
            petiole_length_chirho=local_random_chirho.uniform(.09,.18)
            leaf_base_chirho=attachment_chirho+direction_chirho*petiole_length_chirho
            rod_chirho('ficus_leaf_petiole_chirho',tuple(attachment_chirho),tuple(leaf_base_chirho),.009,bark_chirho,plant_root_chirho)
            vertices_chirho,faces_chirho,midrib_chirho=[],[],[]
            phase_chirho=local_random_chirho.uniform(0,math_chirho.tau)
            for row_chirho in range(19):
                t_chirho=row_chirho/18
                twist_chirho=roll_chirho+.42*(t_chirho-.5)
                across_chirho=across_base_chirho*math_chirho.cos(twist_chirho)+direction_chirho.cross(across_base_chirho)*math_chirho.sin(twist_chirho)
                normal_chirho=direction_chirho.cross(across_chirho).normalized()
                center_chirho=leaf_base_chirho+direction_chirho*(length_chirho*t_chirho)+across_base_chirho*(.045*math_chirho.sin(math_chirho.pi*t_chirho+phase_chirho)*math_chirho.sin(math_chirho.pi*t_chirho))
                center_chirho.z-=.11*t_chirho*t_chirho
                width_chirho=maximum_width_chirho*math_chirho.sin(math_chirho.pi*t_chirho)**.75*(1+.055*math_chirho.sin(5*math_chirho.pi*t_chirho+phase_chirho))
                midrib_chirho.append(tuple(center_chirho+normal_chirho*.004))
                for column_chirho in range(7):
                    across_fraction_chirho=(column_chirho-3)/3
                    asymmetry_chirho=.92 if across_fraction_chirho<0 else 1.04
                    curl_chirho=(-.055*across_fraction_chirho*across_fraction_chirho+.016*math_chirho.sin(t_chirho*math_chirho.tau*2+phase_chirho)*abs(across_fraction_chirho))*math_chirho.sin(math_chirho.pi*t_chirho)
                    vertices_chirho.append(tuple(center_chirho+across_chirho*(width_chirho*across_fraction_chirho*asymmetry_chirho)+normal_chirho*curl_chirho))
            for row_chirho in range(18):
                for column_chirho in range(6):
                    start_chirho=row_chirho*7+column_chirho
                    faces_chirho.append((start_chirho,start_chirho+1,start_chirho+8,start_chirho+7))
            mesh_chirho=bpy_chirho.data.meshes.new('ficus_curved_oval_leaf_chirho')
            mesh_chirho.from_pydata(vertices_chirho,[],faces_chirho)
            mesh_chirho.update()
            leaf_object_chirho=bpy_chirho.data.objects.new('ficus_curved_oval_leaf_chirho',mesh_chirho)
            scene_chirho.collection.objects.link(leaf_object_chirho)
            finish_chirho(leaf_object_chirho,'ficus_curved_oval_leaf_chirho',foliage_chirho[leaf_index_chirho%3],plant_root_chirho,True)
            tube_path_chirho('ficus_fine_midrib_chirho',midrib_chirho,.0028,foliage_chirho[(leaf_index_chirho+1)%3],plant_root_chirho,5)
            leaf_index_chirho+=1
    plant_root_chirho['botanical_form_chirho']='Organic ficus: tapered curved trunk, three unequal crown branches and eighteen irregular curled leaves; fixed seed, no paired ladder arrangement.'
    return plant_root_chirho


def build_lava_lamp_chirho():
    lava_root_chirho=group_chirho('tabletop_lava_lamp_chirho',room_chirho)
    lava_root_chirho.location=(-5.55,-.40,TABLE_SUPPORT_Z_CHIRHO)
    lava_root_chirho.scale=(1.5,1.5,1.5)
    wax_root_chirho.parent=lava_root_chirho
    lathe_chirho('lava_lamp_base_chirho',(0,0,0),[(.38,0),(.39,.07),(.19,.45),(.16,.51)],chrome_chirho,lava_root_chirho)
    lathe_chirho('lava_lamp_glass_chirho',(0,0,0),[(.16,.45),(.29,.58),(.32,.75),(.25,1.65),(.12,2.0),(.115,2.1),(.10,2.1),(.105,2.0),(.235,1.65),(.305,.75),(.275,.6),(.145,.47),(.16,.45)],glass_chirho,lava_root_chirho)
    lathe_chirho('lava_lamp_cap_chirho',(0,0,0),[(.12,1.98),(.13,2.0),(.07,2.35),(0,2.35)],silver_chirho,lava_root_chirho)
    # Radius profile is the actual inside glass wall, in parent-local glTF Y-up units.
    interior_chirho=[[.47,.145],[.60,.275],[.75,.305],[1.65,.235],[2.0,.105],[2.1,.10]]
    wax_root_chirho['interior_profile_chirho']=[value_chirho for row_chirho in interior_chirho for value_chirho in row_chirho]
    wax_root_chirho['interior_base_chirho']=.47
    wax_root_chirho['interior_top_chirho']=2.10
    wax_root_chirho['interior_max_radius_chirho']=.305
    wax_root_chirho['wall_clearance_chirho']=.018
    wax_root_chirho['axis_contract_chirho']='Parent-local glTF Y is height; X/Z are radial. Parent scale is1.5. Profile is flattened height/radius pairs; subtract blob radius and wall clearance before moving.'
    interior_anchor_chirho=group_chirho('lava_interior_chirho',lava_root_chirho)
    interior_anchor_chirho.location=(0,0,1.285)
    interior_anchor_chirho['center_world_gltf_chirho']=[-5.55,3.2175,.40]
    interior_anchor_chirho['height_world_chirho']=2.445
    interior_anchor_chirho['lower_radius_world_chirho']=.2175
    interior_anchor_chirho['upper_radius_world_chirho']=.15
    interior_anchor_chirho['maximum_radius_world_chirho']=.4575
    interior_anchor_chirho['profile_anchor_local_chirho']=[value_chirho for height_chirho,radius_chirho in interior_chirho for value_chirho in (height_chirho-1.285,radius_chirho)]
    interior_anchor_chirho['axis_contract_chirho']='Anchor local glTF Y is height; flattened height/radius pairs use heights relative to this anchor. Parent uniform scale1.5 converts local radius/height to world. Wax siblings retain lamp-base local origin.'
    for index_chirho,position_chirho,scale_chirho in [(0,(0,0,.76),(.22,.22,.15)),(1,(.025,0,1.12),(.145,.145,.23)),(2,(-.035,.015,1.57),(.095,.095,.14)),(3,(.015,-.015,1.82),(.055,.055,.08))]:
        wax_chirho=sphere_chirho('lamp_wax_%02d_chirho'%index_chirho,position_chirho,scale_chirho,pink_chirho,wax_root_chirho)
        wax_chirho['animation_phase_chirho']=index_chirho*1.57
        wax_chirho['animation_amplitude_chirho']=[.07,.13,.10,.055][index_chirho]
        wax_chirho['rest_center_height_chirho']=position_chirho[2]
        wax_chirho['radial_extent_chirho']=max(scale_chirho[:2])
        wax_chirho['vertical_extent_chirho']=scale_chirho[2]
    return lava_root_chirho


def measure_wax_interior_chirho(lava_root_chirho):
    flat_profile_chirho=list(wax_root_chirho['interior_profile_chirho'])
    profile_chirho=sorted(zip(flat_profile_chirho[0::2],flat_profile_chirho[1::2]))
    inverse_chirho=lava_root_chirho.matrix_world.inverted()
    result_chirho={}
    for blob_chirho in wax_root_chirho.children:
        if blob_chirho.type!='MESH':
            continue
        amplitude_chirho=blob_chirho['animation_amplitude_chirho']
        minimum_chirho=float('inf')
        for vertex_chirho in blob_chirho.data.vertices:
            point_chirho=inverse_chirho@blob_chirho.matrix_world@vertex_chirho.co
            for displacement_chirho in [-amplitude_chirho,0,amplitude_chirho]:
                height_chirho=point_chirho.z+displacement_chirho
                assert profile_chirho[0][0]<height_chirho<profile_chirho[-1][0],(blob_chirho.name,'wax leaves vessel vertically')
                radius_chirho=float(numpy_chirho.interp(height_chirho,[row_chirho[0] for row_chirho in profile_chirho],[row_chirho[1] for row_chirho in profile_chirho]))
                gap_chirho=radius_chirho-math_chirho.hypot(point_chirho.x,point_chirho.y)
                minimum_chirho=min(minimum_chirho,gap_chirho)
        assert minimum_chirho>wax_root_chirho['wall_clearance_chirho'],(blob_chirho.name,'wax touches glass',minimum_chirho)
        result_chirho[blob_chirho.name]={'minimum_radial_gap_parent_units_chirho':minimum_chirho,'tested_vertical_motion_chirho':[-amplitude_chirho,amplitude_chirho]}
    return result_chirho


def build_headphones_chirho():
    headset_chirho=group_chirho('overear_headphones_chirho',room_chirho)
    headset_chirho.location=(-3.65,-3.36,TABLE_SUPPORT_Z_CHIRHO)
    headset_chirho.scale=(1.35,1.35,1.35)
    headset_chirho['removable_chirho']=True
    headset_chirho['construction_chirho']='One continuous headband and two inward-facing oval pads. Cups rest on their lower cushion edges; rear padded arch also meets table.'
    support_parts_chirho=[]
    for side_chirho in [-1,1]:
        cup_root_chirho=group_chirho('headphone_cup_%s_chirho'%('left' if side_chirho<0 else 'right'),headset_chirho)
        pad_chirho=torus_chirho('headphone_inward_ear_pad_chirho',(side_chirho*.64,0,.57),.40,.115,rubber_chirho,parent_chirho=cup_root_chirho)
        pad_chirho.rotation_euler.y=-side_chirho*math_chirho.pi/2
        pad_chirho.scale.x=.57/.515
        pad_chirho.scale.y=1.10
        pad_chirho['inner_normal_gltf_chirho']=[-side_chirho,0,0]
        support_parts_chirho.append(pad_chirho)
        for name_chirho,x_chirho,radius_chirho,depth_chirho,mat_chirho in [('headphone_outer_cup_chirho',.81,.48,.20,black_chirho),('headphone_outer_metal_disc_chirho',.925,.42,.045,silver_chirho)]:
            cup_chirho=cylinder_chirho(name_chirho,(side_chirho*x_chirho,0,.57),radius_chirho,depth_chirho,mat_chirho,parent_chirho=cup_root_chirho)
            cup_chirho.rotation_euler.y=side_chirho*math_chirho.pi/2
            cup_chirho.scale.x=1.10
            cup_chirho.scale.y=1.10
        # Visible dark ear aperture faces the opposing cup, within the soft pad opening.
        aperture_chirho=cylinder_chirho('headphone_inner_acoustic_cloth_chirho',(side_chirho*.665,0,.57),.305,.018,cavity_chirho,parent_chirho=cup_root_chirho)
        aperture_chirho.rotation_euler.y=-side_chirho*math_chirho.pi/2
        aperture_chirho.scale.x=1.08
        for y_chirho in [-.26,.26]:
            rod_chirho('headphone_cup_yoke_chirho',(side_chirho*.84,y_chirho,.71),(side_chirho*.83,.30,.72),.022,silver_chirho,cup_root_chirho)
        for index_chirho in range(32):
            angle_chirho=index_chirho*math_chirho.tau/32
            small_box_chirho('headphone_cup_edge_ribs_chirho',(side_chirho*.81,math_chirho.cos(angle_chirho)*.53,.57+math_chirho.sin(angle_chirho)*.53),(.16,.012,.012),black_chirho,headset_chirho)
    vertices_chirho,faces_chirho=[],[]
    for index_chirho in range(65):
        angle_chirho=index_chirho*math_chirho.pi/64
        center_z_chirho=.72-.64*math_chirho.sin(angle_chirho)
        for radial_chirho,vertical_chirho in [(-.10,-.08),(.10,-.08),(.10,.08),(-.10,.08)]:
            vertices_chirho.append(((.83+radial_chirho)*math_chirho.cos(angle_chirho),.30+(1.05+radial_chirho)*math_chirho.sin(angle_chirho),center_z_chirho+vertical_chirho))
    for index_chirho in range(64):
        for side_chirho in range(4):
            following_chirho=(side_chirho+1)%4
            faces_chirho.append((index_chirho*4+side_chirho,index_chirho*4+following_chirho,(index_chirho+1)*4+following_chirho,(index_chirho+1)*4+side_chirho))
    faces_chirho.extend([(3,2,1,0),(256,257,258,259)])
    mesh_chirho=bpy_chirho.data.meshes.new('headphone_continuous_padded_band_chirho')
    mesh_chirho.from_pydata(vertices_chirho,[],faces_chirho)
    mesh_chirho.update()
    band_chirho=bpy_chirho.data.objects.new('headphone_continuous_padded_band_chirho',mesh_chirho)
    scene_chirho.collection.objects.link(band_chirho)
    finish_chirho(band_chirho,'headphone_continuous_padded_band_chirho',leather_chirho,headset_chirho,True)
    support_parts_chirho.append(band_chirho)
    for radial_chirho in [-.075,.075]:
        points_chirho=[((.83+radial_chirho)*math_chirho.cos(index_chirho*math_chirho.pi/64),.30+(1.05+radial_chirho)*math_chirho.sin(index_chirho*math_chirho.pi/64),.804-.64*math_chirho.sin(index_chirho*math_chirho.pi/64)) for index_chirho in range(65)]
        tube_path_chirho('headphone_band_welt_chirho',points_chirho,.006,rubber_chirho,headset_chirho,6)
    return headset_chirho,support_parts_chirho


def build_headphone_cable_chirho(headset_chirho):
    cable_root_chirho=group_chirho('headphone_cable_chirho',room_chirho)
    jack_chirho=(-4.08,-.76,1.68)
    torus_chirho('quarter_inch_headphone_jack_chirho',jack_chirho,.072,.015,chrome_chirho,True,radio_chirho)
    cylinder_chirho('headphone_jack_dark_center_chirho',(-4.08,-.765,1.68),.052,.012,cavity_chirho,True,radio_chirho)
    cylinder_chirho('quarter_inch_plug_shaft_chirho',(-4.08,-.88,1.68),.043,.22,chrome_chirho,True,cable_root_chirho)
    for y_chirho in [-.82,-.90]:
        cylinder_chirho('plug_insulator_ring_chirho',(-4.08,y_chirho,1.68),.045,.018,black_chirho,True,cable_root_chirho)
    cylinder_chirho('headphone_plug_grip_chirho',(-4.08,-1.105,1.68),.075,.23,black_chirho,True,cable_root_chirho)
    for y_chirho in [-1.03,-1.08,-1.13,-1.18]:
        torus_chirho('plug_grip_ring_chirho',(-4.08,y_chirho,1.68),.075,.006,rubber_chirho,True,cable_root_chirho)
    cylinder_chirho('headphone_plug_strain_relief_chirho',(-4.08,-1.275,1.68),.034,.11,rubber_chirho,True,cable_root_chirho)
    # The visible connector sits below the left woofer; cable falls forward, never across its face.
    endpoint_chirho=VectorChirho((-4.08,-1.33,1.68))
    points_chirho=[tuple(endpoint_chirho)]
    coil_floor_chirho=TABLE_SUPPORT_Z_CHIRHO+.018*math_chirho.sin(math_chirho.pi/3)
    for index_chirho in range(1,25):
        t_chirho=index_chirho/24
        points_chirho.append((-4.08-.96*t_chirho,-1.33-.55*t_chirho,1.68-(1.68-coil_floor_chirho)*math_chirho.sin(t_chirho*math_chirho.pi/2)))
    for index_chirho in range(1,145):
        t_chirho=index_chirho/144
        angle_chirho=t_chirho*math_chirho.tau*18
        envelope_chirho=.5-.5*math_chirho.cos(math_chirho.pi*min(1,t_chirho*8))
        points_chirho.append((-5.04+.085*math_chirho.sin(angle_chirho)*envelope_chirho,-1.88-1.49*t_chirho,coil_floor_chirho+.07*(1-math_chirho.cos(angle_chirho))*envelope_chirho))
    cup_endpoint_chirho=headset_chirho.location+VectorChirho((-.83*headset_chirho.scale.x,-.23*headset_chirho.scale.y,.17*headset_chirho.scale.z))
    start_chirho=VectorChirho(points_chirho[-1])
    for index_chirho in range(1,17):
        point_chirho=start_chirho.lerp(cup_endpoint_chirho,index_chirho/16)
        points_chirho.append(tuple(point_chirho))
    tube_path_chirho('coiled_headphone_cord_chirho',points_chirho,.018,black_chirho,cable_root_chirho,6)
    cylinder_chirho('headphone_cup_cord_socket_chirho',tuple(cup_endpoint_chirho),.035,.12,black_chirho,True,cable_root_chirho)
    contract_chirho={'plug_chirho':list(endpoint_chirho),'cup_chirho':list(cup_endpoint_chirho),'jack_chirho':list(jack_chirho),'polyline_length_chirho':sum((VectorChirho(points_chirho[index_chirho])-VectorChirho(points_chirho[index_chirho-1])).length for index_chirho in range(1,len(points_chirho))),'coordinate_system_chirho':'Blender XYZ','separate_root_reason_chirho':'Cable intentionally bridges radio and headset; headset-only AABB establishes speaker clearance.'}
    cable_root_chirho['endpoint_contract_chirho']=contract_chirho
    return cable_root_chirho,contract_chirho


def build_record_paper_material_chirho():
    result_chirho=material_chirho('praise_sleeve_printed_paper_chirho',(.018,.035,.09),.86)
    shader_chirho=result_chirho.node_tree.nodes['Principled BSDF']
    shader_chirho.inputs['Specular IOR Level'].default_value=.18
    image_chirho=bpy_chirho.data.images.new('praise_paper_fibers_chirho',width=128,height=128,alpha=False)
    image_chirho.colorspace_settings.name='Non-Color'
    pixels_chirho=[]
    for y_chirho in range(128):
        for x_chirho in range(128):
            fiber_chirho=((x_chirho*17+y_chirho*31)%37)/36-.5
            pixels_chirho.extend((.5+fiber_chirho*.018,.5+math_chirho.sin(y_chirho*2.7)*.012,1,1))
    image_chirho.pixels.foreach_set(pixels_chirho)
    image_chirho.pack()
    texture_chirho=result_chirho.node_tree.nodes.new('ShaderNodeTexImage')
    texture_chirho.image=image_chirho
    normal_chirho=result_chirho.node_tree.nodes.new('ShaderNodeNormalMap')
    result_chirho.node_tree.links.new(texture_chirho.outputs['Color'],normal_chirho.inputs['Color'])
    result_chirho.node_tree.links.new(normal_chirho.outputs['Normal'],shader_chirho.inputs['Normal'])
    return result_chirho


def framed_verse_chirho(name_chirho,position_chirho,rotation_chirho,words_chirho,reference_chirho,width_chirho,height_chirho,background_chirho=None,ink_chirho=None):
    background_chirho=background_chirho or blue_chirho
    ink_chirho=ink_chirho or cream_chirho
    frame_root_chirho=group_chirho(name_chirho,room_chirho)
    frame_root_chirho.location=position_chirho
    frame_root_chirho.rotation_euler=rotation_chirho
    box_chirho(name_chirho+'_paper_chirho',(0,0,0),(width_chirho,height_chirho,.045),background_chirho,.01,frame_root_chirho)
    for x_chirho in [-width_chirho/2,width_chirho/2]:
        box_chirho(name_chirho+'_side_chirho',(x_chirho,0,.035),(.09,height_chirho+.09,.10),wood_chirho,.012,frame_root_chirho)
    for y_chirho in [-height_chirho/2,height_chirho/2]:
        box_chirho(name_chirho+'_rail_chirho',(0,y_chirho,.035),(width_chirho+.09,.09,.10),wood_chirho,.012,frame_root_chirho)
    text_chirho(name_chirho+'_verse_chirho',words_chirho,(0,.18,.04),.23,ink_chirho,False,frame_root_chirho)
    text_chirho(name_chirho+'_reference_chirho',reference_chirho,(0,-height_chirho*.35,.04),.09,gold_chirho,False,frame_root_chirho)
    return frame_root_chirho


def build_right_wall_details_chirho():
    # A distinct warm-paper scripture print on the right return, with no external artwork.
    framed_verse_chirho('right_faithfulness_frame_chirho',(11.45,1.25,6.3),(math_chirho.pi/2,0,-math_chirho.pi/2),'GREAT IS\nTHY\nFAITHFULNESS','LAMENTATIONS 3:23',2.2,2.9,paper_chirho,cavity_chirho)
    # Unbranded walnut wall clock, composed at10:10 as static room dressing.
    clock_root_chirho=group_chirho('right_walnut_wall_clock_chirho',room_chirho)
    clock_root_chirho.location=(10.55,3.42,8.35)
    clock_root_chirho.rotation_euler.x=math_chirho.pi/2
    cylinder_chirho('wall_clock_walnut_case_chirho',(0,0,0),.60,.14,wood_chirho,parent_chirho=clock_root_chirho,vertices_chirho=64)
    cylinder_chirho('wall_clock_cream_dial_chirho',(0,0,.078),.53,.014,cream_chirho,parent_chirho=clock_root_chirho,vertices_chirho=64)
    torus_chirho('wall_clock_brass_bezel_chirho',(0,0,.09),.553,.015,gold_chirho,parent_chirho=clock_root_chirho)
    for index_chirho in range(12):
        angle_chirho=index_chirho*math_chirho.tau/12
        tick_chirho=box_chirho('wall_clock_hour_mark_chirho',(.465*math_chirho.sin(angle_chirho),.465*math_chirho.cos(angle_chirho),.094),(.016,.065,.009),cavity_chirho,parent_chirho=clock_root_chirho)
        tick_chirho.rotation_euler.z=-angle_chirho
    for angle_chirho,length_chirho in [(math_chirho.tau*(10+10/60)/12,.29),(math_chirho.tau*10/60,.40)]:
        rod_chirho('wall_clock_hand_chirho',(0,0,.11),(math_chirho.sin(angle_chirho)*length_chirho,math_chirho.cos(angle_chirho)*length_chirho,.11),.014,cavity_chirho,clock_root_chirho,8)
    sphere_chirho('wall_clock_pivot_chirho',(0,0,.11),(.029,.029,.015),gold_chirho,clock_root_chirho)
    clock_root_chirho['purpose_chirho']='Static unbranded wall clock; hands are decorative geometry, not a current-time display.'
    cross_root_chirho=group_chirho('right_shelf_wood_cross_chirho',room_chirho)
    cross_root_chirho.location=(9.08,2.96,3.91)
    box_chirho('shelf_cross_standing_base_chirho',(0,0,.04),(.48,.35,.08),wood_chirho,.012,cross_root_chirho)
    box_chirho('shelf_cross_upright_chirho',(0,0,.49),(.085,.085,.82),wood_chirho,.010,cross_root_chirho)
    box_chirho('shelf_cross_transom_chirho',(0,0,.69),(.42,.09,.085),wood_chirho,.010,cross_root_chirho)


def build_room_shell_chirho():
    plaster_chirho=material_chirho('warm_plaster_chirho',(.22,.19,.16),.94)
    ceiling_chirho=material_chirho('soft_ceiling_chirho',(.31,.29,.25),.96)
    panel_chirho=material_chirho('warm_wainscot_chirho',(.105,.087,.065),.76)
    wall_height_chirho=20-ROOM_FLOOR_Z_CHIRHO
    wall_mid_chirho=(20+ROOM_FLOOR_Z_CHIRHO)/2
    box_chirho('room_left_wall_chirho',(-20.12,0,wall_mid_chirho),(.24,40,wall_height_chirho),plaster_chirho)
    box_chirho('room_right_wall_chirho',(20.12,0,wall_mid_chirho),(.24,40,wall_height_chirho),plaster_chirho)
    box_chirho('room_front_wall_chirho',(0,-20.12,wall_mid_chirho),(40,.24,wall_height_chirho),plaster_chirho)
    box_chirho('room_rear_wall_chirho',(0,20.12,wall_mid_chirho),(40,.24,wall_height_chirho),plaster_chirho)
    box_chirho('room_ceiling_chirho',(0,0,20.12),(40,40,.24),ceiling_chirho)
    # Finished returns continue behind source camera Y=-17.4, without narrowing its18degree orbit.
    box_chirho('left_gallery_wall_chirho',(-9.12,-6,wall_mid_chirho),(.24,28,wall_height_chirho),plaster_chirho)
    box_chirho('right_gallery_wall_chirho',(11.62,-6,wall_mid_chirho),(.24,28,wall_height_chirho),plaster_chirho)
    box_chirho('window_wall_upper_chirho',(1.25,3.6,15.05),(20.5,.25,9.9),plaster_chirho)
    box_chirho('window_wall_right_return_chirho',(10.79,3.6,wall_mid_chirho),(1.42,.25,wall_height_chirho),plaster_chirho)
    for wall_x_chirho,direction_chirho in [(-9,1),(11.5,-1)]:
        face_x_chirho=wall_x_chirho+direction_chirho*.035
        box_chirho('gallery_lower_panel_chirho',(face_x_chirho,-6,-2.48),(.045,28,8.84),panel_chirho)
        box_chirho('gallery_dado_rail_chirho',(face_x_chirho+direction_chirho*.025,-6,2.0),(.10,28,.14),wood_chirho,.012)
        box_chirho('gallery_baseboard_chirho',(face_x_chirho+direction_chirho*.025,-6,-6.73),(.10,28,.48),wood_chirho,.012)
        box_chirho('gallery_ceiling_cornice_chirho',(face_x_chirho+direction_chirho*.055,-6,19.78),(.16,28,.24),wood_chirho,.018)
        for y_chirho in [-18,-12,-6,0,6]:
            box_chirho('gallery_panel_stile_chirho',(face_x_chirho+direction_chirho*.035,y_chirho,-2.48),(.07,.065,8.78),wood_chirho,.009)
    for y_chirho in [-18,-9,0,7.8]:
        box_chirho('ceiling_cross_batten_chirho',(1.25,y_chirho,19.83),(20.5,.11,.18),wood_chirho,.018)
    framed_verse_chirho('left_walk_by_faith_frame_chirho',(-8.91,-5,6.5),(math_chirho.pi/2,0,math_chirho.pi/2),'WALK BY\nFAITH','2 CORINTHIANS 5:7',2.25,2.9)
    framed_verse_chirho('right_psalm_frame_chirho',(8.15,3.42,6.65),(math_chirho.pi/2,0,0),'THE LORD IS\nMY SHEPHERD','PSALM 23:1',2.35,2.45)
    box_chirho('right_reading_shelf_chirho',(8.15,2.99,3.84),(2.65,.85,.14),wood_chirho,.025)
    for bracket_x_chirho in [7.3,9.0]:
        box_chirho('right_shelf_wall_bracket_chirho',(bracket_x_chirho,3.30,3.58),(.055,.35,.45),gold_chirho,.008)
    for index_chirho in range(5):
        height_chirho=1.05+.11*(index_chirho%3)
        book_x_chirho=7.25+index_chirho*.31
        book_mat_chirho=[leather_chirho,teal_chirho,red_chirho,blue_chirho,black_chirho][index_chirho]
        box_chirho('right_shelf_book_chirho',(book_x_chirho,2.99,3.91+height_chirho/2),(.24,.62,height_chirho),book_mat_chirho,.012)
        for z_chirho in [4.05,3.91+height_chirho-.12]:
            box_chirho('right_book_spine_rule_chirho',(book_x_chirho,2.674,z_chirho),(.19,.008,.012),gold_chirho)
    build_right_wall_details_chirho()
    room_chirho['interior_bounds_gltf_chirho']=[-20,ROOM_FLOOR_Z_CHIRHO,-20,20,20,20]
    room_chirho['finished_camera_bay_blender_chirho']=[-9,11.5,-20,8,ROOM_FLOOR_Z_CHIRHO,20]
    room_chirho['camera_contract_chirho']='Finished side walls extend behind source camera. Runtime owns18degree horizontal and up14/down9degree orbit limits. Tabletop Y1.29; floor Y-7 in glTF.'


def measure_room_finish_chirho(plant_root_chirho,table_z_chirho):
    floor_bounds_chirho=world_bounds_chirho(bpy_chirho.data.objects['room_floor_chirho'])
    floor_z_chirho=floor_bounds_chirho['max_chirho'][2]
    assert abs(floor_z_chirho-ROOM_FLOOR_Z_CHIRHO)<.0001
    assert abs(table_z_chirho-floor_z_chirho-8.29)<.0001
    support_chirho={}
    for object_chirho in scene_chirho.objects:
        if object_chirho.name.startswith(('table_leveling_foot_chirho','shelf_side_chirho','bookcase_floor_plinth_chirho')):
            bounds_chirho=world_bounds_chirho(object_chirho)
            assert abs(bounds_chirho['min_chirho'][2]-floor_z_chirho)<.0002,('floor support',object_chirho.name)
            support_chirho[object_chirho.name]=bounds_chirho['min_chirho'][2]
    shelf_bounds_chirho=world_bounds_chirho(bpy_chirho.data.objects['right_reading_shelf_chirho'])
    cross_bounds_chirho=world_bounds_chirho(bpy_chirho.data.objects['right_shelf_wood_cross_chirho'])
    assert abs(cross_bounds_chirho['min_chirho'][2]-shelf_bounds_chirho['max_chirho'][2])<.0002
    plant_bounds_chirho=world_bounds_chirho(plant_root_chirho)
    assert abs(plant_bounds_chirho['min_chirho'][2]-floor_z_chirho)<.0002
    protected_roots_chirho=[radio_chirho,desk_lamp_root_chirho,mug_root_chirho,bpy_chirho.data.objects['table_top_chirho']]
    protected_bounds_chirho={object_chirho.name:world_bounds_chirho(object_chirho) for object_chirho in protected_roots_chirho}
    minimum_clearance_chirho=float('inf')
    visible_leaves_chirho=[]
    for object_chirho in plant_root_chirho.children_recursive:
        if object_chirho.type!='MESH':
            continue
        bounds_chirho=world_bounds_chirho(object_chirho)
        for protected_name_chirho,other_chirho in protected_bounds_chirho.items():
            gap_chirho=max(max(other_chirho['min_chirho'][axis_chirho]-bounds_chirho['max_chirho'][axis_chirho],bounds_chirho['min_chirho'][axis_chirho]-other_chirho['max_chirho'][axis_chirho]) for axis_chirho in range(3))
            assert gap_chirho>.025,('plant obstructs approved object',object_chirho.name,protected_name_chirho,gap_chirho)
            minimum_clearance_chirho=min(minimum_clearance_chirho,gap_chirho)
        if object_chirho.name.startswith('ficus_curved_oval_leaf_chirho'):
            visible_count_chirho=0
            for vertex_chirho in object_chirho.data.vertices:
                projected_chirho=worldToCameraViewChirho(scene_chirho,camera_chirho,object_chirho.matrix_world@vertex_chirho.co)
                if .015<projected_chirho.x<.985 and .015<projected_chirho.y<.985 and projected_chirho.z>0:
                    visible_count_chirho+=1
            if visible_count_chirho>=8:
                visible_leaves_chirho.append({'name_chirho':object_chirho.name,'visible_vertices_chirho':visible_count_chirho})
    assert len(visible_leaves_chirho)>=3,('right plant outside home view',visible_leaves_chirho)
    target_chirho=VectorChirho((-.1,.1,3.85))
    offset_chirho=camera_chirho.location-target_chirho
    radius_chirho=offset_chirho.length
    azimuth_chirho=math_chirho.atan2(offset_chirho.x,-offset_chirho.y)
    elevation_chirho=math_chirho.asin(offset_chirho.z/radius_chirho)
    orbit_samples_chirho=[]
    for horizontal_chirho in [-18,0,18]:
        for vertical_chirho in [-9,0,14]:
            yaw_chirho=azimuth_chirho+math_chirho.radians(horizontal_chirho)
            pitch_chirho=elevation_chirho+math_chirho.radians(vertical_chirho)
            point_chirho=target_chirho+VectorChirho((radius_chirho*math_chirho.cos(pitch_chirho)*math_chirho.sin(yaw_chirho),-radius_chirho*math_chirho.cos(pitch_chirho)*math_chirho.cos(yaw_chirho),radius_chirho*math_chirho.sin(pitch_chirho)))
            assert -8.5<point_chirho.x<11.0 and -19.5<point_chirho.y<2.5 and table_z_chirho<point_chirho.z<19.5,('camera leaves finished bay',tuple(point_chirho))
            orbit_samples_chirho.append(list(point_chirho))
    return {'passed_chirho':True,'floor_z_chirho':floor_z_chirho,'table_height_above_floor_chirho':table_z_chirho-floor_z_chirho,'floor_contacts_chirho':support_chirho,'new_shelf_cross_contact_z_chirho':cross_bounds_chirho['min_chirho'][2],'right_plant_bounds_chirho':plant_bounds_chirho,'right_plant_minimum_furniture_separation_chirho':minimum_clearance_chirho,'visible_home_leaf_meshes_chirho':visible_leaves_chirho,'camera_bay_samples_chirho':orbit_samples_chirho,'camera_contract_degrees_chirho':{'horizontal_chirho':18,'up_chirho':14,'down_chirho':9}}


def build_left_poster_chirho(asset_path_chirho,asset_sha256_chirho):
    assert hashlib_chirho.sha256(asset_path_chirho.read_bytes()).hexdigest()==asset_sha256_chirho
    poster_root_chirho=group_chirho('left_wall_christian_poster_chirho',room_chirho)
    poster_root_chirho.location=(-8.96,1.90,6.45)
    poster_root_chirho.rotation_euler=(math_chirho.pi/2,0,math_chirho.pi/2)
    poster_material_chirho=material_chirho('christian_poster_ink_chirho',(1,1,1),.82)
    image_chirho=bpy_chirho.data.images.load(str(asset_path_chirho),check_existing=True)
    image_chirho.pack()
    image_chirho.name='original_christian_poster_chirho'
    texture_node_chirho=poster_material_chirho.node_tree.nodes.new('ShaderNodeTexImage')
    texture_node_chirho.image=image_chirho
    poster_material_chirho.node_tree.links.new(texture_node_chirho.outputs['Color'],poster_material_chirho.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
    width_chirho,height_chirho=3.0,4.5
    mesh_chirho=bpy_chirho.data.meshes.new('christian_poster_print_chirho')
    mesh_chirho.from_pydata([(-width_chirho/2,-height_chirho/2,0),(width_chirho/2,-height_chirho/2,0),(width_chirho/2,height_chirho/2,0),(-width_chirho/2,height_chirho/2,0)],[],[(0,1,2,3)])
    mesh_chirho.update()
    uv_chirho=mesh_chirho.uv_layers.new(name='poster_uv_chirho')
    for index_chirho,value_chirho in enumerate([(0,0),(1,0),(1,1),(0,1)]):
        uv_chirho.data[index_chirho].uv=value_chirho
    print_chirho=bpy_chirho.data.objects.new('christian_poster_print_chirho',mesh_chirho)
    scene_chirho.collection.objects.link(print_chirho)
    finish_chirho(print_chirho,'christian_poster_print_chirho',poster_material_chirho,poster_root_chirho)
    box_chirho('poster_frame_back_chirho',(0,0,-.05),(3.24,4.74,.08),wood_chirho,.012,poster_root_chirho)
    for x_chirho in [-1.59,1.59]:
        box_chirho('poster_frame_side_chirho',(x_chirho,0,.025),(.12,4.74,.12),wood_chirho,.015,poster_root_chirho)
    for y_chirho in [-2.31,2.31]:
        box_chirho('poster_frame_rail_chirho',(0,y_chirho,.025),(3.24,.12,.12),wood_chirho,.015,poster_root_chirho)
    poster_root_chirho['image_sha256_chirho']=asset_sha256_chirho
    poster_root_chirho['print_size_chirho']=[width_chirho,height_chirho]
    return poster_root_chirho


# Original pen paths authored here from simple centerlines, not font glyph outlines.
# The literal letters are text content; this small alphabet is not a font resource.
def handwritten_cassette_chirho(name_chirho,words_chirho,position_chirho,size_chirho,mat_chirho,parent_chirho):
    alphabet_chirho={
        'P': [[(.04,0),(.12,1),(.47,1.02),(.64,.87),(.57,.62),(.10,.57)]],
        'S': [[(.65,.91),(.46,1.03),(.17,.94),(.07,.73),(.23,.57),(.53,.43),(.59,.20),(.40,.02),(.12,.04),(.01,.16)]],
        'A': [[(0,0),(.35,1.03),(.65,.02)],[(.13,.40),(.51,.43)]],
        'L': [[(.13,1),(.04,.04),(.63,.01)]],
        'M': [[(.02,0),(.13,1),(.36,.47),(.65,1.02),(.69,.01)]],
        'G': [[(.64,.87),(.46,1.02),(.19,.94),(.05,.69),(.04,.32),(.20,.05),(.48,.04),(.63,.22),(.62,.46),(.36,.44)]],
        'O': [[(.34,1.01),(.12,.86),(.04,.50),(.12,.15),(.34,.02),(.57,.17),(.65,.52),(.57,.87),(.34,1.01)]],
        'E': [[(.64,.99),(.11,1),(.03,.02),(.61,.04)],[(.08,.52),(.52,.54)]],
    }
    assert set(words_chirho)<=alphabet_chirho.keys()
    curve_chirho=bpy_chirho.data.curves.new(name_chirho,'CURVE')
    curve_chirho.dimensions='3D'
    curve_chirho.resolution_u=4
    curve_chirho.bevel_depth=size_chirho*.027
    curve_chirho.bevel_resolution=2
    curve_chirho.use_fill_caps=True
    advance_chirho=.86
    center_chirho=((len(words_chirho)-1)*advance_chirho+.69)/2
    for letter_index_chirho,letter_chirho in enumerate(words_chirho):
        for stroke_chirho in alphabet_chirho[letter_chirho]:
            spline_chirho=curve_chirho.splines.new('BEZIER')
            spline_chirho.bezier_points.add(len(stroke_chirho)-1)
            for point_chirho,(x_chirho,z_chirho) in zip(spline_chirho.bezier_points,stroke_chirho):
                # Slight forward slant and varied baseline keep the marker writing human.
                x_chirho+=z_chirho*.055+letter_index_chirho*advance_chirho-center_chirho
                z_chirho=z_chirho*(1+.025*math_chirho.sin(letter_index_chirho*1.7))+.018*math_chirho.sin(letter_index_chirho*2.3)
                point_chirho.co=(x_chirho*size_chirho,0,z_chirho*size_chirho)
                point_chirho.handle_left_type=point_chirho.handle_right_type='AUTO' if letter_chirho in 'SGO' else 'VECTOR'
    object_chirho=bpy_chirho.data.objects.new(name_chirho,curve_chirho)
    scene_chirho.collection.objects.link(object_chirho)
    object_chirho.location=position_chirho
    object_chirho.parent=parent_chirho
    curve_chirho.materials.append(mat_chirho)
    bpy_chirho.context.view_layer.objects.active=object_chirho
    object_chirho.select_set(True)
    bpy_chirho.ops.object.convert(target='MESH')
    object_chirho.select_set(False)
    object_chirho['lettering_origin_chirho']='Original hand-plotted pen centerlines; no imported font or glyph outline.'
    object_chirho['label_chirho']=words_chirho
    return object_chirho


def verify_export_parity_chirho(current_path_chirho,baseline_path_chirho,receipt_path_chirho):
    import struct as struct_chirho
    def read_glb_chirho(path_chirho):
        raw_chirho=path_chirho.read_bytes()
        count_chirho=struct_chirho.unpack_from('<I',raw_chirho,12)[0]
        return json_chirho.loads(raw_chirho[20:20+count_chirho]),raw_chirho[28+count_chirho:]
    def records_chirho(document_chirho,binary_chirho):
        def image_digest_chirho(index_chirho):
            image_chirho=document_chirho['images'][index_chirho]
            view_chirho=document_chirho['bufferViews'][image_chirho['bufferView']]
            start_chirho=view_chirho.get('byteOffset',0)
            return hashlib_chirho.sha256(binary_chirho[start_chirho:start_chirho+view_chirho['byteLength']]).hexdigest()
        def normalize_chirho(value_chirho):
            if isinstance(value_chirho,list):
                return [normalize_chirho(item_chirho) for item_chirho in value_chirho]
            if not isinstance(value_chirho,dict):
                return value_chirho
            result_chirho={key_chirho:normalize_chirho(item_chirho) for key_chirho,item_chirho in value_chirho.items()}
            # All material-record index fields are texture references. Resolve identities,
            # because different lettering meshes may reorder glTF indices without changing art.
            if 'index' in value_chirho:
                texture_chirho=document_chirho['textures'][value_chirho['index']]
                result_chirho['index']={'image_sha256_chirho':image_digest_chirho(texture_chirho['source']),'sampler_chirho':document_chirho.get('samplers',[])[texture_chirho['sampler']] if 'sampler' in texture_chirho else None}
            return result_chirho
        materials_chirho={material_chirho['name']:normalize_chirho(material_chirho) for material_chirho in document_chirho['materials']}
        lights_chirho={light_chirho['name']:light_chirho for light_chirho in document_chirho['extensions']['KHR_lights_punctual']['lights']}
        return materials_chirho,lights_chirho
    current_materials_chirho,current_lights_chirho=records_chirho(*read_glb_chirho(current_path_chirho))
    baseline_records_chirho=json_chirho.loads(baseline_path_chirho.read_text())
    baseline_materials_chirho,baseline_lights_chirho=baseline_records_chirho['materials_chirho'],baseline_records_chirho['lights_chirho']
    receipt_chirho={'baseline_sha256_chirho':hashlib_chirho.sha256(baseline_path_chirho.read_bytes()).hexdigest(),'current_sha256_chirho':hashlib_chirho.sha256(current_path_chirho.read_bytes()).hexdigest(),'material_records_equal_chirho':current_materials_chirho==baseline_materials_chirho,'material_count_chirho':len(current_materials_chirho),'light_records_equal_chirho':current_lights_chirho==baseline_lights_chirho,'light_count_chirho':len(current_lights_chirho),'current_lights_chirho':current_lights_chirho,'changed_material_names_chirho':[name_chirho for name_chirho in sorted(set(current_materials_chirho)|set(baseline_materials_chirho)) if current_materials_chirho.get(name_chirho)!=baseline_materials_chirho.get(name_chirho)],'engine_restored_chirho':scene_chirho.render.engine}
    receipt_path_chirho.write_text(json_chirho.dumps(receipt_chirho,indent=2)+'\n')
    assert len(current_lights_chirho)==7 and receipt_chirho['light_records_equal_chirho'],('export light parity failed',str(receipt_path_chirho))
    assert receipt_chirho['material_records_equal_chirho'],('export material parity failed',str(receipt_path_chirho))
    return receipt_chirho
