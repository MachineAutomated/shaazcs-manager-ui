import { useState, useEffect, useRef } from "react";
import { saveTransactionsBulk } from "../api/transactionApi";
import { getCategories } from "../api/utilitiesApi";
import { objectToMap } from "../utils/utility";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

interface CategoryOption {
  label: string;
  value: string; // label string — bulk API uses Category name, not ID
  type?: "IN" | "OUT";
}

interface BulkRow {
  _id: string; // client-side only, not sent to backend
  Item: string;
  CategoryLabel: string;
  Amount: string;
  CreatedAt: Date | null;
  errors: Partial<Record<"Item" | "CategoryLabel" | "Amount" | "CreatedAt", string>>;
}

interface BulkTransactionFormProps {
  onClose?: () => void;
  onSaved?: (count: number) => void;
}

type CalendarInputEvent = {
  value?: Date | Date[] | null;
  target?: { value?: unknown };
};

const hasCompleteTypedTime = (raw: string) => /(^|\s|T)\d{1,2}:\d{2}(?::\d{2})?(\.\d{1,3})?$/.test(raw.trim());

// ── helpers ────────────────────────────────────────────────────────────────

const makeRow = (): BulkRow => ({
  _id: crypto.randomUUID(),
  Item: "",
  CategoryLabel: "",
  Amount: "",
  CreatedAt: null,
  errors: {},
});

