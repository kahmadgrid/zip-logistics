import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

const cards = [
  { title: "Warehouse Management", to: "/admin/warehouses" },
  { title: "Users", to: "/admin/users" },
  { title: "Drivers", to: "/admin/drivers" },
  { title: "Prepare Batches", to: "/admin/batching" },
  { title: "Order Logs", to: "/admin/logs" }
];

export function AdminDashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.to}>
          <h3 className="text-lg font-bold text-slate-900">{c.title}</h3>
          <p className="mt-1 text-sm text-slate-600">Manage and monitor this module.</p>
          <Link to={c.to} className="mt-4 inline-block">
            <Button variant="secondary">Open</Button>
          </Link>
        </Card>
      ))}
    </div>
  );
}

