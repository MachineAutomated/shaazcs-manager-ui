#Inspect the creation date of the Docker image if present locally
docker image inspect ghcr.io/machineautomated/finance-mgr:1.0.0 \
  --format='{{.Created}}'


#Identify remote image timestamp (GitHub Container Registry)
export GITHUB_USER=saqib4968

TOKEN=$(curl -s -u $GITHUB_USER:$GITHUB_PERSONAL_PKG_RW_TOKEN \
"https://ghcr.io/token?service=ghcr.io&scope=repository:machineautomated/shaazcs-manager-ui:pull" \
| jq -r .token)



MANIFEST=$(curl -H "Authorization: Bearer $TOKEN" \
https://ghcr.io/v2/machineautomated/shaazcs-manager-ui/manifests/1.0.0)


echo "$MANIFEST" | jq .schemaVersion

CONFIG_DIGEST=$(echo "$MANIFEST" | jq -r '.config.digest')



curl -s -L \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.docker.container.image.v1+json" \
  https://ghcr.io/v2/machineautomated/shaazcs-manager-ui/blobs/$CONFIG_DIGEST \
| jq -r '.created'


