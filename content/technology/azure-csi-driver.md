---
title: "Getting Started with CSI on Azure Kubernetes Service"
date: 2025-07-07T00:00:00+05:30
description: "A comprehensive, practical guide to deploying and using the Azure Disk CSI driver in AKS."
categories: ["technology"]
image: images/tech/azure-csi.png
tags: ["Azure", "Kubernetes", "CSI", "Storage"]
---

## Introduction

The Container Storage Interface (CSI) is now the industry standard for connecting Kubernetes clusters to a variety of storage solutions. Whether you’re launching a new workload or modernizing an existing deployment, understanding how to leverage CSI is essential. This article provides a hands-on walkthrough for deploying the Azure Disk CSI driver on Azure Kubernetes Service (AKS), combining both conceptual background and practical steps.

## Why CSI?

CSI provides a unified way to integrate Kubernetes with different storage backends, making it easier to manage persistent storage for your applications. Official CSI drivers are maintained by the Kubernetes community and cloud providers, ensuring robust support for cloud-native workloads.

## Prerequisites

Before proceeding, ensure the following:

- Your AKS cluster is running a recent Kubernetes version
- You have cluster-admin rights
- Network connectivity between your nodes and Azure storage endpoints is healthy

## Installing the Azure Disk CSI Driver

Azure’s CSI driver can be installed directly using a deployment script. The following command will fetch and install version v1.30.3 (check for the latest version before running):

```sh
curl -skSL https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/v1.30.3/deploy/install-driver.sh | bash -s v1.30.3 snapshot –
```

This script deploys the necessary controller and node components to your cluster.

## Verifying the Deployment

Once installation is complete, confirm that the driver pods are up and running:

```sh
kubectl get pods -n kube-system -l app=csi-azuredisk
```

You should see both node and controller pods in the `Running` state. Example output:

```sh
NAME                                READY   STATUS    RESTARTS   AGE
csi-azuredisknode-xyz12             3/3     Running   0          5m
csi-azuredisknode-abcd3             3/3     Running   0          5m
csi-azuredisknode-pqrs9             3/3     Running   0          5m
csi-azurediskctrl-0                 5/5     Running   0          5m
csi-azurediskctrl-1                 5/5     Running   0          5m
```

## Defining a StorageClass

To enable dynamic provisioning, create a StorageClass that references the Azure Disk CSI driver. Save the following as `aks-disk-storageclass.yaml`:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: aks-disk-storageclass
provisioner: disk.csi.azure.com
parameters:
  skuname: Standard_LRS
  kind: Managed
reclaimPolicy: Delete
volumeBindingMode: Immediate
```

Apply it with:

```sh
kubectl apply -f aks-disk-storageclass.yaml
```

## Requesting Persistent Storage

Next, create a PersistentVolumeClaim (PVC) to request storage from the above StorageClass. Save as `aks-disk-pvc.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: aks-disk-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: aks-disk-storageclass
  resources:
    requests:
      storage: 50Gi
```

Apply the PVC:

```sh
kubectl apply -f aks-disk-pvc.yaml
```

## Using the PVC in Your Application

To mount the provisioned disk in a pod, reference the PVC in your deployment spec. Here’s an example snippet:

```yaml
spec:
  containers:
    - name: web
      image: nginx:latest
      ports:
        - containerPort: 80
      volumeMounts:
        - mountPath: /usr/share/nginx/html
          name: aks-disk-volume
  volumes:
    - name: aks-disk-volume
      persistentVolumeClaim:
        claimName: aks-disk-pvc
```

With this setup, your application will have access to persistent storage, ensuring data durability even if pods are rescheduled or replaced.

## Additional Notes

- Make sure you are using the latest supported version of the Azure Disk CSI driver for your Kubernetes version.
- You can customize the StorageClass parameters (such as `skuname` and `kind`) to match your performance and cost requirements.
- For advanced scenarios, such as using snapshots or resizing volumes, refer to the [official Azure CSI documentation](https://learn.microsoft.com/en-us/azure/aks/csi-storage-drivers).

## Conclusion

By following these steps, you’ve enabled robust, cloud-native storage for your AKS workloads using the Azure Disk CSI driver. This unified approach ensures your Kubernetes applications can reliably consume persistent storage on Azure.
