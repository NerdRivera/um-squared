import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { orgService } from "../services";
import { OrgCategory } from "../types";
import { getErrorMessage } from "../utils/errors";
import * as styles from "../styles/shared";

const applyOrgSchema = z.object({
  organizationName: z.string().min(2, "Name must be at least 2 characters").max(150),
  description: z.string().min(1, "Description is required").max(2000),
  category: z.nativeEnum(OrgCategory),
  contactInfo: z.string().min(1, "Contact info is required").max(255),
});

type ApplyOrgFormValues = z.infer<typeof applyOrgSchema>;

const CATEGORY_LABELS: Record<OrgCategory, string> = {
  [OrgCategory.GREEK_LIFE]: "Greek Life",
  [OrgCategory.RSO]: "Registered Student Organization",
  [OrgCategory.INTRAMURAL_SPORTS]: "Intramural Sports",
  [OrgCategory.OTHER]: "Other",
};

export function OrgApplyPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ApplyOrgFormValues>({
    resolver: zodResolver(applyOrgSchema),
    defaultValues: { category: OrgCategory.RSO },
  });

  async function onSubmit(values: ApplyOrgFormValues) {
    setFormError(null);
    try {
      await orgService.applyToCreateOrg(values);
      setSubmitted(true);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  if (submitted) {
    return (
      <div style={styles.page}>
        <h1>Application submitted</h1>
        <p>Your organization application is pending review by a platform admin.</p>
        <button style={styles.secondaryButton} onClick={() => navigate("/")}>
          Back home
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>Apply to create an organization</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
        <label style={styles.label}>
          Organization name
          <input style={styles.input} type="text" {...register("organizationName")} />
        </label>
        {errors.organizationName && (
          <p style={styles.errorText}>{errors.organizationName.message}</p>
        )}

        <label style={styles.label}>
          Description
          <textarea style={styles.textarea} {...register("description")} />
        </label>
        {errors.description && <p style={styles.errorText}>{errors.description.message}</p>}

        <label style={styles.label}>
          Category
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <select style={styles.input} {...field}>
                {Object.values(OrgCategory).map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            )}
          />
        </label>
        {errors.category && <p style={styles.errorText}>{errors.category.message}</p>}

        <label style={styles.label}>
          Contact info
          <input
            style={styles.input}
            type="text"
            placeholder="Email or phone for your organization"
            {...register("contactInfo")}
          />
        </label>
        {errors.contactInfo && <p style={styles.errorText}>{errors.contactInfo.message}</p>}

        {formError && <p style={styles.errorText}>{formError}</p>}

        <button style={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}
