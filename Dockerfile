# Dockerfile for ARM64 support only
FROM --platform=linux/arm64 node:20-slim

# Install dependencies needed for Puppeteer/Playwright
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and node_modules (for faster builds in test environment)
COPY package*.json ./
COPY node_modules ./node_modules

# Install Playwright browsers (for Playwright tests)
RUN npx playwright install chromium --with-deps || true

# Configure Puppeteer to use Chromium instead of Chrome
# Skip Chrome download and use Playwright's Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Note: PUPPETEER_EXECUTABLE_PATH will be set dynamically in the code
# since the exact path depends on the Chromium version installed

# Copy application code
COPY . .

# Expose port for API
EXPOSE 3000

# Default command
CMD ["node", "server.js"]
