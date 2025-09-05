--- 
title: "Alibaba cloud FPGA: the bargain bin UltraScale+"
description: "Using a decommissioned Alibaba cloud accelerator card as an FPGA dev board"
summary: "No documentation, no problem!"
tags: ["fpga", "ebay", "debugging", "linux", "hacking"]
date: 2025-09-02
draft": true"
---

# Introduction

I was recently in the market for a new FPGA to start building my upcoming projects on. 
 

Due to the scale of my upcomming projects a Xilinx series 7 UltraScale+ FPGA of the Virtex family would be perfect,
 but a Kintex series FPGA will be a sufficent for early prototyping.
Due to not wanting to part ways with the eye watering amounts of money that is
required for an Vivado enterprise edition license
my choice was effectively narrowed to the FPGA chips available under the WebPack version of Vivado. 

{{< figure
    src="xilinx_doc.png"
    alt="Xilinx supported boards per vivado edition" 
    caption="Xilinx supported boards per vivado edition" 
>}} 


Unsurprisingly Xilinx are well aware of how top of the range the Virtex series are, 
as such they doesn't offer any Virtex chips with the webpack license. 
That said, they do offer support for two very respectable Kintex UltraScale+ FPGA models, the `XCKU3P` and the `XCKU5P`. [1]

{{< figure
    src="fpga_kintex.png"
    alt="Xiling product guide, overview for the Kintex UltraScale+ series"
    caption="Xiling product guide, overview for the Kintex UltraScale+ series"
>}}

These two chips are far from being small hobiest toys, with the smaller `XCUK3P` already boasting +162K LUTs and 
16 GTY transceivers, capable, depending on the physical constraints imposed by the chip packaging of 
operating at up to 32.75Gb/s.
  
Now that the chip selection has been narrowed down I set out to look for a dev board. 
 
My requirements for the board where that it featured : 
- at least 2 SFP+ or 1 QSFP connector 
- a JTAG interface 
- a PCIe interface at least x8 wide

As to where to get the board from, my options where : 
1. Design the board myself
2. Get the AXKU5 or AXKU3 from Alinx
3. See what I could unearth on the second hand market

Although option `1` could have likely been the most interesting, designing a 
dev board with both a high speed PCIe and ethernet interface was not the goal of 
today's project. 

As for option `2`,
Alinx is  newer vendor that is still building up it's credibility in the west, 
there technical documentation is a bit sparse, but people that have 
experimented with them seem to have experienced any issues.
Most importantly, Alinx provided very fairly priced development boards ranging
in the 900 to 1050 dollar ranges ( +150$ for the HPC FMC SFP+ extension board ).
Although these are not cheap by any metric, compared to the competition 
price point they are good value.


Option `2` was comming up ahead until I stumbled upon this ebay listing : 
 
{{< figure 
    src="ebay.png"
    alt="Ebay listing for a decommissioned Alibaba Cloud accelerator FPGA"
    caption="Ebay listing for a decommissioned Alibaba Cloud accelerator FPGA"
>}}
For 200$ this board featured a `XCKU3P-FFVB676`, 2 SPF+ connector and a x8 PCIe interface. 
On the flip side it came with no documentation whatsoever, no guaranty it worked, and the 
faint promise in the listing that there was a JTAG interface. 
A sane person would likely have dismissed this as an interesting internet oddity, a remanence 
of what happens when a generation of accelerator cards gets phased out in favor of the next, 
or maybe just an expensive paperweight. 

But I like a challenge, and the appeal of unlocking the 200$ Kintex UltraScale+ development board 
was to great to ignore. 

As such, I aim for this article to become the documentation paving the way to though this mirage. 

# PCIe interface

## Is it alive ? 

`dmesg` log : 

```
[    0.388790] pci 0000:00:00.0: [14e4:2712] type 01 class 0x060400
[    0.388817] pci 0000:00:00.0: PME# supported from D0 D3hot
[    0.389752] pci 0000:00:00.0: bridge configuration invalid ([bus 00-00]), reconfiguring
[    0.495733] brcm-pcie 1000110000.pcie: link up, 5.0 GT/s PCIe x1 (!SSC)
[    0.495759] pci 0000:01:00.0: [dabc:1017] type 00 class 0x020000
```


