---
title: "MoldUDP64"
date: 2023-08-02
description: "RTL implementation of the MoldUDP64 module."
summary: "Discussing the design of the current MoldUDP64 module."
tags: ["FPGA", "HFT", "moldudp64","verilog"]
draft: false
---
# Introduction

MoldUDP64 is networking protocol used in the NASDAQ native market data feed.

It is build on top of UDP and it's output feed's into the ITCH layer.
As such, of my NASDAQ HFT project I need to implement MoldUDP64.

{{< figure
    src="mold_network_stack.svg"
    alt=""
    caption="NASDAQ ITCH data feed network stack"
    >}}

Due to the nature of this applicaiton this module is designed to optimize 
for low latency, power and area are secondary consernes.

{{< github repo="Essenceia/MoldUPD64" >}}

# MoldUDP64


Each client obtaines the data feed from a NASDAQ server via UDP multicast.

Each packet is only transmitted once and if a client misses a packet it needs to
detect this itself and make a re-transmission request to a different re-request NASDAQ server.
This server will send the missing packet via UDP unicast.

{{< figure
    src="mold_hw.svg"
    alt=""
    caption="High level overview of the client architecture."
    >}}


## Payload format

The MoldUPD64 packet was designed with the requirement of efficiency in mind and with minimal overhead.

{{< figure 
    src="mold_packet.png"
    alt=""
    caption="MoldUDP64 packet"
    >}}

## Header

Each packet header contains a 10 byte `session id`, an 8 byte `sequence number` and a 2 byte `message count`.

{{< figure
    src="mold_head.svg"
    alt=""
    caption="MoldUDP64 packet header"
    >}}
The `session id` and `sequence number` fields are used to keep track of missing messages.

`Session id` keeps track of what sequence of message we are currently receiving.
 
Each message within a `session` is individually tracked using a unique `sequence number`.
The header's `sequence number` indicates the `sequence number` 
of the first message in the packet. The messages following this first message are implicity numbered sequencentially.

The `message count` tells us how many messages our packet will contain.

As such, we can pre-determing the `next sequence number` we expect the receive.
```
sequence_number_next = sequence_number + message_count 
```

If the next packet's sequence number doesn't match, either the packet has been re-ordered
within the network and will arrive latter or we have missed a packet. 

## Messages

Internally this packet can contain 0 or more messages, each of variable length.
Each of these messages is preceided with a 2 byte `lenght` field followed by the 
`message data` of `lenght` bytes. 
{{< figure
    src="mold_msg.svg"
    alt=""
    caption="MoldUDP64 message format"
    >}}

Each of these message data will contain an ITCH messages.

# Architecture

