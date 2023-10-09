---
title: "TotalView-ITCH"
date: 2023-10-09
description: "RTL implementation of the ITCH module."
summary: "Design of the ITCH module."
tags: ["FPGA", "HFT", "ITCH","verilog", "TotalView"]
showTableOfContents : true
draft: true
---
## Introduction

This project is a synthesizable verilog implementation of an `ITCH` message
parser involved in receiving exchange data feeds.
 
The majority of this RTL is automatically generated
to efficiently change message formats for supporting different
exchanges.

By default this module supports `NASDAQ`'s `TotalView ITCH 5.0`
message format.

{{< github repo="Essenceia/ITCH" >}}

## ITCH

`ITCH` is a series of sequenced message formats used to enable
the tracking of the status of an order from the time it is first 
entered until the time it is either
executed or cancelled. Administrative and exchange event messages also exist.

There is no single implementation of `ITCH` but rather each exchange defines there own
messages:`NASDAQ`s flavor of `ITCH` is called `TotalView ITCH` and `ASX` the Australian Securities
Exchange uses `ASX ITCH`.



### Message formats

## Automatic generation

Currently this project implements `NASDAQ`'s `TotocalView ITCH` version `5.0`,
This project is a generic implementation of `ITCH` and all exchange specific code
is automatically generated making it simple to support additional exchanges.


## Architecture

## Resources

[ASX Trade ITCH Specification](https://www.asxonline.com/content/dam/asxonline/public/documents/asx-trade-refresh-manuals/asx-trade-itch-message-specification.pdf) 

