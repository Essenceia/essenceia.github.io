---
title: "Building an Ethernet Switch ASIC"
date: 2026-07-07
description: ""
summary: ""
tags: ["asic", "switch", "ethernet", "gf180mcuD", "180nm", "rtl", "verilog", "100Mbps", "coffeepot", "coffeeshop"]
draft: true
showTableOfContents: true
---
{{< alert icon="heart-empty" >}} 
AI disclosure: All bugs are 100% human made. 
{{< /alert >}}

It seems I built the first open source switch ASIC and I am getting it back from the fab mid november. 
{{< figure 
src="feature_floorplan.png"
caption="Switch floorplan render with area density view enabled, occupying `711.2 x 325`um  of area. The first version of this chip is currently tapped out on the [Tiny Tapeout gf26b shuttle chip](https://tinytapeout.com/chips/ttgf26b/), part of the second [wafer.space](https://wafer.space/) run. Silicon bring-up is expected to start `2026-11-15`."
>}}

Here is its repository : 
{{< github repo="Essenceia/ethernet_switch_asic" showThumbnail=false >}} 

Buckle up and welcome to the tale of more madness. 

## Intro

### FCC has sudo rights

{{< alert icon="envelope" >}} 
I am not a lawyer, I am just a denizen of the internet trying to make sense of an evolving situation. If you spot an issue please [email me](mailto:julia.desmazes@gmail.com).  
{{< /alert >}} 

