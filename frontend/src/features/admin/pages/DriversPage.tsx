import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../services/adminApi";
import { Card } from "../../../components/ui/Card";

export function DriversPage() {
  const { data } = useQuery({ queryKey: ["admin-drivers"], queryFn: adminApi.drivers });

  return (
    <Card>
      <h2 className="mb-5 text-xl font-bold text-slate-900">Drivers</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">ID</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((d) => (
              <tr key={d.id} className="border-t border-slate-100">
                <td className="py-2">{d.id}</td>
                <td>{d.email}</td>
                <td>{d.mobile}</td>
                <td>{d.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

