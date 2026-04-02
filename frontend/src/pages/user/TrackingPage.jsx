import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TrackingTimeline from '../../components/map/TrackingTimeline';
import StatusBadge from '../../components/common/StatusBadge';
import { trackingService } from '../../services/trackingService';
import { getErrMsg } from '../../utils/constants';
import toast from 'react-hot-toast';
import SockJS from 'sockjs-client';
import '../../utils/leafletConfig';
import { truckIcon } from '../../utils/leafletConfig';
import { Client } from '@stomp/stompjs';
import L from "leaflet";


export const bikeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512//684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  useMap,
  Tooltip
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

// ✅ Auto-center map

function RecenterMap({ position }) {
  const map = useMap();
  const prevPosition = useRef(null);

  useEffect(() => {
    if (!position) return;

    // 🚨 Only move if position actually changed
    if (
      !prevPosition.current ||
      prevPosition.current[0] !== position[0] ||
      prevPosition.current[1] !== position[1]
    ) {
      map.flyTo(position, map.getZoom(), {
        duration: 2
      });

      prevPosition.current = position; // ✅ update previous
    }

  }, [position, map]);

  return null;
}

export default function TrackingPage() {
  const { orderId } = useParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [geoRoute, setGeoRoute] = useState(null); // ✅ NEW
  const [destination, setDestination] = useState(null);
  const [driverName, setDriverName] = useState("");
  const [eta, setEta] = useState(null);

//   const destination = [12.9352, 77.6245];
  // Fetch timeline
  const fetchTimeline = () => {
    setLoading(true);
    trackingService.getTimeline(orderId)
      .then(({ data }) => {
        setEvents(data.events || []);
        setDestination([data.dropLat, data.dropLng]);
        setDriverName(data.driverName);
      })
      .catch((err) => toast.error(getErrMsg(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTimeline();
  }, [orderId]);

  // WebSocket live updates
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,

      onConnect: () => {
        client.subscribe(`/topic/tracking/${orderId}`, (message) => {
          const newEvent = JSON.parse(message.body);
          setEvents((prev) => [...prev, newEvent]);
        });
      },

      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message']);
      }
    });

    client.activate();

    return () => client.deactivate();
  }, [orderId]);

  // Extract driver positions
  const positions = events
    .filter(e => e.latitude && e.longitude)
    .map(e => [e.latitude, e.longitude]);

  const latest = positions[positions.length - 1];


  // ✅ Fetch route (GeoJSON)
  useEffect(() => {
    if (!latest || !destination) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            method: "POST",
            headers: {
              "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImIxNTcyOTViYTk5ODQ0NjBhNzc3NTRjZjIyZDkxOTBjIiwiaCI6Im11cm11cjY0In0=",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              coordinates: [
                [latest[1], latest[0]],         // 🚚 driver (start)
                [destination[1], destination[0]] // 📍 destination
              ]
            })
          }
        );

        const data = await res.json();
        const durationSec = data.features[0].properties.summary.duration;
        setEta(durationSec / 60);
        console.log(data);
        setGeoRoute(data); // ✅ use full GeoJSON directly

      } catch (err) {
        console.error("Route fetch error:", err);
      }
    }, 2000); // debounce

    return () => clearTimeout(timeout);
  }, [latest, destination]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/user/bookings" className="text-slate-500 hover:text-slate-300">
            <ArrowLeft size={18} />
          </Link>
          <h1>Tracking</h1>
        </div>

        <p className="flex items-center gap-2">
          Order <span className="font-mono text-brand-400">#{orderId}</span>
          {events.length > 0 && (
            <StatusBadge status={events[events.length - 1].status} />
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Timeline */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-5">
            Delivery Timeline
          </h2>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 py-6 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Loading timeline...
            </div>
          ) : (
            <TrackingTimeline events={events} />
          )}
        </div>

        {/* Map */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">
            Live Location
          </h2>

          {latest ? (
            <div>
              <div className="flex items-center gap-2 text-slate-300 mb-3">
                <MapPin size={16} className="text-brand-400" />
                <span className="font-mono text-sm">
                  {latest[0].toFixed(6)}, {latest[1].toFixed(6)}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden h-64">
                <MapContainer center={latest} zoom={15} className="h-full w-full">

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <RecenterMap position={latest} />

                  {/* 🚚 Driver */}
                  <Marker position={latest} icon = {bikeIcon} >
                      <Tooltip permanent direction="top" offset={[0, -20]}>
                          <div style={{
                            background: "pink",
                            color: "black",
                            padding: "5px 10px",
                            borderRadius: "8px",
                            fontSize: "12px"
                          }}>
                            🚚 {driverName}<br />
                            ⏱️ {eta ? eta.toFixed(1) : "--"} min
                          </div>
                        </Tooltip>
                    </Marker>
                  {/* 📍 Destination */}
                  {destination && (
                    <Marker position={destination} />
                  )}

                  {/* 🛣️ Real Route */}
                  <GeoJSON
                    key={JSON.stringify(geoRoute)}   // 🔥 FORCE RE-RENDER
                    data={geoRoute}
                    style={{
                      color: "red",
                      weight: 5
                    }}
                  />

                  )}

                </MapContainer>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              No location data available yet.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}