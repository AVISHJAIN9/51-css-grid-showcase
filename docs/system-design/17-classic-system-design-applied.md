# 14.17 Classic System Design Problems Applied to This Project

This chapter demonstrates how the foundational engineering patterns of this codebase (Anycast networking, immutable storage, caching hierarchies, and client rendering) scale to classic distributed system design interview scenarios.

```mermaid
graph TD
    A[Classic System Design Implementations] --> B[1. The 100x Scale System]
    A --> C[2. Edge Rate Limiter Service]
    A --> D[3. AI Layout Request Pipeline]
    A --> E[4. Asset Upload & Media Pipeline]
    A --> F[5. URL Shortener / Pastebin Architecture]
```

---

## 1. Design This Project's Architecture at 100x Scale (100M Views/Mo)

### Functional Requirements
- Deliver static HTML5 and compiled CSS3 to 100 million visitors/month globally.
- Global p95 TTFB < 30ms, 99.999% uptime.

### Capacity Estimation
- $100\text{M views/month} \approx 3.33\text{M views/day} \approx 38.5\text{ QPS average}$, peak $100\text{ QPS}$.
- Bandwidth: $100\text{ QPS} \times 0.63\text{ KB} = 63\text{ KB/s}$ (minimal).

### Architecture Diagram
```mermaid
graph TD
    User[User Across Globe] --> GeoDNS[Route 53 Latency-Based Anycast DNS]
    GeoDNS --> Cloudflare[Primary Anycast CDN: 300+ Global PoPs]
    Cloudflare -->|Cache Miss Only <0.2%| Shield[Cloudflare Tiered Cache Origin Shield]
    Shield --> S3Origin[(AWS S3 Multi-Region Replicated Buckets)]
    GeoDNS -.->|Automated Failover| Fastly[Secondary CDN: Fastly Edge]
```

### Bottlenecks & Trade-offs
- The primary bottleneck is DNS resolution latency. Mitigated by setting long TTLs on root A/AAAA records and using Anycast recursive resolvers.

---

## 2. Design a Global Edge Rate Limiter

### Functional Requirements
- Limit client requests to 100 requests per minute per IP address.
- Low latency (<2ms overhead on requests).

### Architecture Diagram
```mermaid
graph LR
    Req[Incoming HTTP Request] --> EdgeWorker[Cloudflare Workers / Edge Gateway]
    EdgeWorker --> KeyGen[Hash Client IP + Minute Window]
    KeyGen --> RedisCluster[(Redis Cluster / Cloudflare KV: INCR & EXPIRE)]
    RedisCluster --> Decision{Count > 100?}
    Decision -->|No| Allow[Proceed: Serve Asset 200 OK]
    Decision -->|Yes| Deny[Block: 429 Too Many Requests]
```

### Deep Dive: Sliding Window Counter Algorithm
Instead of strict 60-second boundaries that allow $2\times$ bursts at the boundary, calculate:
$$\text{Weight} = \frac{\text{Current Minute Time Remaining}}{60}$$
$$\text{Estimated Count} = (\text{Previous Window Count} \times \text{Weight}) + \text{Current Window Count}$$
If $\text{Estimated Count} > 100$, reject immediately.

---

## 3. Design an AI Layout Generation Pipeline with Queueing & Fallbacks

### Functional Requirements
- User inputs a wireframe prompt; system generates verified CSS Grid rules within 2 seconds.
- Handle LLM rate limits, timeouts, and provider outages seamlessly.

### Architecture Diagram
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Gateway as API Gateway
    participant SemCache as Redis Semantic Cache
    participant Queue as BullMQ / SQS Task Queue
    participant Worker as Layout Generation Worker
    participant LLM1 as Primary: Gemini 1.5 Pro
    participant LLM2 as Fallback: Claude 3.5 Sonnet
    participant PostCSS as PostCSS CSS Grid Validator

    User->>Gateway: POST /api/generate { prompt: "4 col dashboard" }
    Gateway->>SemCache: Query prompt vector embedding
    alt Cache Hit (<10ms)
        SemCache-->>Gateway: Return cached CSS Grid rules
        Gateway-->>User: 200 OK (Instant CSS)
    else Cache Miss
        Gateway->>Queue: Push generation job
        Queue->>Worker: Dispatch job to worker
        Worker->>LLM1: Request structured JSON layout
        alt Gemini Succeeds
            LLM1-->>Worker: JSON CSS Grid Schema
        else Gemini Times Out (3s timeout)
            Worker->>LLM2: Fallback to Claude 3.5 Sonnet
            LLM2-->>Worker: JSON CSS Grid Schema
        end
        Worker->>PostCSS: Validate grid lines & syntax
        Worker->>SemCache: Cache prompt embedding & CSS output
        Worker-->>Gateway: Emit WebSocket layout event
        Gateway-->>User: Stream CSS rules to browser CSSOM
    end
```

---

## 4. Design a Media & CSS Asset Upload System

### Functional Requirements
- Allow developers to upload SCSS/CSS files and background images up to 50MB.
- Automatic compression, source map generation, and instant CDN propagation.

### Architecture Diagram
```mermaid
graph TD
    Client[Developer / CI Pipeline] --> API[Auth & Presigned URL Generator]
    API -->|Generate Signed PUT URL| S3Upload[(S3 Ingestion Bucket)]
    Client -->|Direct Multipart Upload| S3Upload
    S3Upload --> Event[S3 ObjectCreated Event]
    Event --> Lambda[AWS Lambda / Worker Service]
    Lambda --> SassCompile[Compile SCSS & Compress Brotli]
    Lambda --> S3Deploy[(S3 Edge Public Distribution Bucket)]
    S3Deploy --> CDNPurge[CDN Instant Cache Purge API]
```

---

## 5. Design a URL Shortener & Layout Pastebin Using This Stack

### Functional Requirements
- Users save a custom CSS Grid configuration and receive a short URL (e.g., `grid.sh/x8k2`).
- 100 million stored layouts, 100:1 read-to-write ratio.

### Architecture & Math
- 100M URLs $\times$ 7-character Base62 hash ($[a-zA-Z0-9]$).
- $62^7 \approx 3.52 \text{ trillion}$ unique combinations.
- Key-Value Store (Redis + DynamoDB):
  - Key: `x8k2` (7 bytes)
  - Value: Compressed CSS Grid JSON (1KB)
  - Storage: $100\text{M} \times 1\text{KB} = 100\text{GB}$ total storage (fits in a single DynamoDB table or managed Redis instance).
