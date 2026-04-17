# 🚀 Microservices E-Commerce Backend

![Node.js](https://img.shields.io/badge/Node.js-22-green)
![Kafka](https://img.shields.io/badge/Kafka-Event--Driven-black)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-orange)
![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen)

---

## 📌 Overview

This project is a **production-grade microservices architecture** built using:

* Node.js + Express
* Kafka (event-driven architecture)
* MySQL (Sequelize ORM)
* API Gateway pattern

It demonstrates:

* Scalable backend design
* Fault-tolerant systems
* Event-driven communication
* Production-ready resilience patterns

---

## 🏗️ Architecture

```
Client
   ↓
API Gateway
   ↓
-------------------------------
| Auth Service  → User Service |
-------------------------------
           ↓
      Order Service
           ↓
        Kafka
           ↓
     Payment Service
           ↓
        Kafka
           ↓
   Notification Service
           ↓
         Email
           ↓
     Order Service (status update)
```

---

## 🧩 Services

### 🔐 API Gateway

* Single entry point
* Handles:

  * Routing
  * JWT Authentication
  * RBAC Authorization
  * Rate limiting
  * Reverse proxy
* Client **never calls services directly**

---

### 🔑 Auth Service

* Register / Login
* JWT token generation
* Password hashing (bcrypt)
* Sync call to User Service

---

### 👤 User Service

* Manages user profile
* Separate database
* Internal service authentication (`x-user-id`)

---

### 📦 Order Service

* Creates order (`PENDING`)
* Produces Kafka event: `order-created`
* Consumes:

  * `payment-success` → `SUCCESS`
  * `payment-failed` → `FAILED`
  * `payment-dlq` → `FAILED`

---

### 💳 Payment Service

* Consumes `order-created`
* Processes payment
* Produces:

  * `payment-success`
  * `payment-retry`
  * `payment-dlq`
* Handles:

  * Retry logic
  * Backpressure
  * Batch processing

---

### 📧 Notification Service

* Consumes `payment-success`
* Sends email (Gmail SMTP)
* Implements:

  * Retry topics (5s, 30s, 2m)
  * DLQ
  * Idempotency

---

## 🔄 Communication Patterns

### ✅ Synchronous (REST)

```
Auth Service → User Service
```

* Axios calls
* Retry (exponential backoff)
* Circuit breaker (opossum)
* Fail-safe fallback

---

### ✅ Asynchronous (Kafka)

```
Order → Payment → Notification → Order
```

* Loose coupling
* High scalability
* Event-driven design

---

## 🔐 Security

* JWT Authentication
* Role-Based Access Control (RBAC)
* Helmet (secure headers)
* CORS protection
* Rate limiting
* Internal service headers

---

## ⚙️ Resilience & Fault Tolerance

### 🔁 Retry Strategy

* Exponential backoff
* Retry topics:

  * `retry-5s`
  * `retry-30s`
  * `retry-2m`

### ☠️ Dead Letter Queue (DLQ)

* After 3 failed retries
* Topics:

  * `payment-dlq`
  * `notification-dlq`

### ⚡ Circuit Breaker

* Prevent cascading failures
* Auto recovery

### 🧠 Idempotency

* Prevent duplicate processing
* Safe retries

---

## 📊 Kafka Topics

```
order-created
payment-success
payment-failed
payment-retry
payment-dlq
notification-retry-5s
notification-retry-30s
notification-retry-2m
notification-dlq
```

---

## 🚀 Backpressure Handling

* In-memory queue
* Consumer pause/resume
* Batch processing
* Controlled throughput

---

## 📦 Database Design

Each service has its own DB:

* `auth_db`
* `user_db`
* `order_db`

### Order Table

```
id (PK)
order_id (UUID)
user_id
amount
status (PENDING, SUCCESS, FAILED)
createdAt
updatedAt
```

---

## 🔄 Order Lifecycle

```
1. Order Created → PENDING
2. Payment Success → SUCCESS
3. Payment Failed → FAILED
4. Retry exhausted → FAILED (DLQ)
```

---

## 🧪 Testing APIs

### API Gateway

```
POST /auth/register
POST /auth/login
POST /orders
GET /users/:id
```

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MySQL (Sequelize)
* Kafka (KafkaJS)
* Winston (logging)
* Zod (validation)
* Docker (ready)

---

## 📜 Logging

* Centralized logging
* JSON logs (ELK / Loki ready)
* Service-based tagging

---

## 🧯 Graceful Shutdown

* Handles:

  * SIGINT / SIGTERM
  * Active requests
  * DB connections
  * Kafka consumers

---

## 🌐 Production Features

✔ API Gateway
✔ JWT + RBAC
✔ Retry + Circuit Breaker
✔ Kafka Event Streaming
✔ Retry Topics + DLQ
✔ Backpressure Handling
✔ Batch Processing
✔ Idempotency
✔ Graceful Shutdown
✔ Centralized Logging

---

## 🚀 Future Enhancements

* Redis caching (user/email)
* Kubernetes (EKS deployment)
* Prometheus + Grafana monitoring
* Saga pattern (distributed transactions)
* Audit logs

---

## 🧠 Key Learning

> Built a fully decoupled microservices system using API Gateway and Kafka, ensuring scalability, fault tolerance, and production-grade reliability.

---

## 👨‍💻 Author

**Satish Pawar**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
