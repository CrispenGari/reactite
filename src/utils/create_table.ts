import { SQLiteDatabase } from "expo-sqlite";
import { TTable, CreateTableOptions } from "../types";

export const getColumnsAndOptions = (
  { fields, skipIfExist, snakeCase, timestamps }: TTable,
  options: Required<CreateTableOptions>
) => {
  const pkCount = Object.values(fields).filter(
    (field) => field.values.primaryKey
  ).length;

  const _snakeCase =
    typeof snakeCase === "undefined" ? options.snakeCase : snakeCase;
  const _timestamps =
    typeof timestamps === "undefined" ? options.timestamps : timestamps;
  const _skipIfExist =
    typeof skipIfExist === "undefined" ? options.skipIfExist : skipIfExist;

  const t = _timestamps
    ? [
        `\`${
          _snakeCase ? "created_at" : "createdAt"
        }\` DATETIME DEFAULT CURRENT_TIMESTAMP`,
        `\`${
          _snakeCase ? "updated_at" : "updatedAt"
        }\` DATETIME DEFAULT CURRENT_TIMESTAMP`,
      ]
    : [];
  const _fields =
    pkCount === 0
      ? [
          "id INT PRIMARY KEY",
          ...Object.entries(fields).map(([name, f]) =>
            `\`${name}\` ${f.stmt()} `.trim()
          ),
          ...t,
        ]
      : [
          ...Object.entries(fields).map(([name, f]) =>
            `\`${name}\` ${f.stmt()} `.trim()
          ),
          ...t,
        ];

  return {
    stmt: _fields.join(", "),
    pkCount,
    skipIfExist: _skipIfExist,
  };
};

export const createTablesTransaction = async (
  client: SQLiteDatabase,
  stmts: string[]
) => {
  await client.withExclusiveTransactionAsync(async (tnx) => {
    for (const stmt of stmts) {
      await tnx.execAsync(stmt);
    }
  });
};
