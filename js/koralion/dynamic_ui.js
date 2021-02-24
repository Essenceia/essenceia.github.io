
			
// SLIDER
// class : slider-field { name , num , slider }
document.addEventListener("DOMContentLoaded", function(event) {
	ldb_init();
	//init_arg_menu();
	init_resize();
	init_function_menu();
	//init_access_menu();
});

// TODO : remove the following function from the code, this was a mistake 
function get_array_length(array){
	let len = 0;
	for (var i = 0; i < array.length; i++) {
	  if (array[i] !== undefined) {
	    len++;
	  }
	}
	return len; 
}


