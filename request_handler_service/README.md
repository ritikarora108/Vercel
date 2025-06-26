# request_handler_service

Serves built static assets from S3 based on incoming HTTP requests.

## Purpose

- Receives HTTP requests for deployed sites
- Extracts project ID from hostname
- Fetches built files from S3 (`output/{id}/dist/...`)
- Serves static assets with correct content type

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Configure environment variables in `.env`:
   - AWS/S3 credentials
3. Start the service:
   ```sh
   npm run dev
   ```

## Flow

1. Receives request for a site (e.g., `id.example.com/index.html`)
2. Extracts project ID from hostname
3. Fetches file from S3
4. Serves file to user

## Related Docs

- [Top-level README](../README.md)
- [Architecture](../docs/architecture.md)
