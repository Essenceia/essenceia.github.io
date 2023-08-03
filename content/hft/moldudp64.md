---
title: "MoldUDP64"
date: 2023-08-02
description: "RTL implementation of the MoldUDP64 module."
summary: "Discussing the design of the current MoldUDP64 module."
tags: ["FPGA", "HFT", "moldudp64","verilog"]
draft: true
---
# Introduction

MoldUDP64 is networking protocol used in the NASDAQ ITCH market data feed.
It is build on top of UDP and it's output feed's into the ITCH layer.
As such, of my NASDAQ HFT project I needed to implement MoldUDP64.

{{< figure
    src="mold_network_stack.svg"
    alt=""
    caption="NASDAQ ITCH data feed network stack"
    >}}

# MoldUDP64


Each client obtaines the data feed from a NASDAQ server via UDP multicast.

Each packet is only transmitted once and if a client misses a packet it needs to
detect this itself and make a re-transmission request to a different re-request NASDAQ server.
This server will send the missing packet via UDP unicast.

{{< figure
    src="mold_hw.svg"
    caption="hw overview"
    >}}

## Payload format

The MoldUPD64 packet was designed with the requirement of efficiency in mind and with minimal overhead.

{{< figure 
    src="mold_packet.png"
    caption="MoldUDP64 packet"
    >}}

## Header

Each packet header contains a 10 byte `session id`, an 8 byte `sequence number` and a 2 byte `message count`.

{{< figure
    scr="mold_header.svg"
    caption="MoldUDP64 packet header"
    >}}

## Messages

Internally this packet can contain multiple messages of variable length.
Each of these message will contain an ITCH messages.


# Implementation

## The length field issue

## Message overlap 

### Version 1

### Version 2

### Version 3


# Conclusion

# Ressources

[NASDAQ MoldUDP64 v1.0 specification](http://nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/moldudp64.pdf) 


