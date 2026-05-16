"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface WebsocketContextType {
  isConnected: boolean;
  sendMessage: (msg: any) => void;
}

const WebsocketContext = createContext<WebsocketContextType>({
  isConnected: false,
  sendMessage: () => {},
});

export function WebsocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  // Mock implementation for Phase 1
  useEffect(() => {
    setIsConnected(true);
    return () => setIsConnected(false);
  }, []);

  const sendMessage = (msg: any) => {
    console.log("Mock WS message sent:", msg);
  };

  return (
    <WebsocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
    </WebsocketContext.Provider>
  );
}

export const useWebsocket = () => useContext(WebsocketContext);
