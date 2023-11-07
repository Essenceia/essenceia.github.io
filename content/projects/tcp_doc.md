---
title: "TCP overview for RTL design"
date: 2023-11-06
description: "TCP documentation for designing an RTL implementation"
summary: "Overview of the TCP module."
tags: ["FPGA", "HFT", "TCP","Verilog", "Ethernet"]
showTableOfContents : true
draft: true
---

## Introduction

I am currently working on designing a high frequency trading FPGA based accelerator and
in that context I will need a to implement a simple TCP client module. 

This post aims to serve as a short documentation to help myself and others 
with implementation there own hardware `TCP` client modules.

## TCP packet

{{< figure
    src="tcp/tcp_header.svg"
    alt=""
    caption="TCP header, each line represents `32` bits. Source : RFC 9293"
>}}

## Socket lifecycle

The following provide schematics as to socket lifecycle as well as
real work examples of a captured `TCP` packets.

### Opening a socket

The client established a connection with the remote server though a 3-way handshake.
The `SYN` and `ACK` are header flags.
 
{{< figure
    scr="tcp/connect.svg"
    alt=""
    caption="Establishing a TCP connection, [credit: Sébastien Koechlin — Travail personnel, CC BY-SA 3.0](https://commons.wikimedia.org/w/index.php?curid=16887424)" 
>}}

`FSM` translation with intermediary states : 
{{< mermaid >}}
%%{init: {'theme':'dark'}}%%
stateDiagram-v2
    CLOSED --> INIT:open socket to server
    CLOSED --> CLOSED
    INIT --> SYN_SENDING:start sending SYN
    SYN_SENDING --> SYN_SENT: finished sending SYN
    SYN_SENT --> SYN_SENT: wait for valid SYN+ACK
    SYN_SENDING --> SYN_SENDING: sending SYN
    SYN_SENT --> ESTABLISH_SENDING : received SYN+ACK, start sending ACK 
    ESTABLISH_SENDING --> ESTABLISH_SENDING: sending ACK
    ESTABLISH_SENDING --> ESTABLISHED: finished sending ACK

    ESTABLISH_SENDING --> CLOSED: timeout/link down
    SYN_SENT --> CLOSED: timout/link down
    SYN_SENDING --> CLOSED : timeout/lint down
{{< /mermaid >}}
 
#### Client -> Server : SYN

```
Transmission Control Protocol, Src Port: 32848, Dst Port: 443, Seq: 0, Len: 0
    Source Port: 32848
    Destination Port: 443
    [Stream index: 16]
    [Conversation completeness: Incomplete, DATA (15)]
    [TCP Segment Len: 0]
    Sequence Number: 0    (relative sequence number)
    Sequence Number (raw): 725103165
    [Next Sequence Number: 1    (relative sequence number)]
    Acknowledgment Number: 0
    Acknowledgment number (raw): 0
    1010 .... = Header Length: 40 bytes (10)
--> Flags: 0x002 (SYN)
    Window: 64240
    [Calculated window size: 64240]
    Checksum: 0xcc24 [unverified]
    [Checksum Status: Unverified]
    Urgent Pointer: 0
    Options: (20 bytes), Maximum segment size, SACK permitted, Timestamps, No-Operation (NOP), Window scale
        TCP Option - Maximum segment size: 1460 bytes
        TCP Option - SACK permitted
        TCP Option - Timestamps
            Kind: Time Stamp Option (8)
            Length: 10
            Timestamp value: 213678753: TSval 213678753, TSecr 0
            Timestamp echo reply: 0
        TCP Option - No-Operation (NOP)
        TCP Option - Window scale: 7 (multiply by 128)
```

```hex
0000   80 50 01 bb 2b 38 32 3d 00 00 00 00 a0 02 fa f0
0010   cc 24 00 00 02 04 05 b4 04 02 08 0a 0c bc 7a a1
0020   00 00 00 00 01 03 03 07
```

#### Server -> Client: SYN,ACK

