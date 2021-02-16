// SLIDER
// class : slider-field { name , num , slider }
document.addEventListener("DOMContentLoaded", function(event) {
	init_sliders();
	init_resize();
});
/* slider */
function init_sliders(){
	let slider_o; 
	//let slider_progress_o;
	let num_o;
	let arg_slider_o;
	let arg_o      = document.getElementsByClassName("args")[0];
	let row_i = 1;
	// create menu 
	row_i = add_arg_slider(arg_o, "Hello", 5 , 0 , 10, row_i );
	row_i = add_arg_slider(arg_o, "World", 5 , 0 , 10, row_i );
	row_i = add_arg_slider(arg_o, "Fish", 5 , 0 , 10 , row_i);
	arg_size_grid(arg_o, row_i);

	let args_slider_o_a = document.getElementsByClassName("slider-field");
	let i = 0;
	let len_i = args_slider_o_a.length;
	
	for (i = 0 ; i < len_i ; i ++){
		arg_slider_o      = args_slider_o_a[i];
		slider_o          = arg_slider_o.querySelector(".slider"); 
		//slider_progress_o = arg_slider_o.querySelector("input[type='range']::-moz-range-progress"); 
		num_o             = arg_slider_o.querySelector(".num");
		// set start values of slider and num 
		setup_slider_arg_values(slider_o, num_o, 0.0, 10.0, 5.0);
		// slider_o.addEventListener( "select", slider_active.bind(null, slider_o, num_o));
		num_o.addEventListener("input", num_txt_leave.bind(null, slider_o, num_o));
		slider_o.addEventListener( "input",  slider_active.bind(null, slider_o, num_o));
		slider_o.addEventListener( "mouseenter", slider_enter.bind(null, slider_o, num_o));
		slider_o.addEventListener( "mouseleave", slider_leave.bind(null, slider_o, num_o));

	}}
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

	return row_i + 1;}
function arg_size_grid(arg_o, row_i){
	let row_s;
	row_s = "repeat("+row_i+", auto) 1fr"
	arg_o.style.setProperty("grid-template-rows",row_s);
	arg_o.style.setProperty("grid-template-columns","1fr");}
function add_arg_variadique(arg_o, options_s_a ){ TODO }
/* UI resize */
function init_resize(){
/* resize-containers are direct children of the ui elements and parents to the handle */
	let i = 0;
	let len_i;
	let resize_wrap_o_a;
	let resize_wrap_o;
	let handle_o;
	let ui_elem_o;
	let ui_mom_o;
	let border_s;
	let grid_var_s;
	resize_wrap_o_a = document.getElementsByClassName("resize_contrainer");
	len_i = resize_wrap_o_a.length;
	for( i = 0 ; i < len_i ; i ++)
	{
		resize_wrap_o = resize_wrap_o_a[i];
		handle_o = resize_wrap_o.querySelector(".handle");
		ui_elem_o = resize_wrap_o.parentElement;

		switch (ui_elem_o.className) {
			case "ui-arg-menu":
				border_s = "border-left";
				grid_var_s = "--col_1_max";
				break;
			case "ui-function-menu":
				border_s = "border-top"
				break;
			case "ui-access-bar":
				border_s = "border-right"
				break;
			case "ui-common-tools":
				border_s = "border-bottom"
				break;
			default:
				// statements_def
				console.error("Unexpected ui element");
				break;
		}
		// handle_o.addEventListener("mouseenter", resize_ui_drag_start.bind(null, resize_wrap_o, border_s ));
		handle_o.addEventListener("dragstart", resize_ui_drag_start.bind(null, resize_wrap_o, border_s ));
		handle_o.addEventListener("dragend", resize_ui_drag_end.bind(null, resize_wrap_o, border_s ));
		handle_o.addEventListener("drag", resize_ui_drag.bind(null, ui_elem_o,  ));

		// handle_o.addEventListener("mouseleave", resize_ui_drag_end.bind(null, resize_wrap_o, border_s ));
	}
}
function resize_ui_drag_start(drag_field_o, border_s ){
	/* drag start : make blue border appear on the side */
	drag_field_o.style.setProperty(border_s,"thin solid var(--col_sel_blue_light)");
	console.log("hover enter");
}
function resize_ui_drag_end(drag_field_o, border_s ){
	/* darg end : remove blue border */
	drag_field_o.style.removeProperty(border_s);
	console.log("hover leave");
}
function resize_ui_drag(ui_o, grid_var_s ){
	console.log("dragged");
}