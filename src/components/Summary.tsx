import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { getSummary } from "../api/transactionApi";
import type { SummaryItem } from "../models/SummaryItem";

interface TotalSummary {
  IN: number;
  OUT: number;
  Leftover: number;
}

const Summary: React.FC = () => {
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [totals, setTotals] = useState<TotalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await getSummary();
        const data = response.data;

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
        setTotals(data.TotalSummary || null);
      } catch (err) {
        console.error("Error fetching summary:", err);
        setError("Failed to fetch summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading)
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ height: "200px" }}
      >
        <ProgressSpinner />
      </div>
    );

  if (error) return <p>{error}</p>;

  const typeBodyTemplate = (rowData: SummaryItem) => (
    <Tag
      value={rowData.type}
      severity={rowData.type === "IN" ? "success" : "danger"}
    />
  );

  const amountTemplate = (rowData: SummaryItem) => (
    <span style={{ fontWeight: 500 }}>
      ₹{rowData.totalAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}
    </span>
  );

  return (
    <div
      className="p-3"
      style={{
        height: "calc(100vh - 100px)",
        overflow: "auto",
        boxSizing: "border-box"
      }}
    >
      <Card 
        className="shadow-3 p-3"
        style={{height:"100%"}}
      >
        {totals && (
          <div
            className="flex justify-content-around align-items-center text-center mb-4 flex-wrap"
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              textAlign: "center",
              backgroundColor: "#f8f9fa",
              padding: "1rem",
              borderRadius: "10px",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            
            <div style={{width:"30%"}}>
              <h4 style={{ color: "green", margin: 0 }}>Total IN</h4>
              <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                ₹{totals.IN.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{width:"30%"}}>
              <h4 style={{ color: "red", margin: 0 }}>Total OUT</h4>
              <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                ₹{totals.OUT.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{width:"30%"}}>
              <h4 style={{ color: "blue", margin: 0 }}>Leftover</h4>
              <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                ₹{totals.Leftover.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        )}

        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <DataTable
            value={summary}
            paginator
            rows={8}
            scrollable
            scrollHeight="60vh"
            stripedRows
            responsiveLayout="scroll"
            emptyMessage="No summary data found."
            style={{ minWidth: "450px" }}
          >
            <Column
              field="type"
              header="Type"
              body={typeBodyTemplate}
              style={{ width: "100px" }}
            />
            <Column field="category" header="Category" />
            <Column
              field="totalAmount"
              header="Total Amount"
              body={amountTemplate}
              style={{ textAlign: "right", width: "150px" }}
            />
          </DataTable>
        </div>
      </Card>
    </div>
  );
};

export default Summary;
