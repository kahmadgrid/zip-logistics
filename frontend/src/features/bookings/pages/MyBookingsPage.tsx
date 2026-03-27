import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { bookingApi } from "../../../services/bookingApi";
import { Card } from "../../../components/ui/Card";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Spinner } from "../../../components/ui/Spinner";

export function MyBookingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingApi.myBookings
  });

  return (
    <Card>
      <h2 className="mb-5 text-xl font-bold text-slate-900">My Bookings</h2>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Estimated Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((b) => (
                <tr key={b.id} className="rounded-xl border border-slate-100 bg-white">
                  <td className="py-2 font-mono">{b.id}</td>
                  <td>{b.deliveryType}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>{b.estimatedPrice}</td>
                  <td>
                    <Link className="font-semibold text-brand-700 hover:text-brand-800" to={`/user/tracking/${b.id}`}>
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

