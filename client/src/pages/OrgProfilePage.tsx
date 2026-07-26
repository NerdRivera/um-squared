import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "react-router-dom";
import { orgService } from "../services";
import { useAuth } from "../context/AuthContext";
import { Role, type Organization } from "../types";
import { getErrorMessage } from "../utils/errors";
import * as styles from "../styles/shared";

const updateOrgSchema = z.object({
  bio: z.string().max(2000).optional().or(z.literal("")),
  websiteUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  coverImageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type UpdateOrgFormValues = z.infer<typeof updateOrgSchema>;

export function OrgProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateOrgFormValues>({ resolver: zodResolver(updateOrgSchema) });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orgService
      .getOrganization(id)
      .then((org) => {
        setOrganization(org);
        reset({
          bio: org.bio ?? "",
          websiteUrl: org.websiteUrl ?? "",
          coverImageUrl: org.coverImageUrl ?? "",
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const canEdit =
    !!user && !!organization && (user.role === Role.PLATFORM_ADMIN || user.organizationId === organization.id);

  async function onSubmit(values: UpdateOrgFormValues) {
    if (!id) return;
    setError(null);
    try {
      const updated = await orgService.updateOrganization(id, {
        bio: values.bio || null,
        websiteUrl: values.websiteUrl || null,
        coverImageUrl: values.coverImageUrl || null,
      });
      setOrganization(updated);
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) {
    return <p style={styles.centeredPage}>Loading…</p>;
  }

  if (error && !organization) {
    return (
      <div style={styles.page}>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div style={styles.page}>
      {organization.coverImageUrl && (
        <img
          src={organization.coverImageUrl}
          alt={`${organization.name} cover`}
          style={{ width: "100%", maxHeight: "220px", objectFit: "cover", borderRadius: "6px" }}
        />
      )}
      <h1>{organization.name}</h1>
      <p>
        <strong>{organization.category}</strong>
      </p>
      <p>{organization.description}</p>
      {organization.bio && <p>{organization.bio}</p>}
      {organization.websiteUrl && (
        <p>
          <a href={organization.websiteUrl} target="_blank" rel="noreferrer">
            {organization.websiteUrl}
          </a>
        </p>
      )}
      {organization.socialLinks && (
        <p>
          {Object.entries(organization.socialLinks).map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{ marginRight: "12px" }}
            >
              {platform}
            </a>
          ))}
        </p>
      )}
      <p>
        {organization.memberCount} members · {organization.postCount} posts
      </p>

      {canEdit && !editing && (
        <button style={styles.button} onClick={() => setEditing(true)}>
          Edit profile
        </button>
      )}

      {canEdit && editing && (
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
          <label style={styles.label}>
            Bio
            <textarea style={styles.textarea} {...register("bio")} />
          </label>
          {errors.bio && <p style={styles.errorText}>{errors.bio.message}</p>}

          <label style={styles.label}>
            Website URL
            <input style={styles.input} type="text" {...register("websiteUrl")} />
          </label>
          {errors.websiteUrl && <p style={styles.errorText}>{errors.websiteUrl.message}</p>}

          <label style={styles.label}>
            Cover image URL
            <input style={styles.input} type="text" {...register("coverImageUrl")} />
          </label>
          {errors.coverImageUrl && <p style={styles.errorText}>{errors.coverImageUrl.message}</p>}

          {error && <p style={styles.errorText}>{error}</p>}

          <div style={{ display: "flex", gap: "8px" }}>
            <button style={styles.button} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
            <button
              style={styles.secondaryButton}
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
