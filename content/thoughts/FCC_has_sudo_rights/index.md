---
title: "FCC has sudo rights: new regulations on consumer routers"
date: 2026-07-20
description: ""
summary: ""
tags: ["fcc", "asic", "ethernet", "routers"]
draft: false
showTableOfContents: false
---

{{< alert icon="envelope" >}} 
I am not a lawyer, I am just a denizen of the internet trying to make sense of an evolving situation. If you spot an issue please [email me](mailto:julia.desmazes@gmail.com).  
{{< /alert >}} 

On March 23, 2026 the US Federal Communications Commission (FCC) made a decision that resonated throughout tech circles when they decided to include consumer foreign made routers on the [Covered List](https://www.fcc.gov/supplychain/coveredlist), 
with exception subject to conditional approval granted [by DoW or DHS](https://www.fcc.gov/supplychain/coveredlist#conditional-approvals). 

For the purposes of this article, we will put the question of the well founded nature of this decision in the "too hard" pile. 
{{< figure
src="feature_too_hard.jpg" 
caption="The **TOO HARD** pile. A mainstay of Warren Buffett's desk."
>}}

In this context, "foreign made" doesn’t simply refer to software, where the router was designed or final product assembly, but also to internal components, with [particular scrutiny being given to any "modular transmitter" components](https://www.law.cornell.edu/cfr/text/47/2.903). 

So although dumb components such as resistors, PCBs and casings don’t cause any issues ([unless they run at +9kHz and where made by entities on the covered list, eg: Huawei](https://docs.fcc.gov/public/attachments/DOC-422722A1.pdf)) the presence of any radio capable chip not designed and manufactured in the US puts you in the cross-hairs. 

Anyways, this development got me thinking: Is there even a single consumer-grade router that is manufactured and assembled in the United States, and includes silicon that is also designed and manufactured in the US ?

Actually, are there even any major consumer-grade networking equipment manufacturers still assembling routers in the United States apart from SpaceX?

And when the answer to these seemed to be "not really" my questions then evolved to: 

_What would it take to build such a chip entirely in the United States?_

At least there I can provide more concrete answers having personally tapped out twice on SkyWater 130nm ([digital hashing accelerator](https://talesonthewire.com/projects/blake2s_hashing_accelerator_a_solo_tapeout_journey/) and [analog design](https://talesonthewire.com/thoughts/broken_doc/)), which is a US based fab. Also, since SkyWater features on the US Department of War list of ["accredited suppliers"](https://www.acq.osd.mil/asds/dmea/tapo/docs/tp/Accredited-Supplier-List-29Jun2026.pdf) for its [Trusted Foundry Program](https://www.acq.osd.mil/asds/dmea/tapo/trusted-supplier-programs.html  ) it's unlikely to end up on the entity list any time soon. If it’s good enough for trusted military applications it's good enough for consumer grade routers. 

Then there is the question of tooling, and although the open source silicon implementation tools are maintained by a worldwide community, OpenROAD was initially [funded by DARPA](https://openroad.readthedocs.io/en/latest/).

As for the origin of the hardware design IP, just make it a greenfield project designed by only US based designers ? 

Now I doubt anyone is too concerned about the ability of existing major consumer router manufacturers to figure this out and get FCC approval for their next generation of devices. 

But the part of the ecosystem I imagine will be more affected is the smaller router manufacturers. 

And it is through this very question that was [opened the giant can of worms I am presently jumping into](/projects/ethernet_switch_asic/). 
