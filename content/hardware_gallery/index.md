---
title: "Hardware Gallery"
date: 2023-08-02
description: "Hardware project gallery, showcase of custom ASIC and PCB projects."

showAuthor : false
showDate : false
showDateUpdated : false
showPagination : false
showReadingTime : false
showTaxonomies : false 
showWordCount : false
showSummary : false
sharingLinks : false
showHeadingAnchors : true
showTableOfContents : false

---

<style> 
section > .max-w-fit {
	max-width: none;
	width: 100%;
}
.article-content.max-w-prose {
	max-width: none;
	width: 100%;
}
</style> 

{{< gallery >}}
{{< figure
	src="pcb_cob_76_56_1.jpg"
	caption="Chip-on-Board test PCBs for 56 and 76 pin parts with coin for scale." 
>}}
{{< figure
	src="tap/tap_v1.png"
	caption="Flex PCB for an \"Taped-Automatic Assembly\" like ASIC packaging. Targetting the 56 pin ASIC switch chip."
	figureClass="grid-w100 xl:grid-w50"
>}}
{{< figure
	src="gf0p2_chip.jpg"
	caption="ASIC chip containing the first generation systolic array."
	figureClass="grid-w100 xl:grid-w50"
>}}
{{< figure
	src="biscotti_v1.jpg"
	caption="Single Ethernet connector Pmod test PCB, assembly in process."
	figureClass="grid-w100 xl:grid-w50"
>}}
{{< figure
	src="biscotti_v1_1.jpg"
	caption="Single Ethernet connector Pmod test PCB mounted."
	figureClass="grid-w100 xl:grid-w50"
>}}
{{< figure
	src="expresso.png"
	caption="Full ASIC chip featuring a 4-port 100Mbps Ethernet switch and a beacon broadcasting over the local network. Tape-out number 10, targetting the gf180mcuD node, 1.94mm×2.53mm die area, 56 pins." 
>}}
{{< figure
	src="beacon.png"
	caption="[Ethernet Beacon broadcasting over 100Mbps Ethernet. Tapeout-number 9, targetting the gf180 node .](/projects/until_heat_death_do_us_part/)"
>}}
{{< figure
	src="teapot.png"
	caption="Accelerator wrapper for interfacing over 100Mbps Ethernet. Tape-out number 6, targetting the gf180mcuD node."
	figureClass="grid-w100 xl:grid-w50"
>}}
{{< figure 
	src="sram_test.png"
	caption="Test design for the OCD 256x8 SRAM macro. Tape-out number 8, targetting the gf180."
	figureClass="grid-w100 xl:grid-w50"
>}} 
{{< figure
	src="switch_tt_v1.png"
	caption="[3-port 100Mbps Ethernet Switch. Tape-out number 7, targetting the gf180mcuD node.](/projects/ethernet_switch_asic/)"
>}}

{{< figure
	src="analog_oscillator.png"
	caption="[Analog 33Mhz oscillator. Tape-out number 5, targetting the sky130A node.](thoughts/broken_doc/)"
>}}
{{< figure
	src="systolic_array_v2.png"
	caption="[Second generation systolic array, using custom designed bfloat16 floating point math with full DFT infrastrucutre including scan-chains accessible over JTAG. Tape-out number 3, targetting the ihp130g2 node.](projects/floating_dragon/)"
>}} 
{{< figure
	src="fast_mul.png"
	caption="[Frequency optimized custom bfloat16 multiplier. Tape-out number 4, targetting the ihp130cmos5l node.](projects/floating_dragon/)"
	figureClass="grid-w100 xl:grid-w50"
>}} 
{{< figure
	src="systolic_array_v2.gif"
	caption="[Initial global placement of the second generation systolic array. Tape-out number 3, targetting the ihp130g2 node.](projects/floating_dragon/)"
	figureClass="grid-w100 xl:grid-w50"
>}} 

{{< figure
	src="systolic_array_v1.png"
	caption="[Silicon Proven at A0. First generation systolic array, using signed integers with in silicon debug infrastrucutre accessible over JTAG. Tape-out number 2, targetting the gf180mcuD node.](projects/two_weeks_until_tapeout/)"
>}} 
{{< figure
	src="blake2s.png"
	caption="[BLAKE2s hashing accelerator. Tape-out number 1, targetting the sky130A node .](projects/blake2s_hashing_accelerator_a_solo_tapeout_journey)"
>}}

{{< figure
	src="anniversary_devboard.jpg"
	caption="[Custom STM32H7 development board designed as a 10 year anniversary present.](/projects/dev_board/)"
>}}
{{< /gallery >}}
