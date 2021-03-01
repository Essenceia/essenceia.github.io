/* arg menu */
let UI_ARG_MENU_o;

function init_arg_menu(){
	let row_i = 1;
	UI_ARG_MENU_o      = document.getElementsByClassName("args")[0];
	 add_arg_variadique(UI_ARG_MENU_o, ["Hello","World"], 0);

	//const slider_json_s = JSON.parse('{"name": "Slider","min": 0,"max": 10,"value": 6}');
	//row_i = add_slider_field(arg_o, slider_json_s, row_i);

}

function set_arg_variadique(variadique_s_a){
	add_arg_variadique(UI_ARG_MENU_o, variadique_s_a, 0);
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
		tmp_json_s = '{ "args" : [{"type": "slider","name": "Slider0","min": 0,	"max": 10,	"value": 6}, {"type": "box","name": "Point","bound_type":1, "min": 3, "obj_type": 0}, {	"type": "slider",	"name": "Slider_3",	"min": 0,	"max": 10,	"value": 6 }]}';
	
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
	for ( var i = 0 ; i < class_name_a_s.length ; i++ )
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
				case ARG_TYPE.slider:
					/* creat new slider element */
					row_i = add_slider_field(arg_o, arguments_a.name , arguments_a.value , arguments_a.min , arguments_a.max , row_i);
					break;
				case ARG_TYPE.box:
					// {"type": "box","name": "Point","bound_type":0, "min": 3, "obj_type": 0}, 
					row_i = add_drop_box_field(arg_o, arguments_a.name , arguments_a.bound_type , arguments_a.min, arguments_a.type, row_i);
					break;
			default :
				console.error("Unhandled agument type "+ arguments_a.type);
				break;
		}
	}

}

function add_arg_variadique(arg_o, options_s_a, selected_opt_i ){
	/* Add the list of variadique arguments */
	let i;
	let len_i;
	let opt_o;
	let txt_o;

	delete_children(arg_o);

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

	// size grid
	arg_size_grid(arg_o);
	
}