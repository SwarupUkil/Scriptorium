FROM php:8.0-cli

# Create a non-root user
RUN useradd -ms /bin/bash appuser

# Set working directory
WORKDIR /app

# Switch to non-root user
USER appuser