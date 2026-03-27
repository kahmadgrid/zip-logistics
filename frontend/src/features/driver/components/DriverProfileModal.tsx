import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { driverApi } from "../../../services/driverApi";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Modal } from "../../../components/ui/Modal";
import { toast } from "react-toastify";

const schema = z.object({
  vehicleType: z.string().min(2, "Vehicle type is required"),
  vehicleNumber: z.string().optional(),
  currentZone: z.string().min(2, "Zone is required"),
  availability: z.enum(["ONLINE", "OFFLINE"]),
  currentLatitude: z.string().min(1, "Latitude is required"),
  currentLongitude: z.string().min(1, "Longitude is required")
});

type FormValues = z.infer<typeof schema>;

export function DriverProfileModal({
  open,
  onClose,
  defaultValues
}: {
  open: boolean;
  onClose: () => void;
  defaultValues?: Partial<FormValues>;
}) {
  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      driverApi.createProfile({
        vehicleType: values.vehicleType,
        vehicleNumber: values.vehicleNumber,
        currentZone: values.currentZone,
        availability: values.availability,
        currentLatitude: Number(values.currentLatitude),
        currentLongitude: Number(values.currentLongitude)
      }),
    onSuccess: () => {
      toast.success("Driver profile saved");
      onClose();
    }
  });

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleType: "BIKE",
      vehicleNumber: "",
      currentZone: "ZONE_1",
      availability: "ONLINE",
      currentLatitude: "12.9716",
      currentLongitude: "77.5946",
      ...defaultValues
    }
  });

  useEffect(() => {
    if (!open) return;
    reset({
      vehicleType: defaultValues?.vehicleType ?? "BIKE",
      vehicleNumber: defaultValues?.vehicleNumber ?? "",
      currentZone: defaultValues?.currentZone ?? "ZONE_1",
      availability: defaultValues?.availability ?? "ONLINE",
      currentLatitude: defaultValues?.currentLatitude ?? "12.9716",
      currentLongitude: defaultValues?.currentLongitude ?? "77.5946"
    });
  }, [open, reset, defaultValues]);

  return (
    <Modal open={open} title="Create / Update Driver Profile" onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Vehicle Type</label>
            <Input {...register("vehicleType")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Vehicle Number</label>
            <Input {...register("vehicleNumber")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current Zone</label>
            <Input {...register("currentZone")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Availability</label>
            <Select {...register("availability")}>
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Latitude</label>
            <Input type="number" step="any" {...register("currentLatitude")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Longitude</label>
            <Input type="number" step="any" {...register("currentLongitude")} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

