import apiClient from "./apiClient";
import type {
  ApplicationStatus,
  ApplyOrgInput,
  OrgApplication,
  OrgApplicationDecisionInput,
  Organization,
  UpdateOrganizationInput,
} from "../types";

export async function applyToCreateOrg(input: ApplyOrgInput): Promise<OrgApplication> {
  const { data } = await apiClient.post<{ application: OrgApplication }>("/orgs/apply", input);
  return data.application;
}

export async function listOrgApplications(status?: ApplicationStatus): Promise<OrgApplication[]> {
  const { data } = await apiClient.get<{ applications: OrgApplication[] }>("/orgs/applications", {
    params: status ? { status } : undefined,
  });
  return data.applications;
}

export async function decideOrgApplication(
  applicationId: string,
  decision: OrgApplicationDecisionInput
): Promise<OrgApplication> {
  const { data } = await apiClient.patch<{ application: OrgApplication }>(
    `/orgs/applications/${applicationId}/decision`,
    decision
  );
  return data.application;
}

export async function getOrganization(id: string): Promise<Organization> {
  const { data } = await apiClient.get<{ organization: Organization }>(`/orgs/${id}`);
  return data.organization;
}

export async function updateOrganization(
  id: string,
  input: UpdateOrganizationInput
): Promise<Organization> {
  const { data } = await apiClient.patch<{ organization: Organization }>(`/orgs/${id}`, input);
  return data.organization;
}
