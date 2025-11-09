import { Button } from "primereact/button";

type Module = "Finance" | "Salawat" | null;
type SubModule = "Transactions" | "TransactionDetails" | "Summary" | "MonthEnd" | "SalawatFunctions" | null;

interface SidebarProps {
  selectedModule: Module;
  selectedSubModule: SubModule;
  onModuleSelect: (module: Module) => void;
  onSubModuleSelect: (subModule: SubModule) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedModule,
  selectedSubModule,
  onModuleSelect,
  onSubModuleSelect,
}) => {
  return (
    <div
      className="card flex flex-column"
      style={{
        width: "100%",
        backgroundColor: "#f9fafb",
        borderRight: "1px solid #ddd",
        height: "100%",
        padding: "0px",
      }}
    >
      <h3 className="text-lg font-semibold">Modules</h3>

      {/* Main Modules */}
      <div className="grid justify-content-center">
        {["Finance", "Salawat"].map((mod) => (
          <div key={mod} className="col-6 flex justify-content-center">
          <Button
            key={mod}
            label={mod}
            onClick={() => onModuleSelect(mod as Module)}
            className="p-button-outlined p-button-sm sidebar-btn"
            style={{
              width: '100%',
              backgroundColor:
                selectedModule === mod ? "lightgrey" : "transparent",
              color: selectedModule === mod ? "white" : "#333",
            }}
          />
          </div>
        ))}
      </div>

      {/* Submodules */}
      {selectedModule === "Finance" && (
        <div className="flex flex-column">
          <h4 className="text-md font-medium mb-2">Finance Options</h4>
          
          <Button
            label="Transactions"
            onClick={() => onSubModuleSelect("Transactions")}
            className="p-button-text p-button-sm sidebar-btn"
            style={{
              backgroundColor:
                selectedSubModule === "Transactions" ? "#007ad9" : "transparent",
              color:
                selectedSubModule === "Transactions" ? "white" : "#007ad9",
            }}
          />
          <Button
            label="Transaction Details"
            onClick={() => onSubModuleSelect("TransactionDetails")}
            className="p-button-text p-button-sm sidebar-btn"
            style={{
              backgroundColor:
                selectedSubModule === "TransactionDetails"
                  ? "#007ad9"
                  : "transparent",
              color:
                selectedSubModule === "TransactionDetails"
                  ? "white"
                  : "#007ad9",
            }}
          />
          <Button
            label="Summary"
            onClick={() => onSubModuleSelect("Summary")}
            className="p-button-text p-button-sm sidebar-btn"
            style={{
              backgroundColor:
                selectedSubModule === "Summary" ? "#007ad9" : "transparent",
              color: selectedSubModule === "Summary" ? "white" : "#007ad9",
            }}
          />
          <Button
            label="Month End"
            onClick={() => onSubModuleSelect("MonthEnd")}
            className="p-button-text p-button-sm sidebar-btn"
            style={{
              backgroundColor:
                selectedSubModule === "MonthEnd" ? "#007ad9" : "transparent",
              color: selectedSubModule === "MonthEnd" ? "white" : "#007ad9",
            }}
          />

        </div>
      )}

      {selectedModule === "Salawat" && (
        <div className="flex flex-column gap-2 mt-4">
          <h4 className="text-md font-medium mb-2">Salawat Options</h4>
          <Button
            label="Salawat Functions"
            onClick={() => onSubModuleSelect("SalawatFunctions")}
            className="p-button-text p-button-sm"
            style={{
              backgroundColor:
                selectedSubModule === "SalawatFunctions"
                  ? "#007ad9"
                  : "transparent",
              color:
                selectedSubModule === "SalawatFunctions" ? "white" : "#007ad9",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
export type { Module, SubModule };
