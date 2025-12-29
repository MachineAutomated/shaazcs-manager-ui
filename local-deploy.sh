#Inspect the creation date of the Docker image if present locally
docker image inspect ghcr.io/machineautomated/finance-mgr:1.0.0 \
  --format='{{.Created}}'

