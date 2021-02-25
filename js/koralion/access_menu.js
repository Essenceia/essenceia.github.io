/* Access menu items are static, they are not created dynamically 
 init is used to bind the items to there handelers */

function init_access_menu(){
	let tmp_elem_o      = document.getElementsByClassName("ui-access-bar")[0];
	let access_menu_o_a = tmp_elem_o.querySelector(".toolbar");
	let elem_o;
	let i;
	for ( i = 0 ; i < access_menu_o_a.children.length ; i++ ){
		elem_o = access_menu_o_a.children[i];
		elem_o.addEventListener("click", fsm_access_bar_clicked.bind(null,elem_o.id));
	}
	fsm_access_bar_clicked("plane");
}