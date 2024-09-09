import React from "react";
import { useReactiteClient } from "./useReactiteClient";

type TState = {
  loading: boolean;
  tables: string[];
};

/**
 * Custom hook to retrieve the list of table names from the SQLite database.
 * This hook provides a state indicating whether the tables are being loaded,
 * as well as the list of table names once the loading is complete.
 *
 * @returns {Object} - The state of the hook.
 * @returns {boolean} loading - Indicates whether the tables are still being loaded.
 * @returns {string[]} tables - The list of table names in the database.
 *
 * @example
 * import React from "react";
 * import { useTables } from "reactite";
 *
 * const TableList = () => {
 *   const { loading, tables } = useTables();
 *
 *   if (loading) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   return (
 *     <ul>
 *       {tables.map((table) => (
 *         <li key={table}>{table}</li>
 *       ))}
 *     </ul>
 *   );
 * };
 *
 * @see [useTables Hook Documentation](https://github.com/CrispenGari/reactite?tab=readme-ov-file#usetables-hook)
 */
export const useTables = (): {
  loading: boolean;
  tables: string[];
} => {
  const client = useReactiteClient();
  const [state, setState] = React.useState<TState>({
    loading: true,
    tables: [],
  });
  React.useEffect(() => {
    setState((s) => ({ ...s, loading: true }));
    const tables = client
      .getAllSync(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;",
        []
      )
      .map((table: any) => table.name)
      .filter((table: string) => table !== "sqlite_sequence");
    setState((s) => ({ ...s, loading: false, tables }));
  }, []);
  return {
    ...state,
  };
};
