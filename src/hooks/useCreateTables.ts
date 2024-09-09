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

/**
 * Custom hook to create tables in the database. This hook generates SQL statements
 * to create tables based on the provided schema and executes them in a transaction.
 * It provides state and callbacks for handling the creation process.
 *
 * @param {Record<string, TTable>} table - An object where each key is a table name and each value is the table schema.
 * @param {CreateTableOptions} [options={ skipIfExist: true, snakeCase: false, timestamps: true }] - Options to configure table creation.
 * @param {TCallBacks} [callbacks={}] - Callbacks to handle various stages of the table creation process.
 * @returns {{
 *   retry: () => Promise<void>;
 *   creating: boolean;
 *   success: boolean;
 *   error: string | null;
 *   sql: string[];
 *   tables: string[] | null;
 *   status: "error" | "success" | "creating" | null;
 * }} - Returns the state and a retry function for the table creation process.
 *
 * @example
 * import { useCreateTables } from 'reactite'
 *
 * const App = ()=>{
 *
 *  const { retry, creating, error, sql, status, success, tables } = useCreateTables(
 *    {
 *       posts: {
 *         fields: {
 *           title: field.unique().type("TEXT"),
 *         },
 *         timestamps: true,
 *        snakeCase: true,
 *        },
 *      users: {
 *        fields: {
 *           username: field.unique().type("TEXT"),
 *          password: field.type("TEXT"),
 *          avatar: field.type("TEXT").nullable().default("hello.jpg"),
 *          id: field.type("INTEGER").pk().autoIncrement(),
 *        },
 *        snakeCase: false,
 *        timestamps: false,
 *        skipIfExist: true,
 *      },
 *     },
 *    { skipIfExist: true }
 *  );
 * return null
 * )
 *
 * @see [useCreateTables Hook Documentation](https://github.com/CrispenGari/reactite?tab=readme-ov-file#usecreatetables-hook)
 */
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

  const retry = async () => await createTable();

  React.useEffect(() => {
    createTable();
  }, []);

  return {
    ...state,
    retry,
  };
};
