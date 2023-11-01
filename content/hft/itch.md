---
title: "ITCH"
date: 2023-01-10
description: "RTL implementation of the ITCH module."
summary: "Design of the ITCH module."
tags: ["FPGA", "HFT", "ITCH","verilog", "TotalView"]
showTableOfContents : true
showSummary: True
draft: true
---
## Introduction

`ITCH` is a message format used in the application layer of
financial exchanges direct data feed. 

{{< figure
    src="mold_network_stack.svg"
    alt=""
    caption="NASDAQ `ITCH` data feed network stack"
    >}}


This project is a synthesizable Verilog implementation of an `ITCH` message
parser used on the receiving end of the exchange  data feeds.
 
Although multiple exchanges use `ITCH` in there datafeeds the
format of these messages vary.
The help quickly add support for different exchanges, the majority of this RTL
is automatically generated to support differnt message formatss.

By default this module supports `NASDAQ`'s `TotalView ITCH 5.0`
message format.

{{< github repo="Essenceia/ITCH" >}}

## ITCH

The `ITCH` protocol is part of the native exchange data feed. 
It is series of binary messages conveying the tracking of the 
status of an order from the time it is first entered until the 
time it is either executed or canceled.
Administrative and exchange event messages also exist.
It is used for outbound market data feed only, the protocol does not support order entry.

The messages that make up the ITCH protocol are delivered by
`MoldUDP64` packets, it takes care of sequencing and delivery guarantee

There is no single implementation of `ITCH` but rather each exchange defines their own
message formats:`NASDAQ`s flavor of `ITCH` is called `TotalView ITCH` and `ASX` the Australian Securities
Exchange uses `ASX ITCH`.

### Message format

Messages are of variable in length based on the `Message Type`. 

{{< alert "bell">}}
I will be using the `TotalView ITCH version 5.0` message format in the following examples.
{{< /alert >}}

There is a pre-defined format per `Message Type` with a fixed length fields and pre-defined filed.
For examples, the `system event` message used to signal a market or data feed handler event
 has the `Message Type = 0x53`, a total lenght of `12` Bytes and the following format :
{{< figure
    src="itch/system_event_msg.svg"
    alt="example message"
    caption="Illustrative example of the `ITCH` message format: `NASDAQ` system event message."
>}}

The fields can be of the one of the following four types :
- `Unisigned integer` : most common type, used for message integer fields, encoded in big endian
- `Price` : Integer fields, need to be converted to a fixed point decimal format.
    There are two sub-type for `Price`, `Price(4)` with `4` decimal places and `Price(8)` with `8`.
- `ASCII` : text is left justified and padded on the right with space 
- `Timestamp` : `6` byte unsigned integer, represents nanoseconds elapsed since midnight

## Automatic generation

Because there is no single `ITCH` protocol message format, and because the
`RTL` code for the decoder is painfully repetitive  I have decided to automatically 
generate the majority of the `verilog` code for this module.

The `ITCH` message format is described in an `xml` file, a `Python` script then 
translates this outlined format into the necessary `verilog` code.
These generated sequences are then written to an file and reincluded into the module at there rightful place.

{{<figure
    src="itch/gen_flow.svg"
    alt=""
    caption="Generation flow from `XML` to `Verilog` module."
>}}

This `XML` was originally written by github user `doctorbigtime` for [his own message parser written in `Rust`.](https://github.com/doctorbigtime/itch).
All credit regarding this `XML` bellong to him.

## Architecture

Internally the message decoder works by accumulating message bytes into flops.
The contents of the fifo are wired to the corresponding message field's output.

Once the entirety of the message has been received, it activated the valid signal corresponding to the message
type.

The number of bytes recieved for each given message is tracked by the `data_cnt_q`.
Using the first byte of each message we identify the `Message Type` deduce on that define
the number expected bytes.

### Input interfaces 

I refert to an *overlap* as cases where, from the perspective of the `MoldUDP64` module,
the last bytes of a message and the first bytes of a new message are transmitted
whitin the same cycle.
The *overlapping bytes* are the first bytes of this new message.
 
[Due the manner in which I have decided to support these overlap cases](/hft/moldudp64) the `ITCH` module
has two buses by which it can accept new message bytes.

#### Standard interface

The standard interface is used to transmit all message bytes with the exeption of the
overlapping bytes. 
```verilog
input                  valid_i,
input                  start_i,
input [KEEP_LW-1:0]    len_i,
input [AXI_DATA_W-1:0] data_i,
```

- `valid_i` : data on this interfance is valid. 
- `start_i` : start of a new message
- `len_i` : length of the valid data in bytes
- `data_i` : data bytes

#### Overlap interface

The interface used for transmitting only the overlapping bytes, due to the
conditions in which and overlap occures there are allways the first bytes
in a new message.

```verilog
input                  ov_valid_i,
input [OV_KEEP_LW-1:0] ov_len_i,
input [OV_DATA_W-1:0]  ov_data_i,
```
 
- `ov_valid_i` : an overlap has occured, data on this interface is valid, implies the
    start of a new message
- `ov_len_i` : length of the valid data in bytes
- `ov_data_i` : overlapping bytes

s where the last bytes of a
message and the first bytes of a new message are transmitted to the `MoldUPD64` module
whitin the same cycle, we have
`ITCH` messages 
decisions made for supporting overlaping messages in the `MoldUPD64` module

### Output interfaces

The output of this module is meant to connect to the trading algorythme module.
There are two output interaces, one is the standard output interface that activates once
all the bytes of the message has been received. 

The second optional, and is an early interface used to indetify the type of the message
currently being received and what message fields have received all there data.

To include this interface, declare the `EARLY` macro. 
 
#### Standard interface

Standard outbound decoder interface, contains recently decoded message.

```verilog
output logic itch_<message_type>_v_o,
output logic [<field length>-1:0] itch_<message_type>_<field_name>_o, 
...
output logic [<field length>-1:0] itch_<message_type>_<field_name>_o, 
```

- `itch_<message_type>_v_o` : valid signal, a message of `<message_type>` has
    been fully received
- `itch_<message_type>_<field_name>_o` : message field
 
#### Early interface

This optional `early` interface is used to start triggering decisions as soon as
individual  data fields have been completely received without the need to wait for 
all of the complete reception of all the message bytes.

```verilog
output logic itch_<message_type>_early_v_o,
output logic itch_<message_type>_<field_name>_early_v_o,
...
output logic itch_<message_type>_<field_name>_early_v_o,
```

- `itch_<message_type>_early_v_o` : valid signal, decoding a message of type `<message_type>`.
- `itch_<message_type>_<field_name>_early_v_o` : valid signal, all bytes of `<field_name>` have been
    received, when used it should be paied with the early `<message_type>` signal.
    The field bytes will be on the standard interface.

## Resources

[ASX Trade ITCH Specification](https://www.asxonline.com/content/dam/asxonline/public/documents/asx-trade-refresh-manuals/asx-trade-itch-message-specification.pdf) 

