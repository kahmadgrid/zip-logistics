import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../services/adminApi";
import { Card } from "../../../components/ui/Card";
import { StatusBadge } from "../../../components/ui/StatusBadge";

export function LogsPage() {
  const { data } = useQuery({ queryKey: ["admin-logs"], queryFn: adminApi.orderLogs });

  return (
    <Card>
      <h2 className="mb-5 text-xl font-bold text-slate-900">Order Logs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Est. Price</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((log) => (
              <tr key={log.id} className="border-t border-slate-100">
                <td className="py-2">{log.id}</td>
                <td>{log.deliveryType}</td>
                <td><StatusBadge status={log.status} /></td>
                <td>{log.estimatedPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

