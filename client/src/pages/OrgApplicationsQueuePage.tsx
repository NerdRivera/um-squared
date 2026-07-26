import { useCallback, useEffect, useState } from "react";
import { orgService } from "../services";
import { ApplicationStatus, type OrgApplication } from "../types";
import { getErrorMessage } from "../utils/errors";
import * as styles from "../styles/shared";

const STATUS_FILTERS: Array<ApplicationStatus | "ALL"> = [
  "ALL",
  ApplicationStatus.PENDING,
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
];

export function OrgApplicationsQueuePage() {
  const [applications, setApplications] = useState<OrgApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    ApplicationStatus.PENDING
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectReasonDrafts, setRejectReasonDrafts] = useState<Record<string, string>>({});

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = statusFilter === "ALL" ? undefined : statusFilter;
      setApplications(await orgService.listOrgApplications(status));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function handleApprove(id: string) {
    setActioningId(id);
    setError(null);
    try {
      await orgService.decideOrgApplication(id, { status: ApplicationStatus.APPROVED });
      await loadApplications();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: string) {
    const rejectedReason = rejectReasonDrafts[id]?.trim();
    if (!rejectedReason) {
      setError("A reason is required to reject an application");
      return;
    }
    setActioningId(id);
    setError(null);
    try {
      await orgService.decideOrgApplication(id, {
        status: ApplicationStatus.REJECTED,
        rejectedReason,
      });
      await loadApplications();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div style={{ ...styles.page, maxWidth: "800px" }}>
      <h1>Organization applications</h1>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            style={status === statusFilter ? styles.button : styles.secondaryButton}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && applications.length === 0 && <p>No applications found.</p>}

      {applications.map((application) => (
        <div key={application.id} style={styles.card}>
          <h3 style={{ margin: "0 0 8px" }}>{application.organizationName}</h3>
          <p style={{ margin: "0 0 4px" }}>
            <strong>Category:</strong> {application.category}
          </p>
          <p style={{ margin: "0 0 4px" }}>
            <strong>Contact:</strong> {application.contactInfo}
          </p>
          <p style={{ margin: "0 0 4px" }}>{application.description}</p>
          <p style={{ margin: "0 0 8px" }}>
            <strong>Status:</strong> {application.status}
            {application.rejectedReason && ` — ${application.rejectedReason}`}
          </p>

          {application.status === ApplicationStatus.PENDING && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                style={styles.input}
                type="text"
                placeholder="Rejection reason (required to reject)"
                value={rejectReasonDrafts[application.id] ?? ""}
                onChange={(e) =>
                  setRejectReasonDrafts((prev) => ({
                    ...prev,
                    [application.id]: e.target.value,
                  }))
                }
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  style={styles.button}
                  disabled={actioningId === application.id}
                  onClick={() => handleApprove(application.id)}
                >
                  Approve
                </button>
                <button
                  style={styles.secondaryButton}
                  disabled={actioningId === application.id}
                  onClick={() => handleReject(application.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
