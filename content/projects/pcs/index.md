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
schematics with others.

### RTL

High level schematics.

#### RX

 
{{< figure
    src="pcs/10g_rx.svg"
    caption="10GBASE-R rx path, optional `xgmii interface`"
    alt="Svg schematic"
>}}


