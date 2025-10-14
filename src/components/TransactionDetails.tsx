import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getTransactionsDetialsByMonth } from "../api/transactionApi";
import { Tag } from "primereact/tag";

interface Transaction {
  id: number;
  Item: string;
  Category: string;
  Amount: number;
  CreatedAt: string;
}

const TransactionDetails: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [ItemFilter, setItemFilter] = useState("");
  const [CategoryFilter, setCategoryFilter] = useState("");
  const [CreatedAtFilter, setCreatedAtFilter] = useState("");

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
      // normalize to avoid undefined fields
      const normalized = (response.data || []).map((t: Transaction) => ({
        ...t,
        Item: t.Item ?? "",
        Category: t.Category ?? "",
        
      }));
    setTransactions(normalizeTransactions(normalized));
    
    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

/**
 * Parse a date string that can be:
 * - "dd.MM.yyyy HH:mm:ss.SSS"
 * - "dd.MM.yyyy HH:mm:ss"
 * - ISO string (e.g. "2025-10-12T14:23:40.321Z") or any string accepted by Date
 *
 * Returns a Date object (local time). Returns null if it cannot parse.
 */
const parseDateString = (s: string): Date | null => {
  if (!s) return null;
  // Trim
  const str = s.trim();

  // Match dd.MM.yyyy HH:mm:ss(.SSS)?
  const dmyRegex = /^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})(?:\s+|T)(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/;
  const m = str.match(dmyRegex);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10); // 1-12
    const year = parseInt(m[3], 10);
    const hour = parseInt(m[4], 10);
    const minute = parseInt(m[5], 10);
    const second = parseInt(m[6], 10);
    const ms = m[7] ? parseInt(m[7].padEnd(3, "0"), 10) : 0;
    // create Date in local timezone with correct parts
    return new Date(year, month - 1, day, hour, minute, second, ms);
  }

  // Try ISO / other parseable strings
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  return null;
};

/** Format Date to "dd Mon yyyy, HH:mm:ss" plus milliseconds */
const formatDateForDisplay = (date: Date) => {
  const pad = (n: number, size = 2) => String(n).padStart(size, "0");
  const padMs = (n: number) => String(n).padStart(3, "0");

  const day = pad(date.getDate());
  const monthShort = date.toLocaleString("en-IN", { month: "short" }); // "Oct"
  const year = date.getFullYear();

  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const ms = padMs(date.getMilliseconds());

  return `${day} ${monthShort} ${year}, ${hh}:${mm}:${ss}.${ms}`;
};

const dateTemplate = (dateString: string) => {
  const parsed = parseDateString(dateString);
  if (!parsed) {
    // fallback: show original string
    return <span style={{ fontFamily: "monospace" }}>{dateString}</span>;
  }

  const formatted = formatDateForDisplay(parsed);

  return (
    <Tag
      icon="pi pi-calendar"
      value={formatted}
      severity="info"
      style={{
        backgroundColor: "#f3f5f7ff",
        color: "#004085",
        borderRadius: "10px",
        fontFamily: "monospace",
        fontSize: "0.9rem",
        padding: "6px 10px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    />
  );
};

  // Normalize fetched transactions to ensure Item/Category are strings
  const normalizeTransactions = (arr: Transaction[]): Transaction[] =>
    arr.map((t) => ({
      ...t,
      Item: t.Item ?? "",
      Category: t.Category ?? "",
  }));

  // Filter transactions dynamically based on input
  // Safe filtering (handles undefined/null values)
const filteredTransactions = transactions.filter((tx) => {
  const ItemVal = (tx.Item ?? "").toString().toLowerCase();
  const CategoryVal = (tx.Category ?? "").toString().toLowerCase();

  const ItemMatch = ItemVal.includes(ItemFilter.trim().toLowerCase());
  const CategoryMatch = CategoryVal.includes(CategoryFilter.trim().toLowerCase());

  return ItemMatch && CategoryMatch;
});


  return (
    <div style={{height:"100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
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
      {/* Input boxes for filtering */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Filter by Item"
          value={ItemFilter}
          onChange={(e) => setItemFilter(e.target.value)}
          style={{ padding: "6px", flex: 1 }}
        />
        <input
          type="text"
          placeholder="Filter by Category"
          value={CategoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: "6px", flex: 1 }}
        />
      </div>
      <DataTable
        value={filteredTransactions}
        paginator
        rows={8}
        stripedRows
        emptyMessage="No transactions found."
      >
      
        {/* <Column field="Item" header="ID" /> */}
        <Column field="Item" header="Item" />
        <Column field="Category" header="Category" />
        <Column field="Amount" header="Amount" />
        <Column
          field="CreatedAt"
          header="Created At"
          body={(rowData) => dateTemplate(rowData.CreatedAt)}
        />
      </DataTable>
    </div>
  );
};

export default TransactionDetails;
