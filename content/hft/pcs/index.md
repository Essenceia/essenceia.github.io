---
title: "Ethernet 10GBASE-R and 40GBASE-R PCS"
date: 2023-10-02
description: ""
summary: "RTL implementation of the Ethernet Physical Coding Sublayer (PCS) for 10Gb and 40Gb fiber optics."
tags: ["rtl", "network", "ethernet", "verilog", "systemverilog"]
sharingLinks : false
showTableOfContents : true
draft: false
---

## Introduction

This project aim's to implement the Ethernet physical layer for 10Gb and 40Gb fiber optics links.

This post is a work in progress and currently used as means to more easily share
schematics.

### Architecture

High level schematics and design considerations for the 10GBASE-R and 40GBASE-R RX and TX PCSs.

#### 10G RX

##### **Vanilla** 
 
{{< figure
    src="pcs/10g_rx.svg"
    caption="10GBASE-R RX path, optional `xgmii interface`"
    alt="Svg schematic"
>}}

##### **Optional CDC**

The CDC would be optional, this would make this design better optimized for low latency.

-  Reduce latency for our latency optimized designs as we could to get away without having different clock frequencies.
    Instead, we would simply need to compensate the de-phasing between the SerDes derived clock and the rest of the
    design also running at 161.13MHz. On the flip is all the downstream design I would need to support invalid
    data one cycle every 32 cycles.

- For the default implementation we would still be able to include the optional CDC and allow you to 
    have different clock frequencies and thus not need to support invalid data cycles.


{{< figure
    src="pcs/10g_rx_v2.svg"
    caption="10GBASE-R RX path, optional `xgmii interface` and `CDC`"
    alt="Svg schematic"
>}}

#### 40G RX

Because we need all lanes to be predictably valid at the same cycle to complete the
descrambling I cannot have an design with an optional CDC.
This is made less consequential as my objective with the 40GBASE-R PCS is not to optimize it 
for low latency.

{{< figure
    src="pcs/40g_rx.svg"
    caption="40GBASE-R RX path, optional `xgmii interface`"
    alt="Svg schematic"
>}}


#### 10G TX

I have decided to select the design with the optional CDC for 10G.
##### **Optional CDC**

{{< figure
    src="pcs/10g_tx.svg"
    caption="10GBASE-R TX path, optional `xgmii interface` and `CDC`"
    alt="Svg schematic"
>}}




