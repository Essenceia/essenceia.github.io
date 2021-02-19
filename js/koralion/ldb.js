/* GLOBALS */

const FDB_m = new Map(); 
			/* local function DB, stores list of all registered functions
				structure of the object 
				map< category_name , array_of_functions > */

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