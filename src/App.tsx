import React, { useState } from "react";
import Sidebar from "./components/sidebar";
import type { Module, SubModule } from "./components/sidebar";
import Content from "./components/Content";

const App: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<Module>(null);
  const [selectedSubModule, setSelectedSubModule] = useState<SubModule>(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        selectedModule={selectedModule}
        selectedSubModule={selectedSubModule}
        onModuleSelect={(mod) => {
          setSelectedModule(mod);
          setSelectedSubModule(null); // reset submodule on module change
        }}
        onSubModuleSelect={setSelectedSubModule}
      />
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Content
          selectedModule={selectedModule}
          selectedSubModule={selectedSubModule}
        />
      </div>
    </div>
  );
};

export default App;
