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


// remove all children ellements, also know as the child killer
function delete_children(elem_o){
	if(elem_o.childElementCount > 0){
		let i;
		let child_o;
		let child_o_a = elem_o.children;
		for ( i = child_o_a.length -1 ; i > -1 ; i-- ){
			child_o = child_o_a[i];
			elem_o.removeChild(child_o);
		}
	}
}
/* return : bool, if the element has the selected class */ 
function has_class(elem_o, class_s){
	let cl_s_a = Array.from(elem_o.classList); // class list, strings array
	if (cl_s_a.indexOf(class_s) === -1){
		return false;
	}
	return true;
}

function remove_class(parent_elem_o, class_s)
{
	let i;
	let elem_o;
	for( i = 0; i < parent_elem_o.children.length ; i++){
		elem_o = parent_elem_o.children[i];
		elem_o.classList.remove(class_s);
	}
}
function add_class(parent_elem_o, class_s)
{
	let i;
	let elem_o;
	for( i = 0; i < parent_elem_o.length ; i++){
		elem_o = parent_elem_o[i];
		// TODO : check if we don't already have the class
		elem_o.classList.add(class_s);
	}
}
/* class_s can only be held by one element per parent, clear all ellements
    and add it to our clicked element if it isn't already present
	return : bool, clicked element didn't had the specified class */
function update_onehot_class(parent_elem_o, clicked_elem_o, class_s){
	let ret_b; 
	ret_b = has_class(clicked_elem_o, class_s);
	if(ret_b === false){
		// remove the class from the other children elements
		remove_class(parent_elem_o, class_s);
		// add to clicked
		clicked_elem_o.classList.add(class_s);
	}
	return !ret_b; 
}

/* class_s can only NOT be held by one element per parent, add it to all ellements
    and remove it from our clicked element if it is present
	return : bool, clicked element had the specified class */
function update_not_onehot_class(parent_elem_o, clicked_elem_o, class_s){
	let ret_b; 
	ret_b = has_class(clicked_elem_o, class_s);
	if(ret_b === true){
		// add the class from the other children elements
		add_class(parent_elem_o, class_s);	
		// add to clicked
		clicked_elem_o.classList.remove(class_s);
	}
	return !ret_b; 
}