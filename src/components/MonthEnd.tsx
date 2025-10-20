import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Calendar } from "primereact/calendar";
import { getMonthEndSummaryForMonth } from "../api/transactionApi";


const MonthEnd: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [monthEndExists, setMonthEndExists] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
  
    const handleCheckMonthEnd = async () => {
      if (!selectedDate) return;
  
      setLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // JS months are 0-based
  
      try {
        const result = await getMonthEndSummaryForMonth(year, month);
        alert(result.data.typeof);
        // Assume API returns null or empty if not found
        setMonthEndExists(!!result);
      } catch (error) {
        console.error("Error fetching month end summary:", error);
        setMonthEndExists(false);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="p-4">
        <Card title="Month End Summary">
          <div className="flex flex-column gap-3">
            <div className="flex align-items-center gap-2">
              <label htmlFor="monthPicker" className="font-medium">
                Select Month:
              </label>
              <Calendar
                id="monthPicker"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.value ?? null)}
                view="month"
                dateFormat="mm/yy"
                showIcon
                placeholder="Select month"
                className="p-calendar-custom"
              />
            </div>
  
            <Button
              label={loading ? "Checking..." : "Check Month End"}
              icon="pi pi-search"
              onClick={handleCheckMonthEnd}
              disabled={!selectedDate || loading}
              style={{ backgroundColor: "skyblue", borderColor: "black" }}
            />
  
            {monthEndExists !== null && (
              <div className="mt-3">
                {monthEndExists ? (
                  <Message
                    severity="success"
                    text="Month-end record already exists for the selected month."
                  />
                ) : (
                  <Message
                    severity="warn"
                    text="No month-end record found. You can perform month end."
                  />
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };
    
    export default MonthEnd;