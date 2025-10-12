import React, { useState } from "react";
import Sidebar from "./components/sidebar";
import type { Module, SubModule } from "./components/sidebar";
import Content from "./components/Content";
import { Splitter, SplitterPanel } from 'primereact/splitter';

const App: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<Module>(null);
  const [selectedSubModule, setSelectedSubModule] = useState<SubModule>(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
    <Splitter >
    <SplitterPanel className="flex align-items-center justify-content-center" size={25} minSize={10}>
      <Sidebar
        selectedModule={selectedModule}
        selectedSubModule={selectedSubModule}
        onModuleSelect={(mod) => {
          setSelectedModule(mod);
          setSelectedSubModule(null); // reset submodule on module change
        }}
        onSubModuleSelect={setSelectedSubModule}
      />
    </SplitterPanel>
    <SplitterPanel className="flex align-items-center justify-content-center" size={75}>
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Content
          selectedModule={selectedModule}
          selectedSubModule={selectedSubModule}
        />
      </div>
    </SplitterPanel>
    </Splitter>
    </div>
  );
};

export default App;