```
Transmission Control Protocol, Src Port: 443, Dst Port: 32848, Seq: 0, Ack: 1, Len: 0
    Source Port: 443
    Destination Port: 32848
    [Stream index: 16]
    [Conversation completeness: Incomplete, DATA (15)]
    [TCP Segment Len: 0]
    Sequence Number: 0    (relative sequence number)
    Sequence Number (raw): 1024563801
    [Next Sequence Number: 1    (relative sequence number)]
    Acknowledgment Number: 1    (relative ack number)
    Acknowledgment number (raw): 725103166
    1010 .... = Header Length: 40 bytes (10)
--> Flags: 0x012 (SYN, ACK)
    Window: 26847
    [Calculated window size: 26847]
    Checksum: 0x5364 [unverified]
    [Checksum Status: Unverified]
    Urgent Pointer: 0
    Options: (20 bytes), Maximum segment size, SACK permitted, Timestamps, No-Operation (NOP), Window scale
        TCP Option - Maximum segment size: 1432 bytes
        TCP Option - SACK permitted
        TCP Option - Timestamps
            Kind: Time Stamp Option (8)
            Length: 10
            Timestamp value: 2103358994: TSval 2103358994, TSecr 213678753
            Timestamp echo reply: 213678753
        TCP Option - No-Operation (NOP)
        TCP Option - Window scale: 8 (multiply by 256)
```

```
0000   01 bb 80 50 3d 11 9a 59 2b 38 32 3e a0 12 68 df
0010   53 64 00 00 02 04 05 98 04 02 08 0a 7d 5e b6 12
0020   0c bc 7a a1 01 03 03 08
```

#### Client -> Server: ACK

```
Transmission Control Protocol, Src Port: 32848, Dst Port: 443, Seq: 1, Ack: 1, Len: 0
    Source Port: 32848
    Destination Port: 443
    [Stream index: 16]
    [Conversation completeness: Incomplete, DATA (15)]
    [TCP Segment Len: 0]
    Sequence Number: 1    (relative sequence number)
    Sequence Number (raw): 725103166
    [Next Sequence Number: 1    (relative sequence number)]
    Acknowledgment Number: 1    (relative ack number)
    Acknowledgment number (raw): 1024563802
    1000 .... = Header Length: 32 bytes (8)
--> Flags: 0x010 (ACK)
    Window: 502
    [Calculated window size: 64256]
    [Window size scaling factor: 128]
    Checksum: 0xe8d2 [unverified]
    [Checksum Status: Unverified]
    Urgent Pointer: 0
    Options: (12 bytes), No-Operation (NOP), No-Operation (NOP), Timestamps
        TCP Option - No-Operation (NOP)
        TCP Option - No-Operation (NOP)
        TCP Option - Timestamps
            Kind: Time Stamp Option (8)
            Length: 10
            Timestamp value: 213678797: TSval 213678797, TSecr 2103358994
            Timestamp echo reply: 2103358994
```
```
0000   80 50 01 bb 2b 38 32 3e 3d 11 9a 5a 80 10 01 f6
0010   e8 d2 00 00 01 01 08 0a 0c bc 7a cd 7d 5e b6 12
```

### Closing a socket

{{< figure
    src="tcp/close.svg"
    alt=""
    caption="Closing a `TCP` connection, [credit Sébastien Koechlin — Travail personnel, CC BY-SA 3.0](https://commons.wikimedia.org/w/index.php?curid=16888554)"
>}}

{{< mermaid >}}
%%{init: {'theme':'dark'}}%%
stateDiagram-v2
    ESTABLISHED --> FIN_WAIT_1_SENDING:start close connection
    FIN_WAIT_1_SENDING -->FIN_WAIT_1_SENDING:sending FIN
    FIN_WAIT_1_SENDING --> FIN_WAIT_1: finished sending ACK
    FIN_WAIT_1--> FIN_WAIT_1: waiting for valid ACK
    FIN_WAIT_1 --> FIN_WAIT_2: received ACK
    FIN_WAIT_2 --> FIN_WAIT_2: waiting for valid FIN
    FIN_WAIT_2 --> TIME_WAIT_SENDING: start sending ACK
    TIME_WAIT_SENDING --> TIME_WAIT_SENDING: sending ACK
    TIME_WAIT_SENDING --> TIME_WAIT: finished sending ACK
    TIME_WAIT --> TIME_WAIT : decrement timer
    TIME_WAIT --> CLOSE: timer elapsed
{{< /mermaid >}}

## Resources 

[French wikipedia TCP article](https://fr.wikipedia.org/wiki/Transmission_Control_Protocol)

[TCP FSM](http://www.tcpipguide.com/free/t_TCPOperationalOverviewandtheTCPFiniteStateMachineF-2.htm)
