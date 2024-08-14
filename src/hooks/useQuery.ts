import React from "react";
import { TFilter } from "../filter";
import { TOperand } from "../operand";
import { useReactiteClient } from "./useReactiteClient";
import { TCallBacks, TQueryOptions } from "../types";
import { getQueryOptionSQL } from "../utils/query";

type TStatus = "error" | "success" | "querying" | null;
type TState<T> = {
  querying: boolean;
  data: T[] | null;
  error: string | null;
  status: TStatus;
  success: boolean;
};

export const useQuery = <TData extends object, TValue>(
  tableName: string,
  filters?: TFilter<TValue> | TOperand<TValue>,
  select?: string | string[],
  options?: TQueryOptions,
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

  const get = React.useCallback(async () => {
    if (typeof onStart !== "undefined")
      onStart({ data: null, status: "querying" });
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
        const { optionsSQL, optionsVars } =
          typeof options === "undefined"
            ? { optionsSQL: "", optionsVars: {} }
            : getQueryOptionSQL(options);

        const stmt = `SELECT ${
          options?.distinct ? "DISTINCT" : ""
        } ${columns} FROM \`${tableName}\` ${optionsSQL};`;
        const data: TData[] = await client.getAllAsync(
          stmt,
          optionsVars as any
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
      } else {
        const { optionsSQL, optionsVars } =
          typeof options === "undefined"
            ? { optionsSQL: "", optionsVars: {} }
            : getQueryOptionSQL(options);

        const stmt = `SELECT ${
          options?.distinct ? "DISTINCT" : ""
        } ${columns} FROM \`${tableName}\` WHERE ${
          filters.stmt
        }  ${optionsSQL};`;
        const values = Array.isArray(filters.values)
          ? filters.values.flat().reduce((acc: any, current: any) => {
              return { ...acc, ...current };
            }, {})
          : filters.values;
        const data: TData[] = await client.getAllAsync(stmt, {
          ...values,
          ...optionsVars,
        });
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
          data: data as any,
          error: null,
        }));
      }
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
  }, [tableName, filters, options]);

  React.useEffect(() => {
    get();
  }, []);

  return {
    ...state,
    refetchQuery: get,
  };
};
