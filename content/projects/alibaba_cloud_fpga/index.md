--- 
title: "Alibaba cloud FPGA: the bargain bin UltraScale+"
description: "Using a decommissioned Alibaba cloud accelerator card as an FPGA dev board"
summary: "No documentation, no problem!"
tags: ["fpga", "ebay", "debugging", "linux", "hacking"]
date: 2025-09-02
draft": true"
---

# Introduction

I was recently in the market for a new FPGA to start building a new projects on. 
 

Due to the scale of my upcomming projects a Xilinx series 7 UltraScale+ FPGA of the Virtex family would be perfect, but a Kintex series FPGA would be a sufficent for early prototyping.
Due to the partial reality of not wanting to part ways with the eye watering amounts of money that is
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

As for option `2`, Alinx
Alinx is  newer vendor that is still building up it's credibility in the west, 
there technical documentation is a bit sparse, but people that have bought them
are not reporting any issues.
Most importantly, Alinx provided very fairly priced development boards ranging
in the 900 to 1050 dollar ranges ( +150$ for the HPC FMC SFP+ extension board ).
Although these are not cheap by any metric, compared to where there competition 
price point these good value.


Option `2` was comming up ahead until I stumbled upon this ebay listing : 
 
{{< figure 
    src="ebay.png"
    alt="Ebay listing for a decommissioned Alibaba Cloud accelerator FPGA"
    caption="Ebay listing for a decommissioned Alibaba Cloud accelerator FPGA"
>}}
For 200$ this board featured a `XCKU3P-FFVB676`, 2 SPF+ connector and a x8 PCIe interface. 
On the flip side it came with no documentation whatsoever, no guaranty it worked, and the 
faint promise in the listing that there was a JTAG interface. \
A sane person would likely have dismissed this as an interesting internet oddity, a remanence 
of what happens when a generation of accelerator cards gets phased out in favor of the next, 
or maybe an expensive paperweight. \

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

## FPGA board JLINK interface 

{{< figure 
    src="board_jtag_intf.svg"
    alt="very nice documentation of the board jtag pinout"
    caption="6 pin board jtag interface"
>}}

## Segger JLINK :heart: 

{{< figure 
    src="segger_jlink_conn.svg"
    alt="very nice 20 pin segger jlink pinnout interface documentation"
    caption="20 pin segger jlink pinnout"
    >}}

## Wiring

{{< figure
    src="jtag_wiring.svg"
    alt="very nice jtag wiring driagram to connect jlink jtag probe to fpga board"
    caption="wiring driagram to connect jlink jtag probe to fpga board"
>}}

# Ressources 

[1] Xilinx Vivado Supported Devices : https://docs.amd.com/r/en-US/ug973-vivado-release-notes-install-license/Supported-Devices 

[2] Official Xilinx dev board : https://www.amd.com/en/products/adaptive-socs-and-fpgas/evaluation-boards/ek-u1-kcu116-g.html

[3] Alinx Kintex UltraScale+ dev boards : https://www.en.alinx.com/Product/FPGA-Development-Boards/Kintex-UltraScale-plus.html
