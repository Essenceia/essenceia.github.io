---
title: "ITCH"
date: 2023-10-03
description: "RTL implementation of the ITCH module."
summary: "Design of the ITCH module."
tags: ["FPGA", "HFT", "ITCH","verilog", "TotalView"]
showTableOfContents : true
showSummary: True
draft: true
---
## Introduction

`ITCH` is a message protocol used in the application layer of
financial exchanges that implement the `ITCH/OUCH` feeds.
It is part of the exchanges direct data feed: a low latency
feeds between the exchange's servers and a client's trading infrastructure. 

{{< figure
    src="mold_network_stack.svg"
    alt=""
    caption="NASDAQ `ITCH` data feed network stack"
    >}}

This project is a synthesizable Verilog implementation of an `ITCH` protocol
message parser used on the receiving end of the link.
 
Although multiple exchanges use `ITCH` in there datafeeds the
format of these messages vary.
In order to require less additional work to add support for new exchanges, 
the majority of this RTL is automatically generated.

By default this module supports `NASDAQ`'s `TotalView ITCH 5.0`
message format.

{{< github repo="Essenceia/ITCH" >}}

## ITCH

The `ITCH` protocol is part of the direct exchange data feed. 
The protocol outlines a series of exchange specific binary messages conveying exchange
status information such as the tracking of order
to administrative and exchange event messages.
It is used for outbound market data feed only, the protocol does not support order entry.

The messages that make up the `ITCH` protocol are delivered by
`MoldUDP64` packets, these provide sequencing and tracking.

There is no single implementation of `ITCH` but rather each exchange defines their own
message formats:`NASDAQ`s flavor of `ITCH` is called `TotalView ITCH` and `ASX` the Australian Securities
Exchange uses `ASX ITCH`.

### Message format

Messages are of defined length based on there `Message Type`. 

{{< alert "bell">}}
I will be using the `TotalView ITCH version 5.0` message format in the following examples.

The modules used in the following examples will be using an `UDP->MoldUPD64` payload width of `8` Bytes.
{{< /alert >}}

There is a pre-defined format per `Message Type` pre-defined fileds.
For examples, the `System Event` message used to signal a market or data feed handler event
 has the `Message Type = 0x53`(`S` in ascii), a total length of `12` Bytes and uses the following format :
{{< figure
    src="itch/system_event_msg.svg"
    alt="example message"
    caption=`System Event` message formal, part of `NASDAQ`'s `TotalView-ITCH` version `5.0`"
>}}

The fields can be of the one of the following four types :
- `Unisigned integer` : most common type, used for message integer fields, big endian.
- `Price` : Integer fields, need to be converted to a fixed point decimal format.
    There are two sub-type for `Price`, `Price(4)` with `4` decimal places and `Price(8)` with `8`.
- `ASCII` : text is left justified and padded on the right with space.
- `Timestamp` : `6` byte unsigned integer, represents nanoseconds elapsed since midnight.

## Automatic generation

Because there is no single `ITCH` protocol message format, and because the
`RTL` code for the decoder is painfully repetitive  I have decided to automatically 
generate the majority of the `verilog` code for this module.


{{<figure
    src="itch/gen_flow.svg"
    alt=""
    caption="Generation flow from `XML` to `Verilog` module."
>}}


### XML

The `ITCH` message format is described in an `xml` file.

This `xml` is also used for generating the code for the `C` `ITCH` library
associated for with this project. This library is used in the `HFT` project's self checking test bench
and in my custom tools.

The following is the description of the `system event` message :

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
- `Struct.id` : asscii code for this message type
- `Struct.database` : identifies if we should include this `Struct` in our generation, currently unused
- `Field.name` : name of the field
- `Field.offset` : field start position, offset in bytes from the start of the message
- `Field.len` : length in bytes of this field
- `Field.type` : type of this field, unused by `ITCH module`, used by `C` library to indicate how to manipulate the data.

