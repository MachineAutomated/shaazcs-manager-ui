# -----------------------------
# Delete Old Docker Image (Python)
# -----------------------------
"""
Step 1: Docker logn and verify
Step 2: Delete old Docker image if it exists
"""

import subprocess
import os
import sys

def run_command(command, description):
    """Run a shell command with descriptive logging and error handling."""
    print(f"\n🔹 {description}...")
    try:
        result = subprocess.run(
            command, shell=True, check=True, capture_output=True, text=True
        )
        print(result.stdout)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during: {description}")
        print(e.stderr)
        sys.exit(1)

def main():
    print("\n🚀 Starting Docker Image Cleanup Stage")

    # Environment Variables
    docker_username = os.getenv("DOCKERHUB_USERNAME")
    docker_token = os.getenv("GH_PERSONAL_PKG_RW_TOKEN")
    image_name = os.getenv("DOCKER_IMAGE_NAME", "shaazcs-manager-ui")
    image_tag = os.getenv("DOCKER_IMAGE_TAG", "latest")
    full_image_name = f"ghcr.io/{docker_username}/{image_name}:{image_tag}"

    # -----------------------------
    # Step 1: Docker Login and Verify
    # -----------------------------
    try:
        print("\n🔹 Step 1: Docker login and verify")
        if not docker_username or not docker_token:
            raise ValueError("DOCKERHUB_USERNAME or GH_PERSONAL_PKG_RW_TOKEN environment variables missing.")

        login_command = f"echo {docker_token} | docker login ghcr.io -u {docker_username} --password-stdin"
        run_command(login_command, "Logging into GitHub Container Registry")

        run_command("docker info", "Verifying Docker daemon status")
    except Exception as e:
        print(f"❌ Docker login or verification failed: {e}")
        sys.exit(1)

    # -----------------------------
    # Step 2: Delete old Docker image if it exists
    # -----------------------------
    try:
        print("\n🔹 Step 2: Delete old Docker image if it exists")

        # Try to pull existing image to confirm existence
        print(f"Checking if image exists: {full_image_name}")
        result = subprocess.run(
            f"docker pull {full_image_name}",
            shell=True, capture_output=True, text=True
        )

        if "manifest unknown" in result.stderr or "not found" in result.stderr.lower():
            print(f"⚠️ No existing image found for {full_image_name}. Skipping deletion.")
        else:
            print("✅ Old image found. Proceeding to delete...")
            run_command(f"docker rmi -f {full_image_name}", f"Deleting old Docker image {full_image_name}")
            print("🧹 Old image deleted successfully.")
    except Exception as e:
        print(f"❌ Failed to delete old Docker image: {e}")
        sys.exit(1)

    print("\n🎉 Docker image cleanup completed successfully!")

if __name__ == "__main__":
    main()
