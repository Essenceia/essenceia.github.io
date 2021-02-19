/* GLOBALS */

const FDB_m = new Map(); 
			/* local function DB, stores list of all registered functions
				structure of the object 
				map< category_name , array_of_functions > */
			
// SLIDER
// class : slider-field { name , num , slider }
document.addEventListener("DOMContentLoaded", function(event) {
	ldb_init();
	create_arg_menu();
	init_resize();
	init_function_menu();
});
/* arg menu */
function create_arg_menu(){
	let row_i = 1;
	let arg_o      = document.getElementsByClassName("args")[0];
	 add_arg_variadique(arg_o, ["Hello","World"], 0);

	//const slider_json_s = JSON.parse('{"name": "Slider","min": 0,"max": 10,"value": 6}');
	//row_i = add_slider_field(arg_o, slider_json_s, row_i);

	arg_size_grid(arg_o);

}

/* slider */
function add_slider_field(arg_o, name_s, value_f , min_f , max_f , row_i){
	let slider_o; 
	//let slider_progress_o;
	let num_o;
	let arg_slider_o;
	let i = 0;
	let len_i;

	
	// create menu 
	arg_slider_o = add_arg_slider(arg_o, name_s, value_f , min_f , max_f, row_i );

	slider_o          = arg_slider_o.querySelector(".slider"); 
	//slider_progress_o = arg_slider_o.querySelector("input[type='range']::-moz-range-progress"); 
	num_o             = arg_slider_o.querySelector(".num");
	// set start values of slider and num 
	//setup_slider_arg_values(slider_o, num_o,min_f, max_f, value_f);
	// slider_o.addEventListener( "select", slider_active.bind(null, slider_o, num_o));
	num_o.addEventListener("input", num_txt_leave.bind(null, slider_o, num_o));
	slider_o.addEventListener( "input",  slider_active.bind(null, slider_o, num_o));
	slider_o.addEventListener( "mouseenter", slider_enter.bind(null, slider_o, num_o));
	slider_o.addEventListener( "mouseleave", slider_leave.bind(null, slider_o, num_o));

	return row_i + 1;
	}
function slider_enter(slider_o, num_o){

	//num_o.style.border = "thin solid var(--col_sel_blue_light)";
	num_o.style.color  = "var(--col_sel_blue_light)";
	slider_o.style.setProperty("--prog_bg_col", "var(--col_sel_blue_light)");
	slider_o.style.setProperty("--bg_col", "var(--col_txt_light)");}
function slider_leave(slider_o, num_o){
	//num_o.style.removeProperty("border");
	num_o.style.removeProperty("color");
	slider_o.style.removeProperty("--prog_bg_col");
	slider_o.style.removeProperty("--bg_col");}
