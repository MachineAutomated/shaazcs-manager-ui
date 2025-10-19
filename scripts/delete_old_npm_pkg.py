# -----------------------------
# DELETE OLD NPM PACKAGE
# -----------------------------
"""
Step 1: Authenticate with NPM using a token.
Step 2: Check the user with whomai
Step 3: List all versions of the specified NPM package.
Step 4: Decide version to delete
Step 5: Delete the specified version of the NPM package.
Step 6: Confirm deletion by listing and verifying the deleted version.
"""


import os
import subprocess
import requests
import json
import sys

# -----------------------------
# Step 0: Configuration
# -----------------------------
PACKAGE_JSON = "package.json"
PACKAGE_PAT = os.environ.get("PIPELINE_PAT")  # Your GitHub PAT for npm
OWNER = "MachineAutomated"
REGISTRY = "https://npm.pkg.github.com"

if not PACKAGE_PAT:
    print("❌ PIPELINE_PAT environment variable not set")
    sys.exit(1)

# Read package name from package.json
with open(PACKAGE_JSON) as f:
    package_name = json.load(f)["name"].split("/")[1]  # Handle scoped packages

API_URL = f"https://api.github.com/users/{OWNER}/packages/npm/{package_name}/versions"
print (API_URL)

# -----------------------------
# Step 1: Authenticate npm
# -----------------------------
npmrc_content = f"""
@{OWNER.lower()}:registry={REGISTRY}
//npm.pkg.github.com/:_authToken={PACKAGE_PAT}
registry={REGISTRY}/
"""
with open(os.path.expanduser("~/.npmrc"), "w") as f:
    f.write(npmrc_content)

print("✅ NPM authentication setup complete")

# Below step is commented out as whoami check doesn't work on Github
# # -----------------------------
# # Step 2: Verify user
# # -----------------------------
# try:
#     subprocess.run(
#         ["npm", "whoami", "--registry", REGISTRY],
#         check=True
#     )
# except subprocess.CalledProcessError:
#     print("❌ npm authentication failed")
#     sys.exit(1)

# -----------------------------
# Step 2: List all versions
# -----------------------------
try:
    headers = {"Authorization": f"Bearer {PACKAGE_PAT}", "Accept": "application/vnd.github+json"}
    response = requests.get(API_URL, headers=headers)
    if response.status_code == 404 and response.json().get("message") == "Package not found.":
        print("No versions found, nothing to delete")
        sys.exit(0)
    elif response.status_code != 200:
        response.raise_for_status()
    versions = response.json()
    print(f"✅ Found {len(versions)} versions:")
    for v in versions:
        print(f" - id={v['id']}, version={v['name']}")
except Exception as e:
    print("List all versions failed")
    sys.exit(1)

# -----------------------------
# Step 3: Decide version to delete
# -----------------------------
# Example: Delete the one and only version
try:
    versions_to_delete = versions[0:] if len(versions) == 1 else []
    if not versions_to_delete:
        print("No old versions to delete")
        sys.exit(0)
except Exception as e:
    print("Error determining versions to delete")
    sys.exit(1)

# -----------------------------
# Step 4: Delete selected versions
# -----------------------------
version_id = None
try:
    for v in versions_to_delete:
        version_id = v["id"]
        print(f"Deleting package version id={version_id}, version={v['name']}")
        del_resp = requests.delete(f"{API_URL}/{version_id}", headers=headers)
        if del_resp.status_code == 204:
            print(f"✅ Deleted version {v['name']}")
        else:
            response.raise_for_status()
            sys.exit(1)
except Exception as e:
    print("Error deleting versions")
    sys.exit(1)
# -----------------------------
# Step 5: Confirm deletion
# -----------------------------
try:
    response = requests.get(API_URL, headers=headers)
    if response.status_code == 404 and response.json().get("message") == "Package not found.":
        print(f"Version Deleted={version_id}")
    elif response.status_code != 200:
        response.raise_for_status()
    remaining_versions = response.json()\
    # If script is scalled for multiple deletions then below code can be used
    # deleted_ids = [v["id"] for v in versions_to_delete]
    # still_there = [v for v in remaining_versions if v["id"] in deleted_ids]

    # if still_there:
    #     print(f"Deleted: {[v['name'] for v in still_there]}")
    #     sys.exit(1)
    # else:
    #     print("Deletion confirmed. All targeted versions removed.")
except Exception as e:
    print("Error confirming deletion")
    sys.exit(1)
