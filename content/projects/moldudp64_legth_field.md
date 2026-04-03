---
title: "MoldUDP64 length field"
date: 2023-08-02
description: "Headaches of the MoldUDP length field."
summary: "Discussing the design of the current MoldUDP64 module."
tags: ["FPGA", "HFT", "moldudp64","length field","verilog"]
draft: true
---
# Introduction

This article describes the headaches associated with managing
the 2 byte length field for the MoldUDP64 module.

This was originally part of the main `MoldUDP64` article but
as cut out in the interest of keeping it sweet and short.


## The length field complications

One of the most tricky aspects of this implementation was correctly extracting the length field.
As the message data is of variable length and our `length` field is of `2 bytes` there
exists a few different configurations when getting this information.

### Length and next data in the same payload

The payload contains the last few bytes of the the previous message data, as 
well as the full length field of our new message as well as the first few bytes
of this new message's data.
 
{{< figure
    src="mold_len_normal.svg"
    alt=""
    caption="2 bytes of the length field are in the middle of the payload sandwiched between the end of the previous message and the first data bytes of our new message."
    >}}

### Length at the beginning of the payload

Our previous message's data's end aligned with the end of the previous payload, as such the new payload contains
the length field aligned on the start of the payload as well as 6 bytes of our new message's data.

{{< figure
    src="mold_len_start.svg"
    alt=""
    caption="The previous message ended on the payload boundary, the new payload contains the new message length field aligned on the beginning of the payload and 6 bytes of the new messages data."
    >}}


### Length at the end of the payload

Our previous message's data's end's 2 bytes before the end of the payload, giving us the full 
2 bytes of the length field but with no data bytes of the new message. 

{{< figure
    src="mold_len_end.svg"
    alt=""
    caption="The full 2 bytes of the length of our new message are at the end of the payload but there are no bytes of our new data."
    >}}


### Length split between 2 payloads

The previous message's data ended 1 byte before the end of the payload, the new message's length
field is now split over 2 consecutive payloads. Internally we now need to keep track of the first
received byte to recompose the length field once the second part arrives.

{{< figure
    src="mold_len_split.svg"
    alt=""
    caption="The 2 bytes of our new message's length field are split between 2 different payloads."
    >}}



