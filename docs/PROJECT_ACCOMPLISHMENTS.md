# BÁO CÁO CHI TIẾT DỰ ÁN AURASCENT (SCENTED CANDLES)

> **Tác giả / Người thực hiện**: Business Analyst & Development Team  
> **Dự án**: AuraScent — E-Commerce Nến Thơm Cao Cấp Tích Hợp AI Real-time  
> **Mục đích tài liệu**: Tổng hợp toàn bộ công việc, kiến trúc, tính năng kỹ thuật và thành tựu đã thực hiện trong codebase phục vụ mục đích báo cáo, cập nhật CV và chuẩn bị phỏng vấn.

---

## 📌 1. TỔNG QUAN HỆ THỐNG

**AuraScent** là nền tảng thương mại điện tử chuyên biệt cho sản phẩm nến thơm cao cấp, giải quyết rào cản chọn lựa mùi hương online thông qua giải pháp **AI Scent Consultant (RAG)** real-time và hệ thống **Vector Semantic Search**.

Hệ thống được thiết kế theo mô hình **Monorepo Microservices**, phân tách rõ ràng giữa:
- **API Gateway (NestJS)**: Đảm nhận các nghiệp vụ E-Commerce cốt lõi, Authentication, Authorization, Checkout, Cart, Payment Webhook và Caching.
- **AI Engine (Python FastAPI & Celery)**: Đảm nhận nhiệm vụ Vector Search (Qdrant), RAG Chatbot Streaming (Gemini LLM) và Async ETL Sync Pipeline (Celery).
- **Web Frontend (React 19 + Vite)**: Giao diện Storefront cho người mua hàng và Admin Dashboard quản trị toàn diện.

---

## 🏗️ 2. KIẾN TRÚC & TECH STACK THỰC TẾ

```text
               ┌───────────────────────────────────────────┐
               │    Web Frontend (React 19 + Vite + TS)    │
               │        Storefront & Admin Dashboard       │
               └─────────────────────┬─────────────────────┘
                                     │ REST / SSE Stream
                                     ▼
               ┌───────────────────────────────────────────┐
               │         NestJS API Gateway (Node.js)       │
               │   Auth, Products, Orders, Cart, Sepay     │
               └──────────────┬────────────────────────────┘
                              │ REST / HTTP Fetch
                              ▼
               ┌───────────────────────────────────────────┐
               │          Python AI Engine & Worker        │
               │   FastAPI SSE Stream / Celery Worker      │
               └──────┬─────────────────┬──────────────────┘
                      │                 │
         ┌────────────┴───┐        ┌────┴──────────────┐
         ▼                ▼        ▼                   ▼
    PostgreSQL          Redis   Qdrant            Gemini API
(Core DB & Index)  (Cache & Lock) (Vector DB)     (Embedding & LLM)
```

### Chi tiết Stack Công nghệ:

| Thành phần | Công nghệ / Thư viện chính |
|---|---|
| **API Gateway** | NestJS v10, TypeScript, TypeORM, PostgreSQL 16, Redis 7 (`ioredis`, `@nestjs-modules/ioredis`), Passport JWT, `@nestjs/throttler` (Rate Limit). |
| **AI Engine** | Python 3.11, FastAPI, Uvicorn, Celery, SQLAlchemy, `qdrant-client`, `google-genai` SDK (`gemini-flash-lite-latest`, `gemini-embedding-001`). |
| **Databases** | PostgreSQL 16 (Relational Data & B-Tree Indexes), Redis 7 (Caching, Cart Storage & Redlock), Qdrant Vector DB (768-dim, Cosine Distance). |
| **Frontend** | React 19, Vite, TypeScript, Ant Design, TailwindCSS. |
| **DevOps & Infra** | Docker & Docker Compose, Render Blueprint (`render.yaml`). |

---

## 🛠️ 3. CHI TIẾT CÁC MODULE & TÍNH NĂNG ĐÃ THỰC HIỆN

### 🔑 3.1. Module Authentication & Authorization (RBAC)
- **JWT Authentication**: Đăng ký, Đăng nhập cấp phát Access Token (JWT) và Refresh Token lưu trữ quản lý trong database.
- **Phân quyền RBAC (Role-Based Access Control)**:
  - Hệ thống 4 bảng quan trọng: `roles`, `permissions`, `user_roles`, `role_permissions`.
  - Phân chia vai trò Admin / Customer, bảo vệ các route nhạy cảm với `JwtAuthGuard` và custom decorators.

---

