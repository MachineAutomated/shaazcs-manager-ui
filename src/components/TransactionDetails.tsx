import { useState, useEffect, useRef } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getTransactionsDetialsByMonth, deleteTransactions } from "../api/transactionApi";
import { Tag } from "primereact/tag";
import { Dialog } from 'primereact/dialog';
import TransactionForm from "./TransactionForm";
import { Toast } from "primereact/toast";

interface Transaction {
  Id: string;
  Item: string;
  Category: string;
  Amount: number;
  CreatedAt: string;
}

const TransactionDetails: React.FC = () => {
  const [saveTransactionsVisible, setSaveTransactionsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [ItemFilter, setItemFilter] = useState("");
  const [CategoryFilter, setCategoryFilter] = useState("");
  const [createdDateFilter, setCreatedDateFilter] = useState<Date | null>(null);
  const [createdTimeFilter, setCreatedTimeFilter] = useState<string>("");
  const [rowsPerPage, setRowsPerPage] = useState<number>(8);
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const toast = useRef<Toast | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);


  useEffect(() => {

    const calculateRows = () => {
      // Get viewport height in pixels
      const screenHeight = window.innerHeight;

      // Reserve space for header, filters, margins, etc.
      const usableHeight = screenHeight * 0.6; // same as our scrollHeight 60vh

      // Approximate height per row (tweaked based on DataTable size)
      const rowHeight = 38; // px per row (for size="small")
      const rows = Math.floor(usableHeight / rowHeight);

      setRowsPerPage(rows > 2 ? rows : 2); // at least 2 rows minimum


    };

    calculateRows();
    window.addEventListener("resize", calculateRows);
    return () => window.removeEventListener("resize", calculateRows);

  }, []);


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
      const normalized = (response.data || []).map((t: any) => ({
        Id: String(t.Id), // cast to string
        Item: t.Item ?? "",
        Category: t.Category ?? "",
        Amount: Number(t.Amount ?? 0),
        CreatedAt: t.CreatedAt ?? "",
      }));
      setTransactions(normalizeTransactions(normalized));

    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for deleting selected transactions
  const handleDeleteSelected = async () => {
    if (selectedTransactions.length === 0) {
      alert("No transactions selected for deletion.");
      return;
    }

    const ok = window.confirm(
      `Delete ${selectedTransactions.length} selected transaction(s)?`
    );
    if (!ok) return;

    const ids = selectedTransactions.map((tx) => tx.Id);
    const prev = transactions;

    // optional: show loading
    setLoading(true);

    try {
      const result = await deleteTransactions(ids);
      if (!result.ok) {
        // rollback on failure
        setTransactions(prev);
        if (result.status === 400) {
          alert(`Cannot delete: ${result.message || "Bad request."}`);
        } else if (result.status === 500) {
          alert(`Server error while deleting. Please try again.`);
        } else {
          alert(`Delete failed (${result.status || "network error"}): ${result.message}`);
        }
        return;
      }

      // success: remove deleted items and clear selection
      setTransactions((prev) => prev.filter((t) => !ids.includes(t.Id)));
      setSelectedTransactions([]);

      toast.current?.show({
        severity: "success",
        summary: "Deleted",
        detail: `Deleted ${ids.length} transaction(s).`,
        life: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for deleting a single transaction
  const handleDeleteTransaction = async (id: string, item: string) => {
    const ok = window.confirm(`Delete "${item}"?`);
    if (!ok) return;

    const prev = transactions;

    // optimistic update
    setTransactions((p) => p.filter((t) => t.Id !== id));
    // also remove from selection to avoid ghost selection
    setSelectedTransactions((sel) => sel.filter((t) => t.Id !== id));

    const result = await deleteTransactions([id]);
    if (!result.ok) {
      // rollback on failure
      setTransactions(prev);
      // restore selection if rollback
      setSelectedTransactions((sel) => {
        const wasDeletedSelected = sel.some((t) => t.Id === id);
        return wasDeletedSelected ? sel : [...sel, ...prev.filter((t) => t.Id === id)];
      });
      if (result.status === 400) {
        alert(`Cannot delete "${item}": ${result.message || "Bad request."}`);
      } else if (result.status === 500) {
        alert(`Server error while deleting "${item}". Please try again.`);
      } else {
        alert(`Delete failed (${result.status || "network error"}): ${result.message}`);
      }
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Deleted",
        detail: `Transaction "${item}" deleted.`,
        life: 2500,
      });
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

    // CreatedAt filter
    let dateMatch = true;
    if (createdDateFilter) {
      const txDate = parseDateString(tx.CreatedAt);
      if (txDate) {
        const filterDateStr = createdDateFilter.toLocaleDateString("en-GB"); // dd/mm/yyyy
        const txDateStr = txDate.toLocaleDateString("en-GB");

        if (filterDateStr !== txDateStr) {
          dateMatch = false;
        } else if (createdTimeFilter.trim()) {
          // Optional time filter (format: HH:mm)
          const [filterH, filterM] = createdTimeFilter.split(":").map(Number);
          dateMatch = txDate.getHours() === filterH && txDate.getMinutes() === filterM;
        }
      } else {
        dateMatch = false;
      }
    }

    return ItemMatch && CategoryMatch && dateMatch;
  });

  useEffect(() => {
  setSelectedTransactions((sel) =>
    sel.filter((s) => filteredTransactions.some((f) => f.Id === s.Id))
  );
}, [filteredTransactions]);


  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Toast container */}
      <Toast ref={toast} position="top-right" />
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", border: "4px solid transparent" }}>
        <Calendar
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.value as Date)}
          view="month"
          dateFormat="mm/yy"
          showIcon
          placeholder="Select Month & Year"
          style={{ width: "45%" }}
          inputStyle={{ backgroundColor: "#f8f9fa" }}
          className="p-calendar-custom"
        />
        <Button
          label="Fetch Transactions"
          icon="pi pi-search"
          onClick={handleFetch}
          loading={loading}
          className="p-button-rounded p-button-outlined"
        />

        <Button
          label={saveTransactionsVisible ? "Saving Transaction" : "Save Transaction"}
          icon="pi pi-save"
          onClick={() => {
            setEditingTransaction(null); //creat-new mode
            setSaveTransactionsVisible(true);
          }}
          loading={loading}
          className="p-button-rounded p-button-outlined"
        />

        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          onClick={handleDeleteSelected}
          className="p-button-rounded p-button-outlined p-button-danger"
          style={{ marginLeft: 8 }}
        />

        <Dialog
          header={editingTransaction ? "Edit Transaction" : "Save Transaction!"}
          visible={saveTransactionsVisible}
          style={{ width: '50vw' }}
          onHide={() => {
            if (!saveTransactionsVisible) return;
            setSaveTransactionsVisible(false);
            setEditingTransaction(null);
          }}>
          {editingTransaction ? (
            <TransactionForm
              initial={{
                Item: editingTransaction.Item,
                CategoryLabel: editingTransaction.Category,
                Amount: editingTransaction.Amount,
                CreatedAt: editingTransaction.CreatedAt,
              }}
              disableItem
              disableCategory
              defaultUpdateIfExists
              onClose={() => {
                setSaveTransactionsVisible(false);
                setEditingTransaction(null);
              }}
            />
          ) : (
            <TransactionForm
              onClose={() => {
                setSaveTransactionsVisible(false);
                setEditingTransaction(null);
              }}
            />
          )}
        </Dialog>

      </div>
      {/* Input boxes for filtering */}
      <div style={{ display: "flex", gap: ".5rem" }} className="filter-bar">
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
        <Calendar
          value={createdDateFilter}
          onChange={(e) => setCreatedDateFilter(e.value as Date)}
          dateFormat="dd/mm/yy"
          showIcon
          placeholder="Filter by Date"
          className="p-calendar-custom"
        />
        <input
          type="time"
          step="60" // step in seconds — here 60 means minutes precision
          value={createdTimeFilter}
          onChange={(e) => setCreatedTimeFilter(e.target.value)}
          style={{
            padding: "6px",
            flex: 0.6,
            fontFamily: "monospace",
            textAlign: "center",
          }}
        />
      </div>
      <DataTable
        value={filteredTransactions}
        paginator
        rows={rowsPerPage}
        stripedRows
        emptyMessage="No transactions found."
        size="small"
        selectionMode="multiple" // disambiguate row-multiple selection
        selection={selectedTransactions}
        onSelectionChange={(e) => {
          const next = Array.isArray(e.value) ? (e.value as Transaction[]) : [];
          setSelectedTransactions(next);
        }}
        dataKey="Id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
        <Column field="Item" header="Item" />
        <Column field="Category" header="Category" />
        <Column field="Amount" header="Amount" />
        <Column
          field="CreatedAt"
          header="Created At"
          body={(rowData) => dateTemplate(rowData.CreatedAt)}
        />
        <Column
          header="Actions"
          body={(rowData: Transaction) => (
            <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <i
                className="pi pi-pencil"
                style={{ color: "#1976d2", fontSize: "1.1rem", cursor: "pointer" }}
                title="Edit"
                onClick={() => {
                  setEditingTransaction(rowData);
                  setSaveTransactionsVisible(true);
                }}
              />
              <i
                className="pi pi-trash"
                style={{ color: "#d32f2f", fontSize: "1.1rem", cursor: "pointer" }}
                title="Delete"
                onClick={() => handleDeleteTransaction(rowData.Id, rowData.Item)}
              />
            </span>
          )}
        />
      </DataTable>
    </div>
  );
};

export default TransactionDetails;
