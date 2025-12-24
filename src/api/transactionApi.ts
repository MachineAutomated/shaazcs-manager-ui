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

// DELETE /transactions with body: ["id1","id2",...]
export async function deleteTransactions(
  ids: string[]
): Promise<{ ok: boolean; status: number; data?: any; message?: string }> {
  try {
    const res = await api.delete(`/transactions`, { data: ids });
    return { ok: true, status: res.status, data: res.data };
  } catch (err: any) {
    const status = err?.response?.status ?? 0;
    const message = err?.response?.data?.message ?? err?.message ?? "Unknown error";
    return { ok: false, status, message };
  }
}