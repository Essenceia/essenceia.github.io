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
	let ui_hierchy_o;


	let mouse_o;
	DRAG_V_B = false;
	mouse_o = window.event;
    mouse_o.preventDefault();
	ui_main_o = document.getElementsByClassName("ui")[0]; // should only be one main ui element
	resize_wrap_o_a = document.getElementsByClassName("resize_contrainer");
	len_i = get_array_length(resize_wrap_o_a);
	for( i = 0 ; i < len_i ; i ++)
	{
		let border_s;
		let grid_var_s;
		let vertical_b; 
		let offset_i;
		let resize_wrap_o = resize_wrap_o_a[i];
		let handle_o      = resize_wrap_o.querySelector(".handle_buffer");
		let ui_elem_o     = resize_wrap_o.parentElement;

		switch (ui_elem_o.classList[0]) {
			case "ui-right-menu":
				if (resize_wrap_o.classList[1] === "vertical"){
					border_s     = "border-top";
					grid_var_s   = "--row_arg_height";
					ui_hierchy_o = resize_wrap_o;
					vertical_b   = true;
					offset_i     = -35;
					handle_o.addEventListener("mousemove", function(event) { resize_arg_veritcal(ui_main_o, ui_hierchy_o, ui_elem_o, grid_var_s, event, offset_i)} );
				}else{
					border_s   = "border-left";
					grid_var_s = "--col_3_max";
					vertical_b = false;
					offset_i   = 5;
					handle_o.addEventListener("mousemove", function(event) { resize_horizental(ui_main_o, ui_elem_o, grid_var_s, event, offset_i)} );
				}
				
				break;
			case "ui-function-menu":
				border_s = "border-top"
				grid_var_s = "--row_4_max";
				vertical_b = true;
				offset_i   = 70;
				handle_o.addEventListener("mousemove", function(event) { resize_veritcal(ui_main_o, ui_elem_o, grid_var_s, event, offset_i)} );
				break;
			case "ui-access-bar":
				border_s = "border-right";
				grid_var_s = "--col_1_max";
				vertical_b = false;
				handle_o.addEventListener("mousemove", function(event) { resize_horizental(ui_main_o, ui_elem_o, grid_var_s, event, offset_i)} );
				break;
			case "ui-common-tools":
				border_s = "border-bottom";
				grid_var_s = "--row_2_max";
				vertical_b = true;
				handle_o.addEventListener("mousemove", function(event) { resize_veritcal(ui_main_o, ui_elem_o, grid_var_s, event, offset_i)} );
				break;
			default:
				// statements_def
				console.error("Unexpected ui element");
				break;
		}
		// handle_o.addEventListener("mouseenter", resize_ui_drag_start.bind(null, resize_wrap_o, border_s ));
		handle_o.addEventListener("mousedown", resize_ui_drag_start.bind(null, resize_wrap_o, border_s ));
		handle_o.addEventListener("mouseup", resize_ui_drag_end.bind(null, resize_wrap_o, border_s ));
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
function resize_arg_veritcal(ui_main_o, ui_hierchy_o, ui_o, grid_var_s, mouse_o, offset_i){
		if ( DRAG_V_B === true){
		let new_size_i;
		let var_i;
		let elem_rect_o      = ui_o.getBoundingClientRect(); 
		let elem_hierarchy_o = ui_hierchy_o.getBoundingClientRect(); 
		let hierarchy_top_i  = elem_hierarchy_o.top 
		/* vertical element */
		var_i =  event.screenY + offset_i;
		new_size_i = elem_rect_o.bottom - var_i;
			// set new size
		/* negative value can occure when the mouse goes bellow the bounds of the window, small check to prevent that from happening and
		affecting the layout */
		//console.log("new size "+ new_size_i + " h top "+hierarchy_top_i);
		if ( new_size_i > 0 ){
			if(hierarchy_top_i > 70){
				ui_main_o.style.setProperty( grid_var_s, new_size_i + "px");
			}else{
				ui_main_o.style.setProperty( grid_var_s, new_size_i-10 + "px");
			}
			//console.log("ellement top "+elem_rect_o.top);			
		}
	}
}

function resize_veritcal(ui_main_o, ui_o, grid_var_s, mouse_o, offset_i){
	if ( DRAG_V_B === true){
		let new_size_i;
		let elem_rect_o = ui_o.getBoundingClientRect(); 
		/* vertical element */
		new_size_i = elem_rect_o.bottom - event.screenY + offset_i;
			// set new size
		/* negative value can occure when the mouse goes bellow the bounds of the window, small check to prevent that from happening and
		affecting the layout */
		if ( new_size_i > 0){
			console.log("ellement top "+elem_rect_o.top);
			if (grid_var_s === "row_arg_height"){

				// need to check that the size doesn't exeed the maximum window size
				if ( elem_rect_o.top  > 10 ){
					ui_main_o.style.setProperty( grid_var_s, new_size_i + "px");
				}
			}else{
			ui_main_o.style.setProperty( grid_var_s, new_size_i + "px");
			}
		}
	}
}
function resize_horizental(ui_main_o, ui_o, grid_var_s, mouse_o, offset_i){
	if ( DRAG_V_B === true){
		let new_size_i;
		let elem_rect_o = ui_o.getBoundingClientRect();
		/* vertical element */
		new_size_i =  elem_rect_o.right - event.screenX + offset_i;
			// set new size
		/* negative value can occure when the mouse goes bellow the bounds of the window, small check to prevent that from happening and
		affecting the layout */
		if ( new_size_i > 0){
			ui_main_o.style.setProperty( grid_var_s, new_size_i + "px");
		}
	}
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
			new_size_i = elem_rect_o.bottom - event.screenY + 35;
		}
		// set new size
		/* negative value can occure when the mouse goes bellow the bounds of the window, small check to prevent that from happening and
		affecting the layout */
		if ( new_size_i > 0){
		ui_main_o.style.setProperty( grid_var_s, new_size_i + "px");
		}
		//console.log("dragged, set new size " + new_size_i);
	}
}