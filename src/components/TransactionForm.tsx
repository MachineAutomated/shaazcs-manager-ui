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
                // When mapping backend response:
        //         const options: CategoryOption[] = (response.data || []).map((c: any) => ({
        //           label: String(c.label ?? c.name ?? "Unknown"), // ensure string
        //           value: Number(c.value ?? c.id ?? 0)
        // }));
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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column"}}>
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
        <div className="card flex align-left" style={{flexDirection:"row"}} >
            <Checkbox 
              className="ml-2"
              id='updateIfExistsCheck' 
              onChange={(e) => setUpdateIfExists(!!e.target.checked)} 
              checked={UpdateIfExists}
              style={{marginLeft:"0px"}}
            >
            </Checkbox>
            <label htmlFor="updateIfExistsCheck" className="ml-2" >Update If Exists</label>
       

        {/* UseCreatedAt checkbox + Calendar */}
        
            <Checkbox
              className="ml-2"
              id='useCreatedAtCheck' 
              onChange={(e) => setUseCreatedAt(!!e.target.checked)} 
              checked={UseCreatedAt}
              style={{marginLeft:"30%"}}
            >
            </Checkbox>
            
            <label htmlFor="useCreatedAtCheck" className="ml-2" 
              style={{marginBottom:"10px"}}
            >
              Use CreatedAt Time
            </label>
          
            {/* </div>
        <div className="card flex justify-content-center"> */}
            {UseCreatedAt && (
              
              
                <FloatLabel >
                <Calendar 
                  id="createdAtdisplay" 
                  value={CreatedAt} 
                  onChange={handleDateChange} 
                  showTime 
                  hourFormat="24"
                  dateFormat="dd.mm.yy"
                  style={{marginTop:"20px"}}
                />
                <label htmlFor="createdAtdisplay" className="font-bold block" 
                >
                    Use Created At
                </label>
                <p style={{ fontSize: "12px", color: "gray" }}>
                  {formattedDate
                    ? `Selected: ${formattedDate}`
                    : "No date selected"}
                </p>
                </FloatLabel>
            )}
         
            <Button 
              label="Submit" 
              style={{marginTop:"20px", backgroundColor:"skyblue", borderColor:"black"}}
            />

        </div>
          
    </form>
  );
};

export default TransactionForm;
