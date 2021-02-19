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