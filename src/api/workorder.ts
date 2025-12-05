import { api } from "../api/client";

export interface SearchResult {
  id: string;
  name: string;
}

// 🔍 Search Users
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

// 🔍 Search Customers (Accounts)
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

// 🔍 Search Assets
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

// 🔍 Search Contacts (already done)
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
