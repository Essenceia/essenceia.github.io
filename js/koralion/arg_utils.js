/* argument input field : slider */
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
/* argument input field : point input field */
function add_drop_box_field(arg_o, txt_s , bounded_type_i, min_i,type_i, row_i){
// <div class="box-field sketch">
//         <div class="name">Point</div>
//         <div class="cnt">
//             <div class="cur-cnt"> 0</div>
//             <div class="sep-cnt">/</div>
//             <div class="max-cnt">4</div>
//         </div>
//         <div class="box-input-field">
//				<input list="<type_s>-list" type="text" class="box-item" placeholder="+" autocomplete="on">
//         </div>
// </div>
	let field_o     = document.createElement("div");
	field_o.classList.add('box-field');
	field_o.classList.add(TypeToString[type_i]);
	field_o.style.setProperty("grid-row",row_i);

	let name_o = document.createElement("div");
	name_o.classList.add('name');
	txt_o = document.createTextNode(txt_s);
	name_o.append(txt_o);

	// cnt 
	let cnt_o = document.createElement("div");
	cnt_o.classList.add('cnt');

	let current_cnt_o         = document.createElement("div");
	current_cnt_o.classList.add('cur-cnt');
	current_cnt_o.textContent = "0";
	let seperator_cnt_o       = document.createElement("div");
	seperator_cnt_o.classList.add('sep-cnt');
	seperator_cnt_o.textContent = "/";

	let max_cnt_o         = document.createElement("div");
	max_cnt_o.classList.add('max-cnt');
	field_o.dataset.bound_type  = bounded_type_i;
	field_o.dataset.bound_value = min_i;
	// determine if we have a strict number of upper bounded ellements, a range, or an unlimited number
	switch (bounded_type_i){
		case RANGE_BOUND_TYPE.strict :
			max_cnt_o.textContent      = min_i;
			break;
		case RANGE_BOUND_TYPE.lower_bounded :
			max_cnt_o.textContent      = min_i + "+";
	}
	cnt_o.append(current_cnt_o);
	cnt_o.append(seperator_cnt_o);
	cnt_o.append(max_cnt_o);
	

	let box_o  = document.createElement("div");
	box_o.classList.add('box-input-field');


	// get reference to corresponding hir list
	let datalist_elem_o = h_get_datalist_from_type(type_i);

	

	for ( let i = 0 ; i < field_o.dataset.bound_value; i++ ){
		// create empty input box
		// <input list="<type_s>-list" type="text" class="box-item" placeholder="+" autocomplete="on">
		let box_item_o = document.createElement("input");
		box_item_o.classList.add('box-item');
		box_item_o.setAttribute("autocomplete" , "on");
		box_item_o.setAttribute("placeholder" , "+");
		box_item_o.setAttribute("type" , "text");
		box_item_o.setAttribute("list" , TypeToString[type_i]+"-list");
		box_item_o.addEventListener('input', box_item_keyboard_input.bind(null,box_o,box_item_o, datalist_elem_o, current_cnt_o, max_cnt_o));
		box_item_o.addEventListener("dragover", function(event) { box_item_drag_over(event, type_i)});
		box_item_o.addEventListener("dragend", function(event) { box_item_drag_input(event,box_o,type_i, box_item_o, datalist_elem_o, current_cnt_o, max_cnt_o )});
		box_o.append(box_item_o);
	}
	field_o.append(name_o);
	field_o.append(cnt_o);
	field_o.append(box_o);
	arg_o.append(field_o);

	return row_i + 1;
}
/*  new input to the box item, update the number of items if valid, set invalid pseudo class on the item if not valid
	validity is conditioned on having a matching object of type_s with the given uid
	User will enter a new name, we check the map to see if we have a match with the correct uid*/
function box_item_keyboard_input(box_o, box_item_o, datalist_elem_o, current_cnt_o, max_cnt_o){
	let item_value_s = box_item_o.value;
	let valid_value_b; 
	if (item_value_s.length > 0){
		// check if we have a corresponding element
		let match_elem_o = datalist_elem_o.querySelector("option[value='"+item_value_s+"']");
		valid_value_b = ( match_elem_o !== null );
		if(valid_value_b === true){
			// check there is not duplicate, if there is, set to invalid
			let duplicate_elem_o = box_o.querySelector("[id='"+match_elem_o.id+"'");
			if (duplicate_elem_o !== null){
				valid_value_b = false;
			}
		}
		add_validity_class(box_item_o, valid_value_b);
		if ( !valid_value_b ){
			console.log("No match value "+item_value_s);
			
		}else{
			// get id for element and add it to the item and put it down as valid
			box_item_o.id = match_elem_o.id;

		}
	}
	update_current_cnt(box_o, current_cnt_o, max_cnt_o);
	
}
function box_item_drag_over(event, type_i){
 	const type_match = event.dataTransfer.getData("type") === TypeToString[type_i];
  	if (type_match) {
    	console.log("type match");


 	}
 	event.preventDefault();
}
/* check if we have draged an object of the correct type */
function box_item_drag_input(event,box_o, type_i , box_item_o, datalist_elem_o, current_cnt_o, max_cnt_o ){
 	const type_match = event.dataTransfer.types.includes(TypeToString[type_i]);
  	if (type_match) {
    	console.log("type match");
 	}
 	event.preventDefault();
}
/* update the cnt of items, count the number of children with the valid class*/
function update_current_cnt(box_field_o, current_cnt_o, max_cnt_o){
	let valid_class_a_o;
	let i;
	valid_class_a_o = box_field_o.getElementsByClassName("valid");
	if ( valid_class_a_o !== null){
		i = valid_class_a_o.length;
	}else{
		i = 0;
	}
	add_validity_class(current_cnt_o , ( max_cnt_o.textContent === "" + i ) );
	current_cnt_o.textContent = i;
}
/* 	add the valid or invalid clas to the element, 
	if valid_b is true we add valid, if not, we add invalid
	clear occurence of valid and invalid if present */
function add_validity_class(elem_o, valid_b){
	if(valid_b){
		elem_o.classList.remove("invalid");
		elem_o.classList.add("valid");
	}else{
		elem_o.classList.remove("valid");
		elem_o.classList.add("invalid");
	}
	console.log("Validity added "+valid_b);
}
/* -------------- */

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

function elem_insert_after(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}