---
title: "Install ML workloads with Rancher — Quick Guide"
date: 2025-10-10T11:00:00+05:30
categories: ["Technology"]
tags: ["rancher", "mlops", "kserve"]
image: "/images/tech/rancher-ml-brief.jpg"
description: "Quick guide: provision Rancher clusters, create GPU/spot nodepools, install KServe, and deploy a demo inference service."
---

Rancher makes it straightforward to manage clusters and run ML workloads across edge and cloud. This quick guide shows the fast path: create a cluster (or use `k3s` locally), add nodepools for GPU and spot instances, install KServe, and deploy a small demo model. Use the full tutorial for detailed YAMLs, Helm values, and production tips.

Try the one-command demo:

```bash
curl -fsSL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
kubectl create namespace kserve
kubectl apply -f https://github.com/kserve/kserve/releases/download/v0.10.0/kserve.yaml
kubectl apply -f https://raw.githubusercontent.com/kserve/kserve/master/docs/samples/v1beta1/inferenceservice/sklearn/iris/iris-sklearn.yaml -n kserve
kubectl get inferenceservices -n kserve
```

For production, follow the full tutorial for nodepool, storage, autoscaling, and security best practices.