```
0000:00:00.0 PCI bridge: Broadcom Inc. and subsidiaries BCM2712 PCIe Bridge (rev 21) (prog-if 00 [Normal decode])
        Control: I/O- Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx-
        Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
        Latency: 0
        Interrupt: pin A routed to IRQ 38
        Bus: primary=00, secondary=01, subordinate=01, sec-latency=0
        Memory behind bridge: [disabled] [32-bit]
        Prefetchable memory behind bridge: 1800000000-182fffffff [size=768M] [32-bit]
        Secondary status: 66MHz- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- <SERR- <PERR-
        BridgeCtl: Parity- SERR- NoISA- VGA- VGA16- MAbort- >Reset- FastB2B-
                PriDiscTmr- SecDiscTmr- DiscTmrStat- DiscTmrSERREn-
        Capabilities: [48] Power Management version 3
                Flags: PMEClk- DSI- D1- D2- AuxCurrent=0mA PME(D0+,D1-,D2-,D3hot+,D3cold-)
                Status: D0 NoSoftRst+ PME-Enable- DSel=0 DScale=1 PME-
        Capabilities: [ac] Express (v2) Root Port (Slot-), MSI 00
                DevCap: MaxPayload 512 bytes, PhantFunc 0
                        ExtTag- RBE+
                DevCtl: CorrErr- NonFatalErr- FatalErr- UnsupReq-
                        RlxdOrd+ ExtTag- PhantFunc- AuxPwr+ NoSnoop+
                        MaxPayload 512 bytes, MaxReadReq 512 bytes
                DevSta: CorrErr- NonFatalErr- FatalErr- UnsupReq- AuxPwr- TransPend-
                LnkCap: Port #0, Speed 5GT/s, Width x1, ASPM L0s L1, Exit Latency L0s <2us, L1 <4us
                        ClockPM+ Surprise- LLActRep- BwNot+ ASPMOptComp+
                LnkCtl: ASPM Disabled; RCB 64 bytes, Disabled- CommClk-
                        ExtSynch- ClockPM- AutWidDis- BWInt- AutBWInt-
                LnkSta: Speed 5GT/s, Width x1
                        TrErr- Train- SlotClk+ DLActive- BWMgmt- ABWMgmt+
                RootCap: CRSVisible+
                RootCtl: ErrCorrectable- ErrNon-Fatal- ErrFatal- PMEIntEna+ CRSVisible+
                RootSta: PME ReqID 0000, PMEStatus- PMEPending-
                DevCap2: Completion Timeout: Range ABCD, TimeoutDis+ NROPrPrP- LTR+
                         10BitTagComp- 10BitTagReq- OBFF Via WAKE#, ExtFmt- EETLPPrefix-
                         EmergencyPowerReduction Not Supported, EmergencyPowerReductionInit-
                         FRS- LN System CLS Not Supported, TPHComp- ExtTPHComp- ARIFwd+
                         AtomicOpsCap: Routing- 32bit- 64bit- 128bitCAS-
                DevCtl2: Completion Timeout: 50us to 50ms, TimeoutDis- LTR- 10BitTagReq- OBFF Disabled, ARIFwd-
                         AtomicOpsCtl: ReqEn- EgressBlck-
                LnkCap2: Supported Link Speeds: 2.5-5GT/s, Crosslink- Retimer- 2Retimers- DRS+
                LnkCtl2: Target Link Speed: 5GT/s, EnterCompliance- SpeedDis-
                         Transmit Margin: Normal Operating Range, EnterModifiedCompliance- ComplianceSOS-
                         Compliance Preset/De-emphasis: -6dB de-emphasis, 0dB preshoot
                LnkSta2: Current De-emphasis Level: -6dB, EqualizationComplete- EqualizationPhase1-
                         EqualizationPhase2- EqualizationPhase3- LinkEqualizationRequest-
                         Retimer- 2Retimers- CrosslinkRes: unsupported, DRS-
                         DownstreamComp: Link Up - Present
        Capabilities: [100 v1] Advanced Error Reporting
                UESta:  DLP- SDES- TLP- FCP- CmpltTO- CmpltAbrt- UnxCmplt- RxOF- MalfTLP- ECRC- UnsupReq- ACSViol-
                UEMsk:  DLP- SDES- TLP- FCP- CmpltTO- CmpltAbrt- UnxCmplt- RxOF- MalfTLP- ECRC- UnsupReq- ACSViol-
                UESvrt: DLP+ SDES+ TLP- FCP+ CmpltTO- CmpltAbrt- UnxCmplt- RxOF+ MalfTLP+ ECRC- UnsupReq- ACSViol-
                CESta:  RxErr- BadTLP- BadDLLP- Rollover- Timeout- AdvNonFatalErr-
                CEMsk:  RxErr- BadTLP- BadDLLP- Rollover- Timeout- AdvNonFatalErr+
                AERCap: First Error Pointer: 00, ECRCGenCap+ ECRCGenEn- ECRCChkCap+ ECRCChkEn-
                        MultHdrRecCap- MultHdrRecEn- TLPPfxPres- HdrLogCap-
                HeaderLog: 00000000 00000000 00000000 00000000
                RootCmd: CERptEn+ NFERptEn+ FERptEn+
                RootSta: CERcvd- MultCERcvd- UERcvd- MultUERcvd-
                         FirstFatal- NonFatalMsg- FatalMsg- IntMsg 0
                ErrorSrc: ERR_COR: 0000 ERR_FATAL/NONFATAL: 0000
        Capabilities: [160 v1] Virtual Channel
                Caps:   LPEVC=0 RefClk=100ns PATEntryBits=1
                Arb:    Fixed- WRR32- WRR64- WRR128-
                Ctrl:   ArbSelect=Fixed
                Status: InProgress-
                VC0:    Caps:   PATOffset=00 MaxTimeSlots=1 RejSnoopTrans-
                        Arb:    Fixed- WRR32- WRR64- WRR128- TWRR128- WRR256-
                        Ctrl:   Enable+ ID=0 ArbSelect=Fixed TC/VC=ff
                        Status: NegoPending- InProgress-
        Capabilities: [180 v1] Vendor Specific Information: ID=0000 Rev=0 Len=028 <?>
        Capabilities: [240 v1] L1 PM Substates
                L1SubCap: PCI-PM_L1.2+ PCI-PM_L1.1+ ASPM_L1.2+ ASPM_L1.1+ L1_PM_Substates+
                          PortCommonModeRestoreTime=8us PortTPowerOnTime=10us
                L1SubCtl1: PCI-PM_L1.2- PCI-PM_L1.1- ASPM_L1.2- ASPM_L1.1-
                           T_CommonMode=1us LTR1.2_Threshold=0ns
                L1SubCtl2: T_PwrOn=10us
        Capabilities: [300 v1] Secondary PCI Express
                LnkCtl3: LnkEquIntrruptEn- PerformEqu-
                LaneErrStat: 0
        Kernel driver in use: pcieport

0000:01:00.0 Ethernet controller: Device dabc:1017
        Subsystem: Red Hat, Inc. Device a001
        Control: I/O- Mem- BusMaster- SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx-
        Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
        Region 0: Memory at 1820000000 (64-bit, prefetchable) [disabled] [size=2K]
        Region 2: Memory at 1800000000 (64-bit, prefetchable) [disabled] [size=512M]
        Capabilities: [40] Power Management version 3
                Flags: PMEClk- DSI- D1- D2- AuxCurrent=0mA PME(D0-,D1-,D2-,D3hot-,D3cold-)
                Status: D0 NoSoftRst+ PME-Enable- DSel=0 DScale=0 PME-
        Capabilities: [70] Express (v2) Endpoint, MSI 00
                DevCap: MaxPayload 1024 bytes, PhantFunc 0, Latency L0s <64ns, L1 <1us
                        ExtTag+ AttnBtn- AttnInd- PwrInd- RBE+ FLReset- SlotPowerLimit 0W
                DevCtl: CorrErr+ NonFatalErr+ FatalErr+ UnsupReq+
                        RlxdOrd+ ExtTag+ PhantFunc- AuxPwr- NoSnoop+
                        MaxPayload 512 bytes, MaxReadReq 512 bytes
                DevSta: CorrErr- NonFatalErr- FatalErr- UnsupReq- AuxPwr- TransPend-
                LnkCap: Port #0, Speed 8GT/s, Width x8, ASPM not supported
                        ClockPM- Surprise- LLActRep- BwNot- ASPMOptComp+
                LnkCtl: ASPM Disabled; RCB 64 bytes, Disabled- CommClk-
                        ExtSynch- ClockPM- AutWidDis- BWInt- AutBWInt-
                LnkSta: Speed 5GT/s (downgraded), Width x1 (downgraded)
                        TrErr- Train- SlotClk+ DLActive- BWMgmt- ABWMgmt-
                DevCap2: Completion Timeout: Range BC, TimeoutDis+ NROPrPrP- LTR-
                         10BitTagComp- 10BitTagReq- OBFF Not Supported, ExtFmt- EETLPPrefix-
                         EmergencyPowerReduction Not Supported, EmergencyPowerReductionInit-
                         FRS- TPHComp- ExtTPHComp-
                         AtomicOpsCap: 32bit- 64bit- 128bitCAS-
                DevCtl2: Completion Timeout: 50us to 50ms, TimeoutDis- LTR- 10BitTagReq- OBFF Disabled,
                         AtomicOpsCtl: ReqEn-
                LnkCap2: Supported Link Speeds: 2.5-8GT/s, Crosslink- Retimer- 2Retimers- DRS-
                LnkCtl2: Target Link Speed: 8GT/s, EnterCompliance- SpeedDis-
                         Transmit Margin: Normal Operating Range, EnterModifiedCompliance- ComplianceSOS-
                         Compliance Preset/De-emphasis: -6dB de-emphasis, 0dB preshoot
                LnkSta2: Current De-emphasis Level: -6dB, EqualizationComplete- EqualizationPhase1-
                         EqualizationPhase2- EqualizationPhase3- LinkEqualizationRequest-
                         Retimer- 2Retimers- CrosslinkRes: unsupported
        Capabilities: [100 v1] Advanced Error Reporting
                UESta:  DLP- SDES- TLP- FCP- CmpltTO- CmpltAbrt- UnxCmplt- RxOF- MalfTLP- ECRC- UnsupReq- ACSViol-
                UEMsk:  DLP- SDES- TLP- FCP- CmpltTO- CmpltAbrt- UnxCmplt- RxOF- MalfTLP- ECRC- UnsupReq- ACSViol-
                UESvrt: DLP+ SDES+ TLP- FCP+ CmpltTO- CmpltAbrt- UnxCmplt- RxOF+ MalfTLP+ ECRC- UnsupReq- ACSViol-
                CESta:  RxErr- BadTLP- BadDLLP- Rollover- Timeout- AdvNonFatalErr-
                CEMsk:  RxErr- BadTLP- BadDLLP- Rollover- Timeout- AdvNonFatalErr+
                AERCap: First Error Pointer: 00, ECRCGenCap- ECRCGenEn- ECRCChkCap- ECRCChkEn-
                        MultHdrRecCap- MultHdrRecEn- TLPPfxPres- HdrLogCap-
                HeaderLog: 00000000 00000000 00000000 00000000
        Capabilities: [1c0 v1] Secondary PCI Express
                LnkCtl3: LnkEquIntrruptEn- PerformEqu-
                LaneErrStat: 0
```
# JTAG interface 

