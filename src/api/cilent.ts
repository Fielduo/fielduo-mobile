import axios, { AxiosInstance, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

class ApiWrapper {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: "http://10.0.2.2:5000/v1",   //https://fielduo.com/v1

      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    });


    this.axiosInstance.interceptors.request.use(
      async (config: any) => {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return config;
      },
      (error) => Promise.reject(error)
    );


    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }


  getBaseUrl() {
    return this.axiosInstance.defaults.baseURL || "";
  }


  async get<T>(url: string): Promise<T> {
    const res = await this.axiosInstance.get<T>(url);
    return res.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const res = await this.axiosInstance.post<T>(url, data, config);
    return res.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const res = await this.axiosInstance.put<T>(url, data, config);
    return res.data;
  }

  async delete<T>(url: string): Promise<T> {
    const res = await this.axiosInstance.delete<T>(url);
    return res.data;
  }


  async postMultipart<T>(url: string, formData: FormData): Promise<T> {
    const res = await this.axiosInstance.post<T>(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  async putMultipart<T>(url: string, formData: FormData): Promise<T> {
    const res = await this.axiosInstance.put<T>(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }


  async setToken(token: string) {
    await AsyncStorage.setItem("authToken", token);
  }

  async clearToken() {
    await AsyncStorage.removeItem("authToken");
  }
}

export const api = new ApiWrapper();
