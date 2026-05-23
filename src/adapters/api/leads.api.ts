import { apiFetch } from "@/adapters/api/http-client";
import { ConsultationRequest, LeadResponse } from "@/domain/lead";

export async function submitConsultation(data: ConsultationRequest) {
  return apiFetch<LeadResponse>("/api/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
