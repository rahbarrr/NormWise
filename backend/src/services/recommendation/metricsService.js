/**
 * NormWise Operational & Performance Metrics Service (Phase 19)
 * In-memory telemetry tracker for monitoring application health, latencies,
 * error distributions, and operational throughput without leaking secrets.
 */

class MetricsService {
  constructor() {
    this.startTime = Date.now();
    this.totalRequests = 0;
    this.totalErrors = 0;
    this.dbQueryFailures = 0;

    // Moving average of response times (ms)
    this.totalResponseTimeMs = 0;
    this.avgResponseTimeMs = 0;

    // Feature specific metrics
    this.recommendationCount = 0;
    this.recommendationTotalTimeMs = 0;
    this.avgRecommendationTimeMs = 0;

    this.documentCount = 0;
    this.documentTotalTimeMs = 0;
    this.avgDocumentTimeMs = 0;
    this.documentFailures = 0;

    this.embeddingCount = 0;
    this.embeddingTotalTimeMs = 0;
    this.avgEmbeddingTimeMs = 0;

    // Circular buffers for recent errors & alerts
    this.MAX_RECENT_ITEMS = 20;
    this.recentErrors = [];
    this.alerts = [];
  }

  recordRequest({ method, route, status, durationMs }) {
    this.totalRequests++;
    this.totalResponseTimeMs += durationMs;
    this.avgResponseTimeMs = Math.round(this.totalResponseTimeMs / this.totalRequests);

    if (status >= 400) {
      this.totalErrors++;
    }
  }

  recordError({ requestId, method, route, status, message }) {
    const safeError = {
      timestamp: new Date().toISOString(),
      requestId: requestId || "unknown",
      method: method || "UNKNOWN",
      route: route || "UNKNOWN",
      status: status || 500,
      message: (message || "Internal Server Error").slice(0, 150),
    };

    this.recentErrors.unshift(safeError);
    if (this.recentErrors.length > this.MAX_RECENT_ITEMS) {
      this.recentErrors.pop();
    }
  }

  recordRecommendation(durationMs) {
    this.recommendationCount++;
    this.recommendationTotalTimeMs += durationMs;
    this.avgRecommendationTimeMs = Math.round(this.recommendationTotalTimeMs / this.recommendationCount);
  }

  recordDocument(durationMs, success = true) {
    this.documentCount++;
    this.documentTotalTimeMs += durationMs;
    this.avgDocumentTimeMs = Math.round(this.documentTotalTimeMs / this.documentCount);
    if (!success) {
      this.documentFailures++;
    }
  }

  recordEmbedding(durationMs) {
    this.embeddingCount++;
    this.embeddingTotalTimeMs += durationMs;
    this.avgEmbeddingTimeMs = Math.round(this.embeddingTotalTimeMs / this.embeddingCount);
  }

  recordDbFailure() {
    this.dbQueryFailures++;
    this.recordAlert("DATABASE_QUERY_FAILURE", "A database query operation encountered an unexpected error.");
  }

  recordAlert(type, message) {
    const alert = {
      timestamp: new Date().toISOString(),
      type,
      message: message.slice(0, 200),
    };
    this.alerts.unshift(alert);
    if (this.alerts.length > this.MAX_RECENT_ITEMS) {
      this.alerts.pop();
    }
  }

  getMetrics() {
    const memory = process.memoryUsage();
    return {
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      memoryMb: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
      },
      requests: {
        total: this.totalRequests,
        errors: this.totalErrors,
        avgResponseTimeMs: this.avgResponseTimeMs,
        dbQueryFailures: this.dbQueryFailures,
      },
      recommendations: {
        totalProcessed: this.recommendationCount,
        avgProcessingTimeMs: this.avgRecommendationTimeMs,
      },
      documents: {
        totalProcessed: this.documentCount,
        avgProcessingTimeMs: this.avgDocumentTimeMs,
        failures: this.documentFailures,
      },
      embeddings: {
        totalProcessed: this.embeddingCount,
        avgProcessingTimeMs: this.avgEmbeddingTimeMs,
      },
      recentErrors: [...this.recentErrors],
      recentAlerts: [...this.alerts],
    };
  }
}

export const metricsService = new MetricsService();
export default metricsService;
