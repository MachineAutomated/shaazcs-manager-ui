import '../App.css'
import React, { useState } from "react";
import type { Module, SubModule } from "../components/Sidebar";
import Content from "../components/Content";
import Sidebar from '../components/Sidebar';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import ToastInfoEmitter from "../components/Toast";
import TopBar from "../components/TopBar";

const Dashboard: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<Module>(null);
  const [selectedSubModule, setSelectedSubModule] = useState<SubModule>(null);

  return (
    <div className="dashboard-root">
      <TopBar/>
      {/* Toast Component */}
      <ToastInfoEmitter
        showMessage={true}
        severity="info"
        detail="Login Successful."
      />
      <div className="dashboard-main">
      <Splitter className='dashboard-container' layout="horizontal" gutterSize={0} >
      <SplitterPanel size={20} minSize={20}>
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
      <SplitterPanel size={80} minSize={80}>
        <Content
          selectedModule={selectedModule}
          selectedSubModule={selectedSubModule}
        />
      </SplitterPanel>
    </Splitter>
    </div>
    </div>
  );
};

export default Dashboard;
