import axios from "axios";
import { API_BASE_URL } from "../config";

export async function saveTransaction(data: any) {
  return axios.post(`${API_BASE_URL}/saveTransaction`, data);
}

export async function getSummary() {
  return axios.get(`${API_BASE_URL}/summary?year=2025&month=10`);
}

export async function getTransactionsDetialsByMonth(year: number, month: number) {
  return axios.get(`${API_BASE_URL}/transactionDetails?year=${year}&month=${month}`)
}

export async function getMonthEndSummaryForMonth(year: number, month: number) {
  return axios.get(`${API_BASE_URL}/monthEnd?year=${year}&month=${month}`)
}