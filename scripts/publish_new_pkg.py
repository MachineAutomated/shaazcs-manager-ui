# -----------------------------
# PUBLISH NEW NPM PACKAGE
# -----------------------------
"""
Step 1: Prepare for publishing.
Step 2: Authenticate with NPM using a token.
Step 3: Publish the new version of the NPM package.
Step 4: Verify the published version.
"""

import os
import subprocess
import json
import sys
import requests

# -----------------------------
# Step 0: Configuration
# -----------------------------
PIPELINE_PKG_PAT = os.environ.get("GH_PERSONAL_PKG_RW_TOKEN")  # Your GitHub PAT for npm
PACKAGE_JSON = "package.json"
OWNER = "MachineAutomated"
REGISTRY = "https://npm.pkg.github.com"

if not PIPELINE_PKG_PAT:
    print("❌ GH_PERSONAL_PKG_RW_TOKEN environment variable not set")
    sys.exit(1)

# -----------------------------
# Step 1: Prepare package info
# -----------------------------

try:
    with open(PACKAGE_JSON) as f:
        pkg_data = json.load(f)
        package_name = pkg_data["name"].split("/")[1]
        package_version = pkg_data.get("version", "0.0.1")
except Exception as e:
    print(f"❌ Failed to read package.json: {e}")
    sys.exit(1)

# -----------------------------
# Step 2: Authenticate with NPM
# -----------------------------
try:
    npmrc_content = f"""
@{OWNER.lower()}:registry={REGISTRY}
//npm.pkg.github.com/:_authToken={PIPELINE_PKG_PAT}
registry={REGISTRY}/
"""
    with open(os.path.expanduser("~/.npmrc"), "w") as f:
        f.write(npmrc_content)
    print("✅ NPM authentication setup complete")
except Exception as e:
    print(f"❌ Failed to write .npmrc: {e}")
    sys.exit(1)


# -----------------------------
# Step 3: Publish the new version
# -----------------------------
try:
    print(f"Publishing package {package_name}@{package_version} ...")
    subprocess.run(["npm", "publish", "--access", "public"], check=True)
    print("✅ Publish successful")
except subprocess.CalledProcessError as e:
    print(f"❌ Publish failed: {e}")
    sys.exit(1)

# -----------------------------
# Step 4: Verify published version
# -----------------------------
try:
    API_URL = f"https://api.github.com/users/{OWNER}/packages/npm/{package_name}/versions"
    headers = {
        "Authorization": f"Bearer {PIPELINE_PKG_PAT}",
        "Accept": "application/vnd.github+json"
    }

    response = requests.get(API_URL, headers=headers)
    response.raise_for_status()
    versions = response.json()

    published_versions = [v["name"] for v in versions]
    if package_version in published_versions:
        print(f"✅ Verified: {package_name}@{package_version} is published")
    else:
        print(f"❌ Verification failed: {package_name}@{package_version} not found")
        sys.exit(1)
except Exception as e:
    print(f"❌ Verification step failed: {e}")
    sys.exit(1)
