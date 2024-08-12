import React from "react";
import { useReactiteClient } from "./useReactiteClient";
import { getPKColumnName } from "../utils";
import { TCallBacks } from "../types";

type TStatus = "error" | "success" | "querying" | null;
type TState<T> = {
  querying: boolean;
  data: T[] | null;
  error: string | null;
  status: TStatus;
  success: boolean;
};

export const useQueryByPKs = <
  TData extends object,
  TPK extends string | number
>(
  tableName: string,
  pks: TPK[],
  select?: string | string[],
  {
    onData,
    onError,
    onFinish,
    onSettled,
    onStart,
    onSuccess,
  }: TCallBacks<TData, TStatus> = {}
): {
  refetchQuery: () => Promise<void>;
  querying: boolean;
  data: TData[] | null;
  error: string | null;
  status: TStatus;
  success: boolean;
} => {
  const client = useReactiteClient();
  const [state, setState] = React.useState<TState<TData>>({
    data: null,
    error: null,
    querying: false,
    status: null,
    success: false,
  });
  const fetcher = React.useCallback(async () => {
    if (typeof onStart !== "undefined")
      onStart({ data: null, status: "querying" });
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
      if (typeof onSettled !== "undefined")
        onSettled({ data, status: "success" });
      if (typeof onData !== "undefined") onData({ data, status: "success" });
      if (typeof onFinish !== "undefined")
        onFinish({ data, status: "success" });
      if (typeof onSuccess !== "undefined")
        onSuccess({ data, status: "success" });
      setState((s) => ({
        ...s,
        status: "success",
        success: true,
        querying: false,
        data,
        error: null,
      }));
    } catch (error: any) {
      const msg = error.message;
      if (typeof onError !== "undefined")
        onError({ message: msg, status: "error" });
      if (typeof onSettled !== "undefined")
        onSettled({ data: null, status: "error" });

      setState((s) => ({
        ...s,
        error: msg,
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
