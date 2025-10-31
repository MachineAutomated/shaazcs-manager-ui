import React from "react";
import type { ReactElement } from "react";
import './App.css';
// import type { Module, SubModule } from "./components/Sidebar";
// import { Splitter, SplitterPanel } from 'primereact/splitter';
// import Content from "./components/Content";
// import Sidebar from './components/Sidebar';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

// function App() {
//   const [selectedModule, setSelectedModule] = useState<Module>(null);
//   const [selectedSubModule, setSelectedSubModule] = useState<SubModule>(null);
//   return (
//     <div className="card flex flex-wrap gap-3 p-fluid">
//       {/* <header className="App-header"> */}
      
//     <Splitter style={{ height: '700px', width: '1200px'}}>
//       <SplitterPanel className="flex align-items-center justify-content-center" size={25} minSize={10}>
//          <Sidebar 
//           selectedModule={selectedModule}
//           selectedSubModule={selectedSubModule}
//           onModuleSelect={(mod) => {
//             setSelectedModule(mod);
//             setSelectedSubModule(null); // reset submodule on module change
//           }}
//           onSubModuleSelect={setSelectedSubModule}
//          />
//       </SplitterPanel>
//       <SplitterPanel className="flex align-items-center justify-content-center" size={75}
       
//       >
//         <Content
//           selectedModule={selectedModule}
//           selectedSubModule={selectedSubModule}
//         />
//       </SplitterPanel>
//     </Splitter>
//     {/* </header> */}
//     </div>
//   );
// }

const ProtectedRoute: React.FC<{ element: ReactElement }> = ({ element }) => {
  const token = sessionStorage.getItem("jwt");
  return token ? element : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
