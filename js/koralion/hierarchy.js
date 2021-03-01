// Hierarchical view 

// name map : name to uid 
const NTU_m = new Map();

/* return int, uid
	if not found trigger error */
function hir_name_to_uid(name_s){
	let ntu_o;
	if (NTU_m.has(name_s)){
		ntu_o = NTU_m.get(name_s);
		return ntu_o.uid_i;
	}else{
		console.error("No matching entry found");
		return -1;
	}
}

// hierachical node object 
var Node = function(uid_i, name_s, type_i , depth_i , parent_node_o ,child_node_o){
  this.uid_i         = uid_i;
  this.name_s        = name_s;
  this.type_i        = type_i;
  this.depth_i       = depth_i;

  this.parent_node_o = parent_node_o;
  if(parent_node_o !== null){
  	parent_node_o._set_child(this);
  }
  // child node is an array 
  this.child_node_o_a  = []
  if (child_node_o !== null){
  	this.child_node_o_a.push(child_node_o);
  }
};

Node.prototype._set_child = function(child_n){
	if ( child_n !== null ){
	this.child_node_o_a.push( child_n);
	}else{
		console.error("Child node is null");
	}
}
Node.prototype.get_all_children_uid = function (){
	let ret_uid_i_a = [];
	let tmp_node_n  = this;
	ret_uid_i_a.push(tmp_node_n.uid_i);
	for(let i = 0; i < tmp_node_n.child_node_o_a.length; i++){
		tmp_node_n = tmp_node_n.child_node_o_a[i];
		ret_uid_i_a.push(tmp_node_n.get_all_children_uid());
	}
	return ret_uid_i_a;
}

Node.prototype.get_all_parent_uid = function(){
	let ret_uid_i_a = [];
	let tmp_node_n  = this;
	ret_uid_i_a.append(tmp_node_n.uid_i);
	while(tmp_node_n.parent_node_o !== null){
		tmp_node_n = tmp_node_n.parent_node_o;
		ret_uid_i_a.append(tmp_node_n.uid_i);
	}
	return ret_uid_i_a;
}
Node.prototype.append = function(uid_i, name_s, type_i){
	return new Node(uid_i, name_s, type_i, this.depth_i + 1, this, null);
}

function is_sketch(type_i){
	if ( type_i >= TypeEnum.CUBE ){
		return false;
	}else{
		return true;
	}
}
function hir_get_map(type_i){
	if (type_i < TypeEnum.CUBE ){
		return SNH_m;
	}else {
		if(type_i >= TypeEnum.EXP ){
			return EXH_m;
		}else{
			return GNH_m;
		}
	}
}

Node.prototype.constructor = Node;

// sketch node hierarchy 
const SNH_m = new Map();
// plane node hierarchy 
const GNH_m = new Map();

const EXH_m = new Map();



function init_hierarchy(){
	h_ui_elem_o.sketch = document.querySelector(".ui-hierarchy-body#sketch");
	h_ui_elem_o.gen    = document.querySelector(".ui-hierarchy-body#gen");
	h_ui_elem_o.exp    = document.querySelector(".ui-hierarchy-body#exp");
	// creat root
	SNH_m.set(ROOT_UID, new Node(ROOT_UID, "root", TypeEnum.ROOT , -1 , null , null)); 
	GNH_m.set(ROOT_UID, new Node(ROOT_UID, "root", TypeEnum.ROOT , -1 , null , null)); 
	// set up default values 
	h_add_node(ROOT_UID, 1, "point 1", TypeEnum.POINT);
	h_add_node(ROOT_UID, 2, "point 2", TypeEnum.POINT);
	h_add_node(ROOT_UID, 3, "point 3", TypeEnum.POINT);
	h_add_node(2, 4, "point 4", TypeEnum.POINT);
	h_add_node(2, 5, "point 5", TypeEnum.POINT);
	h_add_node(5, 6, "point 6", TypeEnum.POINT);
	h_add_node(5, 7, "point 7", TypeEnum.LINE);
	//_h_update_view(h_ui_elem_o.sketch, SNH_m);
	h_update_view();
	init_hierarchy_header();
}
function init_hierarchy_header(){
	for ( let id_s of ["sketch","gen","exp"]){
		let hir_header_elem_o = document.querySelector(".ui-hierarchy-header svg#"+id_s);
		hir_header_elem_o.addEventListener("click", fsm_hir_access_bar_clicked.bind(null, id_s));
	}	
}
function h_update_view(){
	arg_size_grid(h_ui_elem_o.sketch);
}


