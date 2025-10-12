# --------------------------------------------------------------------------
# STAGE 1: Dependency Installation & Application Build
# This stage installs dependencies, builds the Next.js application,
# and is necessary for compiling the project.
# --------------------------------------------------------------------------
FROM node:20-alpine AS builder

# 1. Install necessary build tools (Git for submodules)

# RUN apk add --no-cache git

# 2. Set the working directory
WORKDIR /app

# 3. Copy package files first for efficient caching
# We copy package files relative to the build context defined in docker-compose.yml
COPY package.json package-lock.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the application source code
# This copies everything from the build context (aluminate-admin-frontend)
COPY . .

# 6. Initialize and update submodules if they are present within the context
# NOTE: If your .git folder is not in the build context, this will fail.
# For monorepos, you must adjust the docker-compose context as previously discussed.

# RUN git submodule update --init --recursive

# 7. Build the application
# Use ARG to ensure the build argument is passed correctly
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN npm run build

# --------------------------------------------------------------------------
# STAGE 2: Production Runtime Image (Lean and Secure)
# This stage only copies the necessary files to run the production app.
# --------------------------------------------------------------------------
FROM node:20-alpine AS runner

# 1. Set the working directory
WORKDIR /app

# 2. Skip dependency installation and copy build artifacts from the builder stage
# Copy Next.js required files and build output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 3. Expose the port defined in docker-compose.yml (via args)
# Set a default environment variable for the internal container port
ARG ADMIN_FRONTEND_PORT
ENV PORT=$ADMIN_FRONTEND_PORT
EXPOSE $ADMIN_FRONTEND_PORT

# 4. Define the command to start the production server
CMD ["npm", "run", "start"]
