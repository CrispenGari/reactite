import React from "react";
import { DatabaseContext } from "../ReactiteClientProvider";

export const useReactiteClient = () => {
  const client = React.useContext(DatabaseContext);
  if (!!!client)
    throw new Error(
      "useReactiteClient must be used within a ReactiteClientProvider"
    );
  return client.db;
};
