--- 
title: "Alibaba cloud FPGA: the bargain bin UltraScale+"
description: "Using a decomissioned Alibaba cloud accelerator card as an FPGA dev board"
summary: "No documentation, no problem!"
tags: ["fpga", "ebay", "debugging", "linux", "hacking"]
date: 2025-09-02
draft": true"
---

# Introduction

I like a good deal, demostrabily way more than the next person out there ( see d2020 article series ). 
Having recently left my very lucrative job in HFT, I was in the market for a new FPGA to keep working on. 

Due to the scale of my upcomming projects I knew I needed an Xilinx series 7 UltraScale+ FPGA of the Virtex or Kintex series. 
And due to not wanting to part ways with the eye watering amounts of money that is required for an Vivado entreprise edition license
my choice was effectively narrowed to two FPGA models : XCKU3P, XCKU5P. [1]

{{< figure
    src="xilinx_doc.png"
    alt="Xilinx supported boards per vivado edition" 
    caption="Xilinx supported boards per vivado edition" 
>}} 

As the `K` suggests in the chip name `XCK`, these are both of the Kintex series. 

# JTAG interface 

## FPGA board JLINK interface 

{{< figure 
    src="board_jtag_intf.svg"
    alt="very nice documentation of the board jtag pinout"
    caption="6 pin board jtag interface"
>}}

## Segger JLINK :heart: 

{{< figure 
    src="segger_jlink_conn.svg"
    alt="very nice 20 pin segger jlink pinnout interface documentation"
    caption="20 pin segger jlink pinnout"
    >}}

## Wiring

{{< figure
    src="jtag_wiring.svg"
    alt="very nice jtag wiring driagram to connect jlink jtag probe to fpga board"
    caption="wiring driagram to connect jlink jtag probe to fpga board"
>}}

[1] Xilinx Vivado Supported Devices : https://docs.amd.com/r/en-US/ug973-vivado-release-notes-install-license/Supported-Devices 



