---
title: "Quiet, Always-On: How Development and Test Clusters Accumulate Energy Use"
date: 2026-02-12
draft: false
author: Dr. Vivek Shilimkar
description: "Development and test environments often run 24/7 despite being used only during business hours. This article explores the hidden energy costs of always-on infrastructure and practical strategies to reduce the carbon footprint of non-production workloads."
tags: ["greencloud", "sustainability", "kubernetes", "cloud", "energy-efficiency", "devops"]
categories: ["technology"]
image: "/images/tech/quiet-home.png"
---

Production cluster systems are the most important since they serve customers. Most of the production clusters are overprovisioned with a “just in case” reason. However, their energy use is visible, accepted, and often defended as necessary. 
But, not all the Kubernetes clusters are production clusters. 

There are development environments running on clusters, testing platforms, CI execution clusters, stating setups, and short lived experiments. These clusters do not face customers/users, they face engineers. And yet many of them run 24*7 as production, and quietly become permanent. Even when no developer is testing the code, the cluster is left running, for working on it tomorrow. 

I've seen this myself. Development clusters left running through periods when no one was working, no tests were scheduled, no releases were planned and engineers are sleeping. When the engineers returned, everything was normal. Stable. Quiet. Healthy. Ready for engineers to start coding and testing.

![night-run](/images/tech/running-night.png)

Readiness of the cluster comes with a cost.

Servers do not stop drawing power when developers log off. CPUs leak power even when idle. Memory remains powered. Fans continue to cool the system. A large portion of energy consumption is baseline - simply to keep the infrastructure on, not when the engineers are busy developing/testing. Since these clusters don’t make any noise or emit smoke like factories at their location, the fact that they remain fully powered and consumes energy the whole time goes completely unnoticed. When the development and test clusters remain online continuously, that baseline energy use accumulates over a week and this baseline energy consumption is about 3 times more than when the engineer is actually working. 

This pattern shows up across many non-production environments.
Staging and pre-production clusters are heavily used around release windows, but often sit idle between cycles. Still they are kept fully powered to mirror production, even when nothing is being validated/tested.
CI and test execution clusters are designed to be triggered by code changes. In practice, many are running nightly builds and repeated test matrices by habit rather than necessity.

Individually, none of these clusters are significant. Collectively, they add up. 
These non-production clusters are quiet and that makes them easy to miss in terms of energy use. They rarely fail and trigger incidents. And because they are not production clusters or facing customers, these rarely attract architectural attention once they are created.

## Quantifying the Quiet

Numbers help make the invisible visible. Consider a typical mid-sized engineering organization:
* 10 development clusters (5 nodes each, 4 vCPUs and 16GB RAM per node)
* 3 test environments with similar configurations
* 2 staging environments

Each virtual node draws roughly 50-100W on average. Running continuously:
* Daily energy per environment: ~15-30 kWh
* Monthly per environment: 450-900 kWh
* Annual across all environments: ~70,000-140,000 kWh

That's equivalent to the electricity consumption of 5-10 average homes annually. Just for infrastructure that sits mostly unused outside business hours.

The math is straightforward. If engineers work 40 hours per week out of 168 total hours, these clusters are actively used less than 25% of the time. Yet they consume energy continuously. The other 75% - nights, weekends, holidays - the servers remain powered, CPUs tick, memory stays active, and cooling systems run. All waiting for the next morning's git push.

Green Cloud thinking becomes practical at this point. Not by just questioning production reliability, but by looking honestly at development and test environments and questioning their runtime. Are these environments serving active work, or simply existing because you might use them again after almost 15 hours?

> ### The issue is not that these clusters exist, it is that their existence after working hours is unquestioned.

## Why They Stay On

The reasons are not mysterious:

**Convenience** - Developers expect their environments ready when they arrive. Waiting five minutes for a cluster to start feels like friction.

**Dependencies** - Modern applications are complex webs of services, databases, message queues, caches, and external service mocks. Getting all of these to start cleanly and in the correct order is non-trivial.

**State preservation** - Some test environments carry context across sessions. Shutting them down means losing that accumulated state.

**Fear** - "It works now. If we touch it, something might break." The risk-averse default is to leave things as they are.

**Invisible cost** - Unlike on-premises server rooms with visible power bills, cloud infrastructure costs are abstracted. Energy consumption is buried in monthly invoices, not felt directly.

**Lack of tooling** - Many organizations simply don't have automated systems to safely shut down and restart environments. So they don't.

## What Can Be Done

The solution is not to eliminate these environments. Engineers need them. The solution is to match their runtime to their actual usage patterns.

### 1. Scheduled Shutdown and Startup

Align environment availability with working hours. If no one works between 6 PM and 8 AM, why should the clusters? Automated scheduling can power down environments in the evening and bring them back up in the morning.

Most cloud providers offer native scheduling. AWS Instance Scheduler, Azure Automation Runbooks, and GCP Cloud Scheduler can stop and start instances based on tags and schedules. For Kubernetes clusters, tools like kube-downscaler can automatically scale down deployments outside working hours.

### 2. Ephemeral Environments

Instead of persistent environments, create them on demand. A feature branch gets a preview environment when the PR opens. Tests run in freshly provisioned clusters that are destroyed afterward. Developers request an environment when needed, and it expires after a set period of inactivity.

Tools like Okteto, Garden, and platform-native preview environments (Netlify, Vercel, Render) support this model. The environment exists only when someone is actively using it.

### 3. Right-Sizing Resources

Development doesn't need production-scale resources. A development database doesn't need the same CPU and memory as production. Test workloads don't require multiple replicas and high availability.

Allocate resources appropriate to the workload. Development environments can run with minimal resources, scaled up only when needed for specific testing scenarios.

### 4. Consolidation

Instead of one environment per developer or team, consider shared environments with namespace or tenant isolation. This reduces the total number of clusters running and improves resource utilization.

### 5. Monitoring and Visibility

Make energy consumption and cost visible. Show teams their environment's utilization. Create dashboards that display idle time and accumulated energy use. When people can see the impact, they're more likely to act on it.

## The Cultural Dimension

Technical solutions alone don't solve this. Culture matters.

Make efficiency visible. Show teams their environment's energy footprint alongside cost. Recognize and celebrate teams that reduce their baseline consumption. Make efficient configurations the default. Educate engineers about the environmental impact of infrastructure choices. Give developers tools to manage their own environments rather than imposing top-down restrictions.

When engineers understand the impact and have the tools to act, most will choose efficiency. Not because they're forced to, but because it makes sense.

## Conclusion

Development and test clusters are quiet. They don't generate customer complaints when they sit idle. They don't trigger incidents. They just run, consuming energy hour after hour, accumulating impact slowly and steadily.

The opportunity is clear: these environments have natural usage patterns that don't require 24/7 availability. By aligning runtime with actual use, organizations can significantly reduce energy consumption without sacrificing developer productivity.

Until we look at development and test clusters with the same clarity that we apply to production systems, the impact will remain underestimated - not because it is dramatic, but because it is continuous. And as with physical systems, it is the quiet and continuous processes that shape the long term.

The technology exists. The patterns are proven. What's needed is awareness and willingness to question the default assumption that everything must run continuously.

Every kilowatt-hour saved in development is one that doesn't need to be generated. Across thousands of organizations running non-production infrastructure, the aggregate impact is meaningful - both for operational budgets and for the planet.

The question is not whether we can reduce this energy use. We can. The question is whether we will choose to look at these quiet, always-on systems with the same scrutiny we apply to production.


