// Hierarchical view 
const TypeEnum = {
  ROOT : 0,
  POINT: 1,
  LINE: 2,
  QUAD: 3,
  CUBE: 4,
};
const NULL_UID = -1;
const ROOT_UID =  0;

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

Node.prototype.constructor = Node;

// sketch node hierarchy 
const SNH_m = new Map();
// plane node hierarchy 
const GNH_m = new Map();

const EXH_m = new Map();
const h_ui_elem_o = {
	"sketch" : null,
	"gen" : null,
	"exp" : null
}
function init_hierarchy(){
	h_ui_elem_o.sketch =  document.querySelector(".ui-hierarchy-body#sketch");
	h_ui_elem_o.gen    = document.querySelector(".ui-hierarchy-body#gen");
	h_ui_elem_o.exp    = document.querySelector(".ui-hierarchy-body#exp");
	// creat root
	SNH_m.set(ROOT_UID, new Node(ROOT_UID, "root", TypeEnum.ROOT , -1 , null , null)); 
	GNH_m.set(ROOT_UID, new Node(ROOT_UID, "root", TypeEnum.ROOT , -1 , null , null)); 
	// set up default values 
	h_add_node(ROOT_UID, 1, "point 1", TypeEnum.POINT);
	h_add_node(ROOT_UID, 2, "point 2", TypeEnum.POINT);
	h_add_node(ROOT_UID, 3, "point 3", TypeEnum.POINT);
	_h_update_view(h_ui_elem_o.sketch, SNH_m);
}

function h_update_view(id_s){
	switch (id_s) {
		case "sketch":
			// statements_1
			break;
		default:
			console.error("Not implemented yet");
			// statements_def
			break;
	}
}

function _h_update_view(ui_o, map_m){
	// go through the map and re-draw the hierachy in the ui
	// depth search
	for (let [key, node_o] of map_m.entries()){
		_h_draw_node(ui_o, node_o);
	}

}

function h_add_node(parent_uid_i, uid_i, name_s, type_i){
	let new_node_n;
	let parent_node_o;
	if ( is_sketch(type_i)){
		parent_node_o = SNH_m.get(parent_uid_i);
		SNH_m.set(uid_i , parent_node_o.append(uid_i, name_s, type_i));
	}else{
		parent_node_o = GNH_m.get(parent_uid_i);
		GNH_m.set(uid_i , parent_node_o.append(uid_i, name_s, type_i))
	}
}
function h_add_exp(parent_uid_i, uid_i, name_s, type_i, exp_s){

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
		elem_o.id = node_o.uid_i;
		elem_o.classList.add("type"+node_o.type_i);
		elem_o.style.setProperty("padding-left","calc( var(--mar_big_width) * "+ node_o.depth_i+" )");

		icon_elem_o = document.createElement("div");
		icon_elem_o.classList.add("hir-icon");
		elem_o.append(icon_elem_o);

		txt_elem_o = document.createElement("div");
		txt_elem_o.classList.add("hir-txt");
		txt_elem_o.textContent = node_o.name_s;
		elem_o.append(txt_elem_o);

		// append to parent item
		parent_uid_i  = node_o.parent_node_o.uid_i;
		if (parent_uid_i !== ROOT_UID){
			parent_elem_o = ui_o.querySelector("#"+node_o.parent_elem_o.uid_i);
		}else{
			parent_elem_o = ui_o;
		}
		parent_elem_o.append(elem_o);
	}
}
