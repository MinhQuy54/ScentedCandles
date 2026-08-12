# AuraScent

**E-Commerce Nến Thơm Cao Cấp Tích Hợp AI Tư Vấn Mùi Hương Real-time**

AuraScent giải quyết bài toán "rào cản khứu giác" khi mua nến thơm online bằng cách kết hợp AI Chatbot tư vấn theo cảm xúc/ngữ cảnh, Smart Hybrid Search (BM25 + Vector), và hệ thống chống over-selling khi flash sale.

---

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tech Stack](#tech-stack)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt & Chạy dự án](#cài-đặt--chạy-dự-án)
- [API Overview](#api-overview)
- [Roadmap phát triển](#roadmap-phát-triển)
- [Non-Functional Requirements](#non-functional-requirements)

---

## Tính năng chính

| Tính năng | Mô tả |
|---|---|
| **AI Scent Consultant** | Chatbot tư vấn mùi hương real-time qua Server-Sent Events (SSE), hiểu ngữ cảnh & cảm xúc thay vì chỉ từ khóa |
| **Smart Hybrid Search** | Kết hợp BM25 (Elasticsearch) + Vector Similarity (Qdrant) bằng thuật toán **Reciprocal Rank Fusion (RRF)** |
| **Anti-Overselling Checkout** | Redis Distributed Lock + PostgreSQL `SELECT FOR UPDATE` đảm bảo kho không bao giờ âm dưới tải cao |
| **Async Metadata Extraction** | Celery Worker tự động bóc tách Top/Middle/Base Notes và Moods từ mô tả thô bằng LLM |
| **Circuit Breaker** | Tự động fallback sang PostgreSQL Full-text Search khi AI Engine gặp sự cố |

---

## Kiến trúc hệ thống

```
Web Frontend (ReactJS + TS + Vite)
            │  REST / SSE (HTTP/2)
            ▼
NestJS API Gateway
 ├─ AuthModule (JWT/RBAC)
 ├─ ProductsModule (Prisma + Redis cache)
 ├─ OrdersModule (Redlock + DB Transaction)
 └─ AiClientModule (gRPC Client)
            │  gRPC / Protobuf
            ▼
Python AI Engine
 ├─ gRPC Server: StreamAIChat / SmartSearch / ExtractCandleMetadata
 └─ Celery Async Engine: extract_product_metadata / sync_postgres_to_vector_es
            │
   ┌────────┼──────────┐
   ▼        ▼           ▼
Elasticsearch  Qdrant   Redis (Broker & Lock)
(BM25)         (Vector)
```

Toàn bộ hệ thống chia làm 2 service chính giao tiếp qua **gRPC**:
- **API Gateway (NestJS)**: cổng vào cho Frontend, xử lý Auth, E-commerce core, và proxy sang AI Engine.
- **AI Engine (Python)**: xử lý toàn bộ logic AI (Chatbot streaming, Hybrid Search, Metadata Extraction).

---

## Tech Stack

**Frontend**
- ReactJS + TypeScript + Vite

**Backend — API Gateway**
- NestJS, Prisma ORM, JWT/Passport, ioredis/Redlock, gRPC Client

**Backend — AI Engine**
- Python, gRPC Server, Celery, SentenceTransformer / OpenAI Embedding

**Data & Infrastructure**
- PostgreSQL (nguồn dữ liệu chính — ACID)
- Elasticsearch (BM25 full-text search)
- Qdrant (Vector similarity search)
- Redis (Cache, Message Broker, Distributed Lock)
- Docker Compose (orchestration)

**Giao tiếp nội bộ**
- gRPC + Protobuf (`packages/scented-candles.proto`)
- Server-Sent Events (SSE) cho luồng chat real-time tới Frontend

---

## Cấu trúc thư mục

```
AuraScent/
├── app/
│   ├── web-fe/              # ReactJS + TS + Vite Frontend
│   ├── api-gateway/         # NestJS API Gateway
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   └── ai-client/
│   │   └── prisma/
│   │       └── schema.prisma
│   └── ai-engine/           # Python AI Engine
│       └── src/
│           ├── grpc_server/
│           ├── search_engine/
│           │   ├── es_client.py
│           │   ├── qdrant_client.py
│           │   └── rrf_fusion.py
│           ├── celery_engine/
│           │   └── tasks.py
│           └── embedding_service/
├── packages/
│   └── scented-candles.proto   # Protobuf contract dùng chung
└── docker-compose.yml
```

---

## Yêu cầu hệ thống

- Docker & Docker Compose
- Node.js 20+ (cho `api-gateway`, `web-fe`)
- Python 3.11+ (cho `ai-engine`)
- npm hoặc pnpm

---

## Cài đặt & Chạy dự án

### 1. Clone & cấu hình môi trường

```bash
git clone <repo-url> AuraScent
cd AuraScent
cp .env.example .env   # cấu hình DATABASE_URL, REDIS_URL, OPENAI_API_KEY, v.v.
```

### 2. Khởi động hạ tầng (Postgres, Redis, Qdrant, Elasticsearch)

```bash
docker compose up -d postgres redis qdrant elasticsearch
```

### 3. Build & chạy các service chính

```bash
docker compose up -d --build ai-engine api-gateway
```

### 4. Chạy Prisma Migration

```bash
cd app/api-gateway
npx prisma migrate dev
```

### 5. (Tuỳ chọn) Chạy Frontend ở chế độ dev

```bash
cd app/web-fe
npm install
npm run dev
```

Sau khi hoàn tất, các service mặc định chạy tại:

| Service | Port (mặc định) |
|---|---|
| Web Frontend | `5173` |
| API Gateway (REST/SSE) | `3000` |
| AI Engine (gRPC) | `50051` |
| PostgreSQL | `5432` |
| Redis | `6379` |
| Elasticsearch | `9200` |
| Qdrant | `6333` |

---

## API Overview

### REST Endpoints (NestJS API Gateway)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Không | Đăng ký tài khoản |
| `POST` | `/api/v1/auth/login` | Không | Đăng nhập, nhận JWT |
| `GET` | `/api/v1/products` | Không | Danh sách sản phẩm (cache) |
| `GET` | `/api/v1/products/:id` | Không | Chi tiết sản phẩm |
| `POST` | `/api/v1/products` | Admin | Tạo sản phẩm (kích hoạt Celery) |
| `POST` | `/api/v1/orders` | Customer | Đặt hàng (Redis Lock + Atomic trừ kho) |
| `GET` | `/api/v1/ai/search` | Không | Smart Hybrid Search |
| `GET` | `/api/v1/ai/chat/stream` | Không/Có | SSE Chatbot Stream |

### gRPC Service (`scented_candles.ai.v1.ScentedCandlesAIService`)

```protobuf
rpc StreamAIChat (ChatRequest) returns (stream ChatChunk);
rpc SmartSearch (SearchQuery) returns (SearchResponse);
rpc ExtractCandleMetadata (ExtractRequest) returns (ExtractResponse);
```

Chi tiết đầy đủ message xem tại [`packages/scented-candles.proto`](./packages/scented-candles.proto).

---

## Roadmap phát triển

| Phase | Nội dung | Trạng thái |
|---|---|---|
| **Phase 1** — Monorepo Foundation & Infrastructure | Docker Compose, cấu trúc monorepo, Protobuf contract, Prisma schema | Hoàn thành |
| **Phase 2** — Core E-commerce & Anti-Overselling Inventory | Auth (JWT/RBAC), Products CRUD, Redlock + Transaction, Stress test chống over-selling | Chưa bắt đầu |
| **Phase 3** — AI Engine, Hybrid Search & Async Pipeline | gRPC Server, RRF Search Engine, Celery Metadata Extraction | Chưa bắt đầu |
| **Phase 4** — Integration, Real-time Chatbot (SSE) & Frontend UI | SSE Gateway, React UI (Catalog/Cart/Search/Chatbot), Circuit Breaker, E2E Testing | Chưa bắt đầu |

> Trạng thái chi tiết theo từng task: xem tài liệu kiến trúc nội bộ (BMAD Framework doc).

---

## Non-Functional Requirements

| Chỉ số | Mục tiêu |
|---|---|
| Hybrid Search latency | < 200ms |
| Chatbot Time-to-First-Token | < 500ms |
| Order Creation latency (P99) | < 300ms |
| Checkout throughput | 1.000+ TPS (flash sale) |
| Data sync (PostgreSQL → ES/Qdrant) | < 2s (Eventual Consistency) |
| Over-selling | Tuyệt đối bằng 0 |

---

## Ghi chú kiến trúc

- **Đồng bộ dữ liệu**: dùng mô hình Transactional Outbox / Event-driven qua Celery Queue — khi Product chuyển `ACTIVE`, hệ thống tự sinh embedding và đẩy sang Elasticsearch + Qdrant.
- **Circuit Breaker**: khi tỉ lệ lỗi gRPC > 50% trong 10s, hệ thống tự động mở circuit và fallback Search sang PostgreSQL ILIKE/Full-text Search.
- **Retry Policy**: tối đa 3 lần, Exponential Backoff (100ms → 200ms → 400ms).

---

## License

_Chưa xác định — cập nhật khi dự án open-source hoặc có license chính thức._