function slider_active(slider_o, num_o){
	num_o.value = slider_o.value;
	console.log("active"); 
}
function num_txt_leave(slider_o, num_o){
	let num_f = num_o.value;
	let range_max = slider_o.max;
	let range_min = slider_o.min;
	// update range if not in potencial values
	if ( num_f > range_max)
	{
		range_max = num_f;
	}else if ( num_f < range_min){
		range_min = num_f;
	}

	_align_slider(slider_o, range_min, range_max , num_f );
	console.log("set slider value to "+slider_o.value);
}
function _align_slider(slider_o, min_f, max_f, value_f){
	slider_o.min=  min_f;
	slider_o.max=  max_f;
	// copy num to value
	slider_o.value=  value_f; 
}
function setup_slider_arg_values(slider_o, num_o, min_f, max_f, value_f){
	num_o.value = value_f;
	_align_slider(slider_o, min_f, max_f, value_f);
}
function add_arg_slider(arg_o, txt_s, default_num_f, min_f, max_f, row_i ){
	/* <div class="slider-field">
                    <div class="name">Slider </div>
                    <input class="num" type="number" step="any">
                    <input class="slider" type="range"  step="0.1">
		</div>*/
	let field_o     = document.createElement("div");
	field_o.classList.add('slider-field');
	field_o.style.setProperty("grid-row",row_i);

	let name_o = document.createElement("div");
	name_o.classList.add('name');
	txt_o = document.createTextNode(txt_s);
	name_o.append(txt_o);

	let num_o = document.createElement("input");
	num_o.classList.add('num');
	num_o.type = "number";
	num_o.step = "any";

	let slider_o = document.createElement("input");
	slider_o.classList.add('slider');
	slider_o.type = "range";
	slider_o.step = "0.1";
	
	setup_slider_arg_values(slider_o, num_o, min_f, max_f, default_num_f);

	field_o.append(name_o);
	field_o.append(num_o);
	field_o.append(slider_o);	
	arg_o.append(field_o);

	return field_o;
}
function arg_size_grid(arg_o){
	let row_s;
	let row_i; // get the number of elements in the arg_o div and scale based on that
	row_i = get_array_length(arg_o.children);
	row_s = "repeat("+row_i+", auto) 1fr"
	arg_o.style.setProperty("grid-template-rows",row_s);
	arg_o.style.setProperty("grid-template-columns","1fr");
}
function add_arg_variadique(arg_o, options_s_a, selected_opt_i ){
	/* Add the list of variadique arguments */
	let i;
	let len_i;
	let opt_o;
	let txt_o;

	let sel_field_o = document.createElement("div");
	let arrow_o     = document.createElement("div");
	let arrow_txt_o = document.createTextNode("▼");
	let sel_o       = document.createElement("select");

	sel_field_o.classList.add("select-variadique");
	arrow_o.classList.add("sel-arrow");
	arrow_o.append(arrow_txt_o);
	arg_o.append(sel_field_o);
	sel_field_o.append(arrow_o);
	sel_field_o.append(sel_o);
	len_i = get_array_length(options_s_a);
	for (i = 0; i < len_i ; i ++)
	{
		opt_o       = document.createElement("option");
		opt_o.value = options_s_a[i];
		txt_o       = document.createTextNode(options_s_a[i]);
		opt_o.append(txt_o);
		opt_o.setAttribute("selected", (i === selected_opt_i));
		sel_o.append(opt_o);
	}
	// creat event to be triggered on option changed
	sel_o.addEventListener("change", function(event) { variadique_choice_changed(arg_o, get_arg_category(arg_o) , get_arg_function_name(arg_o), event.target.value )});
	// create init argument list
	variadique_choice_changed(arg_o, get_arg_category(arg_o) , get_arg_function_name(arg_o),get_selected_option(sel_o));
	
}
function get_engine_args_from_variadique(category_s, fun_name_s, variadique_s){
	// TODO
	let tmp_json_s;
	let ret_val_o; 
	if ( (typeof category_s !== 'string') || (typeof fun_name_s !== 'string') || (typeof variadique_s !== 'string') ){
		console.error("Undexpected type to be passed to engine");
	}
	// tmp code 
	if ( variadique_s == "World"){
	tmp_json_s = '{ "args" : [{"type": "slider","name": "Slider","min": 0,	"max": 10,	"value": 6},{"type": "slider","name": "Not Slider","min": 0,	"max": 10,	"value": 6}, {	"type": "slider",	"name": "Slider_2",	"min": 0,	"max": 10,	"value": 6 }]}';
	}else{
		tmp_json_s = '{ "args" : [{"type": "slider","name": "Slider0","min": 0,	"max": 10,	"value": 6}, {	"type": "slider",	"name": "Slider_3",	"min": 0,	"max": 10,	"value": 6 }]}';
	
	}
	try{
		ret_val_o = JSON.parse(tmp_json_s);
	} catch(err) {
    	// json error
    	throw err;
	}
	return ret_val_o;
}
function get_selected_option(sel_o){
	/* return : string, selected option value */
	return sel_o.value;
}
function get_arg_category(arg_menu_o){
	/* return : string, current category of the function shown in the arg menu */
	return arg_menu_o.dataset.category;
}
function get_arg_function_name(arg_menu_o){
	/* return : string, current function name of the function shown in the arg menu */
	return arg_menu_o.dataset.function;
}
/* used on variadique option change as well as on change of the function selected */
function variadique_choice_changed(arg_o, category_s, fun_name_s, selected_option_s)
{
	
	let child_o_a;
	let child_o;
	let class_name_a_s = _argument_s_a;
	let choice_s       = selected_option_s;
	let arguments_o_a  = get_engine_args_from_variadique(category_s, fun_name_s, choice_s);/* get new children */
	let arguments_o;
	let row_i;
	// remove all arguments and fill up with new arguments
	// get all children element and remove
	for ( var i = 0 ; i < get_array_length(class_name_a_s) ; i++ )
	{
		child_o_a   = arg_o.getElementsByClassName(class_name_a_s[i]);
		var len_j_i = get_array_length(child_o_a);
		for(var j = len_j_i-1 ; j > -1 ; j-- )
		{
			console.log(" j "+j+" max "+ len_j_i );
			child_o = child_o_a[j];
			arg_o.removeChild(child_o);
		}
		console.log("loop finished , len value "+len_j_i);
	}
	// all children removed, build new argument list
	len_i = get_array_length(arguments_o_a.args);
	row_i = 2; // we have the variadique selelctor in the top position
	for ( i = 0; i < len_i ; i ++){
		arguments_a = arguments_o_a.args[i];
		switch (arguments_a.type){
				case _arg_type_slider:
					/* creat new slider element */
					row_i = add_slider_field(arg_o, arguments_a.name , arguments_a.value , arguments_a.min , arguments_a.max , row_i);
					break;
			default :
				console.error("Unhandled agument type "+ argument_a.type);
				break;
		}
	}

}



