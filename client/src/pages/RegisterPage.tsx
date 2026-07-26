import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errors";
import * as styles from "../styles/shared";

const registerSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await registerUser(values);
      navigate("/");
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  return (
    <div style={styles.page}>
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
        <label style={styles.label}>
          Display name
          <input style={styles.input} type="text" {...register("displayName")} />
        </label>
        {errors.displayName && <p style={styles.errorText}>{errors.displayName.message}</p>}

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
            autoComplete="new-password"
            {...register("password")}
          />
        </label>
        {errors.password && <p style={styles.errorText}>{errors.password.message}</p>}

        {formError && <p style={styles.errorText}>{formError}</p>}

        <button style={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Register"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
