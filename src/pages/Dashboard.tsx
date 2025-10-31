import React, { useState } from "react";
import type { Module, SubModule } from "../components/Sidebar";
import Content from "../components/Content";
import Sidebar from '../components/Sidebar';
import { Splitter, SplitterPanel } from 'primereact/splitter';

const Dashboard: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<Module>(null);
  const [selectedSubModule, setSelectedSubModule] = useState<SubModule>(null);
  return (
    <div className="card flex flex-wrap gap-3 p-fluid">
      <h2>Welcome to Dashboard</h2>
      <p>You have successfully logged in.</p>
      <Splitter style={{ height: '700px', width: '1200px'}}>
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
      <SplitterPanel className="flex align-items-center justify-content-center" size={75}
       
      >
        <Content
          selectedModule={selectedModule}
          selectedSubModule={selectedSubModule}
        />
      </SplitterPanel>
    </Splitter>
      <button onClick={() => { sessionStorage.removeItem("jwt"); window.location.href = "/"; }}>
        Logout
    </button>
    </div>
  );
};

export default Dashboard;
