# System Architecture & Browser Execution Pipeline

## 1. High-Level Architecture Overview

The CSS Grid Showcase is architected as a lean, zero-runtime-overhead client-side web application. It eliminates traditional multi-tier server complexity by executing entirely within the browser's native layout engine (Blink in Chromium, Gecko in Firefox, WebKit in Safari).

```mermaid
graph TB
    subgraph EdgeCDN [Global Edge CDN Network]
        EdgeCache[Edge Cache Node / Cloudflare / Vercel]
        Origin[Origin Storage: S3 / Git Repo]
    end

    subgraph BrowserClient [Client Browser Architecture]
        subgraph NetworkPipeline [Network & Resource Fetch]
            HTTPParser[HTTP/2 Multiplexer & Decompressor]
            DiskCache[Browser HTTP Cache / Memory Cache]
        end

        subgraph ParsingPipeline [Parsing & Object Model Synthesis]
            HTMLParser[HTML5 Tokenizer & DOM Builder]
            CSSParser[CSS3 Parser & CSSOM Builder]
            DOMTree[(DOM Tree: 7 Element Nodes)]
            CSSOMTree[(CSSOM Tree: Cascaded Style Rules)]
        end

        subgraph RenderingEngine [Blink / WebKit LayoutNG Engine]
            RenderTree[Render Tree Synthesis]
            GFC[Grid Formatting Context Processor]
            LayoutGeometry[Computed Geometry: 4x4 Track Grid Matrix]
            Paint[Paint Layer Operations: Draw Borders, Text, Backgrounds]
            Compositor[GPU Compositor: VSync 60FPS Frame Rasterization]
        end
    end

    Origin --> EdgeCache
    EdgeCache --> NetworkPipeline
    NetworkPipeline --> HTMLParser
    NetworkPipeline --> CSSParser
    HTMLParser --> DOMTree
    CSSParser --> CSSOMTree
    DOMTree --> RenderTree
    CSSOMTree --> RenderTree
    RenderTree --> GFC
    GFC --> LayoutGeometry
    LayoutGeometry --> Paint
    Paint --> Compositor
```

---

## 2. Request & Execution Lifecycle: Top Three Features

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Browser Client
    participant CDN as Edge CDN
    participant Parser as HTML/CSS Parsers
    participant Engine as LayoutNG Engine
    participant GPU as GPU Compositor

    User->>Browser: Enters URL
    Browser->>CDN: GET /index.html (Accept: text/html)
    CDN-->>Browser: 200 OK (HTML Payload)
    Browser->>Parser: Parse HTML, discover <link rel="stylesheet" href="style.css">
    Browser->>CDN: GET /style.css (Conditional If-None-Match)
    CDN-->>Browser: 304 Not Modified / 200 OK (CSS Payload)
    Browser->>Parser: Synthesize DOM & CSSOM Trees

    Note over Engine: Feature F1: Establish Grid Formatting Context
    Engine->>Engine: Resolve repeat(3, 1fr) 20% against viewport width
    Engine->>Engine: Resolve 1fr 2fr 4fr 1fr against min-height 90vh

    Note over Engine: Feature F4: Multi-Row Sidebar Spanning
    Engine->>Engine: Anchor .sidebar at col 4/5, row 2/4 (Spans 6fr + gap)

    Note over Engine: Feature F6: Negative-Indexed Footer
    Engine->>Engine: Anchor footer at col 1/-1 (Terminal explicit grid line 5)

    Engine->>GPU: Generate Draw List & Display Tiles
    GPU-->>User: 60 FPS Render Complete
```

---

## 3. Data Flow & Box Model Tree

```mermaid
classDiagram
    class DocumentBody {
        +display: grid
        +grid-template-columns: repeat(3, 1fr) 20%
        +grid-template-rows: 1fr 2fr 4fr 1fr
        +gap: 20px
        +min-height: 90vh
    }
    class HeaderItem {
        +tag: header
        +grid-column: 1 / 5
    }
    class SmallBox1 {
        +tag: div.small-box-1
        +grid-column: 1 / 2
    }
    class SmallBox2 {
        +tag: div.small-box-2
        +grid-column: 2 / 3
    }
    class SmallBox3 {
        +tag: div.small-box-3
        +grid-column: 3 / 4
    }
    class SidebarItem {
        +tag: div.sidebar
        +grid-column: 4 / 5
        +grid-row: 2 / 4
    }
    class MainItem {
        +tag: main.main-content
        +grid-column: 1 / 4
    }
    class FooterItem {
        +tag: footer
        +grid-column: 1 / -1
    }

    DocumentBody *-- HeaderItem
    DocumentBody *-- SmallBox1
    DocumentBody *-- SmallBox2
    DocumentBody *-- SmallBox3
    DocumentBody *-- SidebarItem
    DocumentBody *-- MainItem
    DocumentBody *-- FooterItem
```

---

## 4. Authentication, Authorization & Security
- **Auth Server:** *Not applicable for this project type.* The application does not collect user credentials, manage sessions, or require authentication gates.
- **Client Security:** Static HTML and CSS files are immune to SQL/NoSQL injection, remote code execution (RCE), and server-side request forgery (SSRF).

---

## 5. Caching Strategy Across Tiers

```mermaid
flowchart LR
    BrowserCache[1. Browser Cache: Cache-Control: max-age=31536000] --> EdgeCache[2. Cloudflare CDN Edge Cache: Global Anycast PoPs]
    EdgeCache --> OriginStorage[3. Origin Storage: GitHub Pages / S3 Bucket]
```

- **Compiled CSS (`style.css`):** Served with content hashing or immutable cache headers:  
  `Cache-Control: public, max-age=31536000, immutable`.
- **HTML Entry Document (`index.html`):** Served with validation caching:  
  `Cache-Control: public, max-age=0, must-revalidate` alongside an `ETag` matching the Git commit hash.

---

## 6. Scaling to 100x Traffic & Bottleneck Analysis

When scaling from 1,000 to 100,000 concurrent visitors:

```mermaid
graph TD
    UserTraffic[100x Incoming User Traffic] --> CDN[Global Edge Anycast CDN: Cloudflare]
    CDN -->|99.8% Cache Hit Ratio| CachedResponse[Cached HTML/CSS Delivered < 20ms]
    CDN -->|0.2% Cache Miss Rate| Origin[Static Storage Origin: Zero Compute Bottleneck]
```

### The First Three Potential Bottlenecks:
1. **Network Bandwidth & Edge Egress:** At massive scale, static asset egress costs dominate. Mitigated by enabling Brotli compression (`Content-Encoding: br`), reducing CSS transfer size to under 300 bytes.
2. **Client-Side Layout Reflow on Mobile Resize:** Resizing windows causes dynamic fraction and viewport recalculation. Mitigated by applying CSS `contain: layout` or `content-visibility: auto` to independent grid items.
3. **Cache Invalidation Delays:** Deploying updates without asset fingerprinting may cause users to serve stale cached stylesheets. Mitigated by appending cache-busting query strings or content hashes (e.g., `style.fdfb0c6.css`).
