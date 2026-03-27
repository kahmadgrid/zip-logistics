import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "../../../services/adminApi";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

export function BatchingPage() {
  const [originZone, setOriginZone] = useState("ZONE_1");
  const [destinationZone, setDestinationZone] = useState("ZONE_2");
  const [batches, setBatches] = useState<any[]>([]);

  const mutation = useMutation({
    mutationFn: () => adminApi.prepareBatches(originZone, destinationZone),
    onSuccess: (data) => setBatches(data)
  });

  return (
    <Card>
      <h2 className="mb-5 text-xl font-bold text-slate-900">Prepare Batches</h2>
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input value={originZone} onChange={(e) => setOriginZone(e.target.value)} placeholder="Origin Zone" />
        <Input value={destinationZone} onChange={(e) => setDestinationZone(e.target.value)} placeholder="Destination Zone" />
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Preparing..." : "Prepare"}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Batch ID</th>
              <th>Area</th>
              <th>Status</th>
              <th>Weight</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id} className="border-t border-slate-100">
                <td className="py-2">{b.id}</td>
                <td>{b.area}</td>
                <td>{b.status}</td>
                <td>{b.currentWeightKg}</td>
                <td>{b.currentVolumeM3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

