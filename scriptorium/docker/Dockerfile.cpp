FROM gcc:10.2.0

# Create a non-root user
RUN useradd -ms /bin/bash appuser

# Set working directory
WORKDIR /app

# Switch to non-root user
USER appuser