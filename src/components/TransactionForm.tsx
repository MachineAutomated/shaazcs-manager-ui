import { useState, useEffect } from "react";
import { saveTransaction } from "../api/transactionApi";
import { getCategories } from "../api/utilitiesApi";
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

interface TransactionFormProps {
  initial?: TransactionFormInitial;
  disableItem?: boolean;
  disableCategory?: boolean;
  defaultUpdateIfExists?: boolean;
  onClose?: () => void;
  onSaved?: (list: SavedTransactionPayload[]) => void; // NEW: notify parent
}

// interface TransactionFormProps {
//   initial?: TransactionFormInitial;
//   disableItem?: boolean;
//   disableCategory?: boolean;
//   defaultUpdateIfExists?: boolean;
//   onClose?: () => void;
// }

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

  //Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // const response = await getCategories();
        const response = await getCategories();
        const map: Map<number, string> = objectToMap(response.data);
        // Convert Map → array for PrimeReact dropdown
        const options: CategoryOption[] = Array.from(map, ([value, label]) => ({
          label,
          value,
        }));
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
    const dmy = /^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})(?:\s+|T)(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/;
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

  // Calendar change handler
  const handleDateChange = (e: any) => {
    const selectedDate = e.value as Date;
    setCreatedAt(selectedDate);
    const formatted = formatDateTime(selectedDate);
    setFormattedDate(formatted);
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
        <div className="card flex justify-content-center">
          <Dropdown
            value={CategoryNumber}
            options={categories}
            onChange={(e) => setCategoryNumber(e.value)}
            disabled={disableCategory || loadingCategories}
            placeholder="Select Category"
            filter     // enables search
            showClear  // adds clear (X) button
            className="transaction-form-components"
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
