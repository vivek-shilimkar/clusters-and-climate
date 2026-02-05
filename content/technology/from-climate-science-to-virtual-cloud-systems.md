---
title: "From Climate Science to Virtual Cloud Systems : Designing Green Cloud Systems"
date: 2026-02-05T17:32:37+00:00
draft: true
categories:
  - technology
tags:
  - cloud
  - sustainability
description: "Exploring the intersection of climate science and cloud computing to design sustainable and energy-efficient virtual systems."
---

## Introduction

Before I was involved with cloud infrastructure and distributed systems, I spent years studying the climate. I am a doctor by PhD — in climate science — and I have spent years understanding how Earth’s climate systems behave, how energy moves through the atmosphere and oceans, and how small imbalances accumulate into large, sometimes irreversible changes. Climate science teaches you patience, but it also teaches you discomfort. The thing about extreme climate events that I learned very early was that these do not arrive suddenly. They grow quietly, while everything still appears normal.

That way of thinking never really left me.

While I was still working with actual clouds in the atmosphere, I also started working with virtual clouds platforms, large-scale computing systems, and automation-heavy infrastructure. I could not help but notice familiar patterns. Not identical, of course — virtual cloud systems are not the actual cloud systems — but the shape of the problems felt similar. Complex systems. Feedback loops. Invisible background activity. Decisions made for convenience in the present that quietly push costs into the future.

My interest in building and designing virtual Green Cloud Systems comes from that place — not only technical, but also emotional. 

The term Green Cloud itself is not primarily about climate, at least not in the way many people assume. In fact, many of you may be encountering it for the first time. And if that is the case, it is completely natural to feel that the term sounds smooth, even harmless. If you decide to read about it on cloud provider blogs or in sustainability reports, you will encounter the same reassuring vocabulary again and again: net zero, carbon neutral, renewable-powered data centers. Everything sounds under control, as if the problem is already well understood — perhaps even solved.
But that sense of comfort is precisely what makes me uneasy.

In climate science, comforting narratives are often the most dangerous ones. They tend to appear right before we stop asking hard questions. And that is exactly why I want to start this discussion on Green Cloud from a very basic place, before tools, before metrics, before solutions.

This article is not about how to reduce your cloud carbon footprint. It is not about offsets, certifications, or choosing the “greenest” region. It is about how we think about systems.
Green Cloud, at its core, a simple but unsettling question I want to ask : Should this system be running at all, and if it does, how much of it is actually necessary?

In cloud-native environments, especially those built on platforms like Kubernetes, activity does not always neatly align with user demand. Large systems are alive even when applications are quiet. Control planes reconcile state. Nodes communicate continuously. Monitoring systems observe relentlessly. Automation pipelines execute because time has passed, not because reality has changed. From a distance, everything looks stable. From close up, everything is moving.
As a climate scientist, I was trained to pay attention to exactly this kind of background motions. In the Earth system, extreme events matter and those are devastating. But those extremes are the result of a small but continuous flow of energy, like global warming. A system can appear balanced while quietly drifting toward inefficiency or instability.
I wish that the cloud engineers start thinking in the same way.

This is not a moral appeal. It is not a call to “save the planet” through willpower alone. It is an invitation to examine system behavior honestly. To notice where automation has turned into a habit. To ask whether always-on infrastructure is still justified. To distinguish between reliability that is engineered and reliability that exists simply because everything is oversized.

I am going to write a series of articles about it because I believe Green Cloud deserves to be understood before systems are automated and tools are advocated. We need a shared mental model first. Without that, measurements become misleading and solutions become superficial.

So this article starts deliberately at the beginning. What does it actually mean for a cloud system to be “idle”? What assumptions do we carry from cost models into energy models without questioning them? And how many of our engineering decisions are shaped more by fear of failure than by evidence of necessity?

These are not questions with immediate answers. But they are the right questions to ask if we want to build Green Clouds rather than only talking about it.

In the articles that follow, I will move gradually from these fundamentals toward concrete examples — Kubernetes clusters that never truly sleep, CI pipelines that run because they always have, and design choices that trade short-term comfort for long-term waste. But none of that makes sense unless we first agree on why building a Green Cloud is, above all, a system design problem.

That is where this journey begins.