---
title: "MoldUDP64"
date: 2023-08-02
description: "RTL implementation of the MoldUDP64 module."
summary: "Discussing the design of the current MoldUDP64 module."
tags: ["FPGA", "HFT", "moldudp64","verilog"]
showTableOfContents : true
draft: false
---
# Introduction

`MoldUDP64` is a networking protocol used in the NASDAQ native market data feed.

It is built on top of UDP and its output feeds into the `ITCH` layer.

As such, I implemented this `MoldUDP64` module as part of my `NASDAQ HFT` project.

{{< figure
    src="mold_network_stack.svg"
    alt=""
    caption="NASDAQ `ITCH` data feed network stack"
    >}}

Due to the nature of this application, the design of this module is optimized 
for low latency. Power and area are secondary concerns.

As of today this module is fully combinational, and doesn't require any pipelining.

This article aims to serve as an accessible introduction to my design process thus far when
implementing this module. For a more technical documentation please refer to my github.
 
{{< github repo="Essenceia/MoldUPD64" >}}

{{< alert >}}
I do not have any professional experience in the domain, and as such my understanding may be flawed.
If you see any mistakes please contact me, so that I can correct them.
{{< /alert >}}

# MoldUDP64


Each client obtains the data feed from a NASDAQ server via UDP multicast.

Each packet is only transmitted once. If a client misses a packet, it needs to
detect this by itself, and make a retransmission request to the dedicated re-request NASDAQ server.
This server will respond with the missing packets via UDP unicast.

{{< figure
    src="mold_hw.svg"
    alt=""
    caption="High level overview of the client architecture not including may modules, of which more relevant to this article are the `ITCH` and `Trading algorithm` modules."
    >}}


## Payload format

The `MoldUPD64` packet was designed with the requirement of efficiency in mind and with minimal overhead.
As such its format is quite simple. 
{{< figure 
    src="mold_packet.png"
    alt=""
    caption="`MoldUDP64` packet"
    >}}

## Header

Each packet header contains a 10 byte `session id`, an 8 byte `sequence number` and a 2 byte `message count`.

{{< figure
    src="mold_head.svg"
    alt=""
    caption="`MoldUDP64` packet header"
    >}}

The `session id` and `sequence number` fields are used to keep track of missing messages.

The `session id` keeps track of what sequence of messages we are currently receiving.
 
Each message within a `session` is individually tracked using a unique `sequence number`.
The `sequence number` of a header indicates the `sequence number` 
of the first message in the packet. The messages following this first message are implicitly numbered sequentially.

The `message count` tells us how many messages our packet will contain.

As such, we can predetermine the `next sequence number` we expect to receive.
```
sequence_number_next = sequence_number + message_count 
```

If the sequence number of the next packet doesn't match, either the packet has been re-ordered
within the network and will arrive later or we have missed a packet. 

## Messages

Internally this packet can contain 0 or more messages, each of variable length.
Each of these messages is preceded by a 2 byte `length` field followed by the 
`message data` of `length` bytes. 
{{< figure
    src="mold_msg.svg"
    alt=""
    caption="`MoldUDP64` message format"
    >}}

Each of these message data will contain an `ITCH` message.

# Architecture

