import React, { useState, useEffect } from "react";
import { saveTransaction } from "../api/transactionApi";
import { getCategories } from "../api/utilitiesApi";

const TransactionForm: React.FC = () => {
    const [Item, setDescription] = useState("");
    const [CategoryNumber, setCategoryNumber] = useState("")
    const [Amount, setAmount] = useState("");
    const [UpdateIfExists, setUpdateIfExists] = useState(false);
    const [UseCreatedAt, setUseCreatedAt] = useState(false);
    const [CreatedAt, setCreatedAt] = useState("");
    const [categories, setCategories] = useState<{ [key: string]: string }>({});
    const [loadingCategories, setLoadingCategories] = useState(true);

     //Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data);
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
            UpdateIfExists,
        };
    
        if (UseCreatedAt && CreatedAt) {
            payload.CreatedAt = CreatedAt;
        }
        const response = await saveTransaction(payload);
      console.log("Saved:", response.data);
      alert("Transaction saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving transaction!");
    }
  };

  // Utility function to format datetime-local input to dd.MM.yyyy HH:mm:ss.SSS
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    const pad = (n: number, z = 2) => ('00' + n).slice(-z);
    return (
      `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` +
      `${pad(date.getMilliseconds(), 3)}`
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px", width: "250px" }}>
      <input
        type="text"
        placeholder="Item Name"
        value={Item}
        onChange={(e) => setDescription(e.target.value)}
      />
      {/* Category dropdown */}
      {loadingCategories ? (
        <p>Loading categories...</p>
        ) : (
        <select
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
        </select>
      )}
      <input
        type="number"
        placeholder="Amount"
        value={Amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input
          type="checkbox"
          checked={UpdateIfExists}
          onChange={(e) => setUpdateIfExists(e.target.checked)}
        />
        Update If Exists
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input
          type="checkbox"
          checked={UseCreatedAt}
          onChange={(e) => setUseCreatedAt(e.target.checked)}
        />
        Use CreatedAt Time
      </label>

      {UseCreatedAt && (
        <input
          type="datetime-local"
          value={CreatedAt}
          onChange={(e) => setCreatedAt(formatDateTime(e.target.value))}
        />
      )}

      <button type="submit">Save</button>
    </form>
  );
};

export default TransactionForm;
