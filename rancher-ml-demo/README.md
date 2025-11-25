Rancher ML demo

This demo contains a tiny FastAPI model server that returns a dummy prediction. It's intended to be deployed to a Rancher-managed cluster (or k3s) for quick testing. The repository includes a Dockerfile, a Kubernetes deployment & service manifest, and a sample KServe `InferenceService` manifest.

Files:
- `app/main.py` - FastAPI model server
- `Dockerfile` - Build image for the server
- `k8s/deployment.yaml` - Kubernetes Deployment + Service
- `kserve/iris-sklearn.yaml` - KServe sample (sklearn) for reference

Build & run locally:

```bash
cd rancher-ml-demo
docker build -t <your-registry>/rancher-ml-demo:latest .
# push to your registry then deploy the k8s manifests to your cluster
```