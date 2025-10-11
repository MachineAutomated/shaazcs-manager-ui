import React, { useEffect, useState } from "react";
import { getSummary } from "../api/transactionApi";
import type { SummaryItem } from "../models/SummaryItem";

const Summary: React.FC = () => {
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await getSummary();
        const data = response.data;

        // Transform backend response into array
        const transformed: SummaryItem[] = [];

        ["IN", "OUT"].forEach((type) => {
          const section = data[type];
          if (section) {
            Object.entries(section).forEach(([category, totalAmount]) => {
              transformed.push({
                type: type as "IN" | "OUT",
                category,
                totalAmount: Number(totalAmount),
              });
            });
          }
        });

        setSummary(transformed);
      } catch (err) {
        setError("Failed to fetch summary");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <p>Loading summary...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Monthly Summary</h2>
      <table style={{ borderCollapse: "collapse", width: "500px" }}>
        <thead>
          <tr>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((item, idx) => (
            <tr key={idx}>
              <td style={tdStyle}>{item.type}</td>
              <td style={tdStyle}>{item.category}</td>
              <td style={tdStyle}>{item.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
  background: "#f4f4f4",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
};

export default Summary;