### 📦 3.2. Module Products & Caching Engine
- **Quản lý Sản phẩm Core**:
  - Quản lý đầy đủ thông tin: SKU, Name, Slug (tự động chuẩn hóa unicode slugify chống trùng), Short/Raw Description, Price, Compare Price, Weight, Burn Time, Status (`DRAFT`, `ACTIVE`, `INACTIVE`), `is_featured`, Soft Delete (`deleted_at`).
  - Upload & quản lý thứ tự ảnh sản phẩm (`product_images` với `is_primary` và `sort_order`).
- **Redis Caching Strategy**:
  - Cache danh sách sản phẩm theo trang và bộ lọc: `products:list:page=X:limit=Y:cat=Z...` với TTL 300 giây.
  - Cache chi tiết sản phẩm: `products:detail:{id}` với TTL 300 giây.
  - Tự động xóa sạch cache sản phẩm (`clearProductsCache`) ngay khi Admin thực hiện Thêm / Sửa / Xóa sản phẩm.
- **Tự động kích hoạt AI Sync**:
  - Khi có thao tác Create/Update/Soft-Delete sản phẩm, API Gateway tự động phát HTTP request sang AI Engine (`/tasks/sync-product`) để đưa task vào Celery Queue.

---

### 📊 3.3. Module Inventory & Anti-Overselling Checkout
- **Quản lý Tồn kho chi tiết**:
  - Lưu trữ `quantity_on_hand` (tồn thực tế) và `quantity_reserved` (tồn đang giữ cho đơn hàng chờ).
  - Tự động tính toán tồn kho khả dụng: $\text{availableStock} = \max(0, \text{quantity_on_hand} - \text{quantity_reserved})$.
- **Cơ chế Chống Over-Selling**:
  - Áp dụng **PostgreSQL Transaction** kết hợp khóa dòng `SELECT FOR UPDATE` trên bảng `inventory` khi đặt hàng.
  - Đảm bảo khi nhiều request checkout đồng thời (Flash Sale), các giao dịch sẽ được xếp hàng xử lý nguyên tử (Atomic), ngăn chặn hoàn toàn việc tồn kho âm.

---

### 🛒 3.4. Module Cart & Redis Cart Merging
- **Guest Cart**: Cho phép người dùng chưa đăng nhập thêm sản phẩm vào giỏ hàng, lưu tạm trên Redis với sessionId.
- **Redis Cart Merging**:
  - Khi người dùng thực hiện Đăng nhập (Login), hệ thống tự động quét các item trong Guest Cart trên Redis.
  - Hợp nhất (Merge) số lượng tương ứng vào Giỏ hàng chính thức trong Database của người dùng và xóa giỏ hàng tạm.

---

### 💳 3.5. Module Thanh Toán Tự Động VietQR & Sepay Webhook
- **VietQR Payment**: Sinh mã QR chuẩn VietQR chứa đúng số tài khoản, mã đơn hàng và số tiền cần thanh toán.
- **Sepay Webhook Integration**:
  - Xây dựng endpoint tiếp nhận Webhook callback real-time từ cổng Sepay khi có biến động dư nợ ngân hàng.
  - Tự động bóc tách mã đơn hàng từ nội dung chuyển khoản, kiểm tra khớp số tiền và cập nhật `payment_status = PAID` cho đơn hàng tức thì.

---

### 🤖 3.6. AI Scent Advisory Chatbot & RAG Engine
- **Vector Search Engine (Qdrant)**:
  - Khởi tạo Qdrant Collection `aurascent_products` cấu hình Cosine Distance và Vector Size 768.
  - Chuyển đổi truy vấn của người dùng thành Vector qua mô hình nhúng `gemini-embedding-001` và thực hiện Cosine Similarity Search để lấy TOP 5 sản phẩm phù hợp nhất.
- **Retrieval-Augmented Generation (RAG)**:
  - Ghép nối dữ liệu ngữ cảnh (Tên sản phẩm, SKU, Danh mục, Giá, Tồn kho khả dụng, Thời gian đốt, Chính sách) vào Prompt template.
  - Ép quy tắc Prompt: Trả lời ngắn gọn, plain text, đi thẳng vào vấn đề, **không lặp lại câu chào mừng** ở mỗi lượt chat.
- **Real-time SSE Streaming**:
  - Đóng gói dữ liệu trả về dưới dạng **Server-Sent Events (SSE)** (`text/event-stream`) giúp Frontend hiển thị câu trả lời từng chữ (typing effect) mượt mà.
- **Reliability & Fallback Strategy**:
  - Tự động retry với danh sách model fallback (`gemini-flash-lite-latest` -> `gemini-flash-latest`).
  - Thiết lập `GEMINI_STREAM_TIMEOUT` (12 giây per model) để tránh treo connection khi API quá tải.

---

