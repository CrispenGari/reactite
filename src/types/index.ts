import * as SQLite from "expo-sqlite";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface ReactiteClientProps {
  dbName: string;
  options?: SQLite.SQLiteOpenOptions;
}
export type SQLITE_TYPE =
  | "INTEGER"
  | "REAL"
  | "TEXT"
  | "BLOB"
  | "NULL"
  | "BOOLEAN"
  | "NUMERIC"
  | "DATETIME";

export type DefaultValue<T extends SQLITE_TYPE> = T extends "INTEGER"
  ? number
  : T extends "NUMERIC"
  ? number
  : T extends "REAL"
  ? number
  : T extends "BOOLEAN"
  ? boolean
  : T extends "TEXT"
  ? string
  : T extends "BLOB"
  ? Buffer | Uint8Array
  : T extends "DATETIME"
  ? string
  : undefined;

export type CreateTableOptions = {
  timestamps?: boolean;
  skipIfExist?: boolean;
};

export type FieldType<T extends SQLITE_TYPE = SQLITE_TYPE> = {
  type: T;
  autoIncrement?: boolean;
  defaultValue?: DefaultValue<T> | null;
  nullable?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
};