/* UI resize */
let DRAG_V_B;
function init_resize(){
/* resize-containers are direct children of the ui elements and parents to the handle */
	let i = 0;
	let len_i;
	let resize_wrap_o_a;
	let resize_wrap_o;
	let handle_o;
	let ui_main_o; // ui master element
	let ui_elem_o;

	let mouse_o;
	DRAG_V_B = false;
	mouse_o = window.event;
    mouse_o.preventDefault();
	ui_main_o = document.getElementsByClassName("ui")[0]; // should only be one main ui element
	resize_wrap_o_a = document.getElementsByClassName("resize_contrainer");
	len_i = get_array_length(resize_wrap_o_a);
	for( i = 0 ; i < len_i ; i ++)
	{
		let border_s;
		let grid_var_s;
		let vertical_b; 
		let resize_wrap_o = resize_wrap_o_a[i];
		let handle_o      = resize_wrap_o.querySelector(".handle_buffer");
		let ui_elem_o     = resize_wrap_o.parentElement;

		switch (ui_elem_o.className) {
			case "ui-arg-menu":
				border_s = "border-left";
				grid_var_s = "--col_3_max";
				vertical_b = false;
				break;
			case "ui-function-menu":
				border_s = "border-top"
				grid_var_s = "--row_4_max";
				vertical_b = true;
				break;
			case "ui-access-bar":
				border_s = "border-right";
				grid_var_s = "--col_1_max";
				vertical_b = false;
				break;
			case "ui-common-tools":
				border_s = "border-bottom";
				grid_var_s = "--row_2_max";
				vertical_b = true;
				break;
			default:
				// statements_def
				console.error("Unexpected ui element");
				break;
		}
		// handle_o.addEventListener("mouseenter", resize_ui_drag_start.bind(null, resize_wrap_o, border_s ));
		handle_o.addEventListener("mousedown", resize_ui_drag_start.bind(null, resize_wrap_o, border_s ));
		handle_o.addEventListener("mouseup", resize_ui_drag_end.bind(null, resize_wrap_o, border_s ));
		handle_o.addEventListener("mousemove", function(event) { resize_ui_drag(ui_main_o, ui_elem_o, grid_var_s, vertical_b, event)} );

		// handle_o.addEventListener("mouseleave", resize_ui_drag_end.bind(null, resize_wrap_o, border_s ));
	}
}
function resize_ui_drag_start(drag_field_o, border_s ){
	/* drag start : make blue border appear on the side */
	drag_field_o.style.setProperty(border_s,"thin solid var(--col_sel_blue_light)");
	DRAG_V_B = true; 
	//console.log("hover enter");
}
function resize_ui_drag_end(drag_field_o, border_s ){
	/* darg end : remove blue border */
	drag_field_o.style.removeProperty(border_s);
	console.log("drag value " + DRAG_V_B);
	DRAG_V_B = false; 
	//console.log("hover leave");
}
function resize_ui_drag(ui_main_o, ui_o, grid_var_s, vertical_b,mouse_o  ){
	if ( DRAG_V_B === true){
		let new_size_i;
		let elem_rect_o; 
	 
		elem_rect_o = ui_o.getBoundingClientRect();
		if (vertical_b === false){
			new_size_i =  elem_rect_o.right - event.screenX + 5;
		}else{
			/* horizontal element */
			new_size_i = elem_rect_o.bottom - event.screenY + 70;
		}
		// set new size
		/* negative value can occure when the mouse goes bellow the bounds of the window, small check to prevent that from happening and
		affecting the layout */
		if ( new_size_i > 0){
		ui_main_o.style.setProperty( grid_var_s, new_size_i + "px");
		}
		//console.log("dragged, set new size " + new_size_i);
	}
}

