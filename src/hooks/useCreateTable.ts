import React from "react";
import { field } from "../field";
import { CreateTableOptions } from "../types";
import { useReactiteClient } from "./useReactiteClient";

// type FieldMap = Prettify<Record<string, FieldInstanceMethods<SQLITE_TYPE>>>;
// type PrimaryKeyCount<T extends FieldMap> = {
//   [K in keyof T]: T[K]["values"]["primaryKey"] extends true ? 1 : 0;
// }[keyof T];

// type EnsureSinglePrimaryKey<T extends FieldMap> = PrimaryKeyCount<T> extends 1
//   ? T
//   : never;
export const useCreateTable = (
  tableName: string,
  fields: Record<string, typeof field>,
  options: CreateTableOptions = { skipIfExist: true, timestamps: true }
) => {
  const primaryKeyCount = Object.values(fields).filter(
    (field) => field.values.primaryKey
  ).length;

  if (primaryKeyCount >= 2) {
    throw new Error(
      `Table "${tableName}" must have exactly one primary key column, but found ${primaryKeyCount}.`
    );
  }

  const client = useReactiteClient();
  const [state, setState] = React.useState<{
    creating: boolean;
    created: boolean;
    error: string | null;
    sql: string[];
    tableName: string | null;
  }>({
    creating: false,
    created: false,
    error: null,
    sql: [],
    tableName: null,
  });
  const _fields = React.useMemo(() => {
    if (primaryKeyCount === 0) {
      return [
        "id INT PRIMARY KEY",
        ...Object.entries(fields).map(([name, f]) =>
          `\`${name}\` ${f.stmt()} `.trim()
        ),
      ];
    }
    return Object.entries(fields).map(([name, f]) =>
      `\`${name}\` ${f.stmt()} `.trim()
    );
  }, [fields, primaryKeyCount]);

  const timestamps = React.useMemo(
    () =>
      options.timestamps
        ? [
            "`createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP",
            "`updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP",
          ]
        : [],
    [options]
  );

  React.useEffect(() => {
    (async () => {
      setState((s) => ({ ...s, creating: true }));
      if (options.skipIfExist || typeof options.skipIfExist === "undefined") {
        const stmt = `CREATE TABLE IF NOT EXISTS \`${tableName}\`(
                ${[..._fields, ...timestamps].join(",\n")}
        );`;

        await client
          .execAsync(stmt)
          .then(() => {
            setState((s) => ({
              ...s,
              created: true,
              creating: false,
              error: null,
              sql: [stmt],
              tableName,
            }));
          })
          .catch((err) => {
            setState((s) => ({
              ...s,
              created: false,
              creating: false,
              error: err.message,
              sql: [],
              tableName: null,
            }));
          });
      } else {
        const stmt1 = `DROP TABLE IF EXISTS  \`${tableName}\`;`;
        const stmt2 = `CREATE TABLE \`${tableName}\`(${[
          ..._fields,
          ...timestamps,
        ].join(", ")});`;
        const promise1 = await client.execAsync(stmt1);
        const [res1] = await Promise.allSettled([promise1]);
        if (res1.status === "rejected") {
          setState((s) => ({
            ...s,
            created: false,
            creating: false,
            error: res1.reason,
            sql: [],
            tableName: null,
          }));
        } else {
          const promise2 = await client.execAsync(stmt2);
          const [res2] = await Promise.allSettled([promise2]);
          if (res2.status === "rejected") {
            setState((s) => ({
              ...s,
              created: false,
              creating: false,
              error: res2.reason,
              sql: [],
              tableName: null,
            }));
          } else {
            setState((s) => ({
              ...s,
              created: true,
              creating: false,
              error: null,
              sql: [stmt1, stmt2],
              tableName,
            }));
          }
        }
      }
    })();
  }, [tableName]);

  return {
    ...state,
  };
};
