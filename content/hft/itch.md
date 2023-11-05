---
title: "ITCH"
date: 2023-10-03
description: "RTL implementation of the ITCH module."
summary: "Design of the ITCH module."
tags: ["FPGA", "HFT", "ITCH","Verilog", "TotalView"]
showTableOfContents : true
draft: false
---
## Introduction

`ITCH` is a message protocol used in the application layer of
financial exchanges that implement the `ITCH/OUCH` feeds.

It is part of the exchange's direct data feed, a low latency
feed between the exchange's servers and a client's trading infrastructure. 

{{< figure
    src="mold_network_stack.svg"
    alt=""
    caption="NASDAQ `ITCH` data feed network stack"
    >}}

This project is a synthesizable `Verilog` implementation of an `ITCH` protocol
message parser, used on the client end of the link.

Although multiple exchanges use `ITCH` in their data feeds, the format of these
messages varies. In order to reduce the amount of additional work required to
add support for new exchanges, the majority of this `RTL` is procedurally
generated.

By default this module supports `NASDAQ`'s `TotalView ITCH 5.0`
message format.

{{< github repo="Essenceia/ITCH" >}}

## ITCH 

The `ITCH` protocol is an integral part of the direct exchange data feed.
This protocol delineates a series of exchange-specific binary messages that
convey essential exchange status information, including the tracking of orders,
administrative messages, and exchange event notifications. It is exclusively
used for outbound market data feeds and does not support order entry.

The messages comprising the `ITCH` protocol are delivered via `MoldUDP64` packets,
which ensure proper sequencing and tracking.

It is important to note that there is no universal implementation of `ITCH`;
instead, each exchange defines its own message formats. For instance, `NASDAQ`'s
version of `ITCH` is known as `TotalView ITCH`, and the Australian Securities
Exchange (`ASX`) uses `ASX ITCH`.

### Message format

Messages are of defined length based on their `Message Type`. 

{{< alert "bell">}}
I will be using the `TotalView ITCH version 5.0` message format in the following examples.

The modules used in the following examples will utilize an `8`-byte payload with for `UDP->MoldUPD64`.
{{< /alert >}}

There is a predefined format for each `Message Type` with predefined fields. 

For example, the `System Event` message, used to signal a market or data feed
handler event, has a `Message Type` of `0x53` (`S` in ASCII), a total length of `12`
bytes, and follows the following format :

{{< figure
    src="itch/system_event_msg.svg"
    alt="example message"
    caption="`System Event` message format, part of `NASDAQ`'s `TotalView-ITCH` version `5.0`"
>}}

The fields can belong to one of the following four types :
- `Unsigned integer` : This is the most common type, used for message integer fields, and it is represented in big endian.
- `Price` : Integer fields that need to be converted to a fixed point decimal format.
    There are two sub-type for `Price`: `Price(4)` with `4` decimal places and
    `Price(8)` with `8`.
- `ASCII` : Text fields that are left-justified and padded on the right with spaces.
- `Timestamp` : A `6`-byte unsigned integer representing the number of nanoseconds elapsed since midnight.

## Automatic generation

Because there is no single `ITCH` protocol message format, and because the
`RTL` code for the decoder is painfully repetitive, I have decided to automatically 
generate the majority of the `Verilog` code for this module.


{{< figure
    src="itch/gen_flow.svg"
    alt=""
    caption="Generation flow from `XML` to `Verilog` module."
>}}


### XML

The `ITCH` message format is described in an `XML` file.

This `XML` file is also used to generate the code for the `C` `ITCH` library
associated with this project. This library is used in the `HFT` project's self-checking test bench
and in my custom tools.

The following is the description of the `System Event` message :

