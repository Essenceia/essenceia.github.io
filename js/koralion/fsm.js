// FSM
var Hierarchy = function(hir_head_elem_o, hir_body_elem_o){
  this.head_elem_o   = hir_head_elem_o;
  this.body_elem_o   = hir_body_elem_o;
  this.selected_b        = false;
}
Hierarchy.prototype.constructor = Hierarchy;
Hierarchy.prototype.get_selected = function(){
	return this.selected_b;
}
Hierarchy.prototype.set_selected = function(selected_b){
	if (this.selected_b != selected_b){
		this.selected_b = selected_b;
		_show_menu(this.body_elem_o, this.selected_b);
		_select_elem(this.head_elem_o, this.selected_b);
	}
}

var Mode = function(fun_menu_o, arg_menu_o,access_bar_elem_o) {
  this.fun_menu_o        = fun_menu_o;
  this.arg_menu_o        = arg_menu_o;
  this.access_bar_elem_o = access_bar_elem_o;
  this.selected_b        = false;
};

function _select_elem(access_bar_elem_o,selected_b){
	if(selected_b){
		access_bar_elem_o.classList.add("selected");
	}else{
		access_bar_elem_o.classList.remove("selected");
	}
}
function _show_menu(fun_menu_o, visible_b){
	if(visible_b){
		fun_menu_o.classList.remove("hidden");
	}else{
		fun_menu_o.classList.add("hidden");
	}
}
Mode.prototype.get_selected = function(){
	return this.selected_b;
}
Mode.prototype.set_selected = function(selected_b){
	if (this.selected_b != selected_b){
		this.selected_b = selected_b;
		_show_menu(this.fun_menu_o, this.selected_b);
		_show_menu(this.arg_menu_o, this.selected_b);
		_select_elem(this.access_bar_elem_o, this.selected_b);
	}
}

Mode.prototype.constructor = Mode;

const FSM_o = new Map();
const HIR_o = new Map();

function init_fsm(){
	// fill map
	let sketch_m;
	let plane_m;
	let gen_m;
	let id_s;
	let tmp_mode_o;

	let access_bar_elem_o;
	let fun_menu_o;
	let arg_menu_o;
	// sketch
	init_fsm_by_id("sketch");
	init_fsm_by_id("plane");
	init_fsm_by_id("gen");
	init_fsm_hir_by_id("sketch");
	init_fsm_hir_by_id("exp");
	init_fsm_hir_by_id("gen");

	fsm_set_selected("plane");
	fsm_hir_set_selected("sketch");
}

function init_fsm_by_id(id_s){
	let access_bar_elem_o;
	let hir_body_elem_o;
	let fun_menu_o;
	let arg_menu_o;
	let tmp_mode_o;

	access_bar_elem_o = document.querySelector(".ui-access-bar .toolbar svg#"+id_s);
	fun_menu_o        = document.querySelector(".ui-function-menu#"+id_s);
	arg_menu_o        = document.querySelector(".ui-right-menu .ui-arg-menu#"+id_s);
	hir_body_elem_o   = document.querySelector(".ui-hierarchy-body#"+id_s);

	tmp_mode_o = new Mode(fun_menu_o, arg_menu_o,access_bar_elem_o);
	FSM_o.set(id_s, tmp_mode_o);
}
function init_fsm_hir_by_id(id_s){
	let hir_head_elem_o;
	let hir_body_elem_o;
	let tmp_mode_o;

	hir_body_elem_o   = document.querySelector(".ui-hierarchy-body#"+id_s);
	hir_head_elem_o   = document.querySelector(".ui-hierarchy-header svg#"+id_s);

	tmp_mode_o = new  Hierarchy(hir_head_elem_o, hir_body_elem_o);
	HIR_o.set(id_s, tmp_mode_o);
}

function fsm_set_selected(id_s){
	for (let [key, value] of FSM_o.entries()) {
		if ( key === id_s){
			value.set_selected(true);
		}else{
			value.set_selected(false);
		}
	}
}

function fsm_hir_set_selected(id_s){
	for (let [key, value] of HIR_o.entries()) {
		if ( key === id_s){
			value.set_selected(true);
		}else{
			value.set_selected(false);
		}
	}
}

function fsm_access_bar_clicked(id_s){
	fsm_set_selected(id_s);
}
function fsm_hir_access_bar_clicked(id_s){
	fsm_hir_set_selected(id_s);
}