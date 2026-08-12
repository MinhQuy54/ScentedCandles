# AuraScent - Tài liệu Phân tích Kiến trúc BMAD & Technical Roadmap

> **Dự án:** AuraScent - E-Commerce Nến Thơm Cao Cấp Tích Hợp AI Tư Vấn Mùi Hương Real-time  
> **Tác giả:** Principal Solutions Architect & Technical Lead  
> **Phương pháp luận:** BMAD Framework (Business - Method - Architecture - Data)  
> **Ngày cập nhật:** 11/08/2026  

---

## 📋 MỤC LỤC
1. [B - BUSINESS (Bài toán & Giá trị Kinh doanh)](#1-b---business-bài-toán--giá-trị-kinh-doanh)
2. [M - METHOD (Phương pháp & Luồng Nghiệp vụ)](#2-m---method-phương-pháp--luồng-nghiệp-vụ)
3. [A - ARCHITECTURE (Kiến trúc Hệ thống & Module Detail)](#3-a---architecture-kiến-trúc-hệ-thống--module-detail)
4. [D - DATA (Mô hình Dữ liệu & Storage)](#4-d---data-mô-hình-dữ-liệu--storage)
5. [🚀 ACTIONABLE TECHNICAL ROADMAP (Phát triển 4 Phase)](#5--actionable-technical-roadmap-phát-triển-4-phase)

---

## 1. B - BUSINESS (Bài toán & Giá trị Kinh doanh)

### 1.1. User Persona & Pain Points
* **Target Audience (Gen Z & Millennials, Decor Enthusiasts, Stress Relievers, Gift Shoppers):**
  * **Persona 1 - Scent Explorer (Người tìm kiếm trải nghiệm):** Yêu thích thử nghiệm mùi hương mới theo tâm trạng (thư giãn, tập trung làm việc, tạo không gian ấm cúng khi đọc sách), coi nến thơm là một phần của lối sống (lifestyle).
  * **Persona 2 - Gift Finder (Người mua quà tặng):** Tìm kiếm nến thơm cao cấp làm quà tặng tinh tế cho người thân, đối tác nhưng phân vân không biết hương thơm nào phù hợp với cá tính người nhận.
* **Pain Points khi mua nến thơm Online:**
  1. **Không thể trải nghiệm khứu giác trực tiếp (Smell Barrier):** Chỉ xem qua hình ảnh và chữ mô tả đơn điệu, khó hình dung sự hòa quyện giữa các tầng hương (*Top Notes*, *Middle Notes*, *Base Notes*).
  2. **Khó chọn mùi theo Ngữ cảnh/Cảm xúc (Contextual Ambiguity):** Từ khóa tìm kiếm truyền thống (VD: "nến hoa hồng") không đáp ứng được nhu cầu tìm theo cảm xúc hay không gian (VD: "mùi gỗ ấm cúng cho phòng ngủ mùa đông", "mùi thanh mát xả stress sau giờ làm").
  3. **Rủi ro Over-selling / Hết hàng giả tạo khi Flash Sale:** Khi săn các phiên bản giới hạn (Limited Edition), hệ thống thường bị đơ hoặc báo mua thành công nhưng sau đó hủy đơn do quá tải tồn kho.

### 1.2. Giá trị Kinh doanh từ Lớp AI (AI Business Value)
* **AI Scent Consultant (Tư vấn viên mùi hương AI 24/7):**
  * Trò chuyện tự nhiên, giải mã nhu cầu cảm xúc & không gian của khách hàng thành gợi ý sản phẩm chính xác.
  * Tăng tỉ lệ chuyển đổi (**Conversion Rate +25-35%**) và giảm tỉ lệ đổi trả do chọn sai mùi hương.
* **Smart Hybrid Search (Tìm kiếm Lai ghép thông minh):**
  * Kết hợp **BM25 Keyword Matching** (từ khóa chính xác như tên thương hiệu, tên mùi) và **Qdrant Vector Similarity** (hiểu ý định ngữ nghĩa, tâm trạng).
  * Giảm tỉ lệ tìm kiếm không ra kết quả (*Zero-result search drop to <1%*).
* **Async Automated Metadata Extraction (Chuẩn hóa dữ liệu tự động):**
  * Bóc tách chính xác các tầng hương (*Top/Middle/Base Notes*) và sắc thái cảm xúc (*Moods*) từ văn bản mô tả thô của Admin bằng Celery Worker.
  * Tiết kiệm 90% thời gian nhập liệu manual cho đội ngũ Vận hành (Operations).

### 1.3. Liệt kê Yêu cầu Chức năng & Phi Chức năng

#### 🎯 Functional Requirements (FR)
* **FR-01 (E-commerce Core):** Đăng ký/Đăng nhập (JWT), Xem danh mục sản phẩm, Quản lý giỏ hàng, Đặt hàng và theo dõi đơn hàng.
* **FR-02 (Anti-Overselling Inventory):** Đặt hàng đồng thời với cơ chế khóa phân tán Redis Lock + PostgreSQL ACID Transaction để trừ kho chính xác 100%.
* **FR-03 (Smart Hybrid Search):** Tìm kiếm kết hợp full-text search và ngữ nghĩa vector với thuật toán Reciprocal Rank Fusion (RRF).
* **FR-04 (Real-time AI Chatbot):** Tư vấn tư duy khứu giác dạng dòng văn bản liên tục (Server-Sent Events streaming).
* **FR-05 (Async Metadata Pipeline):** Tự động phân tích bài viết mô tả nến thơm, trích xuất cấu trúc tầng hương khi Admin thêm sản phẩm mới.

#### ⚡ Non-Functional Requirements (NFR)
* **NFR-01 (SLA Latency):**
  * Hybrid Search response time: $< 200ms$.
  * AI Chatbot Time-to-First-Token (TTFT): $< 500ms$.
  * Order Creation throughput latency: $< 300ms$ cho $99\%$ requests (P99).
* **NFR-02 (Concurrency & Throughput):**
  * Khả năng chịu tải đạt $1.000+$ TPS (Transactions Per Second) tại endpoint Checkout trong các đợt Flash Sale.
* **NFR-03 (Data Integrity & Resilience):**
  * **Zero Over-selling guarantee:** Kho không bao giờ bị âm dưới mọi tải trọng concurrency.
  * **Eventual Consistency:** Dữ liệu sản phẩm từ PostgreSQL đồng bộ sang Elasticsearch và Qdrant trong vòng $< 2$ giây.
  * **Circuit Breaker:** Khi AI Engine gặp sự cố, Search tự động fallback về PostgreSQL Full-text Search mà không gây nghẽn toàn bộ hệ thống.

---

## 2. M - METHOD (Phương pháp & Luồng Nghiệp vụ)

### 2.1. Luồng Xử lý Đơn hàng (Order Placement) - Anti-Overselling Workflow

Cơ chế kết hợp **Redis Distributed Lock (Redlock)** ở tầng API Gateway để Serialize các request trùng sản phẩm hot, kết hợp **PostgreSQL Row-level Lock (`SELECT FOR UPDATE`)** trong Database Transaction.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Web Frontend (ReactJS)
    participant GW as API Gateway (NestJS)
    participant Redis as Redis Lock & Cache
    participant DB as PostgreSQL DB

    Client->>GW: POST /api/v1/orders (items: [{productId, qty}])
    GW->>Redis: Acquire Distributed Lock (lock:product:{productId}, TTL=3s)
    alt Acquire Lock Failed
        Redis-->>GW: Lock Acquired False
        GW-->>Client: 429 Too Many Requests / Retry Later
    else Lock Acquired Success
        Redis-->>GW: Lock Acquired True
        GW->>DB: BEGIN TRANSACTION
        GW->>DB: SELECT stock FROM "Product" WHERE id = {productId} FOR UPDATE
        alt Stock < Quantity
            GW->>DB: ROLLBACK TRANSACTION
            GW->>Redis: Release Lock
            GW-->>Client: 400 Bad Request (Sản phẩm hết hàng)
        else Stock >= Quantity
            GW->>DB: UPDATE "Product" SET stock = stock - qty WHERE id = {productId}
            GW->>DB: INSERT INTO "Order" & "OrderItem"
            GW->>DB: COMMIT TRANSACTION
            GW->>Redis: Release Lock
            GW-->>Client: 201 Created (Order Success, orderId)
        end
    end
```

---

### 2.2. Luồng Tìm kiếm Thông minh (Smart Hybrid Search Workflow with RRF)

Kết hợp điểm số từ **Elasticsearch (BM25)** và **Qdrant (Cosine Similarity Vector)** thông qua thuật toán **Reciprocal Rank Fusion (RRF)**.

Formula:
$$RRF\_Score(d) = \frac{1}{k + r_{ES}(d)} + \frac{1}{k + r_{Qdrant}(d)} \quad (với\ k = 60)$$

```mermaid
sequenceDiagram
    autonumber
    actor Client as ReactJS Frontend
    participant GW as NestJS API Gateway
    participant AI as Python AI Engine (gRPC)
    participant ES as Elasticsearch (BM25)
    participant QD as Qdrant Vector DB

    Client->>GW: GET /api/v1/ai/search?q="nến gỗ ấm phòng ngủ"
    GW->>AI: gRPC SmartSearch(query, limit=20)
    par Parallel Execution in AI Engine
        AI->>ES: BM25 Text Search (query) -> Top 20 Candidates
        AI->>AI: Generate Vector Embedding (SentenceTransformer / OpenAI)
        AI->>QD: Vector Similarity Search (vector) -> Top 20 Candidates
    end
    ES-->>AI: List A (Ranked by BM25)
    QD-->>AI: List B (Ranked by Cosine Similarity)
    AI->>AI: Merge & Calculate RRF Score for each Product ID
    AI->>AI: Sort by RRF Score DESC -> Select Top N
    AI-->>GW: SearchResponse (List of CandleProduct + Score)
    GW-->>Client: 200 OK (JSON Products)
```

---

### 2.3. Luồng Streaming Chatbot (Real-time AI Consultant Workflow)

Luồng giao tiếp đa tầng: **gRPC Server Streaming (Python AI Engine $\rightarrow$ NestJS Gateway)** kết hợp với **Server-Sent Events - SSE (NestJS Gateway $\rightarrow$ ReactJS Frontend)**.

```mermaid
sequenceDiagram
    autonumber
    actor Client as ReactJS Frontend
    participant GW as NestJS Gateway (SSE)
    participant AI as Python AI Engine (gRPC)
    participant LLM as OpenAI / Local LLM

    Client->>GW: EventSource / SSE GET /api/v1/ai/chat/stream?prompt=...
    GW->>AI: gRPC StreamAIChat(ChatRequest)
    AI->>LLM: Call LLM Streaming Completion API
    loop Token Streaming
        LLM-->>AI: Yield text token ("Nến", " thơm", " Rose", ...)
        AI-->>GW: Stream gRPC ChatChunk(delta_text, is_finished=False)
        GW-->>Client: SSE event: message data: {"deltaText": "..."}
    end
    LLM-->>AI: Stream Complete
    AI-->>GW: Stream gRPC ChatChunk("", is_finished=True)
    GW-->>Client: SSE event: end data: {"isFinished": true}
    GW->>Client: Close SSE Stream
```

---

### 2.4. Luồng Async Metadata Extraction (Celery Worker Workflow)

Khi Admin tạo sản phẩm mới, công việc bóc tách thuộc tính tầng hương được đẩy vào hàng đợi Async Celery để không làm block HTTP Request của Admin.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Web Dashboard
    participant GW as NestJS API Gateway
    participant DB as PostgreSQL DB
    participant MQ as Redis Broker / Celery Queue
    participant Worker as Python Celery Worker
    participant LLM as LLM Structuring API
    participant SearchDB as Qdrant & Elasticsearch

    Admin->>GW: POST /api/v1/products (Create with Raw Description)
    GW->>DB: INSERT INTO "Product" (status = 'DRAFT')
    GW->>MQ: Push Task `extract_and_index_product`(product_id, description)
    GW-->>Admin: 202 Accepted (Product Created as DRAFT, processing async)
    
    MQ->>Worker: Consume Task `extract_and_index_product`
    Worker->>LLM: Extract Notes & Moods JSON from Description
    LLM-->>Worker: JSON {top_notes, middle_notes, base_notes, moods}
    Worker->>DB: UPDATE "Product" SET top_notes, middle_notes, base_notes, moods, status='ACTIVE'
    Worker->>Worker: Generate Product Embedding
    Worker->>SearchDB: Index Doc to Elasticsearch & Upsert Vector to Qdrant
```

---

## 3. A - ARCHITECTURE (Kiến trúc Hệ thống & Module Detail)

### 3.1. Sơ đồ Tổng quan Kiến trúc (Monorepo System Architecture)

```
+-----------------------------------------------------------------------------------+
|                                   WEB FRONTEND                                    |
|                             ReactJS + TypeScript (Vite)                           |
+-----------------------------------------------------------------------------------+
                                         | REST / SSE (HTTP/2)
                                         v
+-----------------------------------------------------------------------------------+
|                                NESTJS API GATEWAY                                 |
|  +----------------+  +-----------------+  +----------------+  +-----------------+  |
|  |   AuthModule   |  | ProductsModule  |  |  OrdersModule  |  | AiClientModule  |  |
|  +----------------+  +-----------------+  +----------------+  +-----------------+  |
|         |                     |                   |                    |          |
|    JWT / Passport       Prisma ORM          Redlock / Prisma      gRPC Client     |
+---------|---------------------|-------------------|--------------------|----------+
          |                     |                   |                    |
          |                     v                   v                    | gRPC
          |        +----------------------------------------+            | Protobuf
          +------->|         PostgreSQL Database            |<-----------+
                   +----------------------------------------+            |
                                                            |            |
                                                            v            v
+-----------------------------------------------------------------------------------+
|                                 PYTHON AI ENGINE                                  |
|  +-------------------------------------+  +------------------------------------+  |
|  |     gRPC Server (Servicer)          |  |       Celery Async Engine          |  |
|  | - StreamAIChat                      |  | - extract_product_metadata         |  |
|  | - SmartSearch (RRF Engine)          |  | - sync_postgres_to_vector_es       |  |
|  +-------------------------------------+  +------------------------------------+  |
+-----------------------------------------------------------------------------------+
          |                                   |                    |
          v                                   v                    v
+------------------+                +------------------+  +-------------------------+
|  Elasticsearch   |                |    Qdrant DB     |  |      Redis Broker       |
|  (BM25 Search)   |                |  (Vector DB)     |  | (Queue & Lock Storage)  |
+------------------+                +------------------+  +-------------------------+
```

---

### 3.2. NestJS API Gateway - Detailed Modules Design
* **`AuthModule`**: Đăng ký, Đăng nhập, Guard JWT, Refreshtoken, RBAC (`ADMIN`, `CUSTOMER`).
* **`ProductsModule`**:
  * Public APIs: Lấy danh sách sản phẩm (cache trên Redis), Xem chi tiết sản phẩm.
  * Admin APIs: Tạo/Sửa/Xóa sản phẩm, Trigger Re-index metadata.
* **`OrdersModule`**:
  * Tích hợp `RedlockService` để tạo khóa phân tán theo `product_id`.
  * Thực thi DB Transaction qua Prisma `$transaction` với isolation level `Serializable` hoặc `SELECT FOR UPDATE`.
* **`AiClientModule`**:
  * Khởi tạo `GrpcClient` kết nối tới `ai-engine:50051`.
  * Expose Endpoint SSE Controller `/api/v1/ai/chat/stream` nhận `Observable<ChatChunk>` từ gRPC và pipe sang client format `MessageEvent`.
  * Proxy endpoint `/api/v1/ai/search` gọi gRPC `SmartSearch`.

---

### 3.3. Python AI Engine - Detailed Modules Design
* **`grpc_server/`**:
  * Thực thi `ScentedCandlesAIServiceServicer` được sinh ra từ `scented-candles.proto`.
  * `StreamAIChat`: Quản lý prompt context, gọi LLM Stream (OpenAI / LangChain), `yield ChatChunk`.
  * `SmartSearch`: Đọc query $\rightarrow$ Trích xuất embedding $\rightarrow$ Gọi song song ES & Qdrant $\rightarrow$ Tính RRF Rank $\rightarrow$ Trả về kết quả.
* **`search_engine/`**:
  * `es_client.py`: Quản lý query BM25 trên Elasticsearch.
  * `qdrant_client.py`: Quản lý tìm kiếm Similarity Vector trên Qdrant collection.
  * `rrf_fusion.py`: Thuật toán hợp nhất kết quả RRF.
* **`celery_engine/`**:
  * `tasks.py`: Celery Task `async_extract_metadata(product_id, description)` dùng Instructor / LangChain Structured Output để ép LLM trả về đúng Pydantic Schema.
* **`embedding_service/`**:
  * Sinh vector embedding bằng model `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions) hoặc `text-embedding-3-small` (1536 dimensions).

---

### 3.4. Bộ API Contracts Spec

#### A. RESTful Endpoints (NestJS API Gateway)
| HTTP Method | Path | Auth Required | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | No | Đăng ký tài khoản mới |
| `POST` | `/api/v1/auth/login` | No | Đăng nhập nhận JWT Token |
| `GET` | `/api/v1/products` | No | Lấy danh sách sản phẩm (có Pagination & Cache) |
| `GET` | `/api/v1/products/:id` | No | Xem chi tiết sản phẩm |
| `POST` | `/api/v1/products` | Yes (Admin) | Tạo sản phẩm mới (Kích hoạt Celery Worker) |
| `POST` | `/api/v1/orders` | Yes (Customer) | Đặt hàng (Khóa Redis & Trừ kho Atomic) |
| `GET` | `/api/v1/ai/search` | No | Smart Hybrid Search |
| `GET` | `/api/v1/ai/chat/stream` | No/Yes | Real-time SSE Chatbot Stream |

#### B. gRPC Spec (`scented-candles.proto`)
*(Đã được định nghĩa chuẩn xác tại `packages/scented-candles.proto`)*:
- Service: `scented_candles.ai.v1.ScentedCandlesAIService`
- Methods:
  1. `rpc StreamAIChat (ChatRequest) returns (stream ChatChunk);`
  2. `rpc SmartSearch (SearchQuery) returns (SearchResponse);`
  3. `rpc ExtractCandleMetadata (ExtractRequest) returns (ExtractResponse);`

---

### 3.5. Caching Strategy & Circuit Breaker / Retry Policy
* **Caching Strategy (Redis):**
  * **Product Detail Cache:** `product:detail:{id}` (TTL: 1 hour, Invalidate khi Admin Update).
  * **Hot Search Cache:** `search:cache:{md5(query)}` (TTL: 15 mins).
  * **Distributed Lock Key:** `lock:product:{productId}` (TTL: 3 seconds).
* **Retry Policy & Circuit Breaker (NestJS API Gateway $\rightarrow$ Python AI Engine):**
  * Tích hợp **Resilience4j / Cockatiel / RxJS retryWhen** cho gRPC client.
  * Retry tối đa 3 lần với **Exponential Backoff** ($100ms, 200ms, 400ms$).
  * **Circuit Breaker:** Khi tỉ lệ lỗi gRPC $> 50\%$ trong 10 giây $\rightarrow$ Open Circuit $\rightarrow$ Chuyển luồng Search sang PostgreSQL ILIKE / Full-text Search fallback; Chatbot trả về phản hồi tĩnh tạm thời.

---

## 4. D - DATA (Mô hình Dữ liệu & Storage)

### 4.1. PostgreSQL Database Schema (Prisma Data Model)

```prisma
// packages/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum ProductStatus {
  DRAFT
  PROCESSING
  ACTIVE
  INACTIVE
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  fullName     String
  role         Role     @default(CUSTOMER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  orders       Order[]

  @@map("users")
}

model Category {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  products    Product[]

  @@map("categories")
}

model Product {
  id             String        @id @default(uuid())
  categoryId     String
  category       Category      @relation(fields: [categoryId], references: [id])
  name           String
  slug           String        @unique
  price          Decimal       @db.Decimal(12, 2)
  stock          Int           @default(0)
  rawDescription String        @db.Text
  imageUrl       String?
  topNotes       String[]      @default([])
  middleNotes    String[]      @default([])
  baseNotes      String[]      @default([])
  moods          String[]      @default([])
  status         ProductStatus @default(DRAFT)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  orderItems     OrderItem[]

  @@index([categoryId])
  @@index([status])
  @@map("products")
}

model Order {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  totalAmount     Decimal     @db.Decimal(12, 2)
  status          OrderStatus @default(PENDING)
  shippingAddress String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  items           OrderItem[]

  @@index([userId])
  @@map("orders")
}

model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  unitPrice Decimal  @db.Decimal(12, 2)

  @@map("order_items")
}
```

---

### 4.2. Elasticsearch Index Schema Mapping (`scented_candles_products`)

```json
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer": {
        "vn_ngram_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "ngram_filter"]
        }
      },
      "filter": {
        "ngram_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": {
        "type": "text",
        "analyzer": "vn_ngram_analyzer",
        "search_analyzer": "standard"
      },
      "raw_description": { "type": "text" },
      "price": { "type": "double" },
      "stock": { "type": "integer" },
      "top_notes": { "type": "keyword" },
      "middle_notes": { "type": "keyword" },
      "base_notes": { "type": "keyword" },
      "moods": { "type": "keyword" },
      "is_active": { "type": "boolean" },
      "created_at": { "type": "date" }
    }
  }
}
```

---

### 4.3. Qdrant Vector Collection & Payload Schema

* **Collection Name:** `scented_candles_collection`
* **Vector Configuration:**
  * `size`: 384 (nếu dùng `sentence-transformers/all-MiniLM-L6-v2`) hoặc 1536 (`openai/text-embedding-3-small`).
  * `distance`: `Cosine`
* **Payload Attribute Structure:**

```json
{
  "product_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "name": "Nến Thơm Đà Lạt Pine & Amber",
  "price": 350000.0,
  "category_id": "cat-001",
  "top_notes": ["Thông Đà Lạt", "Vỏ Chanh"],
  "middle_notes": ["Gỗ Thông", "Hổ Phách"],
  "base_notes": ["Rêu Phong", "Cỏ Hương Bài"],
  "moods": ["Ấm Cúng", "Thư Giãn", "Phòng Đọc Sách"],
  "is_active": true
}
```

---

### 4.4. Chiến lược Đồng bộ Dữ liệu (Data Sync Strategy)

Sử dụng **Transactional Outbox Pattern / Event-Driven Sync** qua Celery Queue:
1. Khi Product thay đổi trạng thái sang `ACTIVE` trên PostgreSQL $\rightarrow$ Phát sinh Event/Task `sync_product_to_search_engine(product_id)`.
2. Celery Worker đọc thông tin đầy đủ của Product từ PostgreSQL.
3. Ghép chuỗi văn bản đại diện ngữ nghĩa:
   `text = f"{name}. Tầng hương đầu: {top_notes}. Tầng hương giữa: {middle_notes}. Tầng hương cuối: {base_notes}. Cảm xúc: {moods}. Mô tả: {raw_description}"`
4. Gọi Embedding Model để tạo vector từ `text`.
5. Đẩy Document sang Elasticsearch (`index`) và Qdrant (`upsert point`).
6. Đảm bảo tính nhất quán (Eventual Consistency) $< 2$ giây.

---

## 5. 🚀 ACTIONABLE TECHNICAL ROADMAP (Phát triển 4 Phase)

Dưới đây là Roadmap chi tiết các việc cần làm để khởi tạo và hoàn thiện dự án theo thứ tự chuẩn kỹ thuật.

### 📍 PHASE 1: Monorepo Foundation & Infrastructure Setup
> **Mục tiêu:** Dựng xong khung Monorepo, môi trường Docker Container và Protobuf RPC Spec.

- [ ] **Task 1.1:** Khởi tạo Monorepo cấu trúc chuẩn (`/app/web-fe`, `/app/api-gateway`, `/app/ai-engine`, `/packages/proto`).
- [ ] **Task 1.2:** Cấu hình `docker-compose.yml` chạy đủ các dịch vụ hạ tầng: PostgreSQL, Redis, Qdrant, Elasticsearch.
- [ ] **Task 1.3:** Đăng ký file Protobuf `packages/scented-candles.proto` cho 3 gRPC method (`StreamAIChat`, `SmartSearch`, `ExtractCandleMetadata`).
- [ ] **Task 1.4:** Thiết lập scripts tự động compile Protobuf thành TypeScript code (cho NestJS) và Python code (cho AI Engine).
- [ ] **Task 1.5:** Khởi tạo Prisma Schema trong NestJS API Gateway & thực thi DB Migration đầu tiên trên PostgreSQL.

---

### 📍 PHASE 2: Core E-Commerce & Anti-Overselling Inventory
> **Mục tiêu:** Hoàn thiện toàn bộ logic E-commerce cốt lõi, Authentication và luồng Đặt hàng chống over-selling bằng Redis Distributed Lock.

- [ ] **Task 2.1:** Triển khai `AuthModule` (JWT Đăng ký, Đăng nhập, Guard phân quyền Admin/Customer).
- [ ] **Task 2.2:** Triển khai `ProductsModule` (CRUD Sản phẩm, Quản lý danh mục, Caching danh sách/chi tiết trên Redis).
- [ ] **Task 2.3:** Dựng `RedlockModule` trong NestJS sử dụng `ioredis` / `redlock` để tạo Distributed Lock.
- [ ] **Task 2.4:** Triển khai `OrdersModule` với DB Transaction (`SELECT FOR UPDATE`) + Redis Lock đảm bảo kho hàng không bao giờ bị âm dưới tải lớn.
- [ ] **Task 2.5:** Viết kịch bản Unit Test & Stress Test (k6 / Artillery) giả lập 500 requests đặt hàng cùng 1 sản phẩm còn stock = 10 để kiểm tra chống over-selling.

---

### 📍 PHASE 3: AI Engine, Hybrid Search & Async Pipeline
> **Mục tiêu:** Xây dựng Python AI Engine, gRPC Server, Celery Worker bóc tách metadata và thuật toán RRF Smart Search.

- [ ] **Task 3.1:** Dựng Python gRPC Server thực thi `ScentedCandlesAIService` theo file proto.
- [ ] **Task 3.2:** Khởi tạo Elasticsearch Index Mapping (`vn_ngram_analyzer`) và Qdrant Collection (`Cosine`).
- [ ] **Task 3.3:** Viết Module `SmartSearch` trong AI Engine: Gọi song song ES BM25 + Qdrant Vector và hợp nhất điểm số bằng thuật toán **Reciprocal Rank Fusion (RRF)**.
- [ ] **Task 3.4:** Cấu hình Celery Worker với Redis Broker để xử lý task bất đồng bộ `async_extract_metadata`.
- [ ] **Task 3.5:** Tích hợp LLM API (OpenAI / Local LLM) trong Celery Worker để tự động bóc tách `top_notes`, `middle_notes`, `base_notes`, `moods` khi Admin tạo sản phẩm và tự động đồng bộ sang ES/Qdrant.

---

### 📍 PHASE 4: Integration, Real-time Chatbot (SSE) & Web Frontend UI
> **Mục tiêu:** Hoàn thiện gRPC Server Streaming, SSE trên NestJS Gateway, dựng giao diện ReactJS chuyên nghiệp và kết nối toàn bộ hệ thống.

- [ ] **Task 4.1:** Triển khai gRPC Server Streaming method `StreamAIChat` trong Python AI Engine tích hợp LLM Streaming.
- [ ] **Task 4.2:** Dựng SSE Endpoint `/api/v1/ai/chat/stream` ở NestJS `AiClientModule` nhận stream từ gRPC và chuyển tiếp xuống Client qua Server-Sent Events.
- [ ] **Task 4.3:** Phát triển Web Frontend (ReactJS + TS + Vite):
  - Dựng UI Catalog sản phẩm, Giỏ hàng & Checkout flow.
  - Dựng UI Tìm kiếm Smart Hybrid Search với bộ lọc tầng hương/tâm trạng.
  - Dựng UI Widget Chatbot Tư Vấn Mùi Hương Real-time với hiệu ứng gõ chữ (typing effect) từ luồng SSE.
- [ ] **Task 4.4:** Cấu hình Circuit Breaker cho gRPC Client trên NestJS (Fallback sang DB Search khi AI Engine xuống).
- [ ] **Task 4.5:** End-to-End Testing toàn bộ luồng: Admin thêm nến $\rightarrow$ Celery bóc tách tầng hương $\rightarrow$ Hybrid Search tìm đúng cảm xúc $\rightarrow$ Chatbot tư vấn SSE $\rightarrow$ Checkout trừ kho bằng Redis Lock.

---

> **📌 HƯỚNG DẪN BẮT ĐẦU CODE NGAY:**
> 1. Mở terminal tại thư mục gốc dự án: `docker compose up -d postgres redis qdrant elasticsearch`
> 2. Chạy Migration database: `cd app/api-gateway && npx prisma migrate dev`
> 3. Tiến hành thực thi lần lượt các Task trong **PHASE 1** đến **PHASE 4**.
