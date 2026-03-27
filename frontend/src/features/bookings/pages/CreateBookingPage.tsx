import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { bookingApi } from "../../../services/bookingApi";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  deliveryType: z.enum(["STANDARD", "EXPRESS"]),
  pickupAddress: z.string().min(5),
  dropAddress: z.string().min(5),
  pickupZone: z.string().min(2),
  dropZone: z.string().min(2),
  receiverName: z.string().min(2),
  receiverMobile: z.string().min(8),
  weightKg: z.string().min(1),
  lengthCm: z.string().min(1),
  breadthCm: z.string().min(1),
  heightCm: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

export function CreateBookingPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { deliveryType: "STANDARD", weightKg: "1", lengthCm: "20", breadthCm: "15", heightCm: "10" }
  });

  const mutation = useMutation({
    mutationFn: bookingApi.createBooking,
    onSuccess: (data) => {
      toast.success(`Booking created (#${data.id})`);
      navigate(`/user/tracking/${data.id}`);
    }
  });

  return (
    <Card>
      <h2 className="mb-5 text-xl font-bold text-slate-900">Create Booking</h2>
      <form
        className="grid gap-4"
        onSubmit={handleSubmit((values) =>
          mutation.mutate({
            ...values,
            weightKg: Number(values.weightKg),
            lengthCm: Number(values.lengthCm),
            breadthCm: Number(values.breadthCm),
            heightCm: Number(values.heightCm)
          })
        )}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Delivery Type</label>
            <Select {...register("deliveryType")}>
              <option value="STANDARD">STANDARD</option>
              <option value="EXPRESS">EXPRESS</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Receiver Name</label>
            <Input {...register("receiverName")} />
            {errors.receiverName && <p className="mt-1 text-xs text-rose-600">Receiver name required</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Pickup Address</label>
            <Input {...register("pickupAddress")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Drop Address</label>
            <Input {...register("dropAddress")} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Pickup Zone</label>
            <Input {...register("pickupZone")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Drop Zone</label>
            <Input {...register("dropZone")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Receiver Mobile</label>
            <Input {...register("receiverMobile")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div><label className="mb-1 block text-sm">Weight (kg)</label><Input type="number" step="0.1" {...register("weightKg")} /></div>
          <div><label className="mb-1 block text-sm">Length (cm)</label><Input type="number" {...register("lengthCm")} /></div>
          <div><label className="mb-1 block text-sm">Breadth (cm)</label><Input type="number" {...register("breadthCm")} /></div>
          <div><label className="mb-1 block text-sm">Height (cm)</label><Input type="number" {...register("heightCm")} /></div>
        </div>
        <div>
          <Button disabled={mutation.isPending}>{mutation.isPending ? "Submitting..." : "Create Booking"}</Button>
        </div>
      </form>
    </Card>
  );
}

