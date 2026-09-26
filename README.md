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
| **E-Commerce & Smart Cart** | Đăng ký/đăng nhập (JWT/RBAC), quản lý giỏ hàng thông minh hợp nhất Guest & User qua Redis (**Redis Cart Merging**), thanh toán mã **VietQR/ATM** |
| **Admin Dashboard** | Giao diện quản trị toàn diện dành cho Admin quản lý Sản phẩm, Danh mục, Tồn kho, Ảnh sản phẩm, Người dùng và Phân quyền (RBAC) |
| **AI Scent Consultant** | Chatbot tư vấn mùi hương real-time qua Server-Sent Events (SSE), hiểu ngữ cảnh & cảm xúc |
| **Smart Hybrid Search** | Kết hợp BM25 (Elasticsearch) + Vector Similarity (Qdrant) bằng thuật toán **Reciprocal Rank Fusion (RRF)** |
| **Anti-Overselling Checkout** | Redis Distributed Lock + PostgreSQL `SELECT FOR UPDATE` đảm bảo kho không bao giờ âm dưới tải cao |
| **Async Metadata Extraction** | Celery Worker tự động bóc tách Top/Middle/Base Notes và Moods từ mô tả thô bằng LLM |
| **Circuit Breaker** | Tự động fallback sang PostgreSQL Full-text Search khi AI Engine gặp sự cố |

---

## Kiến trúc hệ thống

```
Web Frontend (ReactJS + TS + Vite + Ant Design)
            │  REST / SSE (HTTP/2)
            ▼
NestJS API Gateway
 ├─ AuthModule (JWT/RBAC)
 ├─ ProductsModule (TypeORM + Redis cache)
 ├─ OrdersModule (Redlock + DB Transaction)
 ├─ CartModule (Redis Cart Merging)
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
- **API Gateway (NestJS)**: Cổng vào cho Frontend, xử lý Auth, E-commerce core (dùng **TypeORM**), và proxy sang AI Engine.
- **AI Engine (Python)**: Xử lý toàn bộ logic AI (Chatbot streaming, Hybrid Search, Metadata Extraction).

---

## Tech Stack

**Frontend**
- React 19 + TypeScript + Vite + Ant Design + Bootstrap

**Backend — API Gateway**
- NestJS, TypeORM, PostgreSQL, JWT/Passport, ioredis, gRPC Client

**Backend — AI Engine**
- Python, gRPC Server, Celery, SentenceTransformer / OpenAI Embedding

**Data & Infrastructure**
- PostgreSQL (nguồn dữ liệu chính — ACID)
- Redis (Cache, Session, Cart Merging & Distributed Lock)
- Elasticsearch (BM25 full-text search)
- Qdrant (Vector similarity search)
- Docker & Docker Compose (Orchestration)
- Render Cloud Deployment (`render.yaml`)

**Giao tiếp nội bộ**
- gRPC + Protobuf (`packages/proto/scented-candles.proto`)
- Server-Sent Events (SSE) cho luồng chat real-time tới Frontend

---

## Cấu trúc thư mục

```
AuraScent/
├── app/
│   ├── web-fe/              # ReactJS + TS + Vite Frontend
│   │   ├── src/
│   │   │   ├── components/  # Core UI & AdminRoute Protection
│   │   │   ├── page/        # Storefront & Admin Dashboard Pages
│   │   │   └── context/     # CartContext & State Management
│   ├── api-gateway/         # NestJS API Gateway
│   │   ├── src/
│   │   │   ├── modules/     # Auth, Products, Orders, Cart, Users, Admin, ...
│   │   │   ├── db/          # TypeORM Entities & Migrations
│   │   │   └── proto/       # Generated gRPC code
│   └── ai-engine/           # Python AI Engine
│       └── src/
│           ├── grpc_server/
│           ├── search_engine/
│           └── celery_engine/
├── packages/
│   └── proto/
│       └── scented-candles.proto   # Protobuf contract dùng chung
├── docker-compose.yml
└── render.yaml               # Render Blueprint deployment config
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
cp .env.example .env   # Cấu hình DATABASE_URL, REDIS_URL, OPENAI_API_KEY, v.v.
```

### 2. Khởi động hạ tầng (Postgres, Redis, Qdrant)

```bash
docker compose up -d postgres redis qdrant
```

### 3. Build & chạy các service chính

```bash
docker compose up -d --build ai-engine api-gateway
```

> **Lưu ý**: `api-gateway` được cấu hình tự động chạy TypeORM Migration (`migrationsRun: true`) khi khởi động ứng dụng.

### 4. (Tuỳ chọn) Chạy Frontend ở chế độ dev

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
| `POST` | `/api/v1/auth/login` | Không | Đăng nhập, nhận JWT Token |
| `GET` | `/api/v1/products` | Không | Danh sách sản phẩm (Search/Filter/Page) |
| `GET` | `/api/v1/products/:id` | Không | Chi tiết sản phẩm |
| `POST` | `/api/v1/products` | Admin | Tạo sản phẩm & upload ảnh |
| `POST` | `/api/v1/orders` | Customer | Đặt hàng & sinh mã VietQR/ATM |
| `GET` | `/api/v1/admin/*` | Admin | APIs quản trị User, Product, Inventory, Role, Category |
| `GET` | `/api/v1/ai/search` | Không | Smart Hybrid Search |
| `GET` | `/api/v1/ai/chat/stream` | Không/Có | SSE Chatbot Stream |

### gRPC Service (`scented_candles.ai.v1.ScentedCandlesAIService`)

```protobuf
rpc StreamAIChat (ChatRequest) returns (stream ChatChunk);
rpc SmartSearch (SearchQuery) returns (SearchResponse);
rpc ExtractCandleMetadata (ExtractRequest) returns (ExtractResponse);
```

Chi tiết protobuf message xem tại [`packages/proto/scented-candles.proto`](./packages/proto/scented-candles.proto).

---

## Roadmap phát triển

| Phase | Nội dung | Trạng thái |
|---|---|---|
| **Phase 1** — Foundation & Infrastructure | Docker Compose, Monorepo structure, Protobuf contract, TypeORM Entities & Migrations | ✅ Hoàn thành |
| **Phase 2** — Core E-Commerce & Admin UI | Auth (JWT/RBAC), Cart Merging (Redis), Orders & VietQR Checkout, Admin Dashboard UI | ✅ Hoàn thành |
| **Phase 3** — AI Engine, Hybrid Search & Async Pipeline | gRPC Server, RRF Search Engine (BM25 + Qdrant), Celery Metadata Extraction | 🔄 Đang phát triển |
| **Phase 4** — Real-time Chatbot (SSE) & E2E Testing | SSE Gateway, React Chatbot UI Component, Circuit Breaker, E2E Testing | ⏳ Sắp tới |

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

## License

_Chưa xác định — cập nhật khi dự án open-source hoặc có license chính thức._
