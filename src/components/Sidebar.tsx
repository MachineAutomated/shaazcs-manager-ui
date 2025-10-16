import { Button } from "primereact/button";

type Module = "Finance" | "Salawat" | null;
type SubModule = "Transactions" | "TransactionDetails" | "Summary" | "SalawatFunctions" | null;

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
      className="card flex flex-column gap-3 p-3"
      style={{
        width: "100%",
        backgroundColor: "#f9fafb",
        borderRight: "1px solid #ddd",
        height: "100%",
      }}
    >
      <h3 className="text-lg font-semibold">Modules</h3>

      {/* Main Modules */}
      <div className="flex flex-column gap-2">
        {["Finance", "Salawat"].map((mod) => (
          <Button
            key={mod}
            label={mod}
            onClick={() => onModuleSelect(mod as Module)}
            className="p-button-outlined p-button-sm"
            style={{
              backgroundColor:
                selectedModule === mod ? "#007ad9" : "transparent",
              color: selectedModule === mod ? "white" : "#333",
              borderColor: "#007ad9",
              fontWeight: selectedModule === mod ? "bold" : "normal",
            }}
          />
        ))}
      </div>

      {/* Submodules */}
      {selectedModule === "Finance" && (
        <div className="flex flex-column gap-2 mt-4">
          <h4 className="text-md font-medium mb-2">Finance Options</h4>

          <Button
            label="Transactions"
            onClick={() => onSubModuleSelect("Transactions")}
            className="p-button-text p-button-sm"
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
            className="p-button-text p-button-sm"
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
            className="p-button-text p-button-sm"
            style={{
              backgroundColor:
                selectedSubModule === "Summary" ? "#007ad9" : "transparent",
              color: selectedSubModule === "Summary" ? "white" : "#007ad9",
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
