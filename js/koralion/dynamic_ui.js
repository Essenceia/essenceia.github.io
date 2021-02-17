// SLIDER
// class : slider-field { name , num , slider }
document.addEventListener("DOMContentLoaded", function(event) {
	create_arg_menu();
	init_resize();
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
function get_args_from_variadique(cathegory_s, fun_name_s, variadique_s){
	// TODO
	let tmp_json_s;
	let ret_val_o; 
	if ( (typeof cathegory_s !== 'string') || (typeof fun_name_s !== 'string') || (typeof variadique_s !== 'string') ){
		console.error("Undexpected type to be passed to backend");
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
function variadique_choice_changed(arg_o, cathegory_s, fun_name_s, selected_option_s)
{
	
	let child_o_a;
	let child_o;
	let class_name_a_s = _argument_s_a;
	let choice_s       = selected_option_s;
	let arguments_o_a  = get_args_from_variadique(cathegory_s, fun_name_s, choice_s);/* get new children */
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
	let border_s;
	let grid_var_s;
	let vertical_b; 
	let mouse_o;
	DRAG_V_B = false;
	mouse_o = window.event;
    mouse_o.preventDefault();
	ui_main_o = document.getElementsByClassName("ui")[0]; // should only be one main ui element
	resize_wrap_o_a = document.getElementsByClassName("resize_contrainer");
	len_i = get_array_length(resize_wrap_o_a);
	for( i = 0 ; i < len_i ; i ++)
	{
		resize_wrap_o = resize_wrap_o_a[i];
		handle_o = resize_wrap_o.querySelector(".handle_buffer");
		ui_elem_o = resize_wrap_o.parentElement;

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
			new_size_i = Math.abs(event.offsetY) - elem_rect_o.bottom;
		}
		// set new size
		ui_main_o.style.setProperty( grid_var_s, new_size_i + "px");
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