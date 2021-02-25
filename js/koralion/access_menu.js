/* Access menu items are static, they are not created dynamically 
 init is used to bind the items to there handelers */

function init_access_menu(){
	let tmp_elem_o      = document.getElementsByClassName("ui-access-bar")[0];
	let access_menu_o_a = tmp_elem_o.querySelector(".toolbar");
	let elem_o;
	let i;
	for ( i = 0 ; i < access_menu_o_a.children.length ; i++ ){
		elem_o = access_menu_o_a.children[i];
		elem_o.addEventListener("click", fsm_access_bar_clicked.bind(null,elem_o.id));
	}
	fsm_access_bar_clicked("plane");
}

/* create a new plane argument menu */
function plane_clicked(parent_elem_o, clicked_elem_o, id_s){
	const sel_changed_b = update_onehot_class(parent_elem_o, clicked_elem_o, "selected");
	if (sel_changed_b){
		let ui_fun_menu_o;
		let ui_arg_menu_o;
		let tmp_elem_o;
		// get function and arg menu
		tmp_elem_o    = focus_ui_elements(id_s);
		ui_fun_menu_o = tmp_elem_o.function_menu;
		ui_arg_menu_o = tmp_elem_o.arg_menu;
	}
}
/* set the arg menu for sketch */
function sketch_clicked(parent_elem_o, clicked_elem_o, id_s){
	console.log("Hello");
	const sel_changed_b = update_onehot_class(parent_elem_o, clicked_elem_o, "selected");
	if (sel_changed_b){
		let ui_fun_menu_o;
		let ui_arg_menu_o;
		let tmp_elem_o;
		// get function and arg menu
		tmp_elem_o  = focus_ui_elements(id_s);
		ui_fun_menu_o = tmp_elem_o.function_menu;
		ui_arg_menu_o = tmp_elem_o.arg_menu;
	}
}

function gen_clicked(parent_elem_o, clicked_elem_o, id_s){
	const sel_changed_b = update_onehot_class(parent_elem_o, clicked_elem_o, "selected");
	if (sel_changed_b){
		let ui_fun_menu_o;
		let ui_arg_menu_o;
		let tmp_elem_o;
		// get function and arg menu
		tmp_elem_o  = focus_ui_elements(id_s);
		ui_fun_menu_o = tmp_elem_o.function_menu;
		ui_arg_menu_o = tmp_elem_o.arg_menu;
	}
}
/* focus on function menu and argument menu with the same id as the the access element id
	return : object { function_menu : obj , arg_menu : obj } */
function focus_ui_elements(id_s){
	let ui_fun_menu_o;
	let ui_arg_menu_o;
	let tmp_elem_o;
	let menu_s    = "ui-function-menu"
	document.getEle
	tmp_elem_o    = document.getElementsByClassName(menu_s);
	ui_fun_menu_o = document.querySelector("."+menu_s+"#"+id_s);
	update_not_onehot_class(tmp_elem_o, ui_fun_menu_o , "hidden");

	menu_s        = "ui-arg-menu";
	tmp_elem_o    = document.getElementsByClassName(menu_s);
	ui_arg_menu_o = document.querySelector("."+menu_s+"#"+id_s);
	update_not_onehot_class(tmp_elem_o, ui_arg_menu_o , "hidden");

	return { "function_menu" : ui_fun_menu_o , "arg_menu" : ui_fun_menu_o};
}