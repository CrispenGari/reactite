import React from "react";
import { ReactiteClient } from "./ReactiteClient";

export const DatabaseContext = React.createContext<ReactiteClient | null>(null);

export const ReactiteClientProvider = ({
  children,
  client,
}: {
  client: ReactiteClient;
  children: React.ReactNode;
}) => {
  return (
    <DatabaseContext.Provider value={client}>
      {children}
    </DatabaseContext.Provider>
  );
};
