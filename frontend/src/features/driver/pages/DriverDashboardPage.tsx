import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Spinner } from "../../../components/ui/Spinner";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { driverApi } from "../../../services/driverApi";
import type { DeliveryOrder } from "../../../services/types";
import { toast } from "react-toastify";

const DRIVER_UPDATE_STATUSES = [
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "AT_ORIGIN_WAREHOUSE",
  "IN_TRANSIT",
  "AT_DESTINATION_WAREHOUSE",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED"
] as const;

function formatReceiver(receiverName: string, receiverMobile: string) {
  return `${receiverName} • ${receiverMobile}`;
}

export function DriverDashboardPage() {
  const {
    data: availableOrders,
    refetch: refetchAvailable,
    isLoading: isLoadingAvailable
  } = useQuery({
    queryKey: ["driver-tasks"],
    queryFn: driverApi.tasks
  });

  const {
    data: assignedOrders,
    refetch: refetchAssigned,
    isLoading: isLoadingAssigned
  } = useQuery({
    queryKey: ["driver-assigned-tasks"],
    queryFn: driverApi.assignedTasks
  });

  const [selectedAssignedOrderId, setSelectedAssignedOrderId] = useState<number | null>(null);
  const selectedAssignedOrder = useMemo(
    () => (assignedOrders ?? []).find((o: DeliveryOrder) => o.id === selectedAssignedOrderId) ?? null,
    [assignedOrders, selectedAssignedOrderId]
  );

  const [actionStatus, setActionStatus] = useState<string>("IN_TRANSIT");
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);

  useEffect(() => {
    if (!selectedAssignedOrder) return;
    setActionStatus(selectedAssignedOrder.status);
    setLatitude(selectedAssignedOrder.pickupLatitude);
    setLongitude(selectedAssignedOrder.pickupLongitude);
  }, [selectedAssignedOrder]);

  useEffect(() => {
    // Auto-select the first assigned order for convenience.
    if (selectedAssignedOrderId != null) return;
    const first = (assignedOrders ?? [])[0];
    if (first?.id) setSelectedAssignedOrderId(first.id);
  }, [assignedOrders, selectedAssignedOrderId]);

  const acceptMutation = useMutation({
    mutationFn: (id: number) => driverApi.acceptTask(id),
    onSuccess: () => {
      toast.success("Order accepted");
      void refetchAvailable();
      void refetchAssigned();
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => driverApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      void refetchAssigned();
    }
  });

  const locMutation = useMutation({
    mutationFn: ({ id, status, latitude, longitude }: { id: number; status: string; latitude: number; longitude: number }) =>
      driverApi.updateLocation(id, { status, latitude, longitude }),
    onSuccess: () => {
      toast.success("Location update sent");
      void refetchAssigned();
    }
  });

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {/* Column 1: Available Orders */}
      <Card>
        <h3 className="mb-3 text-lg font-bold text-slate-900">Available Orders</h3>

        {isLoadingAvailable ? (
          <Spinner />
        ) : (
          <div className="space-y-3">
            {(availableOrders ?? []).map((order) => (
              <div key={order.id} className="rounded-xl border border-slate-100 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-sm">#{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mb-2 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">{order.pickupAddress}</div>
                  <div className="text-slate-500">→ {order.dropAddress}</div>
                </div>

                <div className="mb-2 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">{formatReceiver(order.receiverName, order.receiverMobile)}</div>
                  <div className="text-slate-500">
                    Package: {order.weightKg}kg • {order.lengthCm}×{order.breadthCm}×{order.heightCm} cm
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">
                    {order.pickupZone} → {order.dropZone}
                  </p>
                  <Button
                    onClick={() => acceptMutation.mutate(order.id)}
                    disabled={acceptMutation.isPending}
                    variant="primary"
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}

            {(availableOrders ?? []).length === 0 && (
              <p className="text-sm text-slate-500">No available tasks in your zone.</p>
            )}
          </div>
        )}
      </Card>

      {/* Column 2: Accepted Order Details */}
      <Card>
        <h3 className="mb-3 text-lg font-bold text-slate-900">Accepted Order</h3>

        {isLoadingAssigned ? (
          <Spinner />
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500">Your assigned orders</p>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {(assignedOrders ?? []).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedAssignedOrderId === o.id
                        ? "border-brand-300 bg-brand-50"
                        : "border-slate-100 bg-white hover:border-brand-200"
                    }`}
                    onClick={() => setSelectedAssignedOrderId(o.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm">#{o.id}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="mt-2 truncate text-xs text-slate-600">
                      {o.pickupAddress} → {o.dropAddress}
                    </p>
                  </button>
                ))}
                {(assignedOrders ?? []).length === 0 && (
                  <p className="text-sm text-slate-500">No assigned orders yet.</p>
                )}
              </div>
            </div>

            {!selectedAssignedOrder ? (
              <p className="text-sm text-slate-500">Select an accepted order to view details.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Order</p>
                    <p className="font-mono text-sm">#{selectedAssignedOrder.id}</p>
                  </div>
                  <StatusBadge status={selectedAssignedOrder.status} />
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-500">Delivery</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="font-semibold text-slate-800">{selectedAssignedOrder.pickupAddress}</div>
                    <div className="text-slate-500">→ {selectedAssignedOrder.dropAddress}</div>
                    <div className="pt-1 text-slate-500">
                      Zones: {selectedAssignedOrder.pickupZone} → {selectedAssignedOrder.dropZone}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="mb-2 text-xs font-semibold text-slate-500">Receiver</p>
                    <p className="text-xs font-semibold text-slate-800">{selectedAssignedOrder.receiverName}</p>
                    <p className="text-xs text-slate-600">{selectedAssignedOrder.receiverMobile}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="mb-2 text-xs font-semibold text-slate-500">Package</p>
                    <p className="text-xs text-slate-600">
                      {selectedAssignedOrder.weightKg} kg
                    </p>
                    <p className="text-xs text-slate-600">
                      {selectedAssignedOrder.lengthCm}×{selectedAssignedOrder.breadthCm}×{selectedAssignedOrder.heightCm} cm
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-500">Pricing</p>
                  <p className="text-sm font-bold text-slate-900">Estimated: ₹{selectedAssignedOrder.estimatedPrice}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Column 3: Accepted Order Actions */}
      <Card>
        <h3 className="mb-3 text-lg font-bold text-slate-900">Update Status & Location</h3>
        <p className="mb-3 text-sm text-slate-500">
          Selected Order:{" "}
          <span className="font-mono text-slate-800">{selectedAssignedOrder?.id ?? "None"}</span>
        </p>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Status</label>
            <Select
              value={actionStatus}
              onChange={(e) => setActionStatus(e.target.value)}
              disabled={!selectedAssignedOrder}
            >
              {DRIVER_UPDATE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Latitude</label>
              <Input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                disabled={!selectedAssignedOrder}
                step="any"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Longitude</label>
              <Input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                disabled={!selectedAssignedOrder}
                step="any"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={!selectedAssignedOrder || statusMutation.isPending}
              onClick={() => {
                if (!selectedAssignedOrder) return;
                statusMutation.mutate({ id: selectedAssignedOrder.id, status: actionStatus });
              }}
            >
              {statusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
            <Button
              disabled={!selectedAssignedOrder || locMutation.isPending}
              onClick={() => {
                if (!selectedAssignedOrder) return;
                locMutation.mutate({
                  id: selectedAssignedOrder.id,
                  status: actionStatus,
                  latitude,
                  longitude
                });
              }}
            >
              {locMutation.isPending ? "Sending..." : "Send Location"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

