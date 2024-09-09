import React from "react";
import { useReactiteClient } from "./useReactiteClient";
import { insertTransaction } from "../utils/insert";
import { TFilter } from "../filter";
import { TOperand } from "../operand";
import { Prettify, TCallBacks } from "../types";
import { updateTransaction } from "../utils/update";
import { deleteTransaction } from "../utils/delete";

type TStatus = "error" | "success" | "mutating" | null;
type TState<T> = {
  mutating: boolean;
  data: T | T[] | null;
  error: string | null;
  status: TStatus;
  success: boolean;
};

type TInsert = "insert";
type TUpdate = "update";
type TDelete = "delete";
type TOperation = TInsert | TUpdate | TDelete;

export function useMutation<TData extends object>(
  tableName: string,
  operation: TInsert,
  callbacks?: TCallBacks<TData, TStatus>
): [
  <T extends Partial<TData>>(data: T | T[]) => Promise<void>,
  Prettify<TState<TData>>
];

export function useMutation<TData extends object>(
  tableName: string,
  operation: TUpdate,
  callbacks?: TCallBacks<TData[], TStatus>
): [
  (
    filters: TFilter<any> | TOperand<TFilter<any>[] | TFilter<any>>,
    values: Partial<TData>
  ) => Promise<void>,
  Prettify<TState<TData[]>>
];

/**
 * A hook that performs ``insert``, ``update``, or ``delete`` mutations on a table.
 *
 * @template TData - The shape of the data involved in the mutation.
 *
 * @param {string} tableName - The name of the table to mutate.
 * @param {TOperation} operation - The type of operation to perform ('insert', 'update', or 'delete').
 * @param {TCallBacks<TData, TStatus>} [callbacks] - Optional callbacks for lifecycle events like `onData`, `onError`, `onFinish`, `onSettled`, `onStart`, and `onSuccess`.
 *
 * @returns {[
 *   (data: T | T[]) => Promise<void> | (filters: TFilter<any> | TOperand<TFilter<any>[] | TFilter<any>>, values?: Partial<TData>) => Promise<void> | (filters: TFilter<any> | TOperand<TFilter<any>>) => Promise<void>,
 *   Prettify<TState<TData>>
 * ]}
 * - The first element is a function to perform the specified mutation operation.
 * - The second element is the current state of the mutation including `mutating`, `data`, `error`, `status`, and `success`.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { Button } from 'react-native';
 * import { useMutation, flt, op } from 'reactite';
 *
 * const Post: React.FC = () => {
 *   const [mutateAsync, { mutating }] = useMutation<{
 *     id: string;
 *     username: string;
 *     avatar: string | null;
 *     password: string;
 *     createAt: string;
 *     updatedAt: string;
 *   }>("users", "delete", {
 *     onData(result) {
 *       console.log(JSON.stringify(result, null, 2));
 *     },
 *     onError(error) {
 *       console.log(error);
 *     },
 *   });
 *
 *   return (
 *     <Button
 *       title="Delete"
 *       onPress={async () => {
 *         await mutateAsync(op.or(flt.eq("id", 1), flt.in("id", [10, 11])));
 *       }}
 *     />
 *   );
 * };
 * ```
 *
 * @see {@link https://github.com/CrispenGari/reactite#usemutation-hook | useMutation Documentation}
 */
export function useMutation<TData extends object>(
  tableName: string,
  operation: TDelete,
  callbacks?: TCallBacks<TData, TStatus>
): [
  (
    filters: TFilter<any> | TOperand<TFilter<any>[] | TFilter<any>>
  ) => Promise<void>,
  TState<null>
];

export function useMutation<TData extends object>(
  tableName: string,
  operation: TOperation,
  {
    onData,
    onError,
    onFinish,
    onSettled,
    onStart,
    onSuccess,
  }: TCallBacks<TData, TStatus> = {}
) {
  const client = useReactiteClient();
  const [state, setState] = React.useState<TState<TData>>({
    mutating: false,
    data: null,
    error: null,
    status: null,
    success: false,
  });

  const insertAsync = async (data: TData | TData[]) => {
    if (typeof onStart !== "undefined")
      onStart({ data: null, status: "mutating" });
    setState((s) => ({
      ...s,
      mutating: true,
      status: "mutating",
    }));
    try {
      const singleRecord = !Array.isArray(data);
      const values = singleRecord ? [data] : data;
      if (values.length === 0) {
        throw new Error(
          `The table "${tableName}" requires values when inserting records.`
        );
      }
      const result: any[] = await insertTransaction(client, tableName, values);
      const d = singleRecord ? result[0] : result;
      if (typeof onFinish !== "undefined")
        onFinish({ data: d, status: "success" });
      if (typeof onData !== "undefined") onData({ data: d, status: "success" });
      if (typeof onSettled !== "undefined")
        onSettled({ data: d, status: "success" });
      if (typeof onSuccess !== "undefined")
        onSuccess({ data: d, status: "success" });
      setState((s) => ({
        ...s,
        status: "success",
        success: true,
        mutating: false,
        data: d,
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
  };

  const updateAsync = async <TValue>(
    filters: TFilter<TValue> | TOperand<TValue>,
    values: Partial<TData>
  ) => {
    if (typeof onStart !== "undefined")
      onStart({ data: null, status: "mutating" });
    setState((s) => ({
      ...s,
      mutating: true,
      status: "mutating",
    }));
    try {
      const d: any[] = await updateTransaction(
        client,
        tableName,
        filters,
        values
      );
      if (typeof onFinish !== "undefined")
        onFinish({ data: d, status: "success" });
      if (typeof onData !== "undefined") onData({ data: d, status: "success" });
      if (typeof onSettled !== "undefined")
        onSettled({ data: d, status: "success" });
      if (typeof onSuccess !== "undefined")
        onSuccess({ data: d, status: "success" });
      setState((s) => ({
        ...s,
        status: "success",
        success: true,
        mutating: false,
        data: d,
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
  };

  const deleteAsync = async <TValue>(
    filters: TFilter<TValue> | TOperand<TValue>
  ) => {
    if (typeof onStart !== "undefined")
      onStart({ data: null, status: "mutating" });
    setState((s) => ({
      ...s,
      mutating: true,
      status: "mutating",
    }));
    try {
      await deleteTransaction(client, tableName, filters);
      if (typeof onFinish !== "undefined")
        onFinish({ data: null, status: "success" });
      if (typeof onData !== "undefined")
        onData({ data: null, status: "success" });
      if (typeof onSettled !== "undefined")
        onSettled({ data: null, status: "success" });
      if (typeof onSuccess !== "undefined")
        onSuccess({ data: null, status: "success" });
      setState((s) => ({
        ...s,
        status: "success",
        success: true,
        mutating: false,
        data: null,
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
  };

  const mutateAsync =
    operation === "insert"
      ? insertAsync
      : operation === "delete"
      ? deleteAsync
      : updateAsync;

  return [mutateAsync, { ...state }];
}
