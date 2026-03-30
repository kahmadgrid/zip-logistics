# SmartLogix Frontend

React + Tailwind CSS frontend for the Smart Logistics API.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm start
```

App runs at **http://localhost:3000**  
Backend must be running at **http://localhost:8080**

---

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── StatusBadge.jsx       # Order/availability status pill
│   │   ├── InfoCard.jsx          # Dashboard stat card
│   │   └── ProtectedRoute.jsx    # Role-based route guard
│   ├── forms/
│   │   └── FormFields.jsx        # InputField, SelectField, NumberField
│   ├── table/
│   │   └── DataTable.jsx         # Reusable data table
│   ├── map/
│   │   └── TrackingTimeline.jsx  # Order tracking timeline
│   └── layout/
│       ├── Sidebar.jsx           # Nav sidebar (role-aware)
│       └── DashboardLayout.jsx   # Page wrapper with sidebar
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── user/
│   │   ├── UserDashboard.jsx
│   │   ├── CreateBookingPage.jsx
│   │   ├── MyBookingsPage.jsx
│   │   └── TrackingPage.jsx
│   ├── driver/
│   │   ├── DriverDashboard.jsx
│   │   ├── DriverProfilePage.jsx
│   │   └── DriverTasksPage.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── WarehousePage.jsx
│       ├── UsersPage.jsx
│       ├── DriversPage.jsx
│       ├── BatchingPage.jsx
│       └── LogsPage.jsx
│
├── services/
│   ├── api.js              # Axios instance + interceptors
│   ├── authService.js      # /api/auth/*
│   ├── bookingService.js   # /api/bookings/*
│   ├── driverService.js    # /api/driver/*
│   ├── adminService.js     # /api/admin/*
│   └── trackingService.js  # /api/tracking/*
│
├── context/
│   └── AuthContext.jsx     # Global auth state (token, user, role)
│
└── utils/
    └── constants.js        # STATUS_LABELS, ZONES, helpers
```

---

## 🔐 Roles & Routes

| Role         | Redirect after login     |
|--------------|--------------------------|
| `ROLE_USER`  | `/user/dashboard`        |
| `ROLE_DRIVER`| `/driver/dashboard`      |
| `ROLE_ADMIN` | `/admin/dashboard`       |

All routes are protected. Wrong role = auto-redirect to correct dashboard.

---

## 🌐 API Endpoints Used

### Auth
| Method | Endpoint              | Used in          |
|--------|-----------------------|------------------|
| POST   | `/api/auth/register`  | RegisterPage     |
| POST   | `/api/auth/login`     | LoginPage        |

### User / Bookings
| Method | Endpoint              | Used in              |
|--------|-----------------------|----------------------|
| POST   | `/api/bookings`       | CreateBookingPage    |
| GET    | `/api/bookings/my`    | MyBookingsPage, Dashboard |

### Tracking
| Method | Endpoint                       | Used in       |
|--------|--------------------------------|---------------|
| GET    | `/api/tracking/{orderId}`      | TrackingPage  |
| POST   | `/api/tracking/{orderId}/location` | (admin util) |

### Driver
| Method | Endpoint                              | Used in            |
|--------|---------------------------------------|--------------------|
| POST   | `/api/driver/profile`                 | DriverProfilePage  |
| GET    | `/api/driver/tasks`                   | DriverTasksPage    |
| POST   | `/api/driver/tasks/{id}/accept`       | DriverTasksPage    |
| PATCH  | `/api/driver/tasks/{id}/status`       | DriverTasksPage    |
| POST   | `/api/driver/tasks/{id}/location`     | DriverTasksPage    |

### Admin
| Method | Endpoint                          | Used in          |
|--------|-----------------------------------|------------------|
| POST   | `/api/admin/warehouses`           | WarehousePage    |
| GET    | `/api/admin/users`                | UsersPage        |
| PATCH  | `/api/admin/users/{id}/active`    | UsersPage        |
| GET    | `/api/admin/drivers`              | DriversPage      |
| POST   | `/api/admin/batching/prepare`     | BatchingPage     |
| GET    | `/api/admin/logs/orders`          | LogsPage         |

---

## 🗺 Adding a Real Map (Optional)

In `TrackingPage.jsx`, replace the map placeholder div with Leaflet:

```bash
npm install leaflet react-leaflet
```

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

<MapContainer center={[lat, lng]} zoom={13} className="h-48 rounded-xl">
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[lat, lng]}>
    <Popup>Last known location</Popup>
  </Marker>
</MapContainer>
```

---

## ⚙️ Change Backend URL

Edit `src/services/api.js`:

```js
const BASE_URL = 'http://localhost:8080'; // ← change this
```

---

## 🎨 Design System

- **Font**: DM Sans (headings) + Inter (body)
- **Theme**: Dark slate (`#0f172a` bg, `#1e293b` cards)
- **Accent**: Sky blue (`brand-600`)
- **Components**: Utility classes defined in `index.css` — `.card`, `.btn-primary`, `.btn-secondary`, `.input`, `.label`, `.badge`, `.table`
