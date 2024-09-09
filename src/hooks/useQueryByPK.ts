import React from "react";
import { useReactiteClient } from "./useReactiteClient";
import { getPKColumnName } from "../utils";
import { TCallBacks, TQueryByPKOptions } from "../types";

type TStatus = "error" | "success" | "querying" | null;
type TState<T> = {
  querying: boolean;
  data: T | null;
  error: string | null;
  status: TStatus;
  success: boolean;
};
/**
 * A hook that performs a query on a table based on a single primary key.
 *
 * @template TData - The shape of the data returned from the query.
 * @template TPK - The type of primary key used for filtering.
 *
 * @param {string} tableName - The name of the table to query.
 * @param {TQueryByPKOptions<TPK>} options - The query options, including primary key to filter and columns to select.
 * @param {TCallBacks<TData, TStatus>} [callbacks] - Optional callbacks for lifecycle events like `onData`, `onError`, `onFinish`, `onSettled`, `onStart`, and `onSuccess`.
 *
 * @returns {Object} - An object containing:
 *   - `refetchQuery`: Function to refetch the data.
 *   - `querying`: Boolean indicating if the query is in progress.
 *   - `data`: The fetched data as a `TData` object, or `null` if no data is available yet.
 *   - `error`: Error message if the query fails.
 *   - `status`: The status of the query (e.g., 'success', 'error', etc.).
 *   - `success`: Boolean indicating if the query was successful.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { View, Text, Button, Image } from 'react-native';
 * import { useQueryByPK, flt } from 'reactite';
 *
 * const UserDetail: React.FC = () => {
 *   const { data, error, querying, status, success, refetchQuery } = useQueryByPK<
 *     { username: string; id: number; avatar: string },
 *     number
 *   >(
 *     'users', // The table to query
 *     {
 *       pk: 1, // Primary key to filter
 *       select: ['id', 'username', 'avatar'], // Selects specific columns
 *     },
 *     {
 *       onSettled({ data }) {
 *         console.log('Query settled with data:', data);
 *       },
 *     }
 *   );
 *
 *   return (
 *     <View>
 *       <Text>User Detail</Text>
 *       {querying && <Text>Loading...</Text>}
 *       {error && <Text>Error: {error}</Text>}
 *       {success && data && (
 *         <View style={{ flexDirection: 'row', marginVertical: 10 }}>
 *           <Image
 *             source={{ uri: data.avatar }}
 *             style={{ width: 50, height: 50, marginRight: 10 }}
 *           />
 *           <Text>{data.username}</Text>
 *         </View>
 *       )}
 *       <Button
 *         title="Refetch Data"
 *         onPress={refetchQuery}
 *         disabled={querying}
 *       />
 *     </View>
 *   );
 * };
 * ```
 *
 * @see {@link https://github.com/CrispenGari/reactite#usequerybypk-hook | useQueryByPK documentation}
 */
export const useQueryByPK = <TData extends object, TPK extends string | number>(
  tableName: string,
  options: TQueryByPKOptions<TPK>,
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
  data: TData | null;
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
  const fetcher = React.useCallback(async () => {
    if (typeof onStart !== "undefined")
      onStart({ data: null, status: "querying" });
    setState((s) => ({
      ...s,
      mutating: true,
      status: "querying",
    }));
    try {
      const select = options.select;
      const pk = options.pk;
      const pkName = getPKColumnName(client, tableName);
      const columns =
        typeof select !== "undefined"
          ? (typeof select === "string" ? [select] : select)
              .map((col) => `\`${col}\``)
              .join(", ")
          : "*";
      const data: any = await client.getFirstAsync(
        `SELECT ${columns} FROM \`${tableName}\` WHERE ${pkName} = ?;`,
        pk
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
  }, [tableName, options]);

  React.useEffect(() => {
    fetcher();
  }, []);

  return {
    ...state,
    refetchQuery: fetcher,
  };
};
