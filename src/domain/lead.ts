export interface ConsultationRequest {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string; // e.g. "product_page", "contact_page"
  productId?: string; // if from a specific product
}

export interface LeadResponse {
  id: string;
  status: "pending" | "contacted" | "resolved" | "junk";
  createdAt: string;
  request: ConsultationRequest;
}
