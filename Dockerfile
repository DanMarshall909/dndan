FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose ports for Vite dev server and Express server
EXPOSE 5173 3000

# Default command runs the server
CMD ["npm", "run", "server"]
