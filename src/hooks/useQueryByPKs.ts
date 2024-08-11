import React from "react";
import { useReactiteClient } from "./useReactiteClient";
import { getPKColumnName } from "../utils";

type TState<T> = {
  querying: boolean;
  data: T[] | null;
  error: string | null;
  status: "error" | "success" | "querying" | null;
  success: boolean;
};

export const useQueryByPKs = <
  TData extends object,
  TPK extends string | number
>(
  tableName: string,
  pks: TPK[],
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
  const fetcher = React.useCallback(async () => {
    setState((s) => ({
      ...s,
      mutating: true,
      status: "querying",
    }));
    try {
      const pkName = getPKColumnName(client, tableName);
      const columns =
        typeof select !== "undefined"
          ? (typeof select === "string" ? [select] : select)
              .map((col) => `\`${col}\``)
              .join(", ")
          : "*";
      const data: any[] = await client.getAllAsync(
        `SELECT ${columns} FROM \`${tableName}\` WHERE ${pkName} IN (${Array(
          pks.length
        )
          .fill("?")
          .join(", ")});`,
        ...pks
      );
      setState((s) => ({
        ...s,
        status: "success",
        success: true,
        querying: false,
        data,
        error: null,
      }));
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
  }, [pks, tableName, select]);

  React.useEffect(() => {
    fetcher();
  }, []);

  return {
    ...state,
    refetchQuery: fetcher,
  };
};
