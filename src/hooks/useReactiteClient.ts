import React from "react";
import { DatabaseContext } from "../ReactiteClientProvider";
import { SQLiteDatabase } from "expo-sqlite";
/**
 * Custom hook to access the SQLite database instance provided by the
 * `ReactiteClientProvider`. This hook retrieves the `SQLiteDatabase` instance
 * from the context and throws an error if used outside of a `ReactiteClientProvider`.
 *
 * @returns {SQLiteDatabase} - The `SQLiteDatabase` instance provided by the `ReactiteClientProvider`.
 * @throws {Error} - Throws an error if the hook is used outside of a `ReactiteClientProvider`.
 *
 * @example
 * import React from "react";
 * import { useReactiteClient } from "reactite";
 *
 * const MyComponent = () => {
 *   // Retrieve the SQLiteDatabase instance
 *   const client = useReactiteClient();
 *
 *   // Use the client instance to perform database operations
 *   // Example: client.execute('SELECT * FROM users');
 *
 *   return <View></View>;
 * };
 *
 * @see [useReactiteClient Hook Documentation](https://github.com/CrispenGari/reactite?tab=readme-ov-file#usereactiteclient-hook)
 */
export const useReactiteClient = (): SQLiteDatabase => {
  const client = React.useContext(DatabaseContext);
  if (!!!client)
    throw new Error(
      "useReactiteClient must be used within a ReactiteClientProvider"
    );
  return client.db;
};
