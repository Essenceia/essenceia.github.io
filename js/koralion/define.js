/* constant for class names */
const _slider_field_s = "slider-field";
const _variadique_field_s = "select-variadique";
/* argument list, doesn"t include varaidique ! */
const _argument_s_a = [ _slider_field_s ];

const ARG_TYPE = {
	"slider" : "slider",
	"box"    : "box",
}

const RANGE_BOUND_TYPE = {
	"strict" : 0,  // eg : 4 elements
	//"range"  : 1,  // eg : between 1 and 3 included
	"lower_bounded" : 2, // eg : at least 4
}
const TypeEnum = {
  ROOT : 0,
  POINT: 1,
  LINE: 2,
  QUAD: 3,
  CUBE: 4,
  EXP : 5,
};
const TypeToString = [
  "root", // 0
  "point",// 1
  "line", // 2
  "quad", // 3
  "cude", // 4
  "exp",  // 5
];
const NULL_UID = -1;
const ROOT_UID =  0;

const h_ui_elem_o = {
	"sketch" : null,
	"gen" : null,
	"exp" : null
}