On March 23, 2026 the US Federal Communications Commission (FCC) made a decision that resonated throughout tech circles when they decided to include consumer foreign made routers on the [Covered List](https://www.fcc.gov/supplychain/coveredlist), 
with exception subject to conditional approval granted [by DoW or DHS](https://www.fcc.gov/supplychain/coveredlist#conditional-approvals). 

For the purposes of this article, we will put the question of the well founded nature of this decision in the "too hard" pile. 
{{< figure
src="too_hard.jpg" 
caption="The **TOO HARD** pile. A mainstay of Warren Buffett's desk."
>}}

In this context, "foreign made" doesn’t simply refer to software, where the router was designed or final product assembly, but also to internal components, with [particular scrutiny being given to any "modular transmitter" components](https://www.law.cornell.edu/cfr/text/47/2.903). 

So although dumb components such as resistors, PCBs and casings don’t cause any issues ([unless they run at +9kHz and where made by entities on the covered list, eg: Huawei](https://docs.fcc.gov/public/attachments/DOC-422722A1.pdf)) the presence of any radio capable chip not designed and manufactured in the US puts you in the cross-hairs. 

Anyways, this development got me thinking: Is there even a single consumer-grade router that is manufactured and assembled in the United States, and includes silicon that is also designed and manufactured in the US ?

Actually, are there even any major consumer-grade networking equipment manufacturers still assembling routers in the United States apart from SpaceX?

And when the answer to these seemed to be "not really" my questions then evolved to: 

_What would it take to build such a chip entirely in the United States?_

At least there that I have more concrete answers having personally tapped out twice on SkyWater 130nm ([digital hashing accelerator](https://talesonthewire.com/projects/blake2s_hashing_accelerator_a_solo_tapeout_journey/) and [analog design](https://talesonthewire.com/thoughts/broken_doc/)), which is a US based fab. Also, since SkyWater features on the US Department of War list of ["accredited suppliers"](https://www.acq.osd.mil/asds/dmea/tapo/docs/tp/Accredited-Supplier-List-29Jun2026.pdf) for its [Trusted Foundry Program](https://www.acq.osd.mil/asds/dmea/tapo/trusted-supplier-programs.html  ) it's unlikely to end up on the entity list any time soon. If it’s good enough for trusted military applications it's good enough for consumer grade routers. 

Then there is the question of tooling, and although the open source silicon implementation tools are maintained by a worldwide community, OpenROAD was initially [funded by DARPA](https://openroad.readthedocs.io/en/latest/).

As for the origin of the hardware design IP, just make it a greenfield project designed by only US based designers ? 

Now I doubt anyone is too concerned about the ability of existing major consumer router manufacturers to figure this out and get FCC approval for their next generation of devices. 

But the part of the ecosystem I imagine will be more affected is the smaller open source router manufacturers. 

And it is this very question  that opened up **the giant can of worms we will now proceed to jump into**. 

### Where is the open source networking equipment hardware?

Although Open Source Silicon is in its infancy we are currently seeing a number of projects being designed, tested, and for the most ambitious ones, even taped out with some proven silicon already in the wild. 

That said, the vast majority of the most ambitious projects are predominantly [RISC-V SoCs](https://www.crowdsupply.com/baochip/dabao). 

Surprisingly, there has been much less interest in building open hardware for networking equipment. 

Well .. unsurprisingly actually … networking equipment is far less "sexy" than CPUs and has thus received much less attention from the open source community. On the other hand, this means there's a huge untapped boulevard of projects open to anyone with more time than common sense to build open source networking equipment chips!

Because, on the other side of the great silicon divide, the world of open source networking equipment is actually quite rich, both in terms of its flourishing software ecosystem and the open PCB/electronics ecosystem, with a flurry of [fully featured open source routers available](https://openwrt.org/toh/openwrt/one). Yet, due to the current ecosystem's limitations, under the hood, these are all still forced to rely on proprietary chips for the compute and routing tasks.

_So what would it take to build a router chip?_

It's a very ambitious project, since a router involves a complex SoC needing both a powerful enough CPU to run the networking stack alongside specialized networking hardware, and analog frontend for the wired and wireless connections. Since building a full router outright is much too ambitious of a greenfield project to start with, let's begin with a more approachable first step: building a switch. After all, although most people only have one router, you can have a number of smaller switches, and we also don’t have any open source chips for those either. 

Oh and, I am not talking about building an FPGA switch, oh no, I am talking about building a switch ASIC, taping it out and then proving the silicon works. 

## Switch Flavors

Before we start figuring out what kind of switch we want to build, let me give you a quick overview of the different flavors of switches out there. Readers deeply familiar with networking equipment can skip this part.  

### Glossary

#### Physical Layer

Ethernet supports multiple physical layers, outlined in the 802.3 IEEE spec. Each clause in the spec defines the underlying medium characteristics for carrying the Ethernet protocol over the medium at a given bandwidth. 

Both a 10 Gb fiber Ethernet link and a 10 Mb coaxial cable can carry Ethernet packets and, to the layers above the physical layer the packets will look exactly the same. 

Where they will differ is at the physical layer and, outlined in the spec is precisely how: with which timing and with what encoding data will be transmitted over the medium. 

This ensures that devices made by different manufacturers agree on what "talking Ethernet" looks like and are interoperable. 

So one of the first questions I must answer is which physical layer my switch should support. This will define how much traffic I must route, how fast I should do so and how much bandwidth I can carry.

#### Managed vs Unmanaged

The second question is: what type of switch do I want to build? 

There are two big families of switches: managed and unmanaged. As the name implies, managed switches can be configured and managed from the outside. This allows for much smarter routing, such as supporting different VLANs. 

While unmanaged switches are essentially unconfigurable pieces of networking equipment that you just plug into your network and forget (until power surge do you part).

#### Cut-through vs Store-and-Forward

The last switch characteristic is cut-through versus store-and-forward. 

Cut-through switches start forwarding a packet while the packet is still arriving. Whereas store-and-forward switches wait for the entire packet to arrive before checking that no corruption has occurred, and then only forward the packet if that check passes. 

Where issues arise is when a packet is corrupted, a cut-through switch might still forward it, propagating corrupted packets through the network since forwarding began before the FCS (frame check sequence) could be checked.

### Designing against constraints (again)

As usual with my ASIC design work, what I build is shaped as much by what I want to build as it is by the constraints of the silicon.

#### Pins

My first major constraint is the pins: not only in their amount but also in their maximum bandwidth. 

Since I will be taping this first generation chip out over the [Tiny Tapeout shuttle chip](https://tinytapeout.com/chips/ttgf26b/), using purely digital tiles, I'm constrained by the limit of these pins. 

In total this will afford me 8 input, 8 output, and 8 bi-drectional GPIO pins,  rated to run reliably at 50 MHz on both inbound and outbound data. 

The absence of any analog front end makes building anything IEEE-physical-layer-compliant directly a challenge, but there's a way around this: using an external PHY (physical layer) chip and interfacing with it over the standardized RMII bus. Though this consumes 7 bits per Ethernet interface it makes my 50Mbps pins capable of sending and receiving over **100Mbps Ethernet** (100BASE-TX). 

{{< figure 
src="chip.svg"
caption="Tiny Tapeout shuttle chip"
extrastyle="filter: invert(100%) sepia(93%) hue-rotate(87deg) brightness(119%) contrast(119%);"
>}} 

| Index | Input | Output | Bidirectional |
|-------|------------|-------------|----------------------| 
| 0 | ui[0]| uo[0] | uio[0] |
| 1 | ui[1] | uo[1] | uio[1] |
| 2 | ui[2] | uo[2] | uio[2] | 
| 3 | ui[3] | uo[3] | uio[3] | 
| 4 | ui[4] | uo[4] | uio[4] | 
| 5 | ui[5] | uo[5] | uio[5] | 
| 6 | ui[6] | uo[6] | uio[6] | 
| 7 | ui[7] | uo[7] | uio[7] |

I will be targeting the widely available microchip LAN8720 PHY chip for this interface and will be going more in-depth as to how this ASIC will be interfacing with this PHY later in the article. 

#### Area

My second major constraint is my limited die area. I am paying for all this afterall, more area means higher manufacturing cost. Now I am not trying to accumulate a pool of gold or anything, it’s just that, in compliance with Maslow's hierarchy of needs, waffles rank higher than area, and higher manufacturing cost means less waffles. So just like any semi-conductor company, I am incentivised to keep my area budget under control. 

{{< figure 
src="needs.svg"
caption="Maslow’s hierarchy of needs, distorted ASIC edition. "
>}}

Because store-and-forward requires the switch to store the entire packet before forwarding it, and because ethernet frames can reach upwards of +1.5k Bytes (and +9k for jumbo frames), they require massive amounts of storage. A workaround for that would be to store the packet to some off-chip memory but I don’t have the pin budget to afford that right now, so on-chip memory is my only option. 

The problem is, on-chip memory consumes a lot of area given to the large area footprint of SRAM and the even larger area per stored bit footprint of flip-flops. 

Now if we were talking of a few bytes this could be negotiable, but for multiple 1.5k Bytes packets this is a dealbreaker, thus ruling store-and-forward out. 

{{< figure 
src="sram_scale.webp"
caption="Very very high resolution render of the switch ASIC floorplan using [Tim Edward’s excellent OCD 256x8 SRAM IP](https://github.com/RTimothyEdwards/gf180mcu_ocd_ip_sram), for scale. A single 256 Byte SRAM occupies 301.3 x 224.93 um (using `W` orientation in this implementation) and consumes just by itself 1/3 of the floorplan. If we want to store even a single full packet we would need 6 of  such instances, and since we have 3 ports, we would then need to replicate that 3 times, so 18 instances in total. Now, we have a larger [1028 Byte version of this SRAM](https://github.com/RTimothyEdwards/gf180mcu_ocd_ip_sram/blob/main/cells/gf180mcu_ocd_ip_sram__sram1024x8m8wm1/gf180mcu_ocd_ip_sram__sram1024x8m8wm1.lef) that is 301.3 x 515.81 um which nicely increases our storage area density. But again, if where were to instantiate six such macros this would occupy x3 the area than we currently have to spare. Now, the Tiny Tapeout shuttle chip does support me scaling up this design up at most another two factors of two, or 4x. But the cost would also scale by a factor of 4, at which point we are getting into full chip orders of magnitude of cost. And if I were to go down the full chip route, since I then have the possibility of having a lot more pins to play with, this re-unlocks the possibility of interfacing with much larger external memories, thus changing the landscape of what the correct technical tradeoff would be again."
>}} 

{{< github repo="RTimothyEdwards/gf180mcu_ocd_ip_sram" showThumbnail=false >}} 

#### Easy to use

Lastly, I want something that doesn’t require external software or configuration. 

Firstly because I would like external third party users in the community to be able to easily pick this ASIC up and start using it. But that becomes increasingly more difficult once I start involving custom software. So I am aiming for something that is as close to plug and play as possible with ease of use being a measure of success. 

Not to say that the community won’t be unable to compile and flash my custom embedded abominations, just that their willingness to do decreases exponentially with each extra step. 

Secondly because I am once again working on a very tight schedule and that custom software support adds significant amounts of time to both the pre-tapeout and bringup workloads. This would be especially true for this ethernet switch project since I would aim to be compatible with a widely adopted open source switch management software and protocol like [SNMP](https://en.wikipedia.org/wiki/Simple_Network_Management_Protocol) for monitoring or SSH for monitoring and configuration.

Support for these protocols are not at the level of something I can trivially implement in hardware, especially for SSH, and the best design decision would be to offload to a CPU. So either integrate an on chip CPU on the ASIC or, build a custom interface to an external MCU and offload all these requests to it. Both options involve a significant software effort and with the on chip CPU also promising a huge design effort and even more area usage. At which point, I am approaching the planned architecture of the router rather than the first generation of the switch. 

So, for both of these reasons, an unmanaged switch is the path I am taking. 


#### What are we building?

So to recap, I am building a:
- 3-port
- Full-duplex
- 100 Mbps bandwidth
- cut-through
- unmanaged
ethernet switch. 

Now that we have figured out what we're building, it's time to focus on the fun part: how to build it! 🥳

## System Overview

### The real Ethernet frame you never see

Most people have actually never seen a full ethernet packet. 

When you inspect Ethernet traffic on your computer via tcpdump or wireshark, you actually only see part of the Ethernet frame, with some parts missing. These parts are generally stripped out by your computer's network interface before the packet is forwarded to the software realm, thus hiding them from user’s view. 

Random IPv4 packet captured over tcpdump (`tcpdump -xx -e -v 'ether proto 0x0800'`) :
```sh 
16:36:51.298082 60:e9:aa:92:dc:7d (oui Unknown) > 5c:e9:31:1e:9d:00 (oui Unknown), ethertype IPv4 (0x0800), length 78: (tos 0x2,ECT(0), ttl 64, id 0, offset 0, flags [DF], proto UDP (17), length 64)
    superpitchu.53332 > dfw25s53-in-f9.1e100.net.https: UDP, length 36
    0x0000:  5ce9 311e 9d00 60e9 aa92 dc7d 0800 4502
    0x0010:  0040 0000 4000 4011 2b98 c0a8 0085 4a7d
    0x0020:  0369 d054 01bb 002c a93f 6fe8 5bd5 5378
    0x0030:  f4c9 ccae 477c 5083 0696 8fa4 4f62 57bf
    0x0040:  41a9 78a3 fc60 7781 2b8b 38a1 2ccd
```
The missing parts are:
- **Preamble + SFD**: Before the start of the MAC header exists a sequence of 7 bytes of an alternating bit sequence signifying that a packet is about to start, called the preamble, followed by a 1-byte marker ending in a double asserted bit sequence called the SFD (Start Frame Delimiter) signaling that the next bits are the MAC header. 
- **Frame Check Sequence** Footer: At the end of the packet there is a 4-byte footer called the FCS (Frame Check Sequence), used to check whether the Ethernet frame's content was corrupted during transmission. This is checked by both store-and-forward switches and by most computers' network interface cards and these drop all frames that fail this test before the packet is forwarded.  

{{< figure
src="raw_pkt.svg"
caption="Raw packet overview"
>}}


And since, once they have been evaluated by the networking interface, both the Premable+SFD and FCS serve no further relevant purpose, they are stripped out before the remaining packet bits are forwarded up the networking stack. 

Now, since we're going through the Microchip PHY, we won't actually be interfacing directly with the Ethernet physical layer, as it will be abstracting away the precise 100BASE-TX PHY behavior, though the full ethernet frame will remain intact (including Preamble+SFD+FCS)

All our data transmission and reception will actually be done through the RMII bus interface.

### The RMII interface


{{< figure 
src="lan8720_conn.png"
caption="LAN8720 to application device interface diagram taken directly from the LAN8720 datasheet. For our application the MAC and RMII block are going to be part of our ASIC and we will have 3 such interfaces in parallel. Like in this example, both the ASIC and all the 3 LAN8720 chips will be driven by the same external 50MHz reference clock signal."
>}} 

#### RX 

On the `RX` (reception) side of RMII, we have four pins: two for data, one for data validity, and one to signal that an error has occurred on the line. 
Interestingly, this valid signal isn't a pure data-valid signal but an early data-valid signal, and it's up to our ASIC to read the incoming data and correctly identify when the Ethernet frame data actually starts using the preamble and SFD. The valid signal actually asserts asynchronously a few cycles before the start of the preamble but, deasserts synchronously with the end of the Ethernet frame.

#### TX 
On the `TX` (transmit) side, we only have three signals: two for data and one for valid, with no error signal. This makes sense, since the error signal is there to  indicate issues on the medium, and so there is no need for it on the TX side.

#### Timing 

Lastly the RMII spec outlines the expected timings for interfacing with the PHY chip. 

Unlike what my high level overview might have suggested, new data isn’t immediately available at the start of the clock cycle. Like in all real hardware there is an internal propagation delay. The same goes for how fast the data is allowed to transition after the start of a cycle. Because the PHY chip also contains flip-flops and is thus also subject to hold constraints, the previous cycle’s data must remain stable for a certain period of time after the clock edge before the new value can be propagated. 

{{< figure
src="timing.png"
caption="RMII interface timing for the LAN8720A/LAN8720AI microchip chip family. Documentation code: DS00002165C. I swear, this doc is so well written, it truly makes this chip such a pleasure to work with ❤️. "
>}}

So, implementing correct signaling alone isn't enough to properly interface with this chip. If I want my ASIC to work I also really need to make sure my physical implementation's resulting timing respects these constraints. This is both verified and enforced by specifying design constraint rules as part of the SDC (Synopsys Design Constraints) file.

Now by designing around the constraints of the LAN8720 chip readers might be concerned that I am locking myself into a dependency on a single external chip. 

And actually that is kind of the case here, I am not proud of this but I caught this discrepancy too late, and not mentioning it in this article is simply not the type of write-up I am looking to do here.  

Although the RMII is regented by the RMII Concorcium, and even though within the RMII specification they AC specify characteristics, the LAN8720 isn’t actually compliant. Although in many cases the LAN8720’s timings are actually more constraining than the official spec, when it comes to the hold constraints on the RX pins it is less at 1.4ns vs 2.0ns. 

Although this might still work in practice, **it would be by pure luck and I only believe in engineered luck!**

{{< figure 
src="rmii_ac.png"
caption="RMII Specification, AC Characteristics"
>}}
So note to self for future versions: I should set this to 2.0ns to guarantee that the ASIC would work with other RMII chips. 
Apart from that, the LAN8720 is widely available, easy to get dev boards for, well documented, and at 103 cents a piece, worth every penny.
{{< figure
src="kawaii.webp"
caption="[The official microchip LAN8720 developpement daughterboard](https://www.microchip.com/en-us/development-tool/ac320004-3#Overview) not only came with a real paper datasheet but it was the most precious tiny datasheet I have seen in a long time."
>}}

#### ASIC pinout 

Putting it together, here is what the final pinout of our ASIC will look like connected to all 3 PHY chips. We will be referring to these as PHY0, PHY1 and PHY2.  

| Index | ui (Input) | uo (Output) | uio (Bidirectional) |
|-------|------------|-------------|----------------------|
| 0 | phy0_rx_data[0] | phy0_tx_data[0] | phy2_rx_data[0] |
| 1 | phy0_rx_data[1] | phy0_tx_data[1] | phy2_rx_data[1] |
| 2 | phy0_rx_v | phy0_tx_v | phy2_rx_v |
| 3 | phy0_rx_err | - | phy2_rx_err |
| 4 | phy1_rx_data[0] | - | tx_phase |
| 5 | phy1_rx_data[1] | phy1_tx_data[0] | phy2_tx_data[0] |
| 6 | phy1_rx_v | phy1_tx_data[1] | phy2_tx_data[1] |
| 7 | phy1_rx_err | phy1_tx_v | phy2_tx_v |
 
## Address Resolution

At its heart, a switch is actually, conceptually, a simple piece of equipment who’s role is to read and forward incoming Ethernet frames to the correct ports. 
Matching incoming packet’s destination MAC addresses to the correct port is accomplished by an internal structure called an address table. 

Like a software `dictionary` construct it maps a destination MAC address to a switch port index. 

In order to build this correspondence, the switch analyzes incoming traffic's source MACs, keeping track of which port each source MAC was seen on, in order to forward future traffic to the correct port.

Putting it together: when an incoming Ethernet frame arrives, the switch first reads the destination MAC and checks the address table for a matching entry. If there's a hit, it forwards the packet to the specified port. And in cases where there is no hit, in a best effort to minimize packet drops, it broadcasts the frame on all ports except the one it came from.

At least that is the high level overview, in practice, this is hardware, so things get a bit more hard (pun intended … no, I am not sorry). 

### Filling the table

Recall that this switch is unmanaged, it needs to autonomously learn the correct ports corresponding to each device's MAC address. It does this by reading the source MAC of all incoming Ethernet frames. Once it has the source MAC, it checks the address table to see if this MAC is already present. If no entry exists, it writes a new one. 

The requirement that all entries in the table be unique is not only a correctness requirement but also stems from two [physical implementation constraints (see ASIC implementation rules for readers not already deeply familiar with ASIC design )](https://essenceia.github.io/projects/floating_dragon/#asic-implementation-rules): 
- **Most efficient utilization of the table**: since the table is implemented in hardware not only is its size fixed but each additional entry is none-linearly more expensive. Since this first generation 3 port design only features 4 such entries it is imperative to make the most use of each entry, and duplicated entries are a pure waste. 
- **Timing**: lookup of this address table is on the critical path. But by guaranteeing that each hit is unique, we can replace the priority mux selecting from individual entry hit to the table hit, with a lower logic depth and/or reduction tree. See the code below as an example for the entry port hit to table port hit.

```verilog
always @(*) begin
    /* verilator lint_off CASEOVERLAP */
    (* parallel_case *) // telling synthesizer it can optimize this from a priority mux to a parallel case
    casez(mac_hit) <- onehot0 entry hit vector
        4'b???1: port_hit = mem_port_q[0];
        4'b??1?: port_hit = mem_port_q[1];
        4'b?1??: port_hit = mem_port_q[2];
        4'b1???: port_hit = mem_port_q[3];
        default: port_hit = {PORT_IDX_W{1'bX}}; // port hit will only be used if we have at least one valid entry hit
    endcase
    /* verilator lint_on CASEOVERLAP */
end
```

So, like all hardware structures, this table has a limited, fixed size. 
In the best case, assuming there are multiple free entries, a static allocation algorithm is used to select which entry the new address is written to. If there is a single free entry it is used. 

Where things get complicated is when there are no available entries. To explain what happens in this case, I need to take you on a quick detour and talk about Time-To-Live (TTL).

### Time-To-Live 🪦

Each entry in the table actually has three parts: the MAC address, the port, and a time-to-live counter. 

{{< figure 
src="entry.svg"
caption="Address table entry memory layout. Each entry uses 54 bits of storage, and the first generation switch has 4 such entries. " 
>}} 

So, why am I sacrificing some of my very precious on-chip storage for this counter? Well, because I must !
 
It implements an aging mechanism: entries in the table are only valid for as long as their TTL hasn't expired. This is a necessary mechanism for networking equipment, to make sure old entries aren't kept alive which could result in improper forwarding.

Imagine the following scenario:
a device is connected to our switch on port 0, but then it's disconnected from port 0 and re-connected to port 1. If that device never transmits again, the switch has no way of being made aware that the port for this device has changed. So without an ageing mechanism, as long as the entry isn’t re-allocated, it would continue forwarding all packets destined for that device to the wrong port. Meanwhile, all traffic destined for the device would be lost. 

Because of this, all switches, let they be managed (and unmanaged) implement such an ageing mechanism, where entries are regularly purged from the table. In our switch, this TTL counter also indicates whether an entry is valid (TTL != 0).

Then, at a regular interval, an hardware internal event is triggered and all the entires TTL values in the table are decremented by 1. 

This TTL is a hard-set 300 second (5 minute) invalidation cycle. All entries, if not refreshed within this five-minute window, will ultimately be invalidated.

### Replacement policy 

Coming back to our write example, what happens on a write when we have no invalid entries? 

In cases like this the hardware implements a replacement policy. 

Firstly, in parallel to the other address table lookup mechanism, the hardware keeps track of the oldest valid entry based on the TTL. For cases where multiple entries have the same age, we once again have a static tiebreaking rule. This oldest entry is called the `victim` and is selected for new allocations.

Now, in my explanation so far I have suggested we had 2 distinct cases: 
1. At least 1 invalid entry 
2. No invalid entries 

But in practice, since the first case is actually a generalization of the replacement policy where entire ages are 0 the replacement policy is always used for allocating new entries. 
The distinction is actually between allocating entirely new entries (for which the MAC address isn’t in the table) and existing entries. 

### Updating existing entries 

Even for cases where we detect we have an existing entry we also want to perform a write to the table for two reasons: 

Firstly, it is rewritten in order to refresh its TTL counter back to the maximum value, keeping active ports' entries alive.

Secondly, we also re-write the port index, to correctly handle the corner case where the device might have been connected to a different port compared to when it was originally allocated. 

## War stories

For this ASIC design I stuck to my [classic project roadmap](https://talesonthewire.com/projects/two_weeks_until_tapeout/#project-roadmap) so after having finished writing the design and it having survived ~torture testing~ simulation I moved to the last validation step which was FPGA emulation. 

This last step is particularly important for devices such as these that are expected to correctly interface with third party equipment and for which the testbench might not do a proper job at capturing all the corner cases. 

And, let me, dear reader, tell you a funny story that happened while I was running this emulation. 

Picture this: it was an early 3am, I had finished bringing up the switch and everything was working as expected. At this point my mind was fixated on actively debating whether I should head off to bed and get a wink of sleep or toughen it out until sunrise and go directly [celebrate at waffle house.](https://talesonthewire.com/projects/tapeout_tradition/) For those wondering why I didn’t just head off to waffle house then and there: I am happily married an intend to keep it that way.

{{< figure
src="ssh.svg"
caption="2am emulation setup"
>}}

At that point my main work computer was connected via wired Ethernet to my switch, my switch to my router, and through there to my workstation.

And so there I was connected via ssh, running some physical implementation tests on my workstation, doing some small timing optimizations, when I decided that grabbing a swanky floorplan render would be a great addition to this ASIC’s documentation. 

And so, I opened a GUI … (I know, who does that ?)

Thus, I was interfacing with the physical implementation tools over SSH, with visual forwarding enabled so I could see my floorplan results, and the results were unexpectedly … slow … 

Like reaaaallllly slow … and laggy … and slow 

I was contemplating my ssh visual lag until my two remaining braincells reconnected and realized all my traffic was still being routed through the switch and that all the +9M packets that were composing my network traffic over the past few hours had been bottlenecked at 100 Mbps. 

I was sleep deprived your honor. 

Turns out linux’s network management favors wired connections over wireless when available. So as soon as the switch became available all my ethernet traffic had stopped going over my wireless interface (`wlp3s0`) and was instead routed through my wired interface (`enp2s0`). 

It turns out 100Mbps is enough for browsing ~reddit~ "the web" and [Australia](https://www.reddit.com/r/AskAnAustralian/comments/1tdr1lf/high_speed_internet/) but not enough for ssh visual forwarding of ASIC floorplans. 

At least we know one thing: it works ... Or at least, I think it works. 

The moment of truth will be around the 15th of November 2026 when I get the chips back from the fab: let’s see if it stands up to being silicon proven. 

### A very custom homelab 

For those not familiar with the term, "running a home lab" is the hobby of setting up and running a small datacenter tucked between the kitchen and the bedroom. It is also, as marriage counselors can attest to, a sign that the wife is a saint and that their marriage will be fine (allegedly). 

{{< quote source="The official ultimate authority on the question [r/homelab](https://www.reddit.com/r/homelab/wiki/)">}}
Homelab [hom-læb]: a laboratory of (usually slightly outdated) awesome in the domicile.
{{< /quote >}}

[So it probably comes as no huge surprise](https://talesonthewire.com/projects/d2020_p1/) that I have an interest in homelab’s. 

But one humble switch doesn’t qualify as a homelab, no, there must be more, and it just so happens that there is. 

This is actually part of a larger family of open source networking ASICs that I have dubbed the **"Coffee Shop"** family. 

It includes:
- [`coffeepot` first generation switch.](https://github.com/Essenceia/ethernet_switch_asic)
- [`teapot` Ethernet wrapper for building network connected accelerators.](https://github.com/Essenceia/Teapot)
- [`coldbrew` Ethernet connected beacon for broadcasting an ethernet frame with an uptime count until the heat death of the universe.](https://github.com/Essenceia/Until_Heat_Death_Do_Us_Part)

And,since all of the ASICs mentioned above are already taped out, in mid November when the silicon comes back I can start building my first fully custom homelab! 
 
{{< figure
src="homelab.svg"
caption="First generation custom home lab schematic, or how to take the term \"custom\" a bit too literally."
>}}

### What is next ? 

Obviously, the long-term plan is to replace my router and switch,but before that, I first need to get this switch silicon proven, and then expand it with both more entries for the address resolution table and more ports. Right now, because of the Tiny Tapeout shuttle's limitations, I can only fit three ports max. 
But if I move to a full chip, then I control all the pins! 🔥 w 🔥 

A full chip would allow me to greatly bump my pin could to between 56 and 122 pins,  giving me enough precious pins to make a much more respectable 8 ports switch chip.

{{< figure 
src="waffer.space.png"
caption="I have been eyeing the [wafer.space](https://wafer.space/) 0.5×1 slot so hard these days I might be starting to burn a hole through it. But alas, regrettably good practice requires to have something silicon proven before blowing up the area budget."
>}}

At which point, my measly four entries for the address resolution table just isn’t going to cut it. To address that, I can either scale the number of entries up with more pure digital logic as I am doing now, or change paradigms entirely and move to the analog realm. Because in this beautiful land  lives the mystical creature known for its low lookup latency and its far superior scaling prowess that is the [content-addressable memory, or CAM](https://en.wikipedia.org/wiki/Content-addressable_memory) for short. 🌈 

Although realistically I could maybe scale up the number of entries with a pure digital approach a few more orders of two’s, this would require significant additional logic complexity and would stretch my tight timing even more. But if I wanted say 64 entries or more, a CAM would be the way to go. 

## Closing words

So while I wait to get this first generation silicon back from the fab the next item on my TODO list is to build an analog content-addressable memory for sky130. 

Meanwhile, some of my previous silicon has started coming back with the first-generation systolic array recently landing in my mailbox!

{{< figure 
src="devboard.jpg"
caption="The devboard for the first Global Foundries experimental shuttle chip featuring [my first generation systolic array accelerator, mentioned in the previous Two weeks until tapeout article](https://talesonthewire.com/projects/two_weeks_until_tapeout/) has recently arrived. Hold on tight to your probes, it’s bring-up time !"
>}}

But before any of that can start, there's [one tradition I will never miss out on!](https://talesonthewire.com/projects/tapeout_tradition/)

{{< figure
src="coffee.jpg"
caption="Waffle House, but the waffles have already vanished. 🧇"
>}}