Xilinx FPGAs can be configured by writing a bitstream to there internal CMOS Configuration Latches (CCL). 
This memory is volatile, so this configuration must be re-done on every power cycle. 
For in the field devices this bitstream would typically be read from an external SPI memory during initialisation, 
but for development purposes overwriting the contents of the CCLs over JTAG is acceptable.
 
This configuration is done by shifting in the entire FPGA configuration bitstream into the JTAG bus. 

## FPGA board JTAG interface 

As promissed by the original ebay listing the board did come with an accessible JTAG interface.

{{< figure
    src="pcb_jtag.jpg"
    alt="View of the JTAG interface on the PCB"
    caption="View of the JTAG interface on the PCB"
>}} 


In addition to a power reference, and ground, it featured the four mandatory signals comprising the JTAG TAP, 
which are : 
- **TCK** Test Clock 
- **TMS** Test Mode Select
- **TDI** Test Data Input 
- **TDO** Test Data Output 

That said, since there is not independant reset signal, so we will need to use the JTAG reset state. 


{{< figure 
    src="board_jtag_intf.svg"
    alt="very nice documentation of the board jtag pinout"
    caption="6 pin board jtag interface"
>}}

Anoter issue with this layout is that, likely in the intrest on saving on space and 
manifacturing cost given this accelerator was not desinged as a dev board, this JTAG interface 
doesn't follow an easily compatible layout on which I can just plug on one of my debug probes. 
As such, it will require some re-wiring. 

