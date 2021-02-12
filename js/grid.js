// goal of this code : change the text written in the grid in an animated manner


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

const top_txt_s    = "The work";
const top_sym_s    = "➔";
const side_txt_s   = "is going to be";
const bottom_txt_s = "a long journey but";
const bottom_sym_s = "■";
const tall_txt_s   = "it will be worth it";

document.addEventListener("DOMContentLoaded", function(event) {
	let t;
	const top_txt_o     = document.getElementById("top-line");
	const top_sym_o     = document.getElementById("top-line-symbole");
	const side_txt_o    = document.getElementById("side-line");
	const bottom_txt_o  = document.getElementById("bottom-line");
	const bottom_sym_o  = document.getElementById("bottom-line-symbole");
	const tall_txt_o    = document.getElementById("tall-line");

	t = updateText(top_txt_o, top_txt_s, 0);
	t = updateText(top_sym_o, top_sym_s, t);
	t = updateText(side_txt_o, side_txt_s, t);
	t = updateText(bottom_sym_o, bottom_sym_s, t);
	t = updateText(bottom_txt_o, bottom_txt_s, t);
	t = updateText(tall_txt_o, tall_txt_s, t);
});