Internally, our module intakes new data via a [point to point AXI stream interface](https://developer.arm.com/documentation/ihi0051/a/), 
to which it is connected as a client, and outputs the `message data` to the `ITCH` module.

{{< figure
    src="mold_module.svg"
    alt=""
    caption="Simplified architecture, showing the `MoldUDP64` module's connection to `UDP` for input data to `ITCH` for output data."
    >}}

As long at the `MoldUDP64` is ready to accept new data, if any data is available, 
it will receive a new AXI payload at each cycle. The payload's data will be transmitted on the 
`axis_tdata` bus and the validity of each data byte is indicated by the `axis_tkeep`.

As this implementation targets low latency, one of the major design goals is to always be ready 
to accept new data **without any corner case**.

{{< alert >}}
We will be using an AXI stream data `axis_tdata` width of `64` bits for our illustration, but
ultimately the goal is to make this parameterizable. 
{{< /alert >}}

## Message overlap 

As this implementation targets low latency,we won't accept a new payload each cycle.\
As of writing, **3** iterations of this module have been written, each aiming to improve latency.

### Version 1

In the first version, I wanted to have the `ITCH` message data aligned on the data stream's width 
with no bubbles in the data, and have only one message getting sent to the `ITCH` module at a time.

Additionally I wanted all message data bytes sent in a payload to be valid, with the last payload being the only exception.

This created a corner case when two different messages were on the same payload. 
Since we could only send one message at a time, we needed to back pressure the 
`UDP` module to leave time to purge the end of the previous message before receiving the new message.

{{< figure
    src="mold_v1.svg"
    alt=""
    caption="Back pressure when two messages arrive within the same payload. The purge spreads over multiple cycles"
    >}}

To make matters worse, contrary to the example just above I was also waiting to have 
accumulated a full payload's worth of valid message data **before** sending it out.
 
The initial motivation for doing so was to simplify the logic on the `ITCH` side as all payloads 
would be guaranteed to be 8 bytes wide with the exception of the last.\
Additionally, it allows us to avoid applying back pressure in examples like above, and start
accumulating bytes to complete our output vector.

In practice this doesn't allow us to get rid of back pressure as there is a limit to the amount
of bytes we can store in our flop, and we still ultimately need to resort to back pressure to purge it. \
The only reason why there was not back pressure in this previous example was because I worked under the
assumption that at `t` our flop was empty.

{{< figure
    src="mold_v1.1.svg"
    alt=""
    caption="Assembling a full 8 bytes of valid data before sending it to the `ITCH` module. We are assuming that at `t` our flop used to store the last message data byte is empty."
    >}}

As such this increases the complexity of the `MoldUPD64` logic and doesn't help with latency that much.

### Version 2

Instead of having only one `ITCH` module, I duplicated this module, in order
to start sending message data to the other `ITCH` module in a round robin fashion
when the overlap occurs.

Additionally, since `ITCH` messages are guaranteed to be longer than the 
payload width, and we only mark the `ITCH` message as valid once all the bytes 
have been received, I added a multiplexer to the output of the `ITCH` modules 
to have a single `ITCH` message interface connected to the trading algorithm.

{{< figure
    src="mold_v2.svg"
    alt=""
    caption="Back pressure when two messages arrive within the same payload. The purge spreads over multiple cycles"
    >}}

This implementation was ultimately scrapped as :

- the demux inside the `MoldUDP64` module, and muxes between the `ITCH` and the `trading algorithm` 
    module add avoidable logic levels on this critical data feed path.

- the duplicated logic increases wire delay due to its increased size.

- the guarantee that only one `ITCH` module's output would be valid at a time 
    stopped being true when considering **early** decoded `ITCH` signals. These signals are used 
    to send the data of fully received `ITCH` message fields from a still incomplete `ITCH` message
    such that the trading algorithm can start without having received the full `ITCH` message yet.

### Version 3

This third iteration, the most recent as of writing, aims to leverage the fact that the message data will always be 
larger than the width of the payload.

In order to make this version possible, I had to add some complexity to the logic of the `ITCH` module such that
I could relax the requirements on the number of message data bytes that could be obtained from each payload.

Previously, I expected 8 bytes from every payload with the exception of the last.

I have added a second outbound data interface used to store message data bytes in the event two messages overlap on the same payload.

It is called the `ov` for "overlap" interface, and because of its nature, valid bytes on the overlap are always the first bytes of a new message.

{{< figure
    src="mold_v3.1.svg"
    alt=""
    caption="Payload containing data of two messages, having its data split onto both outbound `MoldUDP64` interfaces. Because overlap only occurs when there is at least 1 byte of the previous message data in the payload, and the length field is 2 bytes, our overlap data is at most 5 bytes wide for a 8 byte payload."
    >}}

Because the presence of an overlap coincides with the end of the previous message, and
because I wanted to have only one `ITCH` module, within the `ITCH` module these bytes are 
flopped as the finishing message is drained. They are then appended to the start of the
new `ITCH` message data. In these cases we will be writing more than 8 bytes of data per cycle.
I will elaborate on this more in a future `ITCH` module write-up. 

{{< figure
    src="mold_v3.svg"
    alt=""
    caption="Overlap signals are transmitted in parallel to normal message signals. There is only one `ITCH` module and a single interface between it and the `Trading algorithm`. "
    >}}

# Conclusion

There is still a lot of room for improvement.
For instance, there is no guarantee that the payload size will remain 8 bytes.
If it drops under 4 bytes, some corner cases like the overlap will cease to exist.

The next write-up will likely be on the ITCH module. [If you wish to be notified when this article is published shot me a mail.{{<icon "envelope">}}](mailto:julia.desmazes@gmail.com?subject="ITCH")

# Additional resources

[NASDAQ MoldUDP64 v1.0 specification](http://nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/moldudp64.pdf) 

[TotalView ITCH 5.0 specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf)

[AMBA 4 AXI4 stream protocol specification](https://developer.arm.com/documentation/ihi0051/a/)
