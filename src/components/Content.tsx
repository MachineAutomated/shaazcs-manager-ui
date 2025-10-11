import React from "react";
import TransactionForm from "./TransactionForm";
import Summary from "./Summary";
import type { Module, SubModule } from "./sidebar";

interface ContentProps {
  selectedModule: Module;
  selectedSubModule: SubModule;
}

const Content: React.FC<ContentProps> = ({ selectedModule, selectedSubModule }) => {
  if (selectedModule === "Finance") {
    switch (selectedSubModule) {
      case "Transactions":
        return <TransactionForm />;
      case "Summary":
        return <Summary />;
      default:
        return <p>Please select a Finance submodule.</p>;
    }
  } else if (selectedModule === "Salawat") {
    switch (selectedSubModule) {
      case "SalawatFunctions":
        return <p>Salawat functions will go here.</p>;
      default:
        return <p>Please select a Salawat function.</p>;
    }
  } else {
    return <p>Please select a module from the left.</p>;
  }
};

export default Content;