## Segger JLINK :heart: 

I do not own an AMD approved JTAG programmer. 

So, traditionally speaking, the Segger JLink is suited to debugging embedded CPU's let them be standalone or in a 
Zynq rather than configuring an FPGA. That being said, all we need to do is use JTAG to shift in a bitstream to the CLLs and 
technically speaking and programmable device with 4 sufficently fast GPIOs can be used as a JTAG programmer.  

Additionally, the Jlink is well supported by OpenOCD and I happened to own one. 
I could also have used an USB Blaster, which since this is considered to be a quartus tool would have been hillarious. 

{{< figure 
    src="segger_jlink_conn.svg"
    alt="very nice 20 pin segger jlink pinnout interface documentation"
    caption="20 pin segger jlink pinnout"
    >}}

### Wiring

Given my PCBs JTAG interface wasn't out of the box compatible with my JLinks probe 
it required some small rewiring. 

{{< figure
    src="jtag_wiring.svg"
    alt="very nice jtag wiring driagram to connect jlink jtag probe to fpga board"
    caption="wiring driagram to connect jlink jtag probe to fpga board"
>}}

## OpenOCD

OpenOCD is an free and open source on-chip debugger software that aims to be compatible with as many 
probes, boards and chips as possible.

Since OpenOCD has support for the Xilinx version of SVF (XSVF), my plan for my flashing flow will be to use the
Vivado generate the XSVF and have OpenOCD flash it. 