Internally, our module intakes new data via a [point to point AXI steam interface](https://developer.arm.com/documentation/ihi0051/a/), 
to which it is conected as a client, and output's the `message data` to the ITCH module.

{{< figure
    src="mold_module.svg"
    alt=""
    caption="Simplified architecture, used to illustrate MoldUDP64 module's connection to UDP for input data and output's to ITCH module."
    >}}

As long at the `MoldUDP64` is ready to accept new data, if any data is available, 
each cycle will receive a new AXI payload. The payload's data will be transmitted on the 
`axis_tdata` bus and a the validity of each data byte will be inidicated by the `axis_tkeep`.

As this implementation targets lower latency, one of my design goals is to always be ready 
to accept new data without any corner cases.


{{< alert >}}
We will be using an AXI steam data `axis_tdata` width of `64` bits for our illustration, but
ultimatly the goal is to make this parametrisable. 
{{< /alert >}}

## The length field complications

One of the most tricky aspects of this implementation was correctly extracting the lenght field.
As the message data is of variable length and our `length` field is of `2 bytes` there
exists a few different configurations when getting this information.

### Lenght and next data in the same payload

The payload contains the last few bytes of the the previous's message data, as 
well as the full length field of our new message as well as the first few bytes
of this new message's data.
 
{{< figure
    src="mold_len_normal.svg"
    alt=""
    caption="2 bytes of the length field are in the middle of the payload sandwitched between the end of the previous message and the first data bytes of our new message."
    >}}

### Length at the begining of the payload

Our previous message's data's end aligned with the end of the previous payload, as such the new payload contains
the length field aligned on the start of the payload as well as 6 bytes of our new message's data.

{{< figure
    src="mold_len_start.svg"
    alt=""
    caption="The previous message ended on the payload boundary, the new payload containst the new message length field aligned on the beging of the payload and 6 bytes of the new messages data."
    >}}


### Length at the end of the payload

Our previous message's data's end's 2 bytes before the end of the payload, giving us the full 
2 bytes of the length field but with no data bytes of the new message. 

{{< figure
    src="mold_len_end.svg"
    alt=""
    caption="The full 2 bytes of the lenght of our new message are at the end of the payload but there are no bytes of our new data."
    >}}


### Length split between 2 payloads

The previous message's data ended 1 byte before the end of the payload, the new message's lenght
field is now split over 2 consecutive payloads. Internally we now need to keep track of the first
received byte to recompose the length field once the second part arrives.

{{< figure
    src="mold_len_split.svg"
    alt=""
    caption="The 2 bytes of our new message's length field are split between 2 different payloads."
    >}}


## Message overlap 

As this implementation target's low latency we want to be able to accept the a new payload every cycle.\
As of now 3 iterations of this module have been written each aiming to reduce latency.

### Version 1

I the first verions the goal was to have the ITCH message data aligned on the data stream's width 
with no bublles and only have 1 message getting sent at a time.

This created a corner case when 2 different messages where on the same payload. 
Since we could only send 1 message at a time we needed to backpressure the 
UDP module to leave us time to purge the end of the previous message before starting
to send the new message.

{{< figure
    src="mold_v1.svg"
    alt=""
    caption="Backpressure when 2 messages arrive withing the same payload. Purged spread over multiple cycles"
    >}}


To make matter worst, contrary to the example just above I was waiting to have 
accumulated a full payload's worth of valid message data **before** sending it 
out.
 
The initial motivation for doing so was to simplify the logic on the ITCH side as all payload's 
would be guarantied to be 8 bytes wide with the exception of the last.\
Additionally, it allows us to not apply backpressur in examples like about and start
accumulating bytes to complete our output vector. \
In practice this doesn't rid us of backpressure as there is a limit to the amount
of bytes we can store in our flop and we sill need to purge it. \
The only reason there was not backpressure in our example was because we implied that
at _t_ our flop was empty.


{{< figure
    src="mold_v1.1.svg"
    alt=""
    caption="Backpressure when 2 messages arrive withing the same payload. Purged spread over multiple cycles"
    >}}

As such this increases the complexity of the MoldUPD64 logic and doesn't help
latency much.


### Version 2

Instead of having only 1 ITCH module, we duplicated this module in order
to start sending message data to the other itch module when this overlap occured.

Additionally, since ITCH message's where guarantied to be longer than the 
payload width and we only marked the ITCH message as valid once all the bytes 
had been received we could add a muliplexer at the output of the ITCH message 
to have a signle itch message interface connected to the trading algorithme.

{{< figure
    src="mold_v2.svg"
    alt=""
    caption="Backpressure when 2 messages arrive withing the same payload. Purged spread over multiple cycles"
    >}}

This implementation was untimatly scrapped as :

- demux inside the `moldudp64` module and muxes between the `itch` and `trading alogithm` 
    module would have added avoidable logic depth on this critical data feed path


- the logic duplicated would have increased wire delay due to 
    it's increased size

- the guaranty that only one ITCH module's output would be valid at a time 
    stopped being true when considering `early` decoded itch signals used 
    to send send the data of fully received itch message fields from a still incomplete itch message.\
    More information on these `early` signals will be provided in the upcomming writeup on the ITCH module.\
    [Send me a mail if you wish to be notified when this article is published.{{<icon "envelope">}}](mailto:julia.desmazes@gmail.com?subject="ITCH")

### Version 3

This third iteration and the most recent as of writting, looks to leverage the fact that the message data will allways be 
larger than the payload's width.

In order to make this version possible I had to complexify the `ITCH` module's logic such that
I can relax the requirements on the number of message data bytes that can we 
obtained from each payload. Previously, we expected 8 bytes from every payload with the
expection of the last.

I have added a second outbound data interface used to store message data bytes in the 
even 2 message overlap on the same payload. It is called the `ov` for "overlap" interface and
valid bytes on the overlap are always the first bytes of a new message.

Because the presence of an overlap coincides with the end of the previous message and
I want to only have 1 ITCH module, internally, in the `ITCH` module these bytes are 
flopped as the finishing itch message drains, and are then appended to the start of the
new itch message data. In these cases we will be writing more than 8 bytes of data per cycle.
We will elaborate on this more in the upcoming ITCH module post. 

{{< figure
    src="mold_v3.svg"
    alt=""
    caption="Overlap signals are transmitted in parallel to normal message signals. There is only one `ITCH` module and a single interface between it and the `Trading algorithm`. Because overlaps only occure when there is at least 1 byte of the previous message data in the payload and the length field is 2 bytes our overlap data is at most 5 bytes wide for a 8 byte payload."
    >}}

Since a message overlap  





# Conclusion

# Ressources

[NASDAQ MoldUDP64 v1.0 specification](http://nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/moldudp64.pdf) 

[AMBA 4 AXI4 steam protocol specificaiton](https://developer.arm.com/documentation/ihi0051/a/)
