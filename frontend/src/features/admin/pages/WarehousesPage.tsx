import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { adminApi } from "../../../services/adminApi";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-toastify";

const schema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  city: z.string().optional(),
  zone: z.string().min(2),
  latitude: z.string().min(1),
  longitude: z.string().min(1),
  capacity: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

export function WarehousesPage() {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "WH-ZONE1", name: "Zone 1 Warehouse", city: "Bengaluru", zone: "ZONE_1", latitude: "12.97", longitude: "77.59", capacity: "500" }
  });

  const mutation = useMutation({
    mutationFn: adminApi.createWarehouse,
    onSuccess: () => {
      toast.success("Warehouse created");
      reset();
    }
  });

  return (
    <Card>
      <h2 className="mb-5 text-xl font-bold text-slate-900">Create Warehouse</h2>
      <form
        className="grid gap-4"
        onSubmit={handleSubmit((values) =>
          mutation.mutate({
            ...values,
            latitude: Number(values.latitude),
            longitude: Number(values.longitude),
            capacity: Number(values.capacity)
          })
        )}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input placeholder="Code" {...register("code")} />
          <Input placeholder="Name" {...register("name")} />
          <Input placeholder="City" {...register("city")} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input placeholder="Zone" {...register("zone")} />
          <Input type="number" placeholder="Latitude" {...register("latitude")} />
          <Input type="number" placeholder="Longitude" {...register("longitude")} />
          <Input type="number" placeholder="Capacity" {...register("capacity")} />
        </div>
        <Button disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Create Warehouse"}</Button>
      </form>
    </Card>
  );
}