const formatDateTime = (date: Date): string => {
  const pad = (n: number, size = 2) => String(n).padStart(size, "0");
  const padMs = (n: number) => String(n).padStart(3, "0");
  return (
    `${pad(date.getDate())}.` +
    `${pad(date.getMonth() + 1)}.` +
    `${date.getFullYear()} ` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}:` +
    `${pad(date.getSeconds())}.` +
    `${padMs(date.getMilliseconds())}`
  );
};

const validateRow = (row: BulkRow): BulkRow["errors"] => {
  const errors: BulkRow["errors"] = {};
  if (!row.Item.trim()) errors.Item = "Required";
  if (!row.CategoryLabel) errors.CategoryLabel = "Required";
  if (!row.Amount.trim() || isNaN(Number(row.Amount))) errors.Amount = "Invalid";
  return errors;
};

// ── component ──────────────────────────────────────────────────────────────

const INITIAL_ROWS = 5;

const BulkTransactionForm: React.FC<BulkTransactionFormProps> = ({ onClose, onSaved }) => {
  const [rows, setRows] = useState<BulkRow[]>(() =>
    Array.from({ length: INITIAL_ROWS }, makeRow)
  );
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // One ref per row — read from DOM directly so it works in both dev and prod builds.
  const dateInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── load categories ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const data = response?.data;
        let options: CategoryOption[] = [];

        if (Array.isArray(data)) {
          type CR = { id: number | string; name: string; type?: string };
          options = (data as CR[])
            .map((c) => ({
              label: String(c?.name ?? ""),
              value: String(c?.name ?? ""), // use label as value — bulk API expects name string
              type: c?.type === "IN" || c?.type === "OUT" ? (c.type as "IN" | "OUT") : undefined,
            }))
            .filter((o) => !!o.label);
        } else if (data && typeof data === "object") {
          const map: Map<number, string> = objectToMap(data);
          options = Array.from(map, ([, label]) => ({ label, value: label }));
        }

        setCategories(options);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // ── row helpers ──────────────────────────────────────────────────────────
  const updateRow = <K extends keyof BulkRow>(index: number, field: K, value: BulkRow[K]) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value, errors: { ...next[index].errors, [field]: undefined } };
      return next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, makeRow()]);

  const deleteRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleRowDateChange = (index: number, e: CalendarInputEvent) => {
    const rawText = dateInputRefs.current[index]?.value?.trim() ?? "";

    if (e.value instanceof Date) {
      if (rawText && !hasCompleteTypedTime(rawText)) {
        return;
      }
      updateRow(index, "CreatedAt", e.value);
      return;
    }

    if (!rawText) {
      updateRow(index, "CreatedAt", null);
    }
  };

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // validate all rows
    const validated = rows.map((row) => ({ ...row, errors: validateRow(row) }));
    const hasErrors = validated.some((r) => Object.keys(r.errors).length > 0);
    if (hasErrors) {
      setRows(validated);
      return;
    }

    const payload = rows.map((row) => ({
      Item: row.Item.trim(),
      Category: row.CategoryLabel,
      Amount: Number(row.Amount),
      ...(row.CreatedAt ? { CreatedAt: formatDateTime(row.CreatedAt) } : {}),
    }));

    setSubmitting(true);
    try {
      await saveTransactionsBulk(payload);
      onSaved?.(payload.length);
      onClose?.();
    } catch (err) {
      console.error("Bulk save error:", err);
      alert("Failed to save transactions. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── category templates ───────────────────────────────────────────────────
  const categoryItemTemplate = (option: CategoryOption) => {
    const symbol = option.type === "IN" ? "+" : option.type === "OUT" ? "-" : "";
    const color = option.type === "IN" ? "#2e7d32" : option.type === "OUT" ? "#d32f2f" : undefined;
    return (
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {symbol && <span style={{ color, fontWeight: 600, fontFamily: "monospace" }}>{symbol}</span>}
        <span>{option.label}</span>
      </span>
    );
  };

  const categoryValueTemplate = (option?: CategoryOption) => {
    if (!option) return <span style={{ color: "#9e9e9e" }}>Category</span>;
    const symbol = option.type === "IN" ? "+" : option.type === "OUT" ? "-" : "";
    const color = option.type === "IN" ? "#2e7d32" : option.type === "OUT" ? "#d32f2f" : undefined;
    return (
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {symbol && <span style={{ color, fontWeight: 600, fontFamily: "monospace" }}>{symbol}</span>}
        <span>{option.label}</span>
      </span>
    );
  };

  // ── valid row count for footer summary ───────────────────────────────────
  const validCount = rows.filter((r) => Object.keys(validateRow(r)).length === 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {loadingCategories ? (
        <p>Loading categories…</p>
      ) : (
        <>
          {/* ── table header ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1.8fr auto",
              gap: "6px",
              fontWeight: 600,
              fontSize: "0.8rem",
              color: "#555",
              padding: "0 4px",
            }}
          >
            <span>Item Name</span>
            <span>Category</span>
            <span>Amount</span>
            <span>Created At</span>
            <span />
          </div>

          {/* ── rows ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              maxHeight: "55vh",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {rows.map((row, index) => (
              <div
                key={row._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr 1.8fr auto",
                  gap: "6px",
                  alignItems: "start",
                }}
              >
                {/* Item */}
                <div>
                  <InputText
                    value={row.Item}
                    placeholder="Item Name"
                    onChange={(e) => updateRow(index, "Item", e.target.value)}
                    className={row.errors.Item ? "p-invalid" : ""}
                    style={{ width: "100%", height: "2.2rem" }}
                  />
                </div>

                {/* Category */}
                <div>
                  <Dropdown
                    value={row.CategoryLabel}
                    options={categories}
                    onChange={(e) => updateRow(index, "CategoryLabel", e.value)}
                    placeholder="Category"
                    filter
                    showClear
                    itemTemplate={categoryItemTemplate}
                    valueTemplate={categoryValueTemplate}
                    className={row.errors.CategoryLabel ? "p-invalid" : ""}
                    style={{ width: "100%", height: "2.2rem" }}
                  />
                </div>

                {/* Amount */}
                <div>
                  <InputText
                    type="number"
                    value={row.Amount}
                    placeholder="Amount"
                    onChange={(e) => updateRow(index, "Amount", e.target.value)}
                    className={row.errors.Amount ? "p-invalid" : ""}
                    style={{ width: "100%", height: "2.2rem" }}
                  />
                </div>

                {/* Created At */}
                <div>
                  <Calendar
                    value={row.CreatedAt}
                    onChange={(e) => handleRowDateChange(index, e)}
                    inputRef={(el) => { dateInputRefs.current[index] = el; }}
                    keepInvalid
                    showTime
                    hourFormat="24"
                    dateFormat="dd.mm.yy"
                    placeholder="Date & Time"
                    className={row.errors.CreatedAt ? "p-invalid" : ""}
                    inputStyle={{ height: "2.2rem", width: "100%" }}
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Delete row */}
                <Button
                  icon="pi pi-times"
                  className="p-button-rounded p-button-text p-button-danger"
                  onClick={() => deleteRow(index)}
                  style={{ height: "2.2rem", width: "2.2rem", padding: 0 }}
                  aria-label="Remove row"
                />
              </div>
            ))}
          </div>

          {/* ── footer ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.5rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "#555" }}>
              {rows.length} row{rows.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
              <span style={{ color: "#2e7d32", fontWeight: 600 }}>{validCount} ready</span>
              {rows.length - validCount > 0 && (
                <span style={{ color: "#d32f2f", fontWeight: 600 }}>
                  &nbsp;·&nbsp;{rows.length - validCount} incomplete
                </span>
              )}
            </span>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button
                icon="pi pi-plus"
                label="Add Row"
                className="p-button-rounded p-button-outlined"
                onClick={addRow}
                style={{ height: "2.2rem" }}
              />
              <Button
                icon="pi pi-send"
                label={submitting ? "Saving…" : `Save All (${rows.length})`}
                className="p-button-rounded p-button-outlined"
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting}
                style={{ height: "2.2rem" }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BulkTransactionForm;
