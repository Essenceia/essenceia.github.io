// update an element with the new content of string
function updateTextTimeout(elem_o, new_txt_c){
	elem_o.textContent += new_txt_c;
};

function updateText(elem_o, new_txt_s, start_t_i){
	let t = start_t_i;
	 for (var i = 0; i < new_txt_s.length; i++) {
	 	t += 100;
   		setTimeout(updateTextTimeout.bind(null, elem_o, new_txt_s[i]) ,t);
 	}
 	return t;	
}