### 🔄 3.7. Async Data Sync Pipeline (Celery Worker)
- **Celery Worker Architecture**:
  - Chạy tiến trình Celery bất đồng bộ độc lập với Redis Broker.
  - Task `sync_product_to_qdrant_task(product_id, action)`:
    1. Kết nối PostgreSQL đọc thông tin sản phẩm và tồn kho khả dụng mới nhất.
    2. Ghép chuỗi văn bản ngữ nghĩa chứa đầy đủ thông số kỹ thuật sản phẩm.
    3. Gọi API Gemini để tạo Vector Embedding (768 chiều).
    4. Upsert/Delete Point trực tiếp trên Qdrant Vector DB.

---

### ⚡ 3.8. Database Indexing & Performance Tuning
Để tối ưu hóa tốc độ truy vấn PostgreSQL khi dữ liệu đơn hàng và sản phẩm tăng cao, dự án đã triển khai Migration [`1735700000000-AddCoreIndexes.ts`](file:///Users/minhquy54/Documents/Workspace-MinhQuy/Project/ScentedCandles/app/api-gateway/src/db/migrations/1735700000000-AddCoreIndexes.ts) tạo 9 B-Tree Indexes:
1. `idx_orders_user_id`: Tối ưu tìm kiếm đơn hàng theo người dùng.
2. `idx_orders_status`: Tối ưu lọc đơn hàng theo trạng thái.
3. `idx_orders_payment_status`: Tối ưu đối soát thanh toán.
4. `idx_orders_created_at` (DESC): Tối ưu sắp xếp lịch sử đơn hàng mới nhất.
5. `idx_order_items_order_id`: Tối ưu join chi tiết đơn hàng.
6. `idx_order_items_product_id`: Tối ưu truy vấn sản phẩm trong đơn hàng.
7. `idx_inventory_product_id`: Tối ưu kiểm tra tồn kho theo sản phẩm.
8. `idx_products_status`: Tối ưu lọc sản phẩm đang ACTIVE trên Storefront.
9. `idx_products_category_id`: Tối ưu lọc sản phẩm theo danh mục.

---

### 🛡️ 3.9. System Security, Resilience & Cloud Deployment
- **API Rate Limiting**: Tích hợp `@nestjs/throttler` giới hạn 100 requests / 60 giây per IP chống Brute-force & DDoS.
- **CORS Protection**: Middleware giới hạn domain truy cập API theo danh sách `CORS_ALLOWED_ORIGINS` và `FRONTEND_URL`.
- **Heartbeat Keep-Alive Service**:
  - Triển khai `setInterval` trong `AiService` (NestJS) tự động ping tới endpoint `/health` của AI Chatbot Service mỗi 10 phút.
  - Khắc phục triệt để hiện tượng Container tự động ngắt/ngủ (Cold-start latency) trên hạ tầng Render Free Tier.
- **Memory Optimization for Cloud**: Tinh chỉnh Celery worker chạy `concurrency=1` và đóng gói combo container phù hợp với hạn mức RAM 512MB của Render Free Plan.

---

## 📝 4. NỘI DUNG CHUẨN BỊ CHO CV & PHỎNG VẤN

### 📄 Mẫu Bullet Points Viết Vào CV (Resume Points)

#### 🇻🇳 Tiếng Việt:
- **Phát triển Nền tảng E-Commerce AuraScent** với kiến trúc Microservices Monorepo (NestJS API Gateway + Python AI Engine + React 19 Frontend).
- **Thiết kế Hệ thống AI Advisory & Vector Search**: Tích hợp Qdrant Vector DB và Gemini Embedding (`gemini-embedding-001`) cho phép tìm kiếm sản phẩm theo ngữ nghĩa; xây dựng luồng tư vấn real-time qua SSE Stream với cơ chế Timeout Retry & Model Fallback.
- **Tối ưu hóa Hiệu năng Database & Caching**: Thiết kế 9 B-Tree Database Indexes trên PostgreSQL via TypeORM Migrations, kết hợp Redis Cache (`TTL 300s`) giảm tải truy vấn cho các API danh mục sản phẩm.
- **Đảm bảo Tính nhất quán Tồn kho (Anti-Overselling)**: Áp dụng PostgreSQL `SELECT FOR UPDATE` row locks khi Checkout; xây dựng cơ chế Redis Cart Merging tự động gộp giỏ hàng Guest & User khi login.
- **Tự động hóa Async ETL Pipeline & Thanh Toán**: Xây dựng Celery Worker bất đồng bộ tự động sync dữ liệu PostgreSQL sang Qdrant Vector DB; tích hợp Sepay Webhook & VietQR tự động khớp lệnh thanh toán.
- **Tăng cường Reliability & Cloud Optimization**: Triển khai Rate Limiting (Throttler), CORS protection và thiết kế dịch vụ Heartbeat Keep-Alive tự động loại bỏ Cold-start trên Render Cloud.

#### 🇬🇧 Tiếng Anh:
- **Architected AuraScent E-Commerce Platform** featuring a Monorepo Microservices architecture using NestJS API Gateway, Python AI Engine, and React 19 UI.
- **Engineered RAG AI Consultant & Vector Search**: Built semantic candle discovery via Qdrant Vector Database and Gemini Embeddings (`gemini-embedding-001`), streaming real-time advisory responses via FastAPI SSE with automated model fallback and stream timeout retries.
- **Optimized Database & Redis Caching**: Implemented 9 targeted B-Tree PostgreSQL indexes via TypeORM migrations across high-traffic tables (`orders`, `inventory`, `products`) and built a Redis caching layer for product endpoints.
- **Ensured Inventory Integrity & Smart Cart**: Prevented overselling using PostgreSQL `SELECT FOR UPDATE` row locks during checkout, and developed Redis Cart Merging to sync guest session carts upon user authentication.
- **Built Async Pipelines & Automated Payments**: Designed Celery background workers to asynchronously sync PostgreSQL product changes into Qdrant Vector DB, and integrated Sepay payment webhooks with VietQR for instant payment verification.
- **Cloud Optimization & Resilience**: Enforced API Rate Limiting (NestJS Throttler), CORS protection, and a self-pinging Heartbeat Keep-Alive service to eliminate container cold-starts on Render Cloud.

---

### 💬 4 Câu Hỏi Phỏng Vấn Chuyên Sâu & Cách Trả Lời Gợi Ý

#### ❓ Q1: Bạn thiết kế luồng RAG Chatbot real-time trong dự án này như thế nào?
> **Trả lời**:  
> "Hệ thống AI Chatbot gồm 3 bước chính:  
> 1. Khi user gửi câu hỏi, AI Engine nhận request và gọi API `gemini-embedding-001` để biến câu hỏi thành Vector 768 chiều.  
> 2. Vector này được dùng để query TOP 5 sản phẩm có độ tương đồng Cosine cao nhất từ Qdrant Vector DB.  
> 3. Kết quả (Tên, Giá, Tồn kho khả dụng, Mô tả) được inject vào Prompt template của Gemini LLM (`gemini-flash-lite-latest`) và stream kết quả về cho Frontend theo dạng Server-Sent Events (SSE). Ngoài ra, tôi cài đặt timeout 12s per model để tự động retry fallback model nếu Google API phản hồi chậm."

#### ❓ Q2: Làm sao bạn giải quyết bài toán Over-selling khi có nhiều người cùng mua nến thơm khi Flash Sale?
> **Trả lời**:  
> "Tôi kết hợp 2 lớp bảo vệ:  
> Ở tầng Database, khi user tạo đơn hàng, hệ thống thực hiện một Atomic Transaction và sử dụng câu lệnh PostgreSQL `SELECT FOR UPDATE` trên dòng tồn kho tương ứng của bảng `inventory`. Việc này sẽ khóa (lock) dòng đó cho đến khi transaction hoàn tất việc trừ tồn kho (`quantity_reserved` / `quantity_on_hand`), ngăn chặn tuyệt đối tình trạng Race Condition dẫn đến tồn kho bị âm."

#### ❓ Q3: Redis Cart Merging hoạt động ra sao khi người dùng chuyển từ khách vô danh (Guest) sang đăng nhập?
> **Trả lời**:  
> "Khi người dùng chưa login, giỏ hàng được lưu tạm trên Redis bằng `sessionId`. Ngay khi người dùng Authenticate thành công (nhận JWT), NestJS API Gateway sẽ kích hoạt hàm merge cart: Lấy danh sách item từ Redis key của session đó, đối soát với giỏ hàng DB của User, cộng dồn số lượng nếu sản phẩm đã tồn tại, và xóa bớt key tạm trên Redis."

#### ❓ Q4: Dịch vụ Heartbeat Keep-Alive giải quyết vấn đề gì trên môi trường Cloud (Render Free Tier)?
> **Trả lời**:  
> "Các nền tảng Cloud miễn phí như Render sẽ tự động chuyển container sang trạng thái ngủ (Sleep/Idle) sau 15 phút không có traffic, khiến request đầu tiên của user bị trễ từ 30-50 giây (Cold Start). Tôi đã thiết kế một Background Cron Job trong NestJS Gateway tự động gửi HTTP HEAD/GET request nhẹ tới endpoint `/health` của AI Engine mỗi 10 phút để giữ cho container luôn ở trạng thái 'ấm' (Warm state)."

---
*Tài liệu được trích xuất và xác minh trực tiếp từ codebase dự án AuraScent.*
