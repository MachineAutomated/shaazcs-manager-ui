import React from "react";

type Module = "Finance" | "Salawat" | null;
type SubModule =
  | "Transactions"
  | "Summary"
  | "SalawatFunctions"
  | null;

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
      className="card flex"
    >
      <h3>Modules</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {["Finance", "Salawat"].map((mod) => (
          <li
            key={mod}
            style={{
              cursor: "pointer",
              marginBottom: "10px",
              fontWeight: selectedModule === mod ? "bold" : "normal",
            }}
            onClick={() => onModuleSelect(mod as Module)}
          >
            {mod}
          </li>
        ))}
      </ul>

      {/* Submodules */}
      {selectedModule === "Finance" && (
        <>
          <h4>Finance Options</h4>
          <ul style={{ listStyle: "none", paddingLeft: "10px" }}>
            <li
              style={{ cursor: "pointer", marginBottom: "5px" }}
              onClick={() => onSubModuleSelect("Transactions")}
            >
              Transactions
            </li>
            <li
              style={{ cursor: "pointer", marginBottom: "5px" }}
              onClick={() => onSubModuleSelect("Summary")}
            >
              Summary
            </li>
          </ul>
        </>
      )}

      {selectedModule === "Salawat" && (
        <>
          <h4>Salawat Options</h4>
          <ul style={{ listStyle: "none", paddingLeft: "10px" }}>
            <li
              style={{ cursor: "pointer", marginBottom: "5px" }}
              onClick={() => onSubModuleSelect("SalawatFunctions")}
            >
              Salawat Functions
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Sidebar;
export type { Module, SubModule };
