const na_txt_s               = "Krestel";
const bottom_line_header_s   = "A minimalist kernel";
const bottom_line_s          = " made in pure C99";


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

document.addEventListener("DOMContentLoaded", function(event) {
	let t;

	let arrow = document.getElementById("arrow-down");
	// scroll the page down when we hover over the arrow
	arrow.addEventListener("click", function( event ) {
		let target     = document.getElementById("scroll-target");
		let pos_target = target.offsetTop;
		window.scroll(0,pos_target);

	});

	// text type animation
	const na_txt_o = document.getElementById("na-txt");
	const blh_o    = document.getElementById("bottom-line-header");    
	const bl_o     = document.getElementById("bottom-line"); 

	t = updateText(na_txt_o, na_txt_s, 0);
	t = updateText(blh_o, bottom_line_header_s,t);
	t = updateText(bl_o, bottom_line_s,t);
});