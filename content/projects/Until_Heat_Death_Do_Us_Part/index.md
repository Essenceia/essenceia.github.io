---
title: "Until Heat Death Do Us Part"
date: 2026-07-04
description: "Broadcasting over Ethernet until the heat death of the universe with a custom ASIC, or yet another terrible idea this time inspired by reddit."
summary: "Broadcasting over Ethernet until the heat death of the universe with a custom ASIC, or yet another terrible idea this time inspired by reddit."
tags: ["asic", "gf180", "180nm", "rtl", "verilog", "Ethernet", "100Mbps", "reddit"]
draft: true
showTableOfContents: true
---

AI disclosure: All bugs are 100% human made. 


As regular readers would be well aware I have a thing for terrible ideas. But after an intense schedule working towards taping out my Ethernet switch ASIC my brain was clearly and simply fried. And when a previously closed experimental shuttle re-opened, dangling before me the irresistible allure of free silicon area, I couldn’t come up with a single original terrible idea for what to build. 

So I did the next worst thing I could think of and asked reddit for advice.

And, the r/chipdesign community delivered: there was quite a turnout with a wide mix of horrendous suggestions. Some honorable mentions were to “actually purposefully build an antenna this time” or a “CPU with no cache, no ram and only disk “. But by far my favorite idea came courtesy of [“thegreatpotatogod”](https://www.reddit.com/r/chipdesign/comments/1uk54wj/comment/ouubmks/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button) and was : 
{{< figure 
src="reddit.png"
description="A counter that has enough bits to count from now until the heat death of the universe, and is determined to do so."
>}}

And I am going to build just that! Also, I only have a little over 48 hours to build this, but since building a counter by itself isn’t ambitious enough I am going to bolt on an 100Mbps Ethernet interface, because I do have at least 48 hours to build this!


This article is going to be a short one, but frait not regular reader, for if you were expecting to spend your afternoon reading a blog post about ASIC design, I have a small novel on designing an ethernet switch from scratch coming down the pipeline for you. 
## Heat death is going to take a while 


Alright, so the plan is to build an ASIC with a large enough counter to theoretically count until the heat death of the universe … 
Assuming the silicon is clocked at 50Mhz and the counter value is incremented ever 20ns (20*10^-9 second) we are going to be in need of a veryyyyyyyyyyyy 
big counter …. 

For this design let’s assume the universe is freed of the pesky hassle of thermodynamic free energy in approximately $10^{100}$ years. I know, I know, this timescale is a hotly debated topic and I could be off by a few factors of 10 but can we at least agree that a [googol](https://en.wikipedia.org/wiki/Googol) is an easier number to remember. 

So, assuming the big freeze arrives in $10^{100}$ years and we are operating at 50Mhz, we have: 
- $`50*10^{6}`$ ticks per second
- $`50*10^{6}*60*60*24`$ ticks per day
- $`50*10^{6}*60*60*24*365.25`$ ticks per year
- $`50*10^{6}*60*60*24*365.25*10^{100}`$ ticks until the big freeze

So we need a \(log_2(50*10^{6}*60*60*24*365.25*10^{100}) = 382.679718 \approx 383\) sized counter ... at the very least. Now let’s round that up to \(384\) bits or a nice \(48\) bytes to make it neatly fit into our Ethernet payload. 

There are a few issues with building a 384 bits counter. Firstly, I need 384 bits of storage which, considering how disproportionately big flip-flops are in terms of area, is going to make for quite the large design. 

Secondly, even if I was to use the most performance optimized type of adder out there, unless I was designing at an advanced node (not my current target of global foundries “180”nm), there is no way this addition is ever meeting timing in a single 20ns cycle. 

The first problem I can live with, as for the second, I will just need to design around it. Thus, this is the story of how our morbidly obese counter got split into 24 leaner 16 bit counters with the previous counter’s overflow bits cascading into the next. 

## Polluting my local network 

The more custom logic I design the more I come to fully appreciate well established widely supported protocols. Partly because most of the imprecisions and undefined behaviors have already been ironed out by someone else, partly because this means that, as long as I correctly comply with the spec I can re-use existing infrastructure built and maintained by somebody else. So unless I have an explicit need for something truly custom I would really rather stick with something everyone speaks. And what is more universal than Ethernet? 

Alright, there might be more universal protocols than Ethernet in terms of absolute number of devices (i2c) or total cumulative bandwidth (PCIe), but Ethernet’s IEEE 802.3 spec is well defined, not behind a paid paywall, simple, covers a wide range of physical layers at varying bandwidths and I like it. 

While working towards building the Ethernet switch I had just built an [100Mbps Ethernet interfacing infrastructure for connecting ASIC accelerators over my local network](https://github.com/Essenceia/Teapot). And since there isn’t any strong incentive to design a custom parallel bus protocol and all the custom MCU code that goes with it for this ASIC I thought: why not just broadcast over Ethernet ? 

Now another great thing about Ethernet in the context of this project is that humanity will probably remember how to speak Ethernet for much longer than I can remember how my custom parallel bus protocol works. The problem is that, in the context of the heat death of the universe, humanity still existing is the bottleneck. So here is to hoping our paperclip optimized overlords will still have the 802.3 spec in their training data by then. 


### What does the broadcast look like 

Unlike the base case for a network connected accelerator the end of the universe counter block doesn’t listen to incoming packets on the network, even if they are addressed to it. This design decision was made because we are all going to be dead soon anyways.

So every second this hardware sends an Ethernet frame to the broadcast designation address ( destination MAC : FF:FF:FF:FF:FF:FF ) containing the latest 48 byte counter value over the local network. Just like a cute little beacon forever reminding the vast emptiness that a group of apes that made religious rituals out of watching cat videos, were once here. 

Full packet layout
```
[ preamble (7 Bytes)][ start of frame delimiter (1 Byte)][ dst mac (6 Bytes) FF:FF:FF:FF:FF:FF ][ src mac (6 Bytes) ASIC mac, configurable ][ ethtype = 0x88B5 (2 Bytes) ][ magic number (2 Bytes) 0xCAFE ][ counter (48 Bytes) ][ FCS (4 Bytes) ] 
```

Whereas IPv4 Ethernet frame use the 0x0800 ethertype, the 0x88B5 ethertype is one of the two official IEEE sanctioned type usable for local experimental protocols, which once again puts us squarely in the “I am respecting the spec”  if you skwint hard enough territory.    

The only slight problem with this is that, since this is an experimental ethtype, the payload layout is also just as experimental. Now assuming there are no other devices speaking 0x88B5 over your local network this should be fine. So for everyone else also running multiple instances of experimental hardware on their local network I have added an additional 2 Byte magic number using the all so original 0xCAFE (little endian) allowing packet parsers to distinguish between this ASIC’s experimental traffic and your other experimental traffic. 

payload:
```
[ magic number (2 Bytes) 0xCAFE ][ counter (48 Bytes) ]
```


## Witnessing the pollution 

Once again this ASIC is being tapped out on an experimental Tiny Tapeout shuttle chip targeting the Global Foundries 180nm and will be part of the 2nd run of Wafer Space. Now I will contain my design to rave on again about Tiny Tapeout, the shuttle chip idea is brilliant and the work they are putting it to make this reliable and affordable is top notch. I can’t recommend this program enough whether you are an MSe EE student wanting to get your first taste of a tapeout or an experienced designer wanting to get a silicon proven design before committing to a full chip. 

Assuming the experimental shuttle chip is functional the silicon might be available for purchase on the [Tiny Tapeout store in 6 months.](https://store.tinytapeout.com/) To be clear, I am not getting payed to say this, I am just a very biased external participant. 

So assuming you have connected this device to your local network, to help your descendants sniff said local network traffic and parse the ethernet frame I am providing 
the `packet_receiver` program under the tools folder of the github repo in case everyone has forgotten how to code by then. 
In the event compilers are still a thing they can build it with: 
```
cd tools
make
```

To run: specify the network interface you want to sniff as the first argument, also yes, you need sudo mode.

Eg:
```
sudo ./packet_receiver wlp3s0
```

Now it is parsing the counter value as a `uint64_t` so technically this will only work correctly 
for the next 11680 years. Now I know this is concerning and you must be shocked at such sloppy engineering 
practice of knowingly releasing buggy software, I hear you. But let us first let humanity survive the [Epochalypse](https://en.wikipedia.org/wiki/Year_2038_problem)
before we start quibbling over this one. 

Just open an issue when you encounter the bug, I will fix it if I'm available. 

### Getting a head start

So when you run the packet receiver you should be treated with a stream of messages that looks something like this : 
```
dst mac ff:ff:ff:ff:ff:ff
src mac 00:90:cf:00:be:ef
ethtype 88b5
counter: 6970468860001
raw pkt: ffffffffffff0090cf00beef88b5feca610052f05606000000000000000000000000000000000000000000000000000000000000000000000000000000000000

dst mac ff:ff:ff:ff:ff:ff
src mac 00:90:cf:00:be:ef
ethtype 88b5
counter: 6970518798433
raw pkt: ffffffffffff0090cf00beef88b5feca61004cf35606000000000000000000000000000000000000000000000000000000000000000000000000000000000000

dst mac ff:ff:ff:ff:ff:ff
src mac 00:90:cf:00:be:ef
ethtype 88b5
counter: 6970568802401
raw pkt: ffffffffffff0090cf00beef88b5feca610047f65606000000000000000000000000000000000000000000000000000000000000000000000000000000000000

dst mac ff:ff:ff:ff:ff:ff
src mac 00:90:cf:00:be:ef
ethtype 88b5
counter: 6970618806369
raw pkt: ffffffffffff0090cf00beef88b5feca610042f95606000000000000000000000000000000000000000000000000000000000000000000000000000000000000

dst mac ff:ff:ff:ff:ff:ff
src mac 00:90:cf:00:be:ef
ethtype 88b5
counter: 6970668810337
raw pkt: ffffffffffff0090cf00beef88b5feca61003dfc5606000000000000000000000000000000000000000000000000000000000000000000000000000000000000
```
Now as an astute reader you are certainly wondering just how I am getting this output knowing that the silicon isn’t going to be available before at least 6 more months. And to answer that mystery let me tell you about FPGA emulation, the idea is to emulate the ASIC’s design on an FPGA in as close to final conditions are possible, in order to validate that the design and all the assumptions that have been made during the design phase, actually work when confronted against cold harsh reality. This is part [of both my and the industry established ASIC flow]( https://talesonthewire.com/projects/two_weeks_until_tapeout/#project-roadmap), because there is not chance in hell I am risking tapeing out anything above trivial without any FPGA emulation + real world software testing if applicable. 

Born from the same instinct as the suspicion placed upon any testbench that passes on the first run, call it having been burned enough time to know you most certainly forgot something experience. 

{{< figure
src="fpga.png"
caption="FPGA emulation connected to my local network. Using the widely available [basys3 from Digilent](https://digilent.com/shop/basys-3-amd-artix-7-fpga-trainer-board-recommended-for-introductory-users/) as my emulator of choice these days thanks to its abundance of easily accessible GPIO, making it perfect for my prototyping needs."
>}}

But most importantly: thanks to this setup I can get a 6 months head start !


## Waffle time 

Well this went more smoothly than expected. The emulated counter has just passed 7047549681761 ticks, the design has been submitted to the shuttle and I didn’t even need to pull a single all right this time. 

Maybe I should have done the CPU ?


{{< figure
src="wafflehouse.jpg"
caption="[Traditional post tapeout celebratory waffles! Help me spread this tradition.](https://talesonthewire.com/projects/tapeout_tradition/)"
>}}





