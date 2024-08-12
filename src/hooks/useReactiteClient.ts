import React from "react";
import { DatabaseContext } from "../ReactiteClientProvider";
import { SQLiteDatabase } from "expo-sqlite";

export const useReactiteClient = (): SQLiteDatabase => {
  const client = React.useContext(DatabaseContext);
  if (!!!client)
    throw new Error(
      "useReactiteClient must be used within a ReactiteClientProvider"
    );
  return client.db;
};
