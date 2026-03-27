import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

export function UserDashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <h3 className="text-lg font-bold text-slate-900">Create Booking</h3>
        <p className="mt-1 text-sm text-slate-600">Standard or express shipment with full parcel details.</p>
        <Link to="/user/bookings/new" className="mt-4 inline-block">
          <Button>Create</Button>
        </Link>
      </Card>
      <Card>
        <h3 className="text-lg font-bold text-slate-900">My Bookings</h3>
        <p className="mt-1 text-sm text-slate-600">Check statuses and estimated price.</p>
        <Link to="/user/bookings" className="mt-4 inline-block">
          <Button variant="secondary">Open List</Button>
        </Link>
      </Card>
      <Card>
        <h3 className="text-lg font-bold text-slate-900">Track Shipment</h3>
        <p className="mt-1 text-sm text-slate-600">Live tracking timeline and journey steps.</p>
        <Link to="/user/bookings" className="mt-4 inline-block">
          <Button variant="secondary">Track</Button>
        </Link>
      </Card>
    </div>
  );
}

