FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript (keeps type errors from sneaking in)
RUN npm run build

# Expose ports for Vite dev server and Express proxy
EXPOSE 3000 3001

# Default command runs both frontend + backend in dev mode
CMD ["npm", "run", "start:docker"]
