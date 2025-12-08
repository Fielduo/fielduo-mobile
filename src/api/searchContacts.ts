import { api } from "./cilent";

export interface Contact {
  id: string;
  name: string;
}

export const searchContacts = async (query: string): Promise<Contact[]> => {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  try {
    // Using your existing API wrapper (auto adds token)
    const data = await api.get<Contact[]>(`/contacts/search?q=${query}`);
    return data;
  } catch (error) {
    console.error("Error searching contacts:", error);
    return [];
  }
};
