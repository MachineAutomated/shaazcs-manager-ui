#!/bin/sh
set -e

############################################
# 0️⃣ Validate arguments
############################################

if [ "$#" -ne 2 ]; then
  echo "❌ Usage: $0 <GITHUB_USERNAME> <GITHUB_PERSONAL_PKG_RW_TOKEN>"
  exit 1
fi

GITHUB_USER="$1"
GITHUB_TOKEN="$2"

############################################
# Images to monitor (ADD MORE HERE)
############################################

IMAGES="
machineautomated/finance-mgr:1.0.0
machineautomated/shaazcs-manager-ui:1.0.0
"

############################################
# Helper: get GHCR registry token
############################################

get_registry_token() {
  curl -s -u "$GITHUB_USER:$GITHUB_TOKEN" \
    "https://ghcr.io/token?service=ghcr.io&scope=repository:$1:pull" \
    | jq -r '.token'
}

############################################
# Helper: get remote image creation timestamp
############################################

get_remote_created() {
  REPO="$1"
  TAG="$2"
  TOKEN="$3"

  MANIFEST=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.docker.distribution.manifest.v2+json" \
    "https://ghcr.io/v2/$REPO/manifests/$TAG")

  CONFIG_DIGEST=$(echo "$MANIFEST" | jq -r '.config.digest')

  curl -s -L \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.docker.container.image.v1+json" \
    "https://ghcr.io/v2/$REPO/blobs/$CONFIG_DIGEST" \
    | jq -r '.created'
}

############################################
# Main logic
############################################

UPDATE_REQUIRED=false

for IMAGE_TAG in $IMAGES; do
  REPO="${IMAGE_TAG%:*}"
  TAG="${IMAGE_TAG#*:}"
  FULL_IMAGE="ghcr.io/$IMAGE_TAG"

  echo "--------------------------------------------"
  echo "🔍 Checking $FULL_IMAGE"

  ##########################################
  # Local image timestamp
  ##########################################

  if docker image inspect "$FULL_IMAGE" >/dev/null 2>&1; then
    LOCAL_CREATED=$(docker image inspect "$FULL_IMAGE" \
      --format='{{.Created}}')
    echo "📦 Local created:  $LOCAL_CREATED"
    LOCAL_TS=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${LOCAL_CREATED%%.*}" "+%s")
  else
    echo "⚠️ Local image not found"
    LOCAL_TS=0
  fi

  ##########################################
  # Remote image timestamp
  ##########################################

  TOKEN=$(get_registry_token "$REPO")

  if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Failed to obtain GHCR token for $REPO"
    exit 1
  fi

  REMOTE_CREATED=$(get_remote_created "$REPO" "$TAG" "$TOKEN")
  echo "🌐 Remote created: $REMOTE_CREATED"

  REMOTE_TS=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${REMOTE_CREATED%%.*}" "+%s")

  ##########################################
  # Compare
  ##########################################

  if [ "$REMOTE_TS" -gt "$LOCAL_TS" ]; then
    echo "🔄 Update required for $FULL_IMAGE"
    UPDATE_REQUIRED=true
  else
    echo "✅ $FULL_IMAGE is up to date"
  fi
done

############################################
# Final decision
############################################

echo "--------------------------------------------"

if [ "$UPDATE_REQUIRED" = true ]; then
  echo "🚀 Updating services via docker compose..."
  docker compose pull
  docker compose up -d
  echo "✅ Update completed"
else
  echo "🎉 All images are up to date. No action needed."
fi
