---
title: "Worst Is Better"
date: 2026-09-16
description: ""
summary: ""
tags: []
draft: false
showTableOfContents: false
showReadingTime: false
showWordCount: false
showTaxonomies: true
---

I believe in applying a worst-is-better development philosophy to my ASIC design, as modeled after [Richard P. Gabriel’s 1991 doctrine](https://dreamsongs.com/RiseOfWorseIsBetter.html).
But whereas the original doctrine was modeled for software allowing it to put simplicity first, hardware’s constraints make me hold correctness as the central tenant:
			
1. **Correctness** the design must be correct in all observable aspects. It is slightly better to be correct than simple. Correctness is the most important consideration in a design. 	
2. **Simplicity** the design must be simple, both in implementation and interface. It is more important for the implementation to be simple than the interfaces. 						
3. **Consistency** the design must not be overly inconsistent. Consistency can be sacrificed for simplicity in some cases.				
4. **Completeness** the design must cover as many important situations as is practical. All reasonably expected cases should be covered, and for cases where we are conforming to a standard, all mandatory feature sets. Optional features can be sacrificed in favor of any other quality. In fact, optional features must be sacrificed whenever implementation correctness is jeopardized. Consistency can be sacrificed to achieve completeness if simplicity is retained.


{{< figure 
	src="feature.jpg"
	caption="M.C Escher, Detailed view of the study for Cubic Space Division, 1952, [credit Escher in The Palace](https://escherinhetpaleis.nl/en/about-escher/escher-today/cubic-space-division)"
>}}
