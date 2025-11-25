Demo quick steps

1. Build and push image

```bash
docker build -t <your-registry>/rancher-ml-demo:latest .
docker push <your-registry>/rancher-ml-demo:latest
```

2. Deploy to cluster (target the Rancher-managed cluster via kubectl)

```bash
kubectl apply -f k8s/deployment.yaml
kubectl get pods
kubectl port-forward svc/rancher-ml-demo 8080:80
# test
curl -X POST localhost:8080/predict -H "Content-Type: application/json" -d '{"data":[1,2,3]}'
```

3. (Optional) Deploy KServe sample

```bash
kubectl apply -f kserve/iris-sklearn.yaml -n kserve
```
