import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getTransactionsDetialsByMonth } from "../api/transactionApi";

interface Transaction {
  id: number;
  item: string;
  category: string;
  amount: number;
  createdAt: string;
}

const TransactionDetails: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!selectedDate) {
      alert("Please select a month and year!");
      return;
    }

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    try {
      setLoading(true);
      const response = await getTransactionsDetialsByMonth(year, month);
      setTransactions(response.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Calendar
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.value as Date)}
          view="month"
          dateFormat="mm/yy"
          showIcon
          placeholder="Select Month & Year"
          style={{width:"45%"}}
          inputStyle={{ backgroundColor: "#f8f9fa" }}
          className="p-calendar-custom"
        />
        <Button
          label="Fetch Transactions"
          icon="pi pi-search"
          onClick={handleFetch}
          loading={loading}
          style={{ backgroundColor:"skyblue", borderColor:"black"}}
        />
      </div>

      <DataTable
        value={transactions}
        paginator
        rows={10}
        stripedRows
        emptyMessage="No transactions found."
      >
        {/* <Column field="Item" header="ID" /> */}
        <Column field="Item" header="Item" />
        <Column field="Category" header="Category" />
        <Column field="Amount" header="Amount" />
        <Column field="CreatedAt" header="Created At" />
      </DataTable>
    </div>
  );
};

export default TransactionDetails;
