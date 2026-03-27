import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authApi } from "../../../services/authApi";
import { useAuthStore } from "../../../store/authStore";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const schema = z.object({
  emailOrMobile: z.string().min(3, "Enter email or mobile"),
  password: z.string().min(4, "Password is required")
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data);
      toast.success("Login successful");
      if (data.role === "ROLE_ADMIN") navigate("/admin");
      else if (data.role === "ROLE_DRIVER") navigate("/driver");
      else navigate("/user");
    }
  });

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <h2 className="mb-1 text-2xl font-bold text-slate-900">Welcome back</h2>
        <p className="mb-6 text-sm text-slate-500">Login using email or mobile number</p>

        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email / Mobile</label>
            <Input {...register("emailOrMobile")} />
            {errors.emailOrMobile && <p className="mt-1 text-xs text-rose-600">{errors.emailOrMobile.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <Input type="password" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          </div>
          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New here?{" "}
          <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/register">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}