```xml
<Struct name="system_event" len="12" id="S" database="true">
    <Field name="message_type" offset="0" len="1" type="char_t"/>
    <Field name="stock_locate" offset="1" len="2" type="u16_t"/>
    <Field name="tracking_number" offset="3" len="2" type="u16_t"/>
    <Field name="timestamp" offset="5" len="6" type="u48_t"/>
    <Field name="event_code" offset="11" len="1" type="eSystemEvent"/>
</Struct>
```

- `Struct.name` : message type
- `Sturct.len` : total length in bytes of this message 
- `Struct.id` : ascii code for this message type
- `Struct.database` : identifies if we should include this `Struct` in our generation, currently unused
- `Field.name` : name of the field
- `Field.offset` : field start position, offset in bytes from the start of the message
- `Field.len` : length in bytes of this field
- `Field.type` : type of this field, unused by `ITCH` module, used by `C` libraries to indicate how to manipulate the data.

This `XML` was originally authored by the github user `doctorbigtime` for [his own message parser written in `Rust`](https://github.com/doctorbigtime/itch).
All credits for this `XML` belong to him.

### Python script

The `itch_msg_to_rtl.py` `Python` script reads this `XML`  and translates the
outlined message formats into `Verilog` code.

These generated sequences are then written into multiple `Verilog` files in the
`gen` folder.

### Include in module

Our main module assembles the code by using the `include` directive to include
the generated code files.

## Architecture

This module is a message decoder, internally it works by accumulating message bytes, identifying the
message type and routing the message field data to the wires associated with the message type.

{{< figure
    src="itch/arch.svg"
    alt=""
    caption="`ITCH` module overview. Inbound message bytes are sent from the `MoldUDP64` module, and its output is connected to the trading algorithm. The outbound `early` interface is optional."
>}}

Internally, the message decoder accumulates the message bytes
received from the `MoldUDP64` module into the internal `data_q` and `ov_data_q`
flops. The contents of the `data_q` flops are connected to the corresponding
outbound decoded message fields.

The number of bytes received for the current message is tracked by the
`data_cnt_q` counter. By examining the first byte of each message, we can
identify the `Message Type` and determine the number of expected bytes to
collect.

The cycle after the entire message has been received, the validity
signal on the `ITCH` outbound interface corresponding to this `Message Type`
is asserted.

### Overlap

I refer to an `overlap` as a case
where, from the perspective of the `MoldUDP64` module, the last bytes of a
message and the first bytes of a new message are transmitted within the same
`UDP->MoldUDP64` payload.

{{< figure
    src="mold_v3.1.svg"
    alt=""
     caption="Payload containing data of two messages, having its data split onto both outbound `MoldUDP64` interfaces. Because overlap only occurs when there is at least 1 byte of the previous message data in the payload, and the length field is 2 bytes, our overlap data is at most `N-3` bytes wide for a `N` byte payload."
    >}}

The **overlapping bytes** are the first bytes of this new message.
 
[Due to choices made regarding how to handle overlap
cases](/hft/moldudp64), the `ITCH` module has two inbound interfaces by which it
can accept new message bytes.

In order to avoid corrupting the value of the byte count `data_cnt_q` and the
flopped data `data_q` for the finishing message, data pertaining to these
overlapping bytes will be stored in dedicated flops `ov_data_q` and `ov_cnt_q`,
and merged with the remainder of its message in the following cycle.

### Interfaces

#### Input interfaces 

The inbound interface is connected to the `MoldUDP64` module and used to
receive message bytes.

{{< figure 
    src="itch/in_intf.svg" 
    alt=""
     caption=""
>}}
 
##### Message interface

The `message interface` is the standard interface used to transmit all
message bytes, with the exception of the overlapping bytes. 

```Verilog
input                  valid_i,
input                  start_i,
input [KEEP_LW-1:0]    len_i,
input [AXI_DATA_W-1:0] data_i,
```

- `valid_i` : signals the validity of data on this interface 
- `start_i` : signals the start of a new message
- `len_i` : length of the valid data in bytes
- `data_i` : data bytes

##### Overlap interface

The `overlap interface` is used exclusively for transmitting the
overlapping bytes. Due to the conditions in which an overlap occurs, there is
no need for a `start` signal, as the start is implied when we have a valid
overlap.

```Verilog
input                  ov_valid_i,
input [OV_KEEP_LW-1:0] ov_len_i,
input [OV_DATA_W-1:0]  ov_data_i,
```
 
- `ov_valid_i` : an overlap has occurred, data on this interface is valid. Implies the
    start of a new message
- `ov_len_i` : length of the valid data in bytes
- `ov_data_i` : overlapping bytes

#### Output interfaces

The output of this module is intended to be connected to a trading algorithm.

There are two output interfaces. The first is the standard output interface, which becomes valid
 once all the bytes of the message have been received. 

The second interface is optional, and is an early interface used to identify the type of
the message currently being received, and which message fields have received all
their data.

To include this interface, declare the `EARLY` macro. 

{{< figure
    src="itch/out_intf.svg"
    alt=""
    caption=""
>}}
 
##### Standard interface

Standard outbound decoder interface, contains fully decoded messages.

```Verilog
output logic itch_<message_type>_v_o,
output logic [<field length>-1:0] itch_<message_type>_<field_name>_o, 
...
output logic [<field length>-1:0] itch_<message_type>_<field_name>_o, 
```

- `itch_<message_type>_v_o` : valid signal, a message of `<message_type>` has
    been fully received
- `itch_<message_type>_<field_name>_o` : message field
 
##### Early interface

This optional `early` interface is used to start triggering decisions as soon as
individual data fields have been fully received, eliminating the need to wait for 
the complete reception of all the message bytes.

```Verilog
output logic itch_<message_type>_early_v_o,
output logic itch_<message_type>_<field_name>_early_v_o,
...
output logic itch_<message_type>_<field_name>_early_v_o,
```

- `itch_<message_type>_early_v_o` : valid signal, decoding a message of type `<message_type>`.
- `itch_<message_type>_<field_name>_early_v_o` : valid signal, all bytes of `<field_name>` have been
    received. When used, it should only be used when the associated early `<message_type>` valid signal is high.
    The field data bytes will be on the standard interface.

### Example

In the following example, the `ITCH` module with an `early` interface is
decoding two messages.  The first is a `21`-byte-long `Snapshot` message, and
the second is a `39`-byte-long anonymous `Add Order` message.

{{< alert "bell" >}}
All values are represented using hexadecimal with the exception of the data byte counter `data_cnt_q` in 
yellow that is using decimal.
{{< /alert >}}

{{< figure
    src="itch/snapshot.svg"
    alt=""
    caption="`Snapshot` message format, `Message Type=0x47`"
>}}

{{< figure
    src="itch/add_order_no_mpid.svg"
    alt=""
    caption="`Add Order` message format, `Message Type=0x41`"
>}}

Since our `Snapshot` message is `21` bytes long, and since, in our `MoldUDP64`
packet, there is a `2` bytes long lenght field before the start of each new
message's data bytes, the first byte of the `Add Order` message will overlap.  

{{< figure
    src="itch/ov_wave.svg"
    alt=""
    caption="Last bytes of the `Snapshot` message and the first byte of the `Add Order` message are overlapping within an `8` byte payload."
>}}

Due to this, the start of the `Add Order` message will be sent through the
overlap interface.  We can observe that the `data_cnt_q` counter will delay
accounting for this overlapping byte by one cycle, giving us the needed time to finish
processing the previous `Snapshot` message.

{{< figure
    src="itch/wave.png"
    alt=""
    caption="Wave view of the `ITCH` module behavior including the optional `early` interface."
>}}


## Resources

[ASX Trade ITCH Specification](https://www.asxonline.com/content/dam/asxonline/public/documents/asx-trade-refresh-manuals/asx-trade-itch-message-specification.pdf) 

