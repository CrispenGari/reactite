import React from "react";
import { useReactiteClient } from "./useReactiteClient";
import { Prettify, TCallBacks } from "../types";
import { updateByPKsTransaction } from "../utils/update";
import { deleteByPKsTransaction } from "../utils/delete";

type TStatus = "error" | "success" | "mutating" | null;
type TState<T> = {
  mutating: boolean;
  data: T | T[] | null;
  error: string | null;
  status: TStatus;
  success: boolean;
};

type TUpdate = "update";
type TDelete = "delete";
type TOperation = TUpdate | TDelete;

export function useMutationByPKs<TData extends object>(
  tableName: string,
  operation: TUpdate,
  callbacks?: TCallBacks<TData[], TStatus>
): [
  (id: Array<string | number>, values: Partial<TData>) => Promise<void>,
  Prettify<TState<TData[]>>
];

export function useMutationByPKs<TData extends object>(
  tableName: string,
  operation: TDelete,
  callbacks?: TCallBacks<TData[], TStatus>
): [(id: Array<string | number>) => Promise<void>, TState<null>];

/**
 * A hook for performing update or delete mutations by an array of primary keys.
 *
 * @template TData - The shape of the data involved in the mutation.
 *
 * @param {string} tableName - The name of the table to mutate.
 * @param {TUpdate | TDelete} operation - The type of operation to perform ('update' or 'delete').
 * @param {TCallBacks<TData[], TStatus>} [callbacks] - Optional callbacks for lifecycle events like `onData`, `onError`, `onFinish`, `onSettled`, `onStart`, and `onSuccess`.
 *
 * @returns {[
 *   (id: Array<string | number>, values?: Partial<TData>) => Promise<void> | (id: Array<string | number>) => Promise<void>,
 *   Prettify<TState<TData[]>>
 * ]}
 * - For 'update': A function to perform the update operation by an array of primary keys, accepting the primary keys and values to update.
 * - For 'delete': A function to perform the delete operation by an array of primary keys, accepting only the primary keys.
 * - The second element is the current state of the mutation including `mutating`, `data`, `error`, `status`, and `success`.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { Button } from 'react-native';
 * import { useMutationByPKs } from 'reactite';
 *
 * const Post: React.FC = () => {
 *   const [mutateAsync, { mutating }] = useMutationByPKs<{
 *     id: string;
 *     username: string;
 *     avatar: string | null;
 *     password: string;
 *     createAt: string;
 *     updatedAt: string;
 *   }>("users", "update", {
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
 *       title="Update"
 *       onPress={async () => {
 *         await mutateAsync(["123", "456"], { username: "newUsername" });
 *       }}
 *     />
 *   );
 * };
 * ```
 *
 * @see {@link https://github.com/CrispenGari/reactite#usemutationbypks-hook | useMutationByPKs documentation}
 */
export function useMutationByPKs<TData extends object>(
  tableName: string,
  operation: TOperation,
  {
    onData,
    onError,
    onFinish,
    onSettled,
    onStart,
    onSuccess,
  }: TCallBacks<TData[], TStatus> = {}
) {
  const client = useReactiteClient();
  const [state, setState] = React.useState<TState<TData>>({
    mutating: false,
    data: null,
    error: null,
    status: null,
    success: false,
  });

  const updateAsync = async <TValue extends Array<string | number>>(
    pks: TValue,
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
      const d = (await updateByPKsTransaction(
        client,
        tableName,
        pks,
        values
      )) as TData[];
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

  const deleteAsync = async <TValue extends Array<string | number>>(
    pks: TValue
  ) => {
    if (typeof onStart !== "undefined")
      onStart({ data: null, status: "mutating" });
    setState((s) => ({
      ...s,
      mutating: true,
      status: "mutating",
    }));
    try {
      await deleteByPKsTransaction(client, tableName, pks);
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

  const mutateAsync = operation === "delete" ? deleteAsync : updateAsync;

  return [mutateAsync, { ...state }];
}
