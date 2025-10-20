# -----------------------------
# Push Docker Image (Python)
# -----------------------------
"""
Step 1: Verify Docker Image Built
Step 2: Docker PUSH the built image to GitHub Container Registry
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
    print("\n🚀 Starting Docker Image Push Stage")

    # Environment Variables
    docker_username = os.getenv("DOCKERHUB_USERNAME")
    docker_owner = os.getenv("DOCKERHUB_OWNER").lower()
    docker_token = os.getenv("GH_PERSONAL_PKG_RW_TOKEN")
    image_name = os.getenv("DOCKER_IMAGE_NAME", "shaazcs-manager-ui")
    image_tag = os.getenv("DOCKER_IMAGE_TAG", "latest")
    full_image_name = f"ghcr.io/{docker_owner}/{image_name}:{image_tag}"

    # -----------------------------
    # Step 1: Verify Built Image and Tag
    # -----------------------------

    try:
        print("\n🔹 Step 1: Verify Built Image and Tag")
        docker_images_output = run_command("docker images", "Listing all Docker images")
        print(docker_images_output)
        image_identifier = f"ghcr.io/{docker_owner}/{image_name}"
        if image_identifier in docker_images_output and image_tag in docker_images_output:
            print(f"✅ Verified: Docker image '{image_identifier}:{image_tag}' exists locally.")
        else:
            print(f"⚠️ Verification failed: Image '{image_identifier}:{image_tag}' not found in local registry.")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Failed to verify built Docker image: {e}")
        sys.exit(1)

    # -----------------------------
    # Step 2: Docker PUSH the built image to GitHub Container Registry
    # -----------------------------
    try:
        print("\n🔹 Step 2: Docker PUSH to GitHub Container Registry")

        if not docker_username or not docker_token:
            raise ValueError("DOCKERHUB_USERNAME or GH_PERSONAL_PKG_RW_TOKEN environment variables missing.")

        # Login before push
        login_cmd = f"echo {docker_token} | docker login ghcr.io -u {docker_username} --password-stdin"
        run_command(login_cmd, "Logging into GitHub Container Registry")

        # Push image
        run_command(f"docker push {full_image_name}", f"Pushing Docker image {full_image_name}")

        # Verify push by checking manifest
        print("🔍 Verifying image upload...")
        result = subprocess.run(
            f"docker manifest inspect {full_image_name}",
            shell=True,
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print(f"✅ Docker image {full_image_name} successfully pushed and verified.")
        else:
            print(f"⚠️ Verification failed for image {full_image_name}. Check if image exists in GHCR.")

    except Exception as e:
        print(f"❌ Failed to push Docker image: {e}")
        sys.exit(1)

    print("\n🎉 Docker image push completed successfully!")

if __name__ == "__main__":
    main()
