// JSON
const json_data_s = '{"buttons": [ {"txt" : "Hello", "alternates" : [ {"name" : "Simple alternate" , "txt" : "I am simple"}, {"name" : "Not simple alternate", "txt" : "I am not simple"} ] } , { "txt": "World"},{ "txt": "I"},{ "txt": "love"},{ "txt": "fish"},{ "txt": "cake"} ] }';

document.addEventListener("DOMContentLoaded", function(event) {
	let i = 0;
	let row = 0;
	let b_cont_o = document.getElementById("wrapper-buttons");
	let b_data_o_a =  get_buttons_from_json(json_data_s);

	for( i = 0; i < b_data_o_a.length ; i ++ ){
		row = addButton(b_data_o_a[i],b_cont_o,row);

	}
	size_button_container(b_cont_o,row);

	
});

// size the number of rows in the button container
function size_button_container(b_cont_o, size_y_i){
	let grid_row_s;
	grid_row_s = "repeat("+size_y_i+", auto)";
	b_cont_o.setAttribute("grid-template-rows",grid_row_s);
}

function addButton(b_o, b_cont_o, idx_i){
	// Add button
	idx_i += 1;
	let new_but_o     = document.createElement("button");
	let new_but_txt_o = document.createTextNode(b_o.txt);
	new_but_o.append(new_but_txt_o);
	b_cont_o.append(new_but_o);

	// Add button attribute
	if ('alternate' in b_o){
		idx_i += 1;
		let new_attr_o     = document.createElement("div");
		new_attr_o.classList.add('attr');
		let new_attr_txt_o = document.createTextNode(b_o.attr);
		new_attr_o.append(new_attr_txt_o);
		// new_attr_o.style.grid-row   = idx_i;
		new_attr_o.style.visibility = "collapse";
		new_attr_o.style.height     = 0 ;
		b_cont_o.append(new_attr_o);
		new_but_o.addEventListener("click",toogle_attr.bind(null,new_attr_o));
	}
	return idx_i;
}

// read json content 
function get_buttons_from_json(json_s)
{
	let toggle_vis_s;
	let height_s;
	let json_o = JSON.parse(json_s);
	// get all buttons
	return json_o.buttons;
}
// show attributes for button
function toogle_attr(attr_o){
	// check if attr is visible
	let vis          = attr_o.style.visibility;

	// toogle
	if  (vis === "collapse"){
		toggle_vis_s = "visible";
		height_s = "auto";
	}else{
		toggle_vis_s = "collapse";
		height_s = "0";
	}

	attr_o.style.visibility = toggle_vis_s;
	attr_o.style.height     = height_s;
}

// creat the list of alternates then call build attribute for the first alternate
// first alternate is considered the default
// create callback to rebuild attributes in case of the alternate chaning
function build_alternates(atlernate_a_o){

}

// build the attributes for the selected alternate
function build_attribute(atlernate_o){

}