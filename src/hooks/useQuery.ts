import React from "react";
import { TFilter } from "../filter";
import { TOperand } from "../operand";
import { useReactiteClient } from "./useReactiteClient";

type TState<T> = {
  querying: boolean;
  data: T | null;
  error: string | null;
  status: "error" | "success" | "querying" | null;
  success: boolean;
};

const useQuery = <TData extends object, TValue>(
  tableName: string,
  filters?: TFilter<TValue> | TOperand<TValue>,
  select?: string | string[]
) => {
  const client = useReactiteClient();
  const [state, setState] = React.useState<TState<TData>>({
    data: null,
    error: null,
    querying: false,
    status: null,
    success: false,
  });

  const get = React.useCallback(async () => {
    setState((s) => ({
      ...s,
      mutating: true,
      status: "querying",
    }));
    try {
      const columns =
        typeof select !== "undefined"
          ? (typeof select === "string" ? [select] : select)
              .map((col) => `\`${col}\``)
              .join(", ")
          : "*";
      if (typeof filters === "undefined") {
        const stmt = `SELECT ${columns} FROM \`${tableName}\`;`;
        const data: TData[] = await client.getAllAsync(stmt, ...[]);
        setState((s) => ({
          ...s,
          status: "success",
          success: true,
          querying: false,
          data: data as any,
          error: null,
        }));
      } else {
        const stmt = `SELECT ${columns} FROM \`${tableName}\` WHERE ${filters.stmt};`;
        const values = Array.isArray(filters.values)
          ? filters.values.flat().reduce((acc: any, current: any) => {
              return { ...acc, ...current };
            }, {})
          : filters.values;
        const data: TData[] = await client.getAllAsync(stmt, values);
        setState((s) => ({
          ...s,
          status: "success",
          success: true,
          querying: false,
          data: data as any,
          error: null,
        }));
      }
    } catch (error: any) {
      setState((s) => ({
        ...s,
        error: error.message,
        status: "error",
        success: false,
        mutating: false,
        data: null,
      }));
    }
  }, [tableName, filters]);

  React.useEffect(() => {
    get();
  }, []);
  return {
    ...state,
    refetchQuery: get,
  };
};

export default useQuery;
