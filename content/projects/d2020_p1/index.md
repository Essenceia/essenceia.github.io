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

These posts are about troubleshooting my way into a working configuration.


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
