import api from "./api";

export async function saveTransaction(data: any) {
  return api.post(`/saveTransaction`, data);
}

export async function getSummary(year: number, month: number) {
  //Todo: Remove hardcoded year and month
  return api.get(`/summary?year=${year}&month=${month}`);
}

export async function getTransactionsDetialsByMonth(year: number, month: number) {
  return api.get(`/transactionDetails?year=${year}&month=${month}`)
}

export async function getMonthEndSummaryForMonth(year: number, month: number) {
  return api.get(`/monthEnd?year=${year}&month=${month}`)
}