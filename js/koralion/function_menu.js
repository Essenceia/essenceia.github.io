

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

/************/
/* category */
/************/

/* set up category list */
function init_category_list(cat_list_o, cat_s_a){
	/* <div class="cateogry list" >
                <div class="category-item">Bridge</div>
                [ ... ]
        </div>
    */
    let i;
    let txt_elem_o;
    for ( i = 0 ; i < cat_s_a.length ; i++ ){
    	let item_elem_o;
    	item_elem_o = document.createElement("div");
    	item_elem_o.classList.add("category-item");
    	item_elem_o.setAttribute("id",cat_s_a[i]);
    	txt_elem_o = document.createTextNode(cat_s_a[i]);
    	item_elem_o.append(txt_elem_o);
    	cat_list_o.append(item_elem_o);
    	// append callback to item for when it is clicked
    	item_elem_o.addEventListener("click", select_category.bind(null, cat_list_o, item_elem_o));
    }
    arg_size_grid(cat_list_o);
}
/*  highlight selected category : add the "selected" class to the element
	and remove it from all the other items */
function select_category(cat_list_o, clicked_elem_o){
	const sel_class_s = "selected";
	let new_cat_s;
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
		new_cat_s = clicked_elem_o.id;
		set_function_list_elem(new_cat_s, ldb_get_function_list_per_category(new_cat_s));
	}
}

/************/
/* function */
/************/

/*  set up the function list items and toolbar
	called when we change category
	added the _elem part to the function name to make it less ambigious */
function set_function_list_elem(new_category_s, fun_list_s_a){
	let cat_current_o;
	let fun_toolbar_o;
	let ui_elem_o;
	let seach_datalist_o;
	let i;
	let fun_item_elem_o;
	let fun_name_elem_o;
	let fun_img_elem_o;

	ui_elem_o     = document.getElementsByClassName("ui-function-menu")[0];
	// toolbar
	fun_toolbar_o = ui_elem_o.querySelector(".function.toolbar");
	
	// set function category
	// toolbar field holds category data-category="bridge"
	fun_toolbar_o.dataset.category = new_category_s;
	// <div class="category-current">Bridge</div>
	cat_current_o = fun_toolbar_o.querySelector(".category-current");
	cat_current_o.textContent = new_category_s;

	// set hint list for autocomplete
	// <datalist id="function-list">
	seach_datalist_o = fun_toolbar_o.querySelector("datalist");
	delete_children(seach_datalist_o);
	set_autocomplete(seach_datalist_o, fun_list_s_a);

	// function list
	let fun_list_o    = ui_elem_o.querySelector(".function.list");
	// create new function item per function
	/* <div class="item-wrapper" id="Antique bridge">
        <div class="name">Antique bridge</div>
        <img src="../images/sensor_door-24px_2.svg">
    </div> */
    delete_children(fun_list_o); // delete all existing items
    // add new items
    for(i=0; i < fun_list_s_a.length; i++ ){
    	fun_item_elem_o = document.createElement("div");
    	fun_item_elem_o.classList.add("item-wrapper");
    	fun_item_elem_o.id = fun_list_s_a[i];

    	fun_name_elem_o = document.createElement("div");
    	fun_name_elem_o.classList.add("name");
    	fun_name_elem_o.textContent =  fun_list_s_a[i];

    	fun_img_elem_o = document.createElement("img");
    	fun_img_elem_o.setAttribute("src", get_function_item_img_src(new_category_s,fun_list_s_a[i]));

    	fun_item_elem_o.append(fun_img_elem_o);
    	fun_item_elem_o.append(fun_name_elem_o);
    	fun_list_o.append(fun_item_elem_o);

    	fun_item_elem_o.addEventListener("click", fun_item_clicked.bind(null,new_category_s, fun_list_s_a[i] ));
       }
}
function get_rand_i(max_i) {
  return Math.floor(Math.random() * Math.floor(max_i));
}
// return : string, scr of function item icon
function get_function_item_img_src(cat_s, fun_item_s){
	let src_s;
	// TODO : get icon for each function
	return "../images/sensor_door-24px_"+get_rand_i(4)+".svg";
}

/* function clicked creates argument menu */
function fun_item_clicked(cat_s, fun_item_id_s){
	let var_s_a;
	var_s_a = engine_get_variadique(cat_s+"."+fun_item_id_s); 
	set_arg_variadique(var_s_a);
}

/* get variadique from engine
	pass name in format : cateogry.function_name
	return, string array, list of variadique */
function engine_get_variadique(cat_fun_s){
	// TODO
	let var_s_a;
	switch(cat_fun_s){
		case "Wall.Small" : 
			var_s_a = ["Hello", "World"];
			break;
		default :
			var_s_a = [ "I", "love", "shrimp"];
			break;
	}
	return var_s_a;
}
