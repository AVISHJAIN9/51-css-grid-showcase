# 14.14 Observability, Telemetry & Web Vitals Operations

## 1. What It Is in Plain Words
Observability provides visibility into the internal state and user experience of a system through three primary telemetry pillars: Metrics, Logs, and Distributed Tracing. In frontend engineering, Real User Monitoring (RUM) tracks Core Web Vitals directly on user devices.

```mermaid
graph LR
    Browser[Client Browser: Web Vitals Library] -->|navigator.sendBeacon()| Collector[Edge Telemetry Collector]
    Collector --> Aggregator[Prometheus / OpenTelemetry]
    Aggregator --> Dashboard[Grafana / Datadog: p50, p95, p99 LCP & CLS]
```

---

## 2. Whether and How THIS Project Uses It
In this project, client-side metrics focus on browser rendering metrics:
- **Core Web Vitals:** Cumulative Layout Shift (CLS), Largest Contentful Paint (LCP), and First Input Delay / Interaction to Next Paint (INP).
- **Edge Analytics:** Monitored via Cloudflare / Vercel Edge Analytics (HTTP status code distributions, bandwidth, cache hit ratios).

---

## 3. Real User Monitoring (RUM) Beacon Script
```javascript
import { onCLS, onLCP, onINP } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    page: window.location.pathname
  });

  // Use sendBeacon to guarantee transmission even if user navigates away
  navigator.sendBeacon('/api/telemetry', body);
}

onCLS(sendToAnalytics);
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
```

---

## 4. Spoken Interview Answer (30 Seconds)
> "For frontend observability, we implement Real User Monitoring using the web-vitals library to capture LCP, CLS, and INP directly on real client devices. We transmit telemetry payloads asynchronously using navigator.sendBeacon, preventing thread blocking on page unloads. At the infrastructure tier, we monitor CDN cache hit ratios, p99 TTFB latencies, and 4xx/5xx error rates to guarantee immediate alerting on visual or network regressions."
