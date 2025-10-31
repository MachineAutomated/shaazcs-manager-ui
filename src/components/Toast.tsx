// ToastInfoEmitter.tsx
import React, { useRef, useEffect } from "react";
import { Toast } from "primereact/toast";

interface ToastInfoProps {
  showMessage: boolean;
  severity?: "success" | "info" | "warn" | "error";
  summary?: string;
  detail?: string;
}

const ToastInfoEmitter: React.FC<ToastInfoProps> = ({
  showMessage,
  severity = "info",
  summary = "Info",
  detail = "Message content",
}) => {
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (showMessage && toast.current) {
      toast.current.show({ severity, summary, detail, life: 3000 });
    }
  }, [showMessage, severity, summary, detail]);

  return <Toast ref={toast} position="top-right" />;
};

export default ToastInfoEmitter;
