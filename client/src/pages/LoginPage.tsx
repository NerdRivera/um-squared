import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errors";
import * as styles from "../styles/shared";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values);
      navigate("/");
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  return (
    <div style={styles.page}>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
        <label style={styles.label}>
          Email
          <input style={styles.input} type="email" autoComplete="email" {...register("email")} />
        </label>
        {errors.email && <p style={styles.errorText}>{errors.email.message}</p>}

        <label style={styles.label}>
          Password
          <input
            style={styles.input}
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
        </label>
        {errors.password && <p style={styles.errorText}>{errors.password.message}</p>}

        {formError && <p style={styles.errorText}>{formError}</p>}

        <button style={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
