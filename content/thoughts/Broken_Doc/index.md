---
title: "The hardware isn't broken, the documentation is !"
date: 2026-05-12
description: "Silicon errats or how my first analog ASIC is dead before arrival."
summary: "Silicon errats or how my first analog ASIC is dead before arrival."
tags: ["ASIC", "analog", "bugs", "documentation", "humor"]
draft: false
showTableOfContents: false
---

Picture this: you have just submitted your latest change, the tapeout countdown has reached 0 and started going negative, and stairing you in the face, 
smack in the middle of your floorplan is a massive issue. 
{{< figure
	src="feature.png"
	caption="Austin we have a problem !" 
>}}

If this was software you might be able to deploy a quick patch, maybe abort the deployment, hoping not too many machines where doing to melt down because of your stupidity. 
But this is cold hardware, and the shuttle run's policy is very clear: once the clock runs out you can shove your sobbing complaints down the `/dev/null` inbox. 

So here we are, staring at an analog ring oscillator missing power.
{{< figure
	src="crime.png"
	caption="Metal3 connection is missing between the vias connecting the power lines on metal4. For my defense your honnor I would like to advance the evidence that it was 4 am and I was out of coffee."  
>}}

This is why you should run LVS kids. 

At least I can find solace in the kawaii pixel art on metal4, and the fact that there were other analog design in this tapeout. 
But mostly in the fact that this is another analog design. 

Now that the lamenting is over, the questions can transition from "How did I not see this ?" and "Is the second ring oscillator alright ?" to
"How do we salvage this ?". 
Luckily for me, the silicon industry has since long established a tradition for dealing with cases like these and it goes something like this : 
> _The hardware isn't broken, the documentation is._™ \(^1\)

Behind each of these "silicon errats" hides traced of a very nerve racking meeting where the cost of a chip 
respins\(^2\) and or recall lie in the balance. Needless to say, erratums are a very appealing option. 
No wonder you can't read a doc without stepping on one.  

{{< katex >}}
And so, I now have the luxury of writing my very first silicon erratum\(^3\)!
Behold doing to much hardware does to your brain: 

{{< quote >}}

## Silicon errata

| Errata # | Title | Impact | Affected Revisions | Fixed Revision |
| -------- | ----- | ------ | ------------------ | -------------- |
| 1 | VSS unconnected to the ring oscillator wired to analog pin 1 | Information | sky26a v1.0 | v2.0 |

Impact Definition: Each erratum is marked with an impact, as defined below:
- Minor - Workaround exists.
- Major - Errata that do not conform to the data sheet or standard.
- Information - The device behavior is not ideal but acceptable. Typically, the data sheet will be
changed to match the device behavior.

### Errata #1

#### Errata Details 

**Description**: Power, driven over VSS, is unconnected to the ring oscillator connected to analog pin 1. 

**Impacts**: No oscillating wave will be produced on analog pin 1. 

**Workaround**: Use the oscillator connected to analog pin 0. Given both oscillators have the same target 33Mhz oscillating frequency, so this should not impact operations. 

{{< /quote >}}

The documentation has now been fixed, all is now well in the world. 

Moral of the story: there is none, but at least the bird is cute. 

{{< figure 
	src="bird.png" 
>}} 

1: Surely someone has trademarked this invaluable and advanced technic of problem dodging? Sure hope they havn't patented it.  

2: Maybe you can get away with doing only a partial respin, how lucky are you felling today? 

3: Which after been in this industry since 2019 and this being my first purely analog tapeout is a fact I am very proud of. Which should not detur anyone from the fact that I didn't run LVS, thus I am an idiot and also this still doesn't work. 

