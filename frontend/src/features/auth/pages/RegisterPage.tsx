import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authApi } from "../../../services/authApi";
import { useAuthStore } from "../../../store/authStore";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const schema = z.object({
  email: z.string().email("Invalid email"),
  mobile: z.string().min(8, "Invalid mobile"),
  fullName: z.string().min(2, "Name is required"),
  password: z.string().min(4, "Password is required"),
  role: z.enum(["ROLE_USER", "ROLE_DRIVER", "ROLE_ADMIN"])
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "ROLE_USER" }
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data);
      toast.success("Account created");
      if (data.role === "ROLE_ADMIN") navigate("/admin");
      else if (data.role === "ROLE_DRIVER") navigate("/driver");
      else navigate("/user");
    }
  });

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <h2 className="mb-1 text-2xl font-bold text-slate-900">Create account</h2>
        <p className="mb-6 text-sm text-slate-500">Register as user, driver, or admin</p>

        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <Input {...register("fullName")} />
            {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <Input {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Mobile</label>
              <Input {...register("mobile")} />
              {errors.mobile && <p className="mt-1 text-xs text-rose-600">{errors.mobile.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <Input type="password" {...register("password")} />
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <Select {...register("role")}>
                <option value="ROLE_USER">USER</option>
                <option value="ROLE_DRIVER">DRIVER</option>
                <option value="ROLE_ADMIN">ADMIN</option>
              </Select>
            </div>
          </div>
          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Register"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already have account?{" "}
          <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/login">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}

