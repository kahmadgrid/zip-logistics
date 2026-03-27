import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { trackingApi } from "../../../services/trackingApi";
import { Card } from "../../../components/ui/Card";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Spinner } from "../../../components/ui/Spinner";
import type { TrackingEvent } from "../../../services/types";
import { toast } from "react-toastify";

const steps = [
  "CREATED",
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "AT_ORIGIN_WAREHOUSE",
  "IN_TRANSIT",
  "AT_DESTINATION_WAREHOUSE",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED"
];

export function TrackingPage() {
  const { orderId } = useParams();
  const id = Number(orderId);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [status, setStatus] = useState("IN_TRANSIT");
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);

  const { data, isLoading } = useQuery({
    queryKey: ["tracking", id],
    queryFn: () => trackingApi.timeline(id),
    enabled: Number.isFinite(id)
  });

  useEffect(() => {
    if (data) setEvents(data);
  }, [data]);

  useEffect(() => {
    if (!id) return;
    const client = trackingApi.createSocketClient(id, (event) => {
      setEvents((prev) => [
        {
          ...event,
          id: event.id ?? `live-${Date.now()}`,
          recordedAt: new Date().toISOString()
        },
        ...prev
      ]);
    });
    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [id]);

  const mutation = useMutation({
    mutationFn: () => trackingApi.addEvent(id, { status, latitude, longitude }),
    onSuccess: (payload) => {
      toast.success("Tracking event sent");
      setEvents((prev) => [{ ...payload, id: payload.id ?? `local-${Date.now()}` }, ...prev]);
    }
  });

  const currentStatus = useMemo(() => events[0]?.status ?? "CREATED", [events]);
  const currentStep = steps.indexOf(currentStatus);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Order #{id} Tracking</h2>

          <div className="mb-6 grid gap-2 md:grid-cols-4">
            {steps.map((step, idx) => (
              <div
                key={step}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                  idx <= currentStep
                    ? "border-brand-300 bg-brand-100 text-brand-800"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          {isLoading ? (
            <Spinner />
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={String(event.id)} className="rounded-xl border border-slate-100 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <StatusBadge status={event.status} />
                    <span className="text-xs text-slate-500">{event.recordedAt ?? "Live event"}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Lat: <span className="font-mono">{event.latitude}</span> | Lng:{" "}
                    <span className="font-mono">{event.longitude}</span>
                  </p>
                </div>
              ))}
              {events.length === 0 && <p className="text-sm text-slate-500">No events yet.</p>}
            </div>
          )}
        </Card>
      </div>

      <div>
        <Card>
          <h3 className="mb-3 text-lg font-bold text-slate-900">Send Manual Tracking Event</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {steps.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Latitude</label>
              <Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(Number(e.target.value))} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Longitude</label>
              <Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(Number(e.target.value))} />
            </div>

            <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
              {mutation.isPending ? "Sending..." : "Send Event"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

