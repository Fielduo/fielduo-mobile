import { api } from "./cilent";

export interface SearchResult {
  id: string;
  name: string;
  invoice_number?: string;
  customer_id?: {
    id: string;
    name: string;
  } | string | null;
  customer_name?: string;
  amount?: number | null;
}


export const getAllInvoices = async (
  query: string
): Promise<SearchResult[]> => {
  // If a query is provided, require at least 2 chars. Empty query means "fetch all".
  if (query && query.trim() && query.length < 2) return [];

  try {
    const data = await api.get<SearchResult[]>("/invoices");
    return data || [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
};

export const searchCustomersForPayment = async (
  query: string
): Promise<SearchResult[]> => {
  if (!query.trim() || query.length < 2) return [];

  try {
    return await api.get<SearchResult[]>(
      `/accounts/search?q=${encodeURIComponent(query)}`
    );
  } catch (error) {
    console.error("Error searching customers:", error);
    return [];
  }
};
