import React, { useState, useEffect } from "react";
import { saveTransaction } from "../api/transactionApi";
import { getCategories } from "../api/utilitiesApi";
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { objectToMap } from "../utils/utility";
import { Calendar } from 'primereact/calendar';
        
interface CategoryOption {
  label: string;
  value: number;
}

const TransactionForm: React.FC = () => {
    const [Item, setDescription] = useState("");
    const [CategoryNumber, setCategoryNumber] = useState<number | null>(null);
    const [Amount, setAmount] = useState("");
    const [UpdateIfExists, setUpdateIfExists] = useState(false);
    const [UseCreatedAt, setUseCreatedAt] = useState(false);
    const [CreatedAt, setCreatedAt] = useState<Date | null>(null);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [formattedDate, setFormattedDate] = useState<string>("");

     //Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                const map = objectToMap(response.data);
                // Convert Map → array for PrimeReact dropdown
                const options: CategoryOption[] = Array.from(map, ([value, label]) => ({
                  label,
                  value,
                }));
                setCategories(options);
            } catch (err) {
                console.error("Error fetching categories:", err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const payload: any = {
            Item,
            CategoryNumber,
            Amount,
            UpdateIfExists
        };
    
        if (UseCreatedAt && formattedDate) {
            payload.CreatedAt = formattedDate;
        }
        const response = await saveTransaction(payload);
      console.log("Saved:", response.data);
      alert("Transaction saved successfully!");
    } catch (err) {
      console.error(err);
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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px", width: "250px" }}>
      <div className="card flex justify-content-center">
        <InputText
            type="text"
            className="p-inputtext-sm"
            value={Item} 
            placeholder="Item Name"
            onChange={(e) => setDescription(e.target.value)}
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
        placeholder="Select Category"
        filter     // enables search
        showClear  // adds clear (X) button
        className="w-full md:w-14rem"
      />
        {/* <Dropdown 
          value={CategoryNumber} 
          onChange={(e) => setCategoryNumber(e.target.value)}
          required
          options={
              Object.entries(categories).values.values().map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))

          } 
          optionLabel="Select Category" 
          placeholder="Select Category" className="w-full md:w-14rem" 
        /> */}
        {/* <select
          value={CategoryNumber}
          onChange={(e) => setCategoryNumber(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {Object.entries(categories).map(([number, name]) => (
            <option key={number} value={number}>
              {name}
            </option>
          ))}
        </select> */}
        </div>
      )}
      <div className="card flex justify-content-center">
        <InputText
            type="number"
            className="p-inputtext-sm"
            value={Amount}
            placeholder="Amount"
            onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div className="card flex justify-content-center">
            <Checkbox onChange={(e) => setUpdateIfExists(e.target.checked)} checked={UpdateIfExists}></Checkbox>
        </div>
        {/* <input
          type="checkbox"
          checked={UpdateIfExists}
          onChange={(e) => setUpdateIfExists(e.target.checked)}
        /> */}
        Update If Exists
      </label>
      {/* UseCreatedAt checkbox + Calendar */}
      <div>
          <div className="card flex justify-content-center">
            <Checkbox onChange={(e) => setUseCreatedAt(e.target.checked)} checked={UseCreatedAt}></Checkbox>
        </div>
        Use CreatedAt Time
        {UseCreatedAt && (
          <div className="mt-2">
            <Calendar
              value={CreatedAt}
              onChange={handleDateChange}
              showTime
              showSeconds
              hourFormat="24"
              showIcon
              dateFormat="dd.mm.yy"
            />
            <p style={{ fontSize: "12px", color: "gray" }}>
              {formattedDate
                ? `Selected: ${formattedDate}`
                : "No date selected"}
            </p>
          </div>
        )}
      </div>

        {/* {UseCreatedAt && (
        <Calendar
        value={CreatedAt}
        onChange={handleChange}
        showTime           // 👈 enables time selection
        hourFormat="24"    // can be "12" or "24"
        dateFormat="dd.mm.yy"
        showIcon
      /> */}
        {/* // <input
        //   type="datetime-local"
        //   value={CreatedAt}
        //   onChange={(e) => setCreatedAt(formatDateTime(e.target.value))}
        // /> */}
        
      
      {/* // )} */}

      <button type="submit">Save</button>
    </form>
  );
};

export default TransactionForm;
