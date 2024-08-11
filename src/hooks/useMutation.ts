import React from "react";
import { useReactiteClient } from "./useReactiteClient";
import { insertTransaction } from "../utils";

// onSuccess: A callback function that runs when the mutation is successful.
// onError: A callback function that runs when the mutation encounters an error.
// onSettled: A callback function that runs when the mutation is either successful or has encountered an error.
// retry: A number or function that defines how many times to retry the mutation if it fails.
type TState<T> = {
  mutating: boolean;
  data: T | null;
  error: string | null;
  status: "error" | "success" | "mutating" | null;
  success: boolean;
};

const useMutation = <T>(
  tableName: string,
  operation: "insert" | "update" | "delete" = "insert"
) => {
  const client = useReactiteClient();
  const [state, setState] = React.useState<TState<T>>({
    mutating: false,
    data: null,
    error: null,
    status: null,
    success: false,
  });
  const insertAsync = async <T extends object>(data: T | T[]) => {
    const singleRecord = Array.isArray(data) === false;
    const values = singleRecord ? [data] : data;
    if (values.length === 0)
      throw new Error(
        `The table "${tableName}" requires values when inserting records.`
      );
    setState((s) => ({
      ...s,
      mutating: true,
      status: "mutating",
    }));
    try {
      const data: any[] = await insertTransaction(client, tableName, values);
      setState((s) => ({
        ...s,
        status: "success",
        success: true,
        mutating: false,
        data: singleRecord ? data[0] : data,
        error: null,
      }));
    } catch (error: any) {
      setState((s) => ({
        ...s,
        error: error.message,
        status: "error",
        success: false,
        mutating: false,
        data: null,
      }));
    }
  };
  const updateAsync = async () => {};
  const deleteAsync = async () => {};

  return {
    ...state,
    mutateAsync:
      operation === "insert"
        ? insertAsync
        : operation === "delete"
        ? deleteAsync
        : updateAsync,
  };
};

export default useMutation;
