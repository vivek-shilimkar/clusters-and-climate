---
title: "Cost-aware Cloud Architectures on a Budget"
date: 2025-09-08
description: "Practical patterns, principles and hands-on examples to design cloud architectures that minimise cost without sacrificing reliability or developer velocity."
tags: ["cloud", "cost", "infrastructure", "terraform", "serverless"]
image: "/images/tech/cost-aware-cloud.png"
---

## Overview

Running workloads in the cloud doesn't have to be expensive. With deliberate architecture choices, observability, and a few automated patterns you can reduce spend substantially while keeping performance and reliability. This article walks through principles, proven patterns, and short hands-on examples you can adapt (Terraform + serverless + cost monitoring).

## Checklist (what you'll get in this article)

- Core principles for cost-aware design and trade-offs to consider.
- Practical architecture patterns: right-sizing, autoscaling, spot/interruptible compute, serverless, multi-tenancy, and CI/CD cost controls.
- Hands-on examples: a Terraform pattern for mixed spot/on‑demand autoscaling, a serverless function example, and quick cost-monitoring steps using cloud provider tools.

## Core principles

1. Measure first
   - Tag everything and enable cost reporting. You can't optimise what you don't measure.
2. Make cost visible
   - Surface spend per team/service in dashboards and CI checks.
3. Choose the right abstraction
   - Not every workload belongs in VMs. Choose serverless, containers or VMs based on traffic profile and run-time cost characteristics.
4. Automate scale down and cleanup
   - Idle resources (dev/devops environments, orphaned volumes) are recurring waste.
5. Trade latency for cost where acceptable
   - Use batching, asynchronous processing and lower-tier storage when possible.

## Architecture patterns

1. Right-sizing and instance families
   - Use historical metrics to pick instance sizes and families. Prefer modern CPU/ARM families where supported.
2. Autoscaling (horizontal) with conservative min/max
   - Scale quickly for burst, but keep sensible min instances for baseline availability.
3. Spot / Preemptible / Interruptible instances
   - Use for stateless or easily checkpointed workloads (batch processing, worker pools).
   - Combine with on-demand capacity for critical pods using a mixed-instance policy.
4. Serverless for spiky, event-driven workloads
   - Lambda/FaaS pricing is often cheaper for low-to-medium throughput with unpredictable traffic.
5. Multi-cloud / spot pool optimization (optional)
   - For large fleets, use spot pools across AZs/instance types to increase capacity and lower price.
6. Cost-aware CI/CD
   - Run expensive tests on demand, schedule nightly heavy jobs, and cache artifacts.
7. Lifecycle policies and tagging
   - Automatically delete old snapshots, unused disks, and remove dev clusters after inactivity.

## Hands-on: Terraform pattern — mixed spot + on-demand autoscaling (conceptual)

This example shows a compact pattern: a launch template (or equivalent) for a mixed autoscaling group that uses Spot instances as the primary capacity and keeps a small on‑demand baseline for critical pods. The snippet below is a conceptual Terraform example you can adapt for AWS Auto Scaling Groups with mixed instances policy.

Note: this is a concise example — validate and extend it for your org security, networking and IAM needs.

```hcl
# providers.tf (assumes AWS provider configured)
provider "aws" { region = "us-east-1" }

# launch_template.tf (launch template for ASG)
resource "aws_launch_template" "app_lt" {
  name_prefix   = "app-lt-"
  image_id      = "ami-xxxx"
  instance_type = "t3.medium"

  lifecycle {
    create_before_destroy = true
  }
}

# autoscaling group with mixed instances (conceptual)
resource "aws_autoscaling_group" "app_asg" {
  name                      = "app-asg"
  mixed_instances_policy {
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.app_lt.id
        version            = "$Latest"
      }
    }

    override {} # add instance types to broaden spot pool

    instances_distribution {
      on_demand_percentage_above_base_capacity = 20 # keep 20% on-demand baseline
      spot_allocation_strategy = "capacity-optimized"
    }
  }

  min_size = 2
  max_size = 20
  desired_capacity = 2
  vpc_zone_identifier = ["subnet-...", "subnet-..."]
}
```

Why this pattern works
- Spot instances get you 50–90% cost savings for non-critical capacity.
- Keeping a small on‑demand baseline prevents total capacity loss during spot interruptions.
- Using multiple instance types increases the chance of finding spot capacity.

Next steps to apply this for Kubernetes
- Use cluster autoscaler configured with node groups that map to the ASG above (EKS/ASG, GKE node pools, etc.).
- Annotate critical pods with pod disruption budgets and node selectors so they land on on‑demand nodes.

## Hands-on: Serverless for cost-efficient spiky workloads

When traffic is unpredictable or low-volume, serverless functions can be cheaper than keeping VMs warm.

Example (AWS Lambda + small API Gateway proxy):

- Package your function as a container image or zip with minimal runtime.
- Optimize memory to the lowest value that still meets latency SLOs — memory correlates with CPU.
- Prefer provisioned concurrency only when steady low-latency is required.

A simple SAM template fragment:

```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.handler
      Runtime: python3.11
      MemorySize: 256
      Timeout: 30
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /process
            Method: post
```

Cost tips for serverless
- Reduce cold-starts by minimizing package size and avoiding huge frameworks.
- Batch small jobs into fewer function invocations when latency allows.
- Delete unused functions and old versions.

## Quick cost monitoring & guardrails

1. Enable provider cost reporting (AWS Cost Explorer, GCP Billing reports, Azure Cost Management).
2. Tag resources by team/service and enable cost allocation tags.
3. Create dashboards (Grafana + cloud billing exporter or native UI) that show daily spend per service.
4. Add budget alerts and automated actions (for example, notify Slack or pause non-critical CI when overspend threshold reached).

Example: basic AWS CLI query (one-off) to fetch last 7 days cost (requires AWS CLI v2 configured):

```bash
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '7 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics "UnblendedCost"
```

## Practical checklist to apply in your org

- [ ] Enable cost reporting and tagging across accounts.
- [ ] Identify the top 10 cost objects (services, teams, resources).
- [ ] Move bursty workloads to serverless where appropriate.
- [ ] Convert long-running dev/test clusters to ephemeral patterns (spin-up on demand, destroy when idle).
- [ ] Introduce spot/interruptible pools for batch and background workers.
- [ ] Automate cleanup (unused volumes, idle IPs, old snapshots) using scheduled jobs.
- [ ] Add budget alerts and integrate with your incident/Slack channels.

## When *not* to prioritise cost

- Critical low-latency workloads where interruptions are unacceptable.
- When cost-saving introduces unacceptable operational complexity and risk for small teams.

## Closing notes

Small, continuous changes compound: tagging, visibility, and a few architecture tweaks (spot pools, serverless and autoscaling) often yield the most predictable savings. If you'd like, I can:

- Create a full Terraform example (complete files and minimal README) for the mixed spot/on‑demand ASG pattern.
- Add a Kubernetes sample (cluster-autoscaler + node groups) and the pod annotations needed to pin critical pods to on‑demand nodes.
- Draft a short post specifically about cost controls for CI/CD.

Which follow-up would you like me to implement next?"
