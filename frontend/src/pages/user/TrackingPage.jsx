import React, { useEffect, useState } from 'react';
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

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

// ✅ Auto-center map when location updates
function RecenterMap({ position }) {
  const map = useMap();
  map.setView(position);
  return null;
}

export default function TrackingPage() {
  const { orderId } = useParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Initial load (important)
  const fetchTimeline = () => {
    setLoading(true);
    trackingService.getTimeline(orderId)
      .then(({ data }) => setEvents(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(getErrMsg(err)))
      .finally(() => setLoading(false));
  };

  // ✅ Load once
  useEffect(() => {
    fetchTimeline();
  }, [orderId]);

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

    return () => {
      client.deactivate();
    };
  }, [orderId]);

  const positions = events
    .filter(e => e.latitude && e.longitude)
    .map(e => [e.latitude, e.longitude]);

  const latest = positions[positions.length - 1];

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
          {events.length > 0 && <StatusBadge status={events[events.length - 1].status} />}
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
                <MapContainer
                  center={latest}
                  zoom={15}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* ✅ Auto move map */}
                  <RecenterMap position={latest} />

                  {/* ✅ Moving marker */}
                 <Marker position={latest} icon={truckIcon} />

                  {/* ✅ Path */}
                  <Polyline positions={positions} />
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