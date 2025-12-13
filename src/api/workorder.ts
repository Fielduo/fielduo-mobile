import { api } from "./cilent";


export interface SearchResult {
  id: string;
  name: string;
}


export const searchUsers = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim() || query.length < 2) return [];
  try {
    const data = await api.get<SearchResult[]>(`/users/search?q=${encodeURIComponent(query)}`);
    return data;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};


export const searchCustomers = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim() || query.length < 2) return [];
  try {
    const data = await api.get<SearchResult[]>(`/accounts/search?q=${encodeURIComponent(query)}`);
    return data;
  } catch (error) {
    console.error("Error searching customers:", error);
    return [];
  }
};


export const searchAssets = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim() || query.length < 2) return [];
  try {
    const data = await api.get<SearchResult[]>(`/newassets/search?q=${encodeURIComponent(query)}`);
    return data;
  } catch (error) {
    console.error("Error searching assets:", error);
    return [];
  }
};


export const searchContacts = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim() || query.length < 2) return [];
  try {
    const data = await api.get<SearchResult[]>(`/contacts/search?q=${encodeURIComponent(query)}`);
    return data;
  } catch (error) {
    console.error("Error searching contacts:", error);
    return [];
  }
};
