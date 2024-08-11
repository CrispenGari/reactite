import React from "react";
import { useReactiteClient } from "./useReactiteClient";

type TState = {
  loading: boolean;
  tables: string[];
};
export const useTables = () => {
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
