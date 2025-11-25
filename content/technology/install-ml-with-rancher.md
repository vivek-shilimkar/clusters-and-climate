---
title: "Install ML workloads with Rancher: from cluster to inference"
date: 2025-10-10T10:00:00+05:30
categories: ["Technology"]
tags: ["rancher", "mlops", "kserve", "seldon", "k3s", "kubernetes"]
image: "/images/tech/rancher-ml.jpg"
description: "Step-by-step guide to provision Rancher-managed clusters, prepare GPU/spot nodepools, install KServe, and deploy a sample inference service."
---

This guide walks through a practical path to run ML workloads using Rancher as the control plane. It covers provisioning clusters, creating nodepools for GPU and spot/low-priority instances, installing an ML inference stack (KServe), and deploying a minimal demo model.

> Note: this tutorial keeps the commands targeted and repeatable. For production, replace demo clusters with cloud-managed clusters and follow your provider best practices.

## What you'll build

- A Rancher-managed Kubernetes cluster (or local k3s for demo)
- Nodepools for CPU and GPU/spot workloads with appropriate taints/labels
- An ML serving stack (KServe) installed via Helm
- A sample inference service (Scikit-Learn/TensorFlow) deployed as an `InferenceService`

## Prerequisites

- Rancher server (v2.6+)
- Access to Rancher UI or API with admin rights
- A machine to run `kubectl` and `helm` configured
- `kubectl` and `helm` installed locally
- (Optional for GPUs) Nodes with NVIDIA GPUs and drivers
- A container registry (DockerHub, GitHub Container Registry, or private)

## Quick demo (local k3s)

The fastest path to test the flow locally uses `k3s`:

```bash
# create a local k3s cluster (simple demo)
curl -fsSL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
kubectl create namespace kserve
kubectl apply -f https://github.com/kserve/kserve/releases/download/v0.10.0/kserve.yaml
kubectl apply -f https://raw.githubusercontent.com/kserve/kserve/master/docs/samples/v1beta1/inferenceservice/sklearn/iris/iris-sklearn.yaml -n kserve
kubectl get inferenceservices -n kserve
```

If you see `Ready` for the `inferenceservice`, the demo is up.

---

## Step 1 — Provisioning clusters with Rancher

You can either create cloud clusters (EKS/GKE/AKS) from Rancher or attach existing clusters. The high-level steps are:

1. Login to Rancher UI
2. Click `Clusters` → `Create` → choose cloud provider or `Import`
3. For cloud clusters, configure nodepools (one for general CPU, one for GPU-ready nodes)
4. Set nodepool labels and taints—e.g. `node.kubernetes.io/instance-type=gpu` and taint `gpu=true:NoSchedule`

Rancher will provision nodes (or show instructions to provision them yourself and then register the cluster).

## Step 2 — Prepare nodepools for ML workloads

On the GPU nodepool:

- Install NVIDIA drivers or use GPU-enabled images from the cloud provider.
- Install NVIDIA device plugin for Kubernetes:

```bash
kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.11.0/nvidia-device-plugin.yml
```

- Add tolerations and node selectors in your ML workload YAML so GPU workloads schedule on the GPU nodepool.

For spot/low-priority nodepools:

- Create a nodepool with spot/preemptible instances and label it `spot=true`.
- Use a lower-priority taint or toleration so only suitable workloads land there.

## Step 3 — Storage & Data access

- Use S3/GCS for datasets and model artifacts. Provide credentials as `Secrets`.
- For fast local training or caching, install Longhorn via Rancher Apps or Helm:

```bash
helm repo add longhorn https://charts.longhorn.io
helm repo update
helm install longhorn longhorn/longhorn --namespace longhorn-system --create-namespace
```

## Step 4 — Install KServe (recommended for inference)

KServe provides a Kubernetes-native model serving layer. Install via Helm:

```bash
helm repo add kserve https://kserve.github.io/helm-charts
helm repo update
helm install kserve kserve/kserve --namespace kserve --create-namespace
```

If you use Istio, Knative or other networking layers, follow KServe docs for compatibility.

## Step 5 — Deploy a sample model

Example `InferenceService` (Sklearn Iris) — save as `iris-sklearn.yaml`:

```yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: iris-sklearn
spec:
  predictor:
    sklearn:
      storageUri: "https://s3.amazonaws.com/kserve-samples/models/sklearn/iris"
      resources:
        limits:
          cpu: 1000m
          memory: 1Gi
```

Apply:

```bash
kubectl apply -f iris-sklearn.yaml -n kserve
kubectl get inferenceservices -n kserve
```

## Step 6 — Autoscaling & Cost controls

- Use Cluster Autoscaler or Karpenter for dynamic scaling.
- Configure nodepool scale policies in Rancher—aggressive scale-down for spot pools helps control cost.
- For training jobs, use checkpointing and periodic uploads to S3 so spot preemptions are recoverable.

## Step 7 — Observability

- Install Prometheus & Grafana via Rancher Apps.
- Export model metrics (latency, request count, error rates) via KServe metrics.
- Centralize logs in Loki/Elasticsearch depending on scale.

## Security & Best Practices

- Use namespaces and Rancher Projects to separate teams and quotas.
- Use SOPS or SealedSecrets for secrets management.
- Add Pod Security Admission policies and NetworkPolicies to limit blast radius.

## Tear down

For local demo:

```bash
kubectl delete -f iris-sklearn.yaml -n kserve
helm uninstall kserve -n kserve
```

## Appendix — Useful YAMLs and Helm values

- Full `iris-sklearn.yaml` (above)
- GPU device plugin manifest (above)

---

If you'd like, I'll next:
- Add a runnable demo repository at `rancher-ml-demo/` with a tiny FastAPI model server, Dockerfile, Helm chart, and k8s manifests; or
- Expand this article into a step-by-step instruction set with screenshots and more detailed Helm values.

Which do you want me to create next?