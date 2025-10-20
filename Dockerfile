
##Munnu
# ====== Stage 1: Build the app ======
FROM ghcr.io/actions/node:18-alpine AS builder

WORKDIR /app

# Pass your GitHub token for private package access
ARG GITHUB_TOKEN
RUN npm config set //npm.pkg.github.com/:_authToken=$GITHUB_TOKEN
RUN npm config set @machineautomated:registry https://npm.pkg.github.com/

# Install the UI package from GitHub Packages
RUN npm install @machineautomated/shaazcs-manager-ui@1.0.0

# Move into package folder and build
WORKDIR /app/node_modules/@machineautomated/shaazcs-manager-ui
RUN npm install && npm run build


# ====== Stage 2: Serve with Nginx ======
FROM ghcr.io/actions/nginx:alpine

# Create a custom Nginx config to serve on port 5173
RUN rm /etc/nginx/conf.d/default.conf
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 5173;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }
}
EOF

# Copy build artifacts from builder stage
COPY --from=builder /app/node_modules/@machineautomated/shaazcs-manager-ui/dist /usr/share/nginx/html

# Expose port 5173
EXPOSE 5173

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