### Building OpenOCD

By default the version of OpenOCD that I got on my test server via the packet manager was quite outdated and missing features 
I will need down the line. 

Additionally, given it was unclear if configuring an Xilinx UltraScale+ FPGA's
had every been attemplted, due to the absence of posts on the matter, I figured I might run into a few issues
and having the ability to modify OpenOCB's source code could come in handy. 
 
As such, I decided to re-build it from source. 

This explains why, in following logs, I will be running OpenOCD version `0.12.0+dev-02170-gfcff4b712`.

Note : I have additionally re-build the jlink libs from source. 

## Determining the scan chain 

Since I do not have the shematics for the board I do not know how many devices are daisy-chainned on the board JTAG BUS. 
Additionally, I would like to confirm if the FPGA on the ebay listing is actually the one on the board. 
In the JTAG standard, each chainned device shall expose an accessible `IDCODE` register. 
This register is used to identify the manifacturer, device type, and revision number. 

By default, when setting up the JTAG server, one is expected to configure the TAPs on the scan chain with the expected `IDCODE` values
and the length of the instruction register for each device. 
Given this is an undocumented board off eaby, I am not sure what the chain looks like. 
Fortunatly, OpenOCB has an autoprobing functionallity, where it will do a bling interrogation in an **attempt** to discover 
the available TAPs and report them out. 

As such, my first order of buisness was doing this autoprobing. 

I used the following OpenOCB configuration, the autoprobling will be used as I did not specify any taps. 

```tcl
source [find interface/jlink.cfg]
transport select jtag

set SPEED 1
jtag_rclk $SPEED
adapter speed $SPEED

reset_config none
```

The blind interrogation sucessfully discovered a single TAP on the chain with an `IDCODE` of `0x04a63093`. 

```
gp@workhorse:~/tools/openocd_jlink_test/autoprob$ openocd
Open On-Chip Debugger 0.12.0+dev-02170-gfcff4b712 (2025-09-04-21:02)
Licensed under GNU GPL v2
For bug reports, read
	http://openocd.org/doc/doxygen/bugs.html
none separate
Info : Listening on port 6666 for tcl connections
Info : Listening on port 4444 for telnet connections
Info : J-Link V10 compiled Jan 30 2023 11:28:07
Info : Hardware version: 10.10
Info : VTarget = 1.812 V
Info : clock speed 1 kHz
Warn : There are no enabled taps.  AUTO PROBING MIGHT NOT WORK!!
Info : JTAG tap: auto0.tap tap/device found: 0x04a63093 (mfg: 0x049 (Xilinx), part: 0x4a63, ver: 0x0)
Warn : AUTO auto0.tap - use "jtag newtap auto0 tap -irlen 2 -expected-id 0x04a63093"
Error: IR capture error at bit 2, saw 0x3ffffffffffffff5 not 0x...3
Warn : Bypassing JTAG setup events due to errors
Warn : gdb services need one or more targets defined
```

