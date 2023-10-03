---
title: "Troubleshooting the redstone D2020"
date: 2023-10-02
description: ""
summary: ""
tags: ["linux", "network", "switch"]
draft: false
---

# Introduction

Because one of my current project is building the ethernet physical layer for 10G and 40G fiber I went out and bough
a decomissioned Redstone D2020 enterprise switch from ebay.
Although there is practically no documentation on this switch and I have no prior experience working with
network equipement wathsoever it was cheap. 
2 weeks latter this beauty showed up.

These posts are about troublshooting my way to a working setup.

# Initial impressions

The Celestica Redston D2020 is an 1U data center switch with 48 10GbE SFP+ ports and 4 QSFP+ 40GbE capable ports.
It has two 460W power supplies for redudancy, 5 colling fans, 1 ethernet RJ45, 1 console RJ45 and 1 USB type A port.

[Datasheet](/pdf/cls_datasheet_redstone_d2020_09.pdf) 

Unlike some other models it doesn't require any license to opperate.

I got mine off from [UNIXSurplusNet on ebay](https://www.ebay.com/str/unixsurplusnet?_trksid=p4429486.m3561.l161211) for 
150$ and it was shipped with a system report mentioning the admin username and password, as well as some
information on the general system and serial configuration.

Thanks to it we learn that the main IC is showing up as a `Broadcom Trident 56846`.
This is probably of the first Trident generation, the `BCM56846KFRBG` of the Broadcome `BCM56840` family that has since been discontinued. 
This appears to be a custom broadcom ASIC targetting 10Gb ethernet applications with 64 integrated 10GBASE-KR capable serial PHY's.
In our switch 16 of these modules are configured such that 4 lanes are bounded together to form our 4 40GBASE-R ports.

{{< figure
    src="bcm56846.svg"
    alt="ascii art"
    caption="Broadcome ethernet IC configuration in our switch"
    >}}

I was unfortuantly unable to find a datasheet describing this IC's internals in detail.

Poping the lid open we discover a single gorgeous multilayer PCB. 
Judging by the traces coming from the ethernet connectors the broadcome IC is likely under the massive passive colling block. 

{{< figure
    src="images/d2020/pcb1.jpg"
    alt="pcb art"
    caption="Admiring a beautiful PCB, top face"
    >}}

Both the power blocks and the 5 fans have connectors to the pcb making them easily detachable.

{{< figure
    src="images/d2020/pcb2.jpg"
    caption="Detachable fan blocks connectors"
    alt="cute fan block connectors"
    >}}

Intrsetingly this PCB also features 4 small Lattice FPGA's of the `MachX02` family, though at a glance it is 
unclear what these are used for. 
I might glean more information if I was to check out the back side of the pcb.




# Reducing noise

At idle the fan duty cycle is set to `60%`, stated otherwise : this switch is cosplaying as a jet engine ... 
Obviously this isn't going to fly.

I can reduce the fan's pwm by overwriting the contents of `/sys/class/thermal/manual_pwm`. This
value is bounds within the `[0;255]` range. 
It is apparently advised to keep the temperature of all the switches internal components bellow `50` degrees celcius.

So far a `~15%` duty cycle seems to be a good compromise given my use case.
```sh
# echo 40 > /sys/class/thermal/manual_pwm
```

## Check thermals

To check thermals, either exit `linuxsh` using the `exit` comand and check the equipement's status using `show environment` :
```sh
# exit

Connection closed by foreign host.
(Routing) #show environment

Temp (C)....................................... 37
Fan Speed, RPM................................. 3181
Fan Duty Level................................. 16%
Temperature traps range: 0 to 45 degrees (Celsius)

Temperature Sensors:
Unit     Sensor  Description       Temp (C)    State           Max_Temp (C)
----     ------  ----------------  ----------  --------------  --------------
1        1       lm75_p2020        30          Normal          30
1        2       lm75_bcm56846     37          Normal          39
1        3       lm75_LIA          32          Normal          32
1        4       lm75_RIA          27          Normal          27
1        5       lm75_ROA          26          Normal          26
1        6       lm75_psuinlet1    27          Normal          33
1        7       lm75_psuinlet2    26          Normal          26

Fans:
Unit Fan Description    Type      Speed         Duty level    State
---- --- -------------- --------- ------------- ------------- --------------
1    1   Fan-1          Removable 3181          16%           Operational
1    2   Fan-2          Removable 3186          16%           Operational
1    3   Fan-3          Removable 3171          16%           Operational
1    4   Fan-4          Removable 3215          16%           Operational
1    5   Fan-5          Removable 3178          16%           Operational

Power Modules:
Unit     Power supply   Description        Type          State
----     ------------   ----------------   ----------    --------------
1        1              PS-1               Removable     Operational
1        2              PS-2               Removable     Operational
```

Or read the contents of the `*_temp` files in the `/sys/class/thermal` folder.
```sh
# cd /sys/class/thermal/
# ls
LIA_temp        bcm56846_temp   fan3speed       manual_pwm      psu2_status
RIA_temp        fan1speed       fan4speed       p2020_temp      psuinlet1_temp
ROA_temp        fan2speed       fan5speed       psu1_status     psuinlet2_temp
```
Since `cat` may not be installed by default, you can quickly real the files using `head`.
```sh
# head ROA_temp
28
```

# Resources 

[Reddit thread](https://www.reddit.com/r/homelab/comments/jzv2wv/redstone_d2020_48x_10gbe_sfp_4x_qsfp_switch/)

Boardcome ASIC :

[Is Broadcom’s chip powering Juniper’s Stratus?](https://www.gazettabyte.com/home/2010/10/14/is-broadcoms-chip-powering-junipers-stratus.html)

[HIGH-CAPACITY STRATAXGS® ETHERNET SWITCH FAMILY WITH INTEGRATED 10G SERIAL PHY](https://docs.broadcom.com/doc/12358267)
