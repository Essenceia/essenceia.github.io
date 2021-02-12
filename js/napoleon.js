

document.addEventListener("DOMContentLoaded", function(event) {

let arrow = document.getElementById("arrow-down");

// scroll the page down when we hover over the arrow
arrow.addEventListener("click", function( event ) {
	let target     = document.getElementById("scroll-target");
	let pos_target = target.offsetTop;
	window.scroll(0,pos_target);

});
});