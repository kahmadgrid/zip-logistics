import { useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../services/adminApi";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/ui/StatusBadge";

export function UsersPage() {
  const { data, refetch } = useQuery({ queryKey: ["admin-users"], queryFn: adminApi.users });
  const mutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => adminApi.setUserActive(id, active),
    onSuccess: () => refetch()
  });

  return (
    <Card>
      <h2 className="mb-5 text-xl font-bold text-slate-900">Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">ID</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="py-2">{u.id}</td>
                <td>{u.email}</td>
                <td>{u.mobile}</td>
                <td>{u.role}</td>
                <td><StatusBadge status={u.active ? "ACTIVE" : "INACTIVE"} /></td>
                <td>
                  <Button
                    variant="secondary"
                    onClick={() => mutation.mutate({ id: u.id, active: !u.active })}
                    disabled={mutation.isPending}
                  >
                    Toggle
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