function get_array_length(array){
	let len = 0;
	for (var i = 0; i < array.length; i++) {
	  if (array[i] !== undefined) {
	    len++;
	  }
	}
	return len; 
}

/* search bar */
function init_search_bar(seach_parent_o, hideable_list_o){
	/* set up callback for the search bar, get search bar and associated search button then link it up to
	the list of items that will be hidden based on the seach outcome */
	let svg_search_o;
	let bar_o;
	/* parent look for seach bar with id="function-search" and svg with id="search" */
	svg_search_o = seach_parent_o.querySelector("#search");
	bar_o = seach_parent_o.querySelector("#function-search");
	svg_search_o.addEventListener("click", search_click.bind(null, hideable_list_o, bar_o));
	// TODO : binding for when Enter is pressed
}
function set_autocomplete(datalist_id_o, list_a_s){
	/* remove current options and set new options 
	create search autocomplete option list */
	let opt_o;
	let txt_o;
	let i;
	let opt_o_a = datalist_id_o.getElementsByTagName("datalist");
	// remove element
	for ( i = opt_o_a.length - 1; i > -1 ; i-- )
	{
		opt_o = opt_o_a[i];
		opt_o_a.removeChild(opt_o);
	}
	// add new ellements
	for ( i = 0; i < list_a_s.length; i ++)
	{
		opt_o = document.createElement("option");
		txt_o = document.createTextNode(list_a_s[i]);
		opt_o.append(txt_o);
		datalist_id_o.append(opt_o);
	}
}
function search_click(function_list_o, search_bar_o){
	/* hide all ellements not containing the search item in there id */
	let elem_o;
	let search_val_s;
	let show_b; // boolean value of if this item should be hidden
	let item_id_s;
	let i;
	let child_o_a;
	let match_o_a = []; // all ellements are passed by reference so we can put them in arrays and modify the attributes latter on 
	let not_match_o_a = [];
	/* get content of the search bar */
	search_val_s = search_bar_o.value;
	child_o_a = function_list_o.children;
	/* go though all the list items and hide all the ellements that don't contain the search term in the id*/
	/* search if we have at least on match, if not don't hide items and set an error on the search bar*/
	for ( i = 0 ; i < child_o_a.length; i++ ){
		elem_o = child_o_a[i];
		item_id_s = elem_o.id;
		show_b = item_id_s.includes(search_val_s);
		if (show_b)
		{
			match_o_a.push(elem_o);
			//elem_o.removeAttribute("hidden");
		}else{
			not_match_o_a.push(elem_o);
			//elem_o.setAttribute("hidden", true);
		}
	}
	if (match_o_a.length > 0){
		for ( i = 0 ; i < match_o_a.length ; i++){
			//match_o_a[i].removeAttribute("hidden");
			match_o_a[i].style.removeProperty("display");
		}
		for ( i = 0 ; i < not_match_o_a.length ; i++){
			// not_match_o_a[i].setAttribute("hidden", true);
			not_match_o_a[i].style.setProperty("display","none");
		}
	}
	// TODO search bar error
}
/*  set up the function list items and toolbar when we change category
	added the _elem part to the function name to make it less ambigious */
function set_function_list_elem(new_category_s){
	// toolbar
	// set function category
	// set hint list for autocomplete

	// function list
	// create new function item per function
	// TODO : get icon for each function
}
function ldb_init(){
	/* fake init because we don't have the backend yet */
	ldb_set_function_list_per_cateogry("Bridge",["Big","Small","Anciant"]);
	ldb_set_function_list_per_cateogry("Door",["Big","Small","Wooden"]);
	ldb_set_function_list_per_cateogry("Window",["Big","Small","Anciant"])
	ldb_set_function_list_per_cateogry("Wall",["Big","Small","Anciant"])
	ldb_add_function_per_category("Wall", "Tall");
}
/* get the list of functions registered for this category 
	return : string array, function list */
