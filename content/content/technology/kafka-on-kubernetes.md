---
title: "How to Set Up Kafka on Kubernetes"
date: 2025-07-07T00:02:00+05:30
description: "A step-by-step guide to deploying Apache Kafka on a Kubernetes cluster using Minikube, kubectl, and Helm."
categories: ["technology"]
image: images/tech/kafka.png
tags: ["Kafka", "Kubernetes", "Helm", "Zookeeper"]
---

## Introduction

Apache Kafka is a powerful distributed event streaming platform. Running Kafka on Kubernetes allows you to leverage container orchestration for scalability and resilience. This article walks you through setting up Kafka on a local Kubernetes cluster using Minikube, with all the necessary tools and configuration manifests.

## Prerequisites

Before you begin, make sure you have:

- A running Kubernetes cluster (Minikube is used for demonstration)
- `kubectl` (Kubernetes CLI)
- `helm` (Kubernetes package manager)

## Choosing a Kubernetes Distribution

Kafka can be deployed on managed Kubernetes services like Azure AKS, Amazon EKS, or Google GKE, or on a local cluster. For simplicity, this guide uses Minikube.

### Setting Up a Local Minikube Cluster

Download and install Minikube:

```sh
https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube
sudo mv minikube /usr/local/bin/
```

Start your Minikube cluster with sufficient resources:

```sh
minikube start --memory=4096 --cpus=2
```

Check the cluster status:

```sh
minikube status
```

## Installing Kubernetes CLI Tools

- **kubectl**: Used to interact with your cluster. [Install guide](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

  Verify installation:
  ```sh
  kubectl version --client
  ```

- **Helm**: Simplifies installation of applications like Kafka. [Install guide](https://helm.sh/docs/intro/install/)

  Verify installation:
  ```sh
  helm version
  ```

## Kafka Cluster Configuration

### Setting up Zookeeper Ensemble

Zookeeper manages broker metadata and coordinates distributed processes for Kafka. Deploy Zookeeper using the following manifest (`zookeeper.yml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zookeeper-deployment
  labels:
    app: zookeeper
spec:
  replicas: 1
  selector:
    matchLabels:
      app: zookeeper
  template:
    metadata:
      labels:
        app: zookeeper
    spec:
      containers:
      - name: zookeeper
        image: confluentinc/cp-zookeeper:7.0.1
        ports:
        - containerPort: 2181
        env:
        - name: ZOOKEEPER_CLIENT_PORT
          value: "2181"
        - name: ZOOKEEPER_TICK_TIME
          value: "2000"
---
apiVersion: v1
kind: Service
metadata:
  name: zookeeper-service
spec:
  selector:
    app: zookeeper
  ports:
    - protocol: TCP
      port: 2181
      targetPort: 2181
```

- **Replicas**: For high availability, increase to an odd number (e.g., 3 or 5).
- **Service**: Exposes Zookeeper on port 2181 for Kafka to connect.

### Configuring Kafka Brokers

Kafka brokers handle records, assign offsets, and store data. Deploy Kafka using the following manifest (`kafka.yml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kafka-deployment
  labels:
    app: kafka
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kafka
  template:
    metadata:
      labels:
        app: kafka
    spec:
      containers:
      - name: broker
        image: confluentinc/cp-kafka:7.0.1
        ports:
        - containerPort: 9092
        env:
        - name: KAFKA_BROKER_ID
          value: "1"
        - name: KAFKA_ZOOKEEPER_CONNECT
          value: 'zookeeper-service:2181'
        - name: KAFKA_LISTENER_SECURITY_PROTOCOL_MAP
          value: PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT
        - name: KAFKA_ADVERTISED_LISTENERS
          value: PLAINTEXT://:29092,PLAINTEXT_INTERNAL://kafka-service:9092
        - name: KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR
          value: "1"
        - name: KAFKA_TRANSACTION_STATE_LOG_MIN_ISR
          value: "1"
        - name: KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR
          value: "1"
---
apiVersion: v1
kind: Service
metadata:
  name: kafka-service
spec:
  selector:
    app: kafka
  ports:
    - protocol: TCP
      port: 9092
```

- **Replicas**: For high availability, increase to an odd number.
- **Service**: Exposes Kafka on port 9092 for producers and consumers.

### Additional Considerations

- **High Availability**: Increase replicas for both Zookeeper and Kafka.
- **Persistent Storage**: Use PersistentVolumeClaims for broker storage.
- **Resource Allocation**: Allocate appropriate CPU and memory for each pod.

## Deploying Zookeeper and Kafka

Apply the manifests:

```sh
kubectl create -f ./resources/zookeeper.yml
kubectl create -f ./resources/kafka.yml
```

Check deployment status:

```sh
kubectl get deployments
```

Example output:

```
NAME                        READY   STATUS    RESTARTS   AGE
kafka-deployment-5647b8549-w6skc    1/1     Running    0         2d
zookeeper-deployment-b65b447fd-k4qhx 1/1     Running    0         2d
```

You can also use the Minikube dashboard:

```sh
minikube dashboard
```

## Creating a Kafka Topic

Exec into the Kafka pod and create a topic:

```sh
kafka-topics --bootstrap-server localhost:9092 --create --topic topic-one --replication-factor 1 --partitions 3
```

Expected output:

```
Created topic test-topic.
```

## Producing and Consuming Messages

Start a producer:

```sh
kafka-console-producer --broker-list localhost:9092 --topic topic-one
```

Type a few messages and exit with Ctrl+C.

Start a consumer (in another terminal):

```sh
kafka-console-consumer --bootstrap-server localhost:9092 --topic topic-one --from-beginning
```

You should see the messages you produced. Note that with multiple partitions, message order is not guaranteed.

## Conclusion

With these steps, you have a basic Kafka cluster running on Kubernetes. For production, consider scaling replicas, adding persistent storage, and tuning resource allocations for reliability and performance.
