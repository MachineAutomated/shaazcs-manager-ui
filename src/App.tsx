import React,{ useState } from 'react';
import './App.css';
import type { Module, SubModule } from "./components/sidebar";
import { Splitter, SplitterPanel } from 'primereact/splitter';
// import { Menu } from 'primereact/menu';
import Content from "./components/Content";
import Sidebar from './components/sidebar';
import "primereact/resources/themes/lara-light-cyan/theme.css";

function App() {
  const [selectedModule, setSelectedModule] = useState<Module>(null);
  const [selectedSubModule, setSelectedSubModule] = useState<SubModule>(null);
  return (
    <div className="card flex flex-wrap gap-3 p-fluid">
      {/* <header className="App-header"> */}
      
    <Splitter style={{ height: '600px', width: '1200px'}}>
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
        <Content
          selectedModule={selectedModule}
          selectedSubModule={selectedSubModule}
        />
      </SplitterPanel>
    </Splitter>
    {/* </header> */}
    </div>
  );
}

export default App;
