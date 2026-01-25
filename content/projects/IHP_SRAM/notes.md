Power connection wasn't being made. 
I am using the default hierarchical macro instegration. 
My design's main power is on TopMetal1, and I was expecting SRAM power ports to be on layer N-1, so Metal5. 
Yet looking at the SRAM macro lef file shows me that power is actually expected on Metal4. 
https://github.com/IHP-GmbH/IHP-Open-PDK/blob/a2bf8ea81aee7d0fcdd6d62168edca0d7d0bcb08/ihp-sg13g2/libs.ref/sg13g2_sram/lef/RM_IHPSG13_1P_256x8_c3_bm_bist.lef#L146C1-L153C8

Good problem to have, since this means I can integreate SRAM as a 2 layer deep macro, problem is not: how do I drop the expected power grid one more layer ? 

Currently the OpenROAD power delievery network grid builder doesn't find the pad: 
```
[09:20:27] WARNING  [PDN-0232] The grid "macro - m_ihp_sram" (Instance) does not contain any shapes or vias.                                                                                                                                                       openroad.py:297
[09:20:27] ERROR    [PDN-0233] Failed to generate full power grid.  
```

This is only made more puzzling to me as I think I am already creating a connection: 
```
            add_global_connection \
                -net $power_net \
                -inst_pattern $instance_name \
                -pin_pattern $power_pin \
                -power
```
Global connection might not mean what I think it means... 


I asked for help un-stupidding myself on the Tiny Tapeout discord and tnt jumped in pointing me to this missmatch in power connection layers. 
Then mole99 also dropped by and pointed me to the crown jewel I was looking for: an example of an full IHP chip (using the new librelane chip flow) that just so happened to be using the SAME SRAM MACRO !!!! 
Alright, calm my exitement, not exactly the same macro, but of the same family, aka: Close enogth !  

And guess what, he has a custon PDN tcl script for setting the power delivery to these STAM MACROS, which I will now proceed to unshamfully wripe off. 
https://github.com/IHP-GmbH/ihp-sg13g2-librelane-template/blob/da17746e19984826dd780ce778b6bb40dbf54544/librelane/config.yaml#L196


Oh yeah baby, here we go! We have found the magical missing ingrediant: 
```tcl
define_pdn_grid \
    -macro \
    -instances "\
    i_chip_core.sram_0" \
    -name sram_NS \
    -starts_with POWER

add_pdn_stripe \
    -grid sram_NS \
    -layer Metal5 \
    -width 2.81 \
    -pitch 11.24 \
    -offset 2.81 \
    -spacing 2.81 \
    -nets "VSS VDD" \
    -starts_with POWER

add_pdn_connect \
    -grid sram_NS \
    -layers "Metal4 Metal5"
add_pdn_connect \
    -grid sram_NS \
    -layers "Metal5 TopMetal1"
```
So what is this party all about ? 

#### Adding a new power grid 


```
define_pdn_grid \
    -macro \
    -instances "\
    i_chip_core.sram_0" \
    -name sram_NS \
    -starts_with POWER
```
