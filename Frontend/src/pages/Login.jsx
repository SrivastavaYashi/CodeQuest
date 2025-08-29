
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loginUser } from "../authSlice";
import { useEffect } from "react";

const LoginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {isAuthenticated } = useSelector(
    (state) => state.auth
  );
    
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(LoginSchema) });

   useEffect(() => {
      if (isAuthenticated) {
        navigate("/");
      }
    }, [isAuthenticated, navigate]);
  

  const onSubmit = (data) => {
    dispatch(loginUser(data));
    // You can call your backend signup API here
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100 p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              {...register("emailId")}
              type="email"
              placeholder="Enter your email"
              className={`input input-bordered w-full ${
                errors.emailId ? "input-error" : ""
              }`}
            />
            {errors.emailId && (
              <span className="text-error text-sm">{errors.emailId.message}</span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="Enter your password"
              className={`input input-bordered w-full ${
                errors.password ? "input-error" : ""
              }`}
            />
            {errors.password && (
              <span className="text-error text-sm">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-4">
            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;