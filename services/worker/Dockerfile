FROM golang:1.21-alpine AS builder

# Install system dependencies for OpenCV
RUN apk add --no-cache \
    gcc g++ \
    pkgconfig \
    opencv-dev \
    ffmpeg-dev

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -o worker main.go

# Final stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache \
    opencv \
    ffmpeg \
    ca-certificates

# Create non-root user
RUN addgroup -g 1001 -S worker && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G worker worker

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/worker .

# Change ownership
RUN chown -R worker:worker /app

# Switch to non-root user
USER worker

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081/health || exit 1

# Start the application
CMD ["./worker"]