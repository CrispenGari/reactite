import * as SQLite from "expo-sqlite";
import { field } from "../field";
import { TFilter } from "../filter";
import { TOperand } from "../operand";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type TPaginatedCallBacks<TPaginatedData, TStatus> = {
  onError?: (error: { message: string; status: TStatus }) => void;
  onSuccess?: (result: { data: TPaginatedData; status: TStatus }) => void;
  onSettled?: (result: { data: TPaginatedData; status: TStatus }) => void;
  onStart?: (status: { data: TPaginatedData; status: TStatus }) => void;
  onFinish?: (result: { data: TPaginatedData; status: TStatus }) => void;
  onData?: (result: { data: TPaginatedData; status: TStatus }) => void;
};
export type TCallBacks<TData, TStatus> = {
  onError?: (error: { message: string; status: TStatus }) => void;
  onSuccess?: (result: {
    data: TData | TData[] | null;
    status: TStatus;
  }) => void;
  onSettled?: (result: {
    data: TData | TData[] | null;
    status: TStatus;
  }) => void;
  onStart?: (status: { data: TData | TData[] | null; status: TStatus }) => void;
  onFinish?: (result: {
    data: TData | TData[] | null;
    status: TStatus;
  }) => void;
  onData?: (result: { data: TData | TData[] | null; status: TStatus }) => void;
};

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
  skipIfExist?: boolean;
  timestamps?: boolean;
  snakeCase?: boolean;
};

export type TTable = Prettify<
  Record<"fields", Record<string, typeof field>> &
    Partial<Record<"timestamps", boolean>> &
    Partial<Record<"snakeCase", boolean>> &
    Partial<Record<"skipIfExist", boolean>>
>;
export type FieldType<T extends SQLITE_TYPE = SQLITE_TYPE> = {
  type: T;
  autoIncrement?: boolean;
  defaultValue?: DefaultValue<T> | null;
  nullable?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
};

export type TOrder = "asc" | "desc";
export type TAggregationFn = "count" | "avg" | "min" | "max" | "sum";

export type TPaginatedQueryOptions<TValue> = {
  filters?: TFilter<TValue> | TOperand<TValue>;
  select?: string | string[];
  pageSize: number;
  cursor?: string | number;
  order?: {
    order: TOrder;
    column: string;
  };
  distinct?: boolean;
};
export type TQueryByPKOptions<TPK> = {
  pk: TPK;
  select?: string | string[];
};
export type TQueryQueryByPKs<TPKs> = {
  pks: TPKs;
  select?: string | string[];
};
export type TQueryOptions<TValue> = {
  filters?: TFilter<TValue> | TOperand<TValue>;
  select?: string | string[];
  limit?: number;
  offset?: number;
  order?: {
    order: TOrder;
    column: string;
  };
  distinct?: boolean;
  // aggregation?: {
  //   groupBy: string[];
  //   fn: TAggregationFn;
  //   having: {
  //     column: "*" | string;
  //     filters: TFilter<TValue> | TOperand<TValue>;
  //   };
  //   returnAggregationColumn: boolean;
  // };
};
