# AI-Based Smart Logistics System (Phase 1)

Spring Boot backend scaffold for express, warehouse (intercity), and customized delivery workflows.

## Implemented in Phase 1

- JWT authentication with role-based authorization (`ROLE_USER`, `ROLE_DRIVER`, `ROLE_ADMIN`)
- Modular architecture with `controller -> service -> repository`
- Core domain entities:
  - `AppUser`
  - `DriverProfile`
  - `DeliveryOrder`
  - `TrackingLog`
  - `Warehouse`
- Delivery lifecycle support:
  - `CREATED -> APPROVED -> ASSIGNED -> PICKED -> IN_TRANSIT -> DELIVERED`
- Booking APIs with initial routing behavior:
  - same-zone express attempts direct driver assignment
  - inter-zone or warehouse flow uses warehouse suggestion
- Pricing, matching, warehouse, and notification services as extensible engine modules
- Real-time tracking via WebSocket topic:
  - `/topic/tracking/{orderId}`

## API Modules

- `Authentication Service`:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- `Booking Service`:
  - `POST /api/bookings`
  - `GET /api/bookings/my`
- `Driver Module`:
  - `GET /api/driver/tasks`
  - `PATCH /api/driver/tasks/{orderId}/status`
- `Admin Module`:
  - `GET /api/admin/users`
  - `GET /api/admin/drivers`
  - `PATCH /api/admin/users/{id}/active`
  - `GET /api/admin/logs/orders`
- `Tracking Service`:
  - `POST /api/tracking/{orderId}/location`
  - `GET /api/tracking/{orderId}`

## Tech Stack

- Java 17
- Spring Boot
- Spring Security + JWT
- Spring Data JPA
- MySQL
- WebSockets (STOMP broker)

## Run

1. Create MySQL database or let Spring create it:
   - `smart_logistics`
2. Update DB credentials in `src/main/resources/application.yml`
3. Build and run:
   - `mvn clean test`
   - `mvn spring-boot:run`

## Notes for Phase 2

- Integrate Google Maps + Weather APIs for route and ETA intelligence
- Introduce dynamic demand/weather pricing strategy
- Implement proper order batching and warehouse optimization algorithms
- Add payment provider integration and event-driven notifications
