# NormWise System Telemetry & Operational Monitoring Guide (Phase 19)

This document specifies the health check contracts, telemetry metrics service, administrative monitoring dashboard, structured logging format, and external alerting integration for **NormWise**.

---

## 1. Health Check Contracts & Probes

NormWise provides standard Kubernetes / Docker compatible health and readiness probes.

### Liveness Probe: `GET /api/health`
Checks whether the Express web application process is responsive and receiving incoming traffic.

- **Status Code:** `200 OK`
- **Response Format:**
  ```json
  {
    "status": "ok",
    "service": "normwise-api",
    "timestamp": "2026-09-26T14:09:10.336Z"
  }
  ```

### Readiness Probe: `GET /api/health/ready`
Verifies that all downstream dependencies required to process procurement recommendations are fully operational:
1. **PostgreSQL Connectivity**: Evaluates `SELECT 1;`.
2. **pgvector Extension**: Verifies `vector` extension is registered in `pg_extension`.
3. **Storage Directory**: Probes read/write capability on `UPLOAD_DIR`.

- **Success Response (`200 OK`):**
  ```json
  {
    "status": "ready",
    "service": "normwise-api",
    "timestamp": "2026-09-26T14:09:10.357Z",
    "checks": {
      "database": { "status": "ok" },
      "vectorExtension": { "status": "ok", "extension": "vector" },
      "storage": { "status": "ok", "path": "/app/uploads" }
    }
  }
  ```
- **Failure Response (`503 Service Unavailable`):**
  Returns `{ "status": "not_ready", "checks": { ... } }` if any dependency is unavailable.

### Version Information: `GET /api/version`
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "name": "NormWise",
    "version": "1.0.0-mvp",
    "environment": "production",
    "timestamp": "2026-09-26T14:09:10.359Z"
  }
  ```

---

## 2. In-Memory Telemetry Tracker (`metricsService.js`)

NormWise includes an integrated in-memory metrics service that tracks real-time system performance without external heavy daemon dependencies:

- **Counters:**
  - `totalRequests`: Total HTTP requests serviced since process startup.
  - `totalErrors`: Count of 4xx and 5xx responses.
  - `requestsByMethod`: Distribution across `GET`, `POST`, `PUT`, `DELETE`.
  - `requestsByStatusCode`: Distribution across `2xx`, `3xx`, `4xx`, `5xx`.
- **Latency Tracking:**
  - Rolling average response duration in milliseconds.
  - Minimum and maximum observed response times.
- **Subsystem Processing Times:**
  - Document parsing & OCR extraction duration.
  - pgvector semantic retrieval duration.
  - Multi-factor scoring duration.
  - LLM reason synthesis duration.
- **Recent Errors Ring Buffer:**
  - Retains the last 20 operational errors with route, status code, error message, timestamp, and `X-Request-ID`.
- **Automated Alerts Generator:**
  - High error rate alert (> 10% errors across 50+ requests).
  - High response latency warning (> 1,500ms average response time).
  - Storage space alerts.

---

## 3. Administrator System Monitoring Dashboard (`/admin/monitoring`)

The administrative dashboard provides live visualization of the system's operational health:

- **Path:** `/admin/monitoring` (accessible from the sidebar by `ADMIN` users).
- **Endpoint:** `GET /api/admin/system/health` (guarded by `requireAuth` + `requireRole("ADMIN")`).
- **Telemetry Displayed:**
  - **Service Status Badges**: PostgreSQL Database, pgvector Extension, File Storage, OCR Provider, LLM Provider, Translation Service.
  - **System Metrics**: Node.js uptime, Process Memory (RSS, Heap Used, Heap Total), OS Total/Free Memory.
  - **Performance Cards**: Total Requests, Average Latency, Error Rate %, Active System Alerts.
  - **Recent Dataset Imports**: Source name, imported version, standards created, errors count.
  - **Recent Processing Failures**: Uploaded tender filename, document type, processing error trace.

---

## 4. Structured Request Logging

NormWise formats all HTTP traffic as structured JSON logs:

```json
{
  "timestamp": "2026-09-26T14:09:10.485Z",
  "level": "INFO",
  "service": "normwise-api",
  "requestId": "29b8e115-93c8-4873-a73a-c11c723f175c",
  "method": "POST",
  "route": "/api/recommend",
  "status": 200,
  "duration": "92.4ms",
  "ip": "127.0.0.1",
  "userAgent": "NormWise-Client/1.0"
}
```

### Traceability Guarantee
- Each request receives a unique `X-Request-ID` (or adopts incoming header from reverse proxy).
- The `X-Request-ID` is echoed in all response headers and logged in `AuditEvent` records for full end-to-end auditability.

---

## 5. External Monitoring Integration

### Prometheus / Datadog Scraping
Configure your metrics scraper to poll `/api/health` and `/api/health/ready` every 15–30 seconds.

### Uptime Monitoring (UptimeRobot, BetterStack, Pingdom)
Point your uptime monitor to:
- `https://normwise.gov.in/api/health` (Alert on non-200 status code)
- `https://normwise.gov.in/api/health/ready` (Alert on non-200 status code)

### Alert Channels
Connect alerts to:
- **Slack / Teams**: Real-time notification for 5xx spikes or database disconnects.
- **PagerDuty / Opsgenie**: High-priority paging for database unavailability or storage volume full.
