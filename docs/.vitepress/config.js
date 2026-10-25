import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(
  defineConfig({
    title: 'CSS Grid Showcase',
    description: 'Interview-Ready Architecture and Complete Technical Documentation',
    appearance: 'dark',
    base: '/',
    
    themeConfig: {
      nav: [
        { text: 'Guide', link: '/00-project-type' },
        { text: 'Features', link: '/01-features' },
        { text: 'System Design', link: '/system-design/' },
        { text: 'Comparisons', link: '/04-tech-comparisons' },
        { text: 'Interview Q&A', link: '/09-interview-qa' },
        { text: 'Say It Out Loud', link: '/14-say-it-out-loud' },
        { text: 'Master Checklist', link: '/13-master-checklist' }
      ],

      sidebar: [
        {
          text: 'Project Overview & Analysis',
          collapsed: false,
          items: [
            { text: 'Project Type Classification', link: '/00-project-type' },
            { text: 'Full Project Analysis', link: '/00a-project-analysis' },
            { text: '30s & 2min Pitches', link: '/00b-project-pitch' },
            { text: 'Project Map & Landscape', link: '/00-project-map' },
            { text: 'Step-by-Step Build Order', link: '/02-build-order' },
            { text: 'System Architecture', link: '/05-architecture' }
          ]
        },
        {
          text: 'Feature Inventory & Deep Dives',
          collapsed: false,
          items: [
            { text: 'Master Feature Catalogue', link: '/01-features' },
            { text: 'F1: 2D Grid & Track Geometry', link: '/features/01-grid-container' },
            { text: 'F2: Full-Span Header', link: '/features/02-header-spanning' },
            { text: 'F3: Subdivided Card Trio', link: '/features/03-subdivided-card-boxes' },
            { text: 'F4: Multi-Row Sidebar', link: '/features/04-multi-row-sidebar' },
            { text: 'F5: Main Content Canvas', link: '/features/05-main-content-flow' },
            { text: 'F6: Full-Bleed Footer', link: '/features/06-full-bleed-footer' },
            { text: 'F7: Sass & Source Maps', link: '/features/07-sass-nesting-compilation' },
            { text: 'F8: Viewport Height & Gaps', link: '/features/08-viewport-scaling-gap' },
            { text: 'Say It Out Loud (Verbal Scripts)', link: '/14-say-it-out-loud' }
          ]
        },
        {
          text: 'Specifications & Quality',
          collapsed: false,
          items: [
            { text: 'API & DOM Interfaces', link: '/03-api-reference' },
            { text: 'Technical Comparisons', link: '/04-tech-comparisons' },
            { text: 'Security Audit & OWASP Top 10', link: '/06-security' },
            { text: 'AI Integration Analysis', link: '/07-ai-integration' },
            { text: 'Engineering Quality, Ops & CI/CD', link: '/08-quality-and-ops' }
          ]
        },
        {
          text: 'Web-Scale System Design Suite',
          collapsed: false,
          items: [
            { text: 'System Design Suite Overview', link: '/system-design/' },
            { text: '14.1 Requirements & Estimation', link: '/system-design/01-requirements-and-estimation' },
            { text: '14.2 Architecture Styles', link: '/system-design/02-architecture-styles' },
            { text: '14.3 Networking & Communication', link: '/system-design/03-networking-and-communication' },
            { text: '14.4 Load Balancing & Scaling', link: '/system-design/04-load-balancing-and-scaling' },
            { text: '14.5 Databases & Storage', link: '/system-design/05-databases-and-storage' },
            { text: '14.6 Caching Deep Dive', link: '/system-design/06-caching' },
            { text: '14.7 Messaging & Async Processing', link: '/system-design/07-messaging-and-async' },
            { text: '14.8 Consistency & Distributed Systems', link: '/system-design/08-consistency-and-distributed' },
            { text: '14.9 Reliability & Resilience', link: '/system-design/09-reliability-and-resilience' },
            { text: '14.10 API Design & Rate Limiting', link: '/system-design/10-api-design-and-rate-limiting' },
            { text: '14.11 Security Architecture', link: '/system-design/11-security-architecture' },
            { text: '14.12 Search & AI Architecture', link: '/system-design/12-search-and-ai-architecture' },
            { text: '14.13 Real-Time Systems', link: '/system-design/13-real-time-systems' },
            { text: '14.14 Observability & Operations', link: '/system-design/14-observability-and-operations' },
            { text: '14.15 Performance Engineering', link: '/system-design/15-performance-engineering' },
            { text: '14.16 Cost & Trade-Offs', link: '/system-design/16-cost-and-trade-offs' },
            { text: '14.17 Classic System Design Applied', link: '/system-design/17-classic-system-design-applied' },
            { text: '14.18 Design Decisions Log (ADRs)', link: '/system-design/decisions' }
          ]
        },
        {
          text: 'Interview Mastery & Reference',
          collapsed: false,
          items: [
            { text: '150+ Interview Questions & Answers', link: '/09-interview-qa' },
            { text: 'Gaps & Prioritized Roadmap', link: '/10-gaps-and-improvements' },
            { text: 'Technical Glossary', link: '/11-glossary' },
            { text: 'Developer Confirmation List', link: '/12-confirm-list' },
            { text: 'Master 275-Item Checklist', link: '/13-master-checklist' }
          ]
        }
      ],

      search: {
        provider: 'local'
      },

      outline: {
        level: [2, 3],
        label: 'On this page'
      },

      socialLinks: [
        { icon: 'github', link: 'https://github.com/AVISHJAIN9/grid' }
      ]
    },

    mermaid: {
      theme: 'dark'
    },

    vite: {
      optimizeDeps: {
        include: ['fastdom', 'mermaid']
      }
    }
  })
);
