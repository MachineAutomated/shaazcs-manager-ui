# Shaazcs Manager UI

Tasks done to docker push

```
docker build --no-cache \
  --build-arg GITHUB_TOKEN=${GH_PERSONAL_PKG_RW_TOKEN} \
  -t shaazcs-manager-ui:1.0.0 .

docker run -p 5173:5173 shaazcs-manager-ui:1.0.0

docker build --no-cache -t shaazcs-manager-ui:1.0.0 --build-arg GH_TOKEN=ghp_xxx .


docker tag shaazcs-manager-ui:1.0.0 ghcr.io/machineautomated/shaazcs-manager-ui:1.0.0

docker push ghcr.io/machineautomated/shaazcs-manager-ui:1.0.0
```

Tasks required to Download Docker Image and Run

```
docker pull ghcr.io/machineautomated/shaazcs-manager-ui:1.0.0
docker run -p 5173:5173 ghcr.io/machineautomated/shaazcs-manager-ui:1.0.0
```