import React from "react";

import { CreateTableOptions, TTable } from "../types";
import { useReactiteClient } from "./useReactiteClient";
import {
  createTablesTransaction,
  getColumnsAndOptions,
} from "../utils/create_table";

type TState = {
  creating: boolean;
  success: boolean;
  error: string | null;
  sql: string[];
  tables: string[] | null;
  status: "error" | "success" | "creating" | null;
};

type TCallBacks = {
  onError?: (error: {
    message: string;
    status: "error" | "success" | "creating" | null;
  }) => void;
  onSuccess?: (result: {
    tables: string[];
    total: number;
    status: "error" | "success" | "creating" | null;
  }) => void;
  onSettled?: (result: {
    tables: string[];
    total: number;
    status: "error" | "success" | "creating" | null;
  }) => void;
  onStart?: (status: {
    tables: string[];
    total: number;
    status: "error" | "success" | "creating" | null;
  }) => void;
  onFinish?: (result: {
    tables: string[];
    total: number;
    status: "error" | "success" | "creating" | null;
  }) => void;
};

export const useCreateTables = (
  table: Record<string, TTable>,
  options: CreateTableOptions = {
    skipIfExist: true,
    snakeCase: false,
    timestamps: true,
  },

  { onError, onFinish, onSettled, onStart, onSuccess }: TCallBacks = {}
): {
  retry: () => Promise<void>;
  creating: boolean;
  success: boolean;
  error: string | null;
  sql: string[];
  tables: string[] | null;
  status: "error" | "success" | "creating" | null;
} => {
  const client = useReactiteClient();
  const [state, setState] = React.useState<TState>({
    creating: false,
    success: false,
    error: null,
    sql: [],
    tables: null,
    status: null,
  });

  const createTable = React.useCallback(async () => {
    const stmts: string[] = [];
    const tables: string[] = [];
    setState((s) => ({ ...s, creating: true, status: "creating" }));
    if (typeof onStart !== "undefined")
      onStart({ status: "creating", tables: [], total: 0 });
    try {
      for (const [tableName, values] of Object.entries(table)) {
        tables.push(tableName);
        const { pkCount, skipIfExist, stmt } = getColumnsAndOptions(values, {
          skipIfExist:
            typeof options.skipIfExist !== "undefined"
              ? options.skipIfExist
              : true,
          snakeCase:
            typeof options.snakeCase !== "undefined"
              ? options.snakeCase
              : false,
          timestamps:
            typeof options.timestamps !== "undefined"
              ? options.timestamps
              : true,
        });
        if (pkCount >= 2) {
          throw new Error(
            `Table "${tableName}" must have exactly one primary key column, but found ${pkCount}.`
          );
        }
        const sql = skipIfExist
          ? `CREATE TABLE IF NOT EXISTS \`${tableName}\`(${stmt});`
          : `CREATE TABLE \`${tableName}\`(${stmt});`;
        if (!skipIfExist) stmts.push(`DROP TABLE IF EXISTS  \`${tableName}\`;`);
        stmts.push(sql);
      }
      await createTablesTransaction(client, stmts);
      if (typeof onFinish !== "undefined")
        onFinish({ tables, status: "success", total: tables.length });
      if (typeof onSettled !== "undefined")
        onSettled({ tables, status: "success", total: tables.length });
      if (typeof onSuccess !== "undefined")
        onSuccess({ tables, status: "success", total: tables.length });

      setState((s) => ({
        ...s,
        success: true,
        creating: false,
        error: null,
        sql: stmts,
        tables,
        status: "success",
      }));
    } catch (err: any) {
      if (typeof onError !== "undefined")
        onError({ message: err.message, status: "error" });
      setState((s) => ({
        ...s,
        success: false,
        creating: false,
        error: err.message,
        sql: [],
        tables: null,
        status: "error",
      }));
    }
  }, [options, table]);

  const retry = () => createTable();

  React.useEffect(() => {
    createTable();
  }, []);

  return {
    ...state,
    retry,
  };
};