This `XML` was originally written by github user `doctorbigtime` for [his own message parser written in `Rust`](https://github.com/doctorbigtime/itch).
All credit for this `xml` belong to him.

### Python script

The `itch_msg_to_rtl.py` `Python` script will then read this `xml`  
and translates the outlined message formats into the necessary `verilog` code.

These generated sequences are then written into multiple `verilog` file in the `gen` folder.

### Include in module

Our main module assembles the code by using the `\`include` directive to include the generated
code files.

## Architecture

This module is a message decoder, internally it works by accumulating message bytes, identifying the
message type and routing the message field data to the wires associated with the message type.

{{< figure
    src="itch/arch.svg"
    alt=""
    caption="`ITCH` module overview. Inbound message bytes are sent from the `MoldUDP64` module and it's output is connected to the trading algorithm. The outbound `early` interface is optional."
>}}

Internally the message decoder works by accumulating into the message bytes transmited from the `MoldUPD64`
module into the `data_q` and `ov_data_q` flops. The contents of the `data_q` flops is wired to the corresponding outbound message field's.

The number of bytes recieved for the current message is tracked by the `data_cnt_q` counter.
Using the first byte of each message we identify the `Message Type` and can deduce
the number of bytes to gather.

The cycle after the entirety of the message has been received, it activats the valid signal for this message
type.

### Overlap

I refert to an `overlap` as cases where, from the perspective of the `MoldUDP64` module,
the last bytes of a message and the first bytes of a new message are transmitted
whitin the same `UDP->MoldUPD64` payload.

{{< figure
    src="mold_v3.1.svg"
    alt=""
     caption="Payload containing data of two messages, having its data split onto both outbound `MoldUDP64` interfaces. Because overlap only occurs when there is at least 1 byte of the previous message data in the payload, and the length field is 2 bytes, our overlap data is at most `N-3` bytes wide for a `N` byte payload."
    >}}

The **overlapping bytes** are the first bytes of this new message.
 
[Due to choices made in regards to the manner in which I support overlap cases](/hft/moldudp64) the `ITCH` module
has two inbound interfaces by which it can accept new message bytes.

In order to not corrupt the value of the byte count `data_cnt_q` and the flopped data `data_q` for the finishing message, data pertaining
to these overlapping bytes will be stored in dedicated flops `ov_data_q` and `ov_cnt_q` and merged with the remainder of it's message
in the following cycle.

### Interfaces

#### Input interfaces 

The inbound interface is connected to the `MoldUDP64` module and used to received message bytes.

{{< figure
    src="itch/in_intf.svg"
    alt=""
    caption=""
>}}
 
##### Message interface

The `message interface` is the standard interface used to to transmit all message bytes with the exeption of the
overlapping bytes. 

```verilog
input                  valid_i,
input                  start_i,
input [KEEP_LW-1:0]    len_i,
input [AXI_DATA_W-1:0] data_i,
```

- `valid_i` : data on this interfance is valid. 
- `start_i` : signals the start of a new message
- `len_i` : length of the valid data in bytes
- `data_i` : data bytes

##### Overlap interface

The `overlap interface` is used for transmitting only the overlapping bytes, due to the
conditions in which and overlap occures there is no need for a `start` signal as 
the start is implied when we have a valid overlap.

```verilog
input                  ov_valid_i,
input [OV_KEEP_LW-1:0] ov_len_i,
input [OV_DATA_W-1:0]  ov_data_i,
```
 
- `ov_valid_i` : an overlap has occured, data on this interface is valid, implies the
    start of a new message
- `ov_len_i` : length of the valid data in bytes
- `ov_data_i` : overlapping bytes

#### Output interfaces

The output of this module is meant to connect to a trading algorithm.

There are two output interaces, one is the standard output interface that activates once
all the bytes of the message has been received. 

The second is optional, it is an early interface used to idnetify the type of the message
currently being received and which message fields have received all there data.

To include this interface, declare the `EARLY` macro. 

{{< figure
    src="itch/out_intf.svg"
    alt=""
    caption=""
>}}
 
##### Standard interface

Standard outbound decoder interface, contains fully decoded messages.

```verilog
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
individual  data fields have been completely received skipping the need to wait for 
complete reception of all the message bytes.

```verilog
output logic itch_<message_type>_early_v_o,
output logic itch_<message_type>_<field_name>_early_v_o,
...
output logic itch_<message_type>_<field_name>_early_v_o,
```

- `itch_<message_type>_early_v_o` : valid signal, decoding a message of type `<message_type>`.
- `itch_<message_type>_<field_name>_early_v_o` : valid signal, all bytes of `<field_name>` have been
    received, it's use should be paied with the early `<message_type>` signal.
    The field bytes will be on the standard interface.

### Example

In the following example the `ITCH` module with an `early` interface is decoding two messages.
The first is a `21` byte long `Snapshot` message and the second is an `39` byte long anonymous `Add Order` message.

{{< alert "bell" >}}
All values are represented using hexadecimal with the exception of the data byte counter `data_cnt_q` in 
yellow.
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

Since our `snapshot` message is `21` bytes long, there are `2` length bytes 
before the start of each message's data bytes, the first byte of the 
`add order` message will overlap.

{{< figure
    src="itch/ov_wave.svg"
    alt=""
    caption="Last bytes of the `snapshot` message and the first byte of the `add order` message are overlapping within an `8` byte payload."
>}}

Because of this the start of the `add order` message will be sent though the overlap interface.
We can see that the `data_cnt_q` counter will delay accounting for this overlapping byte by one cycle giving us
time to finish with the previous `snapshot` message.

{{< figure
    src="itch/wave.png"
    alt=""
    caption="Wave view of the `ITCH` module behavior including the optional `early` interface."
>}}


## Resources

[ASX Trade ITCH Specification](https://www.asxonline.com/content/dam/asxonline/public/documents/asx-trade-refresh-manuals/asx-trade-itch-message-specification.pdf) 

