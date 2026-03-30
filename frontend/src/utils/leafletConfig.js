import L from 'leaflet';

// ✅ Default marker fix (important)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix broken icon issue in React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ Custom Truck Icon (Uber-style 🚚)
export const truckIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  iconSize: [36, 36],        // clean modern size
  iconAnchor: [18, 36],      // center bottom
  popupAnchor: [0, -36],
});

// ✅ Optional: Pickup marker
export const pickupIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// ✅ Optional: Drop marker
export const dropIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});