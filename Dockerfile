# # ====== Stage 1: Build ======
# FROM node:18-alpine AS builder

# # Set working directory
# WORKDIR /app

# # Copy .npmrc with GitHub Token for package authentication
# # (We'll pass the token at build time, not commit it!)
# ARG GITHUB_TOKEN
# RUN echo "@machineautomated:registry=https://npm.pkg.github.com/" > .npmrc && \
#     echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc && \
#     echo "always-auth=true" >> .npmrc

# # Install your private package from GitHub Packages
# RUN npm install @machineautomated/shaazcs-manager-ui@1.0.0

# # ====== Stage 2: Run ======
# FROM node:18-alpine AS runtime

# WORKDIR /app

# # Copy installed app from builder
# COPY --from=builder /app/node_modules /app/node_modules

# # Copy your package files
# COPY --from=builder /app/node_modules/@machineautomated/shaazcs-manager-ui /app

# # Install vite (runtime requirement for dev mode)
# RUN npm install vite

# EXPOSE 5173

# CMD ["npm", "run", "dev"]

##Munnu
# ====== Stage 1: Build the app ======
FROM node:18-alpine AS builder

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
FROM nginx:alpine

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
