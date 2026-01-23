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