Comparing against the `UltraScale Architecture Configuration User Guide (UG570)` we see that this `IDCODE` matches up
perfectly with the expected value for the `KU3P`. 

{{< figure
    src="idcode.png"
    alt="JTAG and IDCODE for UltraScale Architecture-based FPGAs"
    caption="JTAG and IDCODE for UltraScale Architecture-based FPGAs"
>}}

By default OpenOCB assumes a JTAG instruction lenght of 2 bits while our FPGA actually have an IR length of 6 bits. 
This is the root cause behind the IR capture error encountered during autoprobing `JTAG and IDCODE for UltraScale Architecture-based FPGAs`.
We can confirm this was our issues as, when we update our simple probling script to determine the `IDCODE` of a single 
TAP with an IR length of 6 bits we can re-detert the FPGA with no additional errors. 

```tcl
source [find interface/jlink.cfg]
transport select jtag

set SPEED 1
jtag_rclk $SPEED
adapter speed $SPEED

reset_config none

jtag newtap auto_detect tap -irlen 6
```

Output : 
```
gp@workhorse:~/tools/openocd_jlink_test/autoprob$ openocd
Open On-Chip Debugger 0.12.0+dev-02170-gfcff4b712 (2025-09-04-21:02)
Licensed under GNU GPL v2
For bug reports, read
	http://openocd.org/doc/doxygen/bugs.html
Info : Listening on port 6666 for tcl connections
Info : Listening on port 4444 for telnet connections
Info : J-Link V10 compiled Jan 30 2023 11:28:07
Info : Hardware version: 10.10
Info : VTarget = 1.812 V
Info : clock speed 1 kHz
Info : JTAG tap: auto_detect.tap tap/device found: 0x04a63093 (mfg: 0x049 (Xilinx), part: 0x4a63, ver: 0x0)
Warn : gdb services need one or more targets defined
```

Thus based on the probing, this is the JTAG scan chain I will be working with : 

{{< figure 
    src="scan_chain.svg"
    alt="JTAG scan chain for the alibaba cloud FPGA"
    caption="JTAG scan chain for the alibaba cloud FPGA"
>}}

## Systerm Monitor Registers

The xilinx UltraScale+ family has de 

# Pinout 

