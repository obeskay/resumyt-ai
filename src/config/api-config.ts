import axios from "axios";

// Configuración específica para el cliente
export const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configuración específica para el servidor
export const serverApi = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptores para manejo de errores
const errorHandler = (error: any) => {
  console.error("API Error:", error);
  return Promise.reject(error);
};

clientApi.interceptors.response.use((response) => response, errorHandler);
serverApi.interceptors.response.use((response) => response, errorHandler);
