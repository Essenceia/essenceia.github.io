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

This project aims to implement the Ethernet physical layer for 10Gb and 40Gb fiber optics links.

This post is a work in progress and currently used as means to share
schematics.

{{< github repo="essenceia/ethernet-physical-layer" >}}

## Architecture

### PCS 

High level schematics and design considerations for the 10GBASE-R and 40GBASE-R RX and TX PCSs.

#### 10G RX

##### **Vanilla** 
 
{{< figure
    src="pcs/10g_rx.svg"
    caption="10GBASE-R RX path, optional `xgmii interface`"
    alt="Svg schematic"
>}}

##### **Optional CDC**

The CDC is optional. We can configure the design in two ways :

- Without CDC : Reduce latency for our latency optimized designs as we could to get away without having different clock frequencies.
    Instead, we would simply need to compensate the de-phasing between the SerDes derived clock and the rest of the
    design also running at 161.13MHz. 
    On the flip is all the downstream design I would need to support invalid
    data one cycle every 32 cycles. Because of this we also need to a `signal_ok` signal along side the
    data to help differentiate a cycle with no data and a signal loss. 

- For the default implementation we would still be able to include the optional CDC and allow you to 
    have different clock frequencies and thus not need to support invalid data cycles.


{{< figure
    src="pcs/10g_rx_v2.svg"
    caption="10GBASE-R RX path, optional `xgmii interface` and `CDC`"
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


#### 40G RX

Because I need all lanes to be predictably valid at the same cycle to complete the
descrambling I cannot have a design with an optional CDC.
This is made less consequential as I do not have low latency requirements for the 40GBASE-R PCS.

{{< figure
    src="pcs/40g_rx.svg"
    caption="40GBASE-R RX path, optional `xgmii interface`"
    alt="Svg schematic"
>}}


#### 40G TX

Each lane `SerDes` block is driven by the common 161,13MHz clock coming from the PCS.

All lanes are in sync with one another, so are the gearboxes.
Thus each one should be ready to accept a new 66b data block every cycle.

The ability to accept a new data block is signaled by the gearboxes using the `ready` signal.
Since they are all in sync, all those `ready` signals should have the same value.
Thus we can connect any of those to the CDC.

{{< figure
    src="pcs/40g_tx.svg"
    caption="40GBASE-R TX path, all SerDes blocks are clocked from the same 161.13MHz clock coming from the PCS, optional `xgmii interface`"
    alt=""
    >}}

### Testing

#### 10G PCS loopback

**Clock** 

{{< figure
    src="pcs/clk_loopback_10g.svg"
    caption="Clock framework overview"
    alt=""
    >}}

**Reset**

The reset signal for the PCS modules is controlled by a reset controller that
keeps the logic in reset until all `PLL`s and `SerDes`s have achieved lock.

This reset controller runs at a frequency of `50MHz`, so we first need to
synchronize it with the RX PCS domain. The resulting signal is `nreset`, 
which is used to reset the RX PCS.

The reset signal for the TX PCS is driven by the `pcs_loopback module`. 
This module compensates for the phase difference between both PCS clocks while also
introducing an essential additional cycle delay. This synchronization ensures
that both PCS gearboxes are aligned concerning when the RX PCS sends valid data and
when the TX PCS is ready to accept new data.

{{< figure
    src="pcs/reset_loopback_10g.svg"
    caption="PCS modules reset signals overview."
    alt=""
    >}}



