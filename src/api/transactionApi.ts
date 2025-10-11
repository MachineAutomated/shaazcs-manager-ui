import axios from "axios";
import { API_BASE_URL } from "../config";

export async function saveTransaction(data: any) {
    return axios.post(`${API_BASE_URL}/saveTransaction`, data);
  }

export async function getSummary() {
    return axios.get(`${API_BASE_URL}/summary?year=2025&month=10`);
  }