```
| Pin Index | Name | IO Standard | Location | Bank |
|-----------|------|-------------|----------|------|
| 0 | diff_100mhz_clk_p | LVDS | E18 | BANK67 |
| 1 | diff_100mhz_clk_n | LVDS | D18 | BANK67 |
| 2 | sfp_mgt_clk_p | LVDS | K7 | BANK227 |
| 3 | sfp_mgt_clk_n | LVDS | K6 | BANK227 |
| 4 | sfp_1_txn | - | B6 | BANK227 |
| 5 | sfp_1_txp | - | B7 | BANK227 |
| 6 | sfp_1_rxn | - | A3 | BANK227 |
| 7 | sfp_1_rxp | - | A4 | BANK227 |
| 8 | sfp_2_txn | - | D6 | BANK227 |
| 9 | sfp_2_txp | - | D7 | BANK227 |
| 10 | sfp_2_rxn | - | B1 | BANK227 |
| 11 | sfp_2_rxp | - | B2 | BANK227 |
| 12 | SFP_1_MOD_DEF_0 | LVCMOS18 | D14 | BANK87 |
| 13 | SFP_1_TX_FAULT | LVCMOS18 | B14 | BANK87 |
| 14 | SFP_1_LOS | LVCMOS18 | D13 | BANK87 |
| 15 | SFP_1_LED | LVCMOS18 | B12 | BANK87 |
| 16 | SFP_2_MOD_DEF_0 | LVCMOS18 | E11 | BANK86 |
| 17 | SFP_2_TX_FAULT | LVCMOS18 | F9 | BANK86 |
| 18 | SFP_2_LOS | LVCMOS18 | E10 | BANK86 |
| 19 | SFP_2_LED | LVCMOS18 | C12 | BANK87 |
| 20 | IIC_SDA_SFP_1 | LVCMOS18 | C14 | BANK87 |
| 21 | IIC_SCL_SFP_1 | LVCMOS18 | C13 | BANK87 |
| 22 | IIC_SDA_SFP_2 | LVCMOS18 | D11 | BANK86 |
| 23 | IIC_SCL_SFP_2 | LVCMOS18 | D10 | BANK86 |
| 24 | IIC_SDA_EEPROM_0 | LVCMOS18 | G10 | BANK86 |
| 25 | IIC_SCL_EEPROM_0 | LVCMOS18 | G9 | BANK86 |
| 26 | IIC_SDA_EEPROM_1 | LVCMOS18 | J15 | BANK87 |
| 27 | IIC_SCL_EEPROM_1 | LVCMOS18 | J14 | BANK87 |
| 28 | GPIO_LED_R | LVCMOS18 | A13 | BANK87 |
| 29 | GPIO_LED_G | LVCMOS18 | A12 | BANK87 |
| 30 | GPIO_LED_H | LVCMOS18 | B9 | BANK86 |
| 31 | GPIO_LED_1 | LVCMOS18 | B11 | BANK86 |
| 32 | GPIO_LED_2 | LVCMOS18 | C11 | BANK86 |
| 33 | GPIO_LED_3 | LVCMOS18 | A10 | BANK86 |
| 34 | GPIO_LED_4 | LVCMOS18 | B10 | BANK86 |
| 35 | pcie_mgt_clkn | - | T6 | BANK225 |
| 36 | pcie_mgt_clkp | - | T7 | BANK225 |
| 37 | pcie_tx0_n | - | R4 | BANK225 |
| 38 | pcie_tx1_n | - | U4 | BANK225 |
| 39 | pcie_tx2_n | - | W4 | BANK225 |
| 40 | pcie_tx3_n | - | AA4 | BANK225 |
| 41 | pcie_tx4_n | - | AC4 | BANK224 |
| 42 | pcie_tx5_n | - | AD6 | BANK224 |
| 43 | pcie_tx6_n | - | AE8 | BANK224 |
| 44 | pcie_tx7_n | - | AF6 | BANK224 |
| 45 | pcie_rx0_n | - | P1 | BANK225 |
| 46 | pcie_rx1_n | - | T1 | BANK225 |
| 47 | pcie_rx2_n | - | V1 | BANK225 |
| 48 | pcie_rx3_n | - | Y1 | BANK225 |
| 49 | pcie_rx4_n | - | AB1 | BANK224 |
| 50 | pcie_rx5_n | - | AD1 | BANK224 |
| 51 | pcie_rx6_n | - | AE3 | BANK224 |
| 52 | pcie_rx7_n | - | AF1 | BANK224 |
| 53 | pcie_tx0_p | - | R5 | BANK225 |
| 54 | pcie_tx1_p | - | U5 | BANK225 |
| 55 | pcie_tx2_p | - | W5 | BANK225 |
| 56 | pcie_tx3_p | - | AA5 | BANK225 |
| 57 | pcie_tx4_p | - | AC5 | BANK224 |
| 58 | pcie_tx5_p | - | AD7 | BANK224 |
| 59 | pcie_tx6_p | - | AE9 | BANK224 |
| 60 | pcie_tx7_p | - | AF7 | BANK224 |
| 61 | pcie_rx0_p | - | P2 | BANK225 |
| 62 | pcie_rx1_p | - | T2 | BANK225 |
| 63 | pcie_rx2_p | - | V2 | BANK225 |
| 64 | pcie_rx3_p | - | Y2 | BANK225 |
| 65 | pcie_rx4_p | - | AB2 | BANK224 |
| 66 | pcie_rx5_p | - | AD2 | BANK224 |
| 67 | pcie_rx6_p | - | AE4 | BANK224 |
| 68 | pcie_rx7_p | - | AF2 | BANK224 |
| 69 | pcie_perstn_rst | LVCMOS18 | A9 | BANK86 |
```

# Ressources 

[1] Xilinx Vivado Supported Devices : https://docs.amd.com/r/en-US/ug973-vivado-release-notes-install-license/Supported-Devices 

[2] Official Xilinx dev board : https://www.amd.com/en/products/adaptive-socs-and-fpgas/evaluation-boards/ek-u1-kcu116-g.html

[3] Alinx Kintex UltraScale+ dev boards : https://www.en.alinx.com/Product/FPGA-Development-Boards/Kintex-UltraScale-plus.html

UltraScale Architecture Configuration User Guide (UG570) : https://docs.amd.com/r/en-US/ug570-ultrascale-configuration/Device-Resources-and-Configuration-Bitstream-Lengths?section=gyn1703168518425__table_vyh_4hs_szb
