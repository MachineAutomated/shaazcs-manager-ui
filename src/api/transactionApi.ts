import axios from "axios";
import { API_BASE_URL } from "../config";

export async function getSummary() {
    return axios.get(`${API_BASE_URL}/summary?year=2025&month=10`);
  }