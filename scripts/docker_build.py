# -----------------------------
# Docker Build
# -----------------------------
"""
Step 1: Docker setup
Step 2: Verify Docker File Exists
Step 3: Build Docker Image
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
    print("\n🚀 Starting Docker Build Stage")

    # -----------------------------
    # Step 1: Docker Setup
    # -----------------------------
    try:
        print("\n🔹 Step 1: Docker Setup")
        run_command("docker --version", "Checking Docker version")
        run_command("docker info", "Verifying Docker daemon status")
    except Exception as e:
        print(f"❌ Failed during Docker setup: {e}")
        sys.exit(1)

    # -----------------------------
    # Step 2: Verify Dockerfile
    # -----------------------------
    try:
        print("\n🔹 Step 2: Verify Dockerfile existence")
        if not os.path.exists("Dockerfile"):
            raise FileNotFoundError("Dockerfile not found in current directory.")
        print("✅ Dockerfile found.")
    except Exception as e:
        print(f"❌ Dockerfile verification failed: {e}")
        sys.exit(1)

    # -----------------------------
    # Step 3: Build Docker Image
    # -----------------------------
    try:
        print("\n🔹 Step 3: Build Docker Image")
        image_name = os.getenv("DOCKER_IMAGE_NAME", "shaazcs-manager-ui")
        image_tag = os.getenv("DOCKER_IMAGE_TAG", "latest")
        token = os.getenv("GH_PERSONAL_PKG_RW_TOKEN")

        build_command = f"docker build -t {image_name}:{image_tag} --build-arg GITHUB_TOKEN={token} ."
        run_command(build_command, f"Building Docker image {image_name}:{image_tag}")
        print(f"✅ Docker image built successfully: {image_name}:{image_tag}")
    except Exception as e:
        print(f"❌ Docker image build failed: {e}")
        sys.exit(1)

    print("\n🎉 Docker build stage completed successfully!")

if __name__ == "__main__":
    main()