function h_add_node( parent_uid_i, uid_i, name_s, type_i){
	let new_node_n;
	let parent_node_o;
	let map_m = hir_get_map(type_i);
	h_add_node_per_map(h_ui_elem_o.sketch, map_m ,parent_uid_i, uid_i, name_s, type_i );
}
function h_add_exp(parent_uid_i, uid_i, name_s, type_i, exp_s){

}

function h_add_node_per_map(ui_o, map_m,parent_uid_i, uid_i, name_s, type_i){
	let new_node_n;
	let parent_node_o;
	parent_node_o = map_m.get(parent_uid_i);
	new_node_n    = parent_node_o.append(uid_i, name_s, type_i);
	map_m.set(uid_i , new_node_n);
	_h_draw_node(ui_o, new_node_n);

	NTU_m.set(name_s, uid_i);
	// TODO update the datalist, used for autocomplete
}
function _h_draw_node(ui_o, node_o){
	if( node_o.uid_i !== ROOT_UID){
		let elem_o;
		let icon_elem_o;
		let txt_elem_o;
		let parent_elem_o;
		let parent_uid_i;
		elem_o = document.createElement("div");
		elem_o.classList.add("hir-item");
		elem_o.id = "h"+node_o.uid_i;
		elem_o.classList.add("type"+node_o.type_i);
		elem_o.style.setProperty("padding-left","calc( var(--mar_big_width) * "+ node_o.depth_i+" )");
		elem_o.setAttribute("draggable", true);
		elem_o.addEventListener("dragstart", h_item_drag_start.bind(null,elem_o));

		icon_elem_o = document.createElement("object");
		icon_elem_o.classList.add("hir-icon");
		icon_elem_o.type = "image/svg+xml";
		icon_elem_o.data = "../images/ui/type/"+node_o.type_i+".svg";
		//icon_elem_o.data = "../images/ui/type/"+node_o.type_i+".svg";

		elem_o.append(icon_elem_o);

		txt_elem_o = document.createElement("div");
		txt_elem_o.classList.add("hir-txt");
		txt_elem_o.textContent = node_o.name_s;
		elem_o.append(txt_elem_o);

		// append to parent item
		parent_uid_i  = node_o.parent_node_o.uid_i;
		if (parent_uid_i !== ROOT_UID){
			parent_elem_o = ui_o.querySelector("#h"+parent_uid_i);
			//parent_elem_o.insertAdjacentElement('afterend' ,elem_o);
		}else{
			parent_elem_o = ui_o;
		}
		parent_elem_o.append(elem_o);

		_h_add_to_datalist(ui_o, node_o);
	}
}

/* map for DOM datalist per type : key < type_i > : value < datalist DOM >*/
const DHL_m = new Map();

/* add option in the datalist for this hierachical type */
function _h_add_to_datalist(ui_o, node_o){
	let opt_o;
	let id_s = TypeToString[node_o.type_i] + "-list";
	let datalist_o = ui_o.querySelector("datalist#"+id_s);
	if(datalist_o === null){
		// create
		datalist_o = document.createElement("datalist");
		datalist_o.id = id_s;
		ui_o.append(datalist_o);
		DHL_m.set(node_o.type_i, datalist_o);
	}
	opt_o       = document.createElement("option");
	opt_o.id    = node_o.uid_i;
	opt_o.value = node_o.name_s;
	datalist_o.append(opt_o);
}
/* get reference to datalist DOM from type
	return : pointer to DOM, datalist */
function h_get_datalist_from_type(type_i){
	return DHL_m.get(type_i);
}
function h_item_drag_start(item_elem_o){
	console.log("Drag start");
}
