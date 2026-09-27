# AuraScent

**Nền tảng E-Commerce Nến Thơm Tích Hợp AI Tư Vấn Mùi Hương Real-time & Vector Semantic Search**

[![NestJS](https://img.shields.io/badge/API_Gateway-NestJS_10-E0234E?logo=nestjs)](https://nestjs.com/)
[![Python](https://img.shields.io/badge/AI_Engine-Python_3.11-3776AB?logo=python)](https://python.org/)
[![React](https://img.shields.io/badge/Frontend-React_19_|_Vite-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Cache_&_Lock-Redis_7-DC382D?logo=redis)](https://redis.io/)
[![Qdrant](https://img.shields.io/badge/Vector_DB-Qdrant-D01562?logo=qdrant)](https://qdrant.tech/)

---

## Tổng quan dự án

**AuraScent** giải quyết rào cản chọn lựa mùi hương khi mua nến thơm trực tuyến. Hệ thống kết hợp AI Chatbot tư vấn cảm xúc theo ngữ cảnh real-time, Vector Semantic Search (Qdrant DB + Gemini Embeddings), cơ chế chống over-selling khi flash sale, và tích hợp thanh toán tự động qua VietQR / Sepay.

---

## Tính năng thực tế triển khai

| Nhóm tính năng | Chi tiết kỹ thuật thực tế |
|---|---|
| **AI Scent Consultant (RAG)** | Chatbot tư vấn mùi hương real-time qua SSE stream (FastAPI), truy vấn ngữ cảnh RAG từ Qdrant Vector DB, tích hợp Gemini LLM với fallback model & timeout retry, quản lý prompt tránh lặp hội thoại. |
| **Vector Semantic Search** | Tìm kiếm sản phẩm theo ngữ nghĩa bằng Qdrant Vector Database kết hợp mô hình nhúng `gemini-embedding-001` (768 dimensions). |
| **E-Commerce & Smart Cart** | Đăng ký/đăng nhập JWT & RBAC, quản lý giỏ hàng với **Redis Cart Merging** (tự động hợp nhất giỏ hàng Guest & User khi login). |
| **Anti-Overselling Checkout** | Kết hợp Redis Distributed Lock (Redlock) và PostgreSQL `SELECT FOR UPDATE` đảm bảo không over-selling dưới tải cao. |
| **Payment Integration** | Tự động hóa thanh toán mã **VietQR** và Webhook khớp lệnh giao dịch real-time qua **Sepay**. |
| **Async Data Pipeline** | Celery Worker tự động trích xuất thông tin chi tiết (Notes, Moods, Inventory) từ PostgreSQL và đồng bộ sang Qdrant Vector DB khi Admin thay đổi sản phẩm. |
| **Performance & Resilience** | Redis cache cho danh sách & chi tiết sản phẩm, TypeORM Database Indexing tối ưu hóa truy vấn PostgreSQL, API Rate Limiting (Throttler), CORS protection & Keep-alive Heartbeat service. |
| **Admin Dashboard** | Giao diện quản trị toàn diện: Quản lý Sản phẩm, Tồn kho, Đơn hàng, Danh mục, Người dùng & Phân quyền. |

---

## Kiến trúc hệ thống

```text
               ┌───────────────────────────────────────────┐
               │    Web Frontend (React 19 + Vite + TS)    │
               └─────────────────────┬─────────────────────┘
                                     │ REST / SSE (HTTP)
                                     ▼
               ┌───────────────────────────────────────────┐
               │         NestJS API Gateway (Node.js)       │
               │   Auth, Products, Orders, Cart, Sepay     │
               └──────────────┬────────────────────────────┘
                              │ REST / HTTP
                              ▼
               ┌───────────────────────────────────────────┐
               │          Python AI Engine & Chatbot        │
               │   FastAPI SSE Stream / Celery Worker      │
               └──────┬─────────────────┬──────────────────┘
                      │                 │
         ┌────────────┴───┐        ┌────┴──────────────┐
         ▼                ▼        ▼                   ▼
    PostgreSQL          Redis   Qdrant            Gemini API
(Primary Data & Index) (Lock/Cache/Cart) (Vector Search)   (Embedding & LLM)
```

---

## Tech Stack Thực Tế

- **Frontend**: React 19, TypeScript, Vite, Ant Design, TailwindCSS.
- **Backend API Gateway**: NestJS, TypeORM, PostgreSQL 16, Redis 7 (ioredis, Redlock), Passport JWT, Throttler Rate Limiting.
- **AI Engine & Worker**: Python 3.11, FastAPI, Celery, Google Gemini API (`gemini-flash-lite-latest`, `gemini-embedding-001`), Qdrant Client.
- **Databases & Storage**: PostgreSQL (ACID & Core Indexing), Redis (Cache, Session, Cart & Lock), Qdrant (Vector Database).
- **Infrastructure & Deployment**: Docker & Docker Compose, Render Cloud Blueprint (`render.yaml`).

---

## Cấu trúc thư mục

```text
ScentedCandles/
├── app/
│   ├── api-gateway/       # NestJS API Gateway (Auth, Core E-Commerce, TypeORM, Sepay, Redis)
│   ├── ai-engine/          # Python AI Service (FastAPI Chatbot SSE, Celery Async Sync to Qdrant)
│   └── web-fe/             # React 19 + TypeScript Storefront & Admin Dashboard
├── packages/
│   └── proto/              # Protobuf definitions
├── docker-compose.yml      # Local container orchestration
└── render.yaml             # Render Cloud deployment blueprint
```

---

## Cài đặt & Chạy ứng dụng

### 1. Khởi chạy hạ tầng qua Docker Compose

```bash
# Clone repository
git clone https://github.com/MinhQuy54/ScentedCandles.git
cd ScentedCandles

# Tạo file .env từ .env.example
cp .env.example .env

# Chạy Postgres, Redis, Qdrant
docker compose up -d postgres redis qdrant
```

### 2. Chạy Services (Dev mode)

- **API Gateway (NestJS)**:
  ```bash
  cd app/api-gateway
  npm install
  npm run start:dev
  ```
- **AI Engine (Python)**:
  ```bash
  cd app/ai-engine
  pip install -r requirements.txt
  python -m src.chatbot.main
  ```
- **Web Frontend (React)**:
  ```bash
  cd app/web-fe
  npm install
  npm run dev
  ```

---

## Danh sách Endpoint chính

| Method | Endpoint | Access | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Đăng ký tài khoản |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập nhận JWT Token |
| `GET` | `/api/v1/products` | Public | Lấy danh sách sản phẩm (Redis Cached) |
| `POST` | `/api/v1/orders` | Customer | Đặt hàng & khởi tạo mã thanh toán VietQR |
| `POST` | `/api/v1/sepay/webhook` | Webhook | Xử lý callback thanh toán tự động từ Sepay |
| `GET` | `/api/v1/ai/chat/stream` | Public | Real-time AI Scent Advisory (SSE) |
| `GET` | `/api/v1/admin/*` | Admin | Quản lý hệ thống (Products, Inventory, Users, Roles) |

---

## License

Project thuộc quyền sở hữu riêng / thương mại.
