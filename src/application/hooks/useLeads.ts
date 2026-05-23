"use client";

import { useState } from "react";
import { submitConsultation } from "@/adapters/api/leads.api";
import { ConsultationRequest, LeadResponse } from "@/domain/lead";

export function useLeads() {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async (data: ConsultationRequest): Promise<LeadResponse> => {
    setIsMutating(true);
    setError(null);
    try {
      const response = await submitConsultation(data);
      setIsMutating(false);
      return response;
    } catch (err) {
      setIsMutating(false);
      setError(err instanceof Error ? err : new Error("Failed to submit consultation"));
      throw err;
    }
  };

  return {
    submit,
    isMutating,
    error,
  };
}
