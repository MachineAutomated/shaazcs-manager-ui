import { useState, useEffect } from "react";
import { saveTransaction } from "../api/transactionApi";
import { getCategories, createCategories } from "../api/utilitiesApi";
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { objectToMap } from "../utils/utility";
import { Calendar } from 'primereact/calendar';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';

interface CategoryOption {
  label: string;
  value: number;
  type?: "IN" | "OUT";
}

type TransactionFormInitial = {
  Item?: string;
  CategoryLabel?: string; // matches TransactionDetails' Category string
  Amount?: number;
  CreatedAt?: string; // "dd.MM.yyyy HH:mm:ss.SSS" or ISO
};

type SavedTransactionPayload = {
  Id?: string;
  Item: string;
  CategoryLabel: string;
  Amount: number;
  CreatedAt?: string;
};

type CalendarInputEvent = {
  value?: Date | Date[] | null;
  target?: { value?: unknown };
};

interface TransactionFormProps {
  initial?: TransactionFormInitial;
  disableItem?: boolean;
  disableCategory?: boolean;
  defaultUpdateIfExists?: boolean;
  onClose?: () => void;
  onSaved?: (list: SavedTransactionPayload[]) => void; // NEW: notify parent
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  initial,
  disableItem = false,
  disableCategory = false,
  defaultUpdateIfExists = false,
  onClose,
  onSaved
}) => {
  const [Item, setDescription] = useState(initial?.Item ?? "");
  const [CategoryNumber, setCategoryNumber] = useState<number | null>(null);
  const [Amount, setAmount] = useState(
    initial?.Amount != null ? String(initial.Amount) : ""
  );
  const [UpdateIfExists, setUpdateIfExists] = useState(defaultUpdateIfExists);
  const [UseCreatedAt, setUseCreatedAt] = useState(Boolean(initial?.CreatedAt));
  const [CreatedAt, setCreatedAt] = useState<Date | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"IN" | "OUT">("IN");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const typeOptions: Array<{ label: string; value: "IN" | "OUT" }> = [
    { label: "IN", value: "IN" },
    { label: "OUT", value: "OUT" },
  ];

  const typeItemTemplate = (option: { label: string; value: "IN" | "OUT" }) => (
    <span
      style={{
        color: option.value === "IN" ? "#2e7d32" : "#d32f2f",
        fontWeight: 600,
        fontFamily: "monospace",
      }}
    >
      {option.value === "IN" ? "+" : "-"}
    </span>
  );

  const typeValueTemplate = (option?: { label: string; value: "IN" | "OUT" }) => (
    <span
      style={{
        color: (option?.value ?? newCategoryType) === "IN" ? "#2e7d32" : "#d32f2f",
        fontWeight: 600,
        fontFamily: "monospace",
      }}
    >
      {(option?.value ?? newCategoryType) === "IN" ? "+" : "-"}
    </span>
  );


    // Render '+' (green) or '-' (red) next to category names in the dropdown
    const categoryItemTemplate = (option: CategoryOption) => {
      const hasType = option.type === "IN" || option.type === "OUT";
      const symbol = option.type === "IN" ? "+" : option.type === "OUT" ? "-" : "";
      const color = option.type === "IN" ? "#2e7d32" : option.type === "OUT" ? "#d32f2f" : undefined;
      return (
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {hasType && (
            <span style={{ color, fontWeight: 600, fontFamily: "monospace" }}>{symbol}</span>
          )}
          <span>{option.label}</span>
        </span>
      );
    };
    const categoryValueTemplate = (option?: CategoryOption) => {
      if (!option) return <span>Category</span>;
      const hasType = option.type === "IN" || option.type === "OUT";
      const symbol = option.type === "IN" ? "+" : option.type === "OUT" ? "-" : "";
      const color = option.type === "IN" ? "#2e7d32" : option.type === "OUT" ? "#d32f2f" : undefined;
      return (
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {hasType && (
            <span style={{ color, fontWeight: 600, fontFamily: "monospace" }}>{symbol}</span>
          )}
          <span>{option.label}</span>
        </span>
      );
    };
  //Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const data = response?.data;
        let options: CategoryOption[] = [];

        if (Array.isArray(data)) {
          // New API shape: [{ id, name, type }]
          type CategoryResponse = { id: number | string; name: string; type?: string };
          options = (data as CategoryResponse[])
            .map((c) => ({
              label: String(c?.name ?? ""),
              value: Number(c?.id),
              type: c?.type === "IN" || c?.type === "OUT" ? (c.type as "IN" | "OUT") : undefined,
            }))
            .filter((o: CategoryOption) => !!o.label && !Number.isNaN(o.value));
        } else if (data && typeof data === "object") {
          // Back-compat: { "1": "GROCERY", ... }
          const map: Map<number, string> = objectToMap(data);
          options = Array.from(map, ([value, label]) => ({ label, value }));
        }

        setCategories(options);

        // If editing, set category by label
        if (initial?.CategoryLabel) {
          const found = options.find(
            (opt) => opt.label.toLowerCase() === initial.CategoryLabel!.toLowerCase()
          );
          if (found) setCategoryNumber(found.value);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [initial?.CategoryLabel]);

  // Parse initial CreatedAt to Date
  useEffect(() => {
    if (initial?.CreatedAt) {
      const parsed = parseToDate(initial.CreatedAt);
      if (parsed) {
        setCreatedAt(parsed);
        setFormattedDate(formatDisplay(parsed));
      }
    }
  }, [initial?.CreatedAt]);

  // Helpers for parsing/formatting (keep minimal)
  const parseToDate = (s: string): Date | null => {
    const dmy = /^(\d{1,2})[-./](\d{1,2})[-./](\d{4})(?:\s+|T)(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/;
    const m = s.trim().match(dmy);
    if (m) {
      const day = +m[1], mon = +m[2], yr = +m[3];
      const hh = +m[4], mm = +m[5], ss = +m[6];
      const ms = m[7] ? +(m[7].padEnd(3, "0")) : 0;
      return new Date(yr, mon - 1, day, hh, mm, ss, ms);
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };
  const formatDisplay = (date: Date) => {
    const pad = (n: number, size = 2) => String(n).padStart(size, "0");
    const padMs = (n: number) => String(n).padStart(3, "0");
    const day = pad(date.getDate());
    const mon = date.toLocaleString("en-IN", { month: "short" });
    const yr = date.getFullYear();
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const ms = padMs(date.getMilliseconds());
    return `${day} ${mon} ${yr}, ${hh}:${mm}:${ss}.${ms}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Item.trim()) {
      alert("Item is required.");
      return;
    }
    if (CategoryNumber == null) {
      alert("Category is required.");
      return;
    }

    // Always send CreatedAt:
    // - if UseCreatedAt is checked and a date is chosen -> use that
    // - otherwise -> use current date/time
    const effectiveDate = UseCreatedAt && CreatedAt ? CreatedAt : new Date();
    const formattedCreatedAt = formatDateTime(effectiveDate);

    const payload = {
      Item,
      CategoryNumber,
      Amount: Number(Amount),
      UpdateIfExists,
      UseCreatedAt,
      CreatedAt: formattedCreatedAt,
    };

    try {
      const res = await saveTransaction(payload);

      const catLabel =
        categories.find((c) => c.value === CategoryNumber)?.label ?? initial?.CategoryLabel ?? "";

      const saved: SavedTransactionPayload = {
        Id: res?.data?.Id ?? res?.data?.id,
        Item,
        CategoryLabel: catLabel,
        Amount: Number(Amount),
        CreatedAt: formattedCreatedAt,
      };

      onSaved?.([saved]);
      onClose?.();
    } catch (err) {
      console.error("Error saving transaction:", err);
      alert("Error saving transaction!");
    }
  };

  // function to format dd.MM.yyyy HH:mm:ss.SSS
  // Format Date + Time in required format
  const formatDateTime = (date: Date | null): string => {
    if (!date) return "";
    const pad = (num: number, size = 2) => String(num).padStart(size, "0");
    const padMs = (num: number) => String(num).padStart(3, "0");

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

  // Hybrid input handling:
  // - commit when the value is a valid Date
  // - clear only when input is emptied
  // - keep previous valid date during partial/invalid typing
  const handleDateChange = (e: CalendarInputEvent) => {
    if (e.value instanceof Date) {
      setCreatedAt(e.value);
      setFormattedDate(formatDateTime(e.value));
      return;
    }

    const targetValue = (e.target as { value?: unknown } | undefined)?.value;
    const rawText = typeof targetValue === "string" ? targetValue.trim() : "";
    if (!rawText) {
      setCreatedAt(null);
      setFormattedDate("");
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      alert("Category name is required.");
      return;
    }
    setCreatingCategory(true);
    try {
      await createCategories([{ Name: name, Type: newCategoryType }]);
      const resp = await getCategories();
      const data = resp?.data;
      let options: CategoryOption[] = [];
      if (Array.isArray(data)) {
        type CategoryResponse = { id: number | string; name: string; type?: string };
        options = (data as CategoryResponse[])
          .map((c) => ({
            label: String(c?.name ?? ""),
            value: Number(c?.id),
            type: c?.type === "IN" || c?.type === "OUT" ? (c.type as "IN" | "OUT") : undefined,
          }))
          .filter((o: CategoryOption) => !!o.label && !Number.isNaN(o.value));
      } else if (data && typeof data === "object") {
        const map: Map<number, string> = objectToMap(data);
        options = Array.from(map, ([value, label]) => ({ label, value }));
      }
      setCategories(options);
      const created = options.find((o) => o.label.toLowerCase() === name.toLowerCase());
      if (created) setCategoryNumber(created.value);
      setNewCategoryName("");
    } catch (err) {
      console.error("Error creating category:", err);
      alert("Failed to create category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card ">
      <div className="card flex justify-content-center">
        <InputText
          type="text"
          className="transaction-form-components"
          value={Item}
          placeholder="Item Name"
          onChange={(e) => setDescription(e.target.value)}
          disabled={disableItem}
        />
      </div>
      {/* Category dropdown */}
      {loadingCategories ? (
        <p>Loading categories...</p>
      ) : (
        <div
          className="transaction-form-components"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            flexWrap: "nowrap",
            justifyContent: "flex-start",
            width: "100%",
            
            padding: "0",
            overflowX: "auto",
          }}
        >
          <Dropdown
            value={CategoryNumber}
            options={categories}
            onChange={(e) => setCategoryNumber(e.value)}
            disabled={disableCategory || loadingCategories}
            placeholder="Category"
            filter
            showClear
            className="centered-dropdown"
            itemTemplate={categoryItemTemplate}
            valueTemplate={categoryValueTemplate}
            style={{ minWidth: "50%", height: "2.5rem"}}
          />
          <InputText
            type="text"
            className="transaction-form-components"
            value={newCategoryName}
            placeholder="New Category"
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{ width: "30%", height: "2.5rem" }}
          />
          <Dropdown
            value={newCategoryType}
            options={typeOptions}
            className="centered-dropdown"
            onChange={(e) => setNewCategoryType(e.value)}
            placeholder="Type"
            style={{ width: "12%",  height: "2.5rem"}}
            itemTemplate={typeItemTemplate}
            valueTemplate={typeValueTemplate}
          />
          <Button
            icon="pi pi-plus"
            className="p-button-rounded p-button-outlined"
            disabled={creatingCategory}
            onClick={handleAddCategory}
            style={{ padding: "0.25rem 0.6rem", height: "2.2rem" }}
            aria-label="Add Category"
          />
        </div>
      )}
      <div className="card flex justify-content-center">
        <InputText
          type="number"
          className="transaction-form-components"
          value={Amount}
          placeholder="Amount"
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="card flex align-left" style={{ flexDirection: "row" }} >
        <Checkbox
          className="ml-2"
          id='updateIfExistsCheck'
          onChange={(e) => setUpdateIfExists(!!e.target.checked)}
          checked={UpdateIfExists}
          style={{ marginLeft: "0px" }}
        >
        </Checkbox>
        <label htmlFor="updateIfExistsCheck" className="ml-2" >Update If Exists</label>


        {/* UseCreatedAt checkbox + Calendar */}

        <Checkbox
          className="ml-2"
          id='useCreatedAtCheck'
          onChange={(e) => setUseCreatedAt(!!e.target.checked)}
          checked={UseCreatedAt}
          style={{ marginLeft: "30%" }}
        >
        </Checkbox>

        <label htmlFor="useCreatedAtCheck" className="ml-2"
          style={{ marginBottom: "10px" }}
        >
          Use CreatedAt Time
        </label>

      </div>
      <div className="card flex justify-content-center">
        {UseCreatedAt && (


          <FloatLabel >
            <Calendar
              id="createdAtdisplay"
              className="transaction-form-components"
              value={CreatedAt}
              onChange={handleDateChange}
              keepInvalid
              showTime
              hourFormat="24"
              dateFormat="dd.mm.yy"
              style={{ marginTop: "30px" }}
            />
            <label htmlFor="createdAtdisplay" className="font-bold block" style={{ paddingLeft: "40px", paddingBottom: "5px" }}>
              Using Created At
            </label>
            <p style={{ fontSize: "12px", color: "gray" }}>
              {formattedDate
                ? `Selected: ${formattedDate}`
                : "No date selected"}
            </p>
          </FloatLabel>
        )}

        <Button
          icon="pi pi-send"
          label="Submit"
          className="p-button-rounded p-button-outlined"
        />

      </div>
    </form>
  );
};

export default TransactionForm;
