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

# Celestical Redstone D2020

The Celestica Redston D2020 is an 1U data center switch with 48 10GbE SFP+ ports and 4 QSFP+ 40GbE capable ports.
It has two 460W power supplies for redudancy, 5 colling fans, 1 ethernet RJ45, 1 console RJ45 and 1 USB type A port.

[Datasheet](/pdf/cls_datasheet_redstone_d2020_09.pdf) 

Unlike some other models it doesn't require any license to opperate.

I got mine off from [UNIXSurplusNet on ebay](https://www.ebay.com/str/unixsurplusnet?_trksid=p4429486.m3561.l161211) for 
150$ and it was shipped with a system report mentioning the admin username and password, as well as some
information on the general system and serial configuration.

## Ethernet ASIC

Thanks to this seller provided test report we learn that the main IC is showing up as a `Broadcom Trident 56846`.

This is probably of the first Trident generation, the `BCM56846KFRBG` of the Broadcome `BCM56840` family that has since been discontinued. 
This appears to be a custom broadcom ASIC targetting 10Gb ethernet applications with 64 integrated 10GBASE-KR capable serial PHY's.
In our switch 16 of these modules are configured such that 4 lanes are bounded together to form our 4 40GBASE-R ports.

{{< figure
    src="bcm56846.svg"
    alt="ascii art"
    caption="Broadcome ethernet IC configuration in our switch"
    >}}

I was unfortuantly unable to find a full datasheet describing this IC's internals in details.

So I do the next best thing... 

Poping the lid open we discover a single gorgeous multilayer PCB. 

Judging by the traces on the pcb coming from the ethernet connectors cages the broadcome IC is likely under the massive passive colling block. 

{{< figure
    src="images/d2020/pcb1.jpg"
    alt="pcb art"
    caption="Switch PCS top face, we can see the pcb traces going from the ethernet connector cages to bellow the big metal passive cooler"
    >}}

Looking at the porduct brief it appears this broadcome IC doesn't feature an CPU, rather it acts as a NIC connecting to the CPU via PCIe.

{{< figure
    src="images/d2020/pcie.png"
    alt="pcb art"
    caption="BCM56840 system schematics from the [products brief]()https://docs.broadcom.com/doc/12358267)."
    >}}

## CPU 

Our system's CPU is likely located bellow the block colling block as hinted by the DDR Sk hyinx DIMMs surounding another
imposing black passive cooler.

{{< figure
    src="images/d2020/pcb2.jpg"
    alt="pcb art"
    caption="Switch CPU surounded by multiple Skyinx DDR3 DIMs."
    >}}



Our processor chip is a Freescale `P2020`, this is a dual core PowerPC system with 2GB of external EEC DDR3 DRAM.
Here was can notice an intresting inconsistency, the switch datasheet lists the CPUs as running at 800MHz,
but when we reading the contents of `/proc/cpuinfo` they are reported as running at 1.2GHz.

```
# head -n 20 /proc/cpuinfo
processor       : 0
cpu             : e500v2
clock           : 1199.999988MHz
revision        : 5.1 (pvr 8021 1051)
bogomips        : 100.00

processor       : 1
cpu             : e500v2
clock           : 1199.999988MHz
revision        : 5.1 (pvr 8021 1051)
bogomips        : 100.00

total bogomips  : 200.00
timebase        : 50000000
platform        : P2020 CEL
model           : fsl,P2020
Memory          : 2048 MB
``` 

## Power and cooling 

Behind the processor we have a series of cooling fans flanked on both sides by our power blocks.
 
Both the power blocks and the 5 fans have connectors to the pcb making them detachable.
The fan's can be easily popped outcome out, and come off as a single block.
In practive only 4 fan's are needed for opperation, the 5th is redudant, so one fan block
can safely be removed at any time during operation.

{{< figure
    src="images/d2020/fan.jpg"
    caption="Detachable fan blocks, these were detached when the switch was not in opperation"
    alt="cute fan block connectors"
    >}}

## FPGA

Intrsetingly this PCB also features 4 Lattice FPGA's of the `MachXO2` family.

{{< figure
    src="images/d2020/fpga.jpg"
    caption="Lattice `LCMX02-1200UHC` FPGA on the PCB."
    alt="fpga spotted"
    >}}

These are realtively small FPGA's with only about 1280 LUT's each and are likely used as I2C bus controllers
for accessing the Digital Diagnostic Monitoring Interface (DDMI) on the optipcal transivers.

{{< figure 
    src="images/d2020/machXO2.png"
    caption="Lattice semiconductor MachXO2 family datahseet, overview of FPGA features. We have the `XO2-1200U` in our switch"
    alt="lattice machXO2 family features"
    >}}


For thoese unfamiliar optical transivers this interface allows real time access to the transiver's operating
parameters, and it includes a system of alarm and warning flags which alerts the host system when particular 
operating parameters are outside of a factory set normal operating range. Additionally this also includes information 
on the transiver itself, such at the vendor, it's laser wavelength,it's supported link length, and more.

Internally each transiver features an small microcontroller in charge of reporting these diagnostic information and
commincating this transiver information with the wider system via the 2-wire serial I2C bus.

{{< figure
    src="images/d2020/i2c_bus.svg"
    caption=""
    alt="i2b bus"
    >}}

Since an I2C bus is a shared medium and multiple transivers are connected onto the same I2C bus
the FPGA act's as the I2C Master of this bus.

# Connecting to the switch console

My original plan was to gain access to the switch command line interface via the console port.

{{< figure
    src="images/d2020/cable.jpg"
    caption="RJ45 to USB serial cable"
    alt="serial cable"
    >}}


To this end I had aquired an `RJ45 to USB` cable and configured my PC's serial to match the seller
provided serial configuration.

```
(Routing) #show serial

Serial Port Login Timeout (minutes)............ 5
Baud Rate (bps)................................ 9600
Character Size (bits).......................... 8
Flow Control................................... Disable
Stop Bits...................................... 1
Parity......................................... none
```

Initially all seemed to be going well, the serial cable was correctly getting detected as an 
USB to serial device as evidenced by my `dmesg` logs.

```sh
pitchu /etc >sudo dmesg | tail
[55357.778160] usb 1-4: new full-speed USB device number 7 using xhci_hcd
[55357.931485] usb 1-4: New USB device found, idVendor=1a86, idProduct=7523, bcdDevice= 2.54
[55357.931501] usb 1-4: New USB device strings: Mfr=0, Product=2, SerialNumber=0
[55357.931503] usb 1-4: Product: USB2.0-Ser!
[55357.936519] ch341 1-4:1.0: ch341-uart converter detected
[55357.949546] ch341-uart ttyUSB0: break control not supported, using simulated break
[55357.949663] usb 1-4: ch341-uart converter now attached to ttyUSB0
```

I was using picocom as my serial terminal with a baudrate of 9600, no flow control, a character size of 8, 1
stop bit and no parity. 


```bash
pitchu /dev/serial >sudo picocom -b 9600 /dev/ttyUSB0 --omap delbs
picocom v3.1

port is        : /dev/ttyUSB0
flowcontrol    : none
baudrate is    : 9600
parity is      : none
databits are   : 8
stopbits are   : 1
escape is      : C-a
local echo is  : no
noinit is      : no
noreset is     : no
hangup is      : no
nolock is      : no
send_cmd is    : sz -vv
receive_cmd is : rz -vv -E
imap is        :
omap is        : delbs,
emap is        : crcrlf,delbs,
logfile is     : none
initstring     : none
exit_after is  : not set
exit is        : no

Type [C-a] [C-h] to see available commands
Terminal ready
```
Yet, nothing happened, there was never any response from the consol port.
It was as if I was sending commands into the void .

Even after trying multiple different serial terminals such as `minicom` and `screen` as well as
trying different serial configuration I didn't see to find a way to sucessfully connect to the switch.

Was there something wrong with the switch, was it booting properly ?

# Checking liveness 

At this point the switch is powered and connected via it's console port the my PC but it's connected to the network.

Althoug the fans were spinning and I had some blinking, I wasnted to check if the switch was alive.
I connected the `RJ45` management port directly to my PC and started scanning network traffic on this link using `wireshark`.

22 bits of the MAC address are reserved for the equipement vendors idenfiers, and Celestica has the vendor identifier `0x00e0ec`.
Additionally, we know our switch's MAC address is `00:e0:ec:38:e5:d5`


After a little while an `ICMP` message originating from the MAC address `00:e0:ec:38:e5:d5` was captured.
We can spot our switch's MAC address as the source MAC in the packets MAC header.

```
0000   33 33 00 00 00 16 00 e0 ec 38 e5 d5 86 dd 60 00   33.......8....`.
                         ^^ ^^ ^^ ^^ ^^ ^^
0010   00 00 00 24 00 01 00 00 00 00 00 00 00 00 00 00   ...$............
0020   00 00 00 00 00 00 ff 02 00 00 00 00 00 00 00 00   ................
0030   00 00 00 00 00 16 3a 00 05 02 00 00 01 00 8f 00   ......:.........
0040   89 7c 00 00 00 01 04 00 00 00 ff 02 00 00 00 00   .|..............
0050   00 00 00 00 00 01 ff 38 e5 d5                     .......8..
```

This confirmed that our switch was indeed alive, so now we just needed to find another way in.

# Telnet

Since I now knew the switch was working and basic networking functionality was running as evidenced by the `ICMP` packet
I decided to check if there wasn't also an `ssh` port open. 

At this point I connected the switch to my home's router and started scanning my network using `nmap` see at what
IP it was going to be attributed.

```sh
pitchu /dev/serial >nmap -sn 192.168.4.0/24
Starting Nmap 7.94 ( https://nmap.org ) at 2023-10-03 16:13 PDT
Nmap scan report for 192.168.4.1
Host is up (0.018s latency).
Nmap scan report for 192.168.4.22
Host is up (0.0075s latency).
Nmap scan report for 192.168.4.81
Host is up (0.00045s latency).
Nmap scan report for 192.168.4.106
Host is up (0.015s latency).
Nmap done: 256 IP addresses (4 hosts up) scanned in 3.09 seconds
```

The switch was now at address `192.168.4.106` so I then proceeded to check what ports where open.

```sh
pitchu /dev/serial >nmap --top-ports 1000 192.168.4.106
Starting Nmap 7.94 ( https://nmap.org ) at 2023-10-03 16:16 PDT
Nmap scan report for 192.168.4.106
Host is up (0.0039s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE
23/tcp open  telnet
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 0.19 seconds
```

Although initially I had hoped for an open `ssh` port, `telnet` can also provide access to a virtual terminal and
it just as good for my local usecase.

I then opened a telnet connection and logged into the `admin` user's session.

```sh
pitchu /dev >telnet 192.168.4.106 23
Trying 192.168.4.106...
Connected to 192.168.4.106.
Escape character is '^]'.

User:admin
Password:
(Routing) >
```

Sucess :partying_face:

# Priviledge levels

When connecting to the switch, by default we log into a dedicated CLI with only has a very limited amount of commands.
```
TODO ?
```
To expand the available commands we need to enter `enable` to turn on priviledge commands.
We now have many more commands available to us.
```
TODO ?
```

Unfortuantly, this is still a basic CLI and I would rather the full power of a linux shell.
We can escape this CLI mode and access the linux shell by using `linuxsh` in this priviliedged mode.
```
TODO ? 
```

{{< figure
    src="images/d2020/cli.svg"
    caption="Priviledge escalation using the CLI to get the root linux shell."
    alt=""
    >}}

I can now fell home. 


# Reducing noise

At idle the fan duty cycle is set to `60%`, stated otherwise : this switch is cosplaying as a jet engine ... 
Obviously this isn't going to fly.

I can reduce the fan's pwm by overwriting the contents of `/sys/class/thermal/manual_pwm`. This
value is bounds within the `[0;255]` range. 
It is apparently advised to keep the temperature of all the switches internal components bellow `50` degrees celcius.

So far a `~15%` duty cycle seems to be a good compromise given my use case.
```
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

[QorIQ® P2020 and P2010 Dual- and Single-Core Communications Processors](https://www.nxp.com/products/processors-and-microcontrollers/power-architecture/qoriq-communication-processors/p-series/qoriq-p2020-and-p2010-dual-and-single-core-communications-processors:P2020)

[List of MAC addresses with vendor identifiers](https://gist.github.com/aallan/b4bb86db86079509e6159810ae9bd3e4).