function ldb_get_function_list_per_category(category_s){
		return FDB_m.get(category_s);
}
function ldb_set_function_list_per_cateogry(category_s, fun_a_s){
	FDB_m.set(category_s, fun_a_s );
	console.log("New cateogry added "+category_s+" : "+fun_a_s);
}
/* add a single function name, not an array of function names */
function ldb_add_function_per_category(category_s, fun_s){
	// check if catheogry exists
	let fun_a_s;
	let cat_exists_b = FDB_m.has(category_s);
	/* if doesn't exist create it and set our fun_s as the only function,
	 else append it to the end of the existing function name array */
	if ( cat_exists_b ){
		fun_a_s = FDB_m.get(category_s);
		fun_a_s.push(fun_s);
		console.log("Added to cateogry "+category_s+" ,new value : "+fun_a_s);
	}else{
		fun_a_s = [];
		fun_a_s.push(fun_s);
		FDB_m.set(category_s, fun_a_s);
		console.log("New cateogry added "+category_s+" : "+fun_a_s);
	}
}
/* remove function from category */
function ldb_delete_function_from_category(category_s, fun_s){
	let fun_a_s;
	const cat_exists_b = FDB_m.has(category_s);
	if ( cat_exists_b ){
		fun_a_s = FDB_m.get(category_s);
		const index = fun_a_s.indexOf(fun_s);
		if (index > -1) {
  			FDB_m.set( category_s, fun_a_s.splice(index, 1));
		}
	}
}
/* remove category */
function ldb_delete_category(category_s){
	const cat_exists_b = FDB_m.has(category_s);
	if ( cat_exists_b ){
		 FDB_m.delete(category_s);
	}
}
/* function menu, class="ui-function-menu" */
function init_function_menu()
{
	let ui_elem_o     = document.getElementsByClassName("ui-function-menu")[0];
	/* function */
	let fun_toolbar_o = ui_elem_o.querySelector(".function.toolbar");
	let fun_list_o    = ui_elem_o.querySelector(".function.list");
	init_search_bar(fun_toolbar_o, fun_list_o);
	/* cateogry :  get the list of cateogries */
	let cat_s_a = Array.from(FDB_m.keys());
	let cat_toolbar_o = ui_elem_o.querySelector(".category.toolbar");
	let cat_list_o    = ui_elem_o.querySelector(".cateogry.list");
	init_category_list(cat_list_o, cat_s_a);
	// add selected to the first item by first element
	select_category(cat_list_o, cat_list_o.children[0]);
}

/* category */
/* set up category list */
function init_category_list(cat_list_o, cat_s_a){
	/* <div class="cateogry list" >
                <div class="category-item">Bridge</div>
                [ ... ]
        </div>
    */
    let i;
    let item_elem_o;
    let txt_elem_o;
    for ( i = 0 ; i < cat_s_a.length ; i++ ){
    	item_elem_o = document.createElement("div");
    	item_elem_o.classList.add("category-item");
    	item_elem_o.setAttribute("id",cat_s_a[i]);
    	txt_elem_o = document.createTextNode(cat_s_a[i]);
    	item_elem_o.append(txt_elem_o);
    	cat_list_o.append(item_elem_o);
    }
}
/*  highlight selected category : add the "selected" class to the element
	and remove it from all the other items */
function select_category(cat_list_o, clicked_elem_o){
	const sel_class_s = "selected";
	let cl_s_a = Array.from(clicked_elem_o.classList); // class list, strings array
	// check if the clicked item is already selected, if it is then : don't need update
	if (cl_s_a.indexOf(sel_class_s) === -1){
		let elem_o;
		let i;
		
		// remove all selected class
		for( i = 0; i < cat_list_o.children.length ; i++){
			elem_o = cat_list_o.children[i];
			elem_o.classList.remove(sel_class_s);
		}
		// add selected class
		clicked_elem_o.classList.add(sel_class_s);

		// update function list
		// TODO
	}
}