import React from "react";
import { useReactiteClient } from "./useReactiteClient";
import { getPKColumnName } from "../utils";
import { TCallBacks, TQueryQueryByPKs } from "../types";

type TStatus = "error" | "success" | "querying" | null;
type TState<T> = {
  querying: boolean;
  data: T[] | null;
  error: string | null;
  status: TStatus;
  success: boolean;
};

/**
 * A hook that performs a query on a table based on a list of primary keys.
 *
 * @template TData - The shape of the data returned from the query.
 * @template TPK - The type of primary key used for filtering.
 *
 * @param {string} tableName - The name of the table to query.
 * @param {TQueryQueryByPKs<TPK[]>} options - The query options, including primary keys to filter, columns to select.
 * @param {TCallBacks<TData, TStatus>} [callbacks] - Optional callbacks for lifecycle events like `onData`, `onError`, `onFinish`, `onSettled`, `onStart`, and `onSuccess`.
 *
 * @returns {Object} - An object containing:
 *   - `refetchQuery`: Function to refetch the data.
 *   - `querying`: Boolean indicating if the query is in progress.
 *   - `data`: The fetched data as an array of `TData` objects, or `null` if no data is available yet.
 *   - `error`: Error message if the query fails.
 *   - `status`: The status of the query (e.g., 'success', 'error', etc.).
 *   - `success`: Boolean indicating if the query was successful.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { View, Text, Button, FlatList, Image } from 'react-native';
 * import { useQueryByPKs, flt } from 'reactite';
 *
 * const UserDetails: React.FC = () => {
 *   const { data, error, querying, status, success, refetchQuery } = useQueryByPKs<
 *     { username: string; id: number; avatar: string },
 *     number
 *   >(
 *     'users', // The table to query
 *     {
 *       pks: [1, 2, 3], // Primary keys to filter
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
 *       <Text>User Details</Text>
 *       {querying && <Text>Loading...</Text>}
 *       {error && <Text>Error: {error}</Text>}
 *       {success && (
 *         <FlatList
 *           data={data}
 *           keyExtractor={(item) => item.id.toString()}
 *           renderItem={({ item }) => (
 *             <View style={{ flexDirection: 'row', marginVertical: 10 }}>
 *               <Image
 *                 source={{ uri: item.avatar }}
 *                 style={{ width: 50, height: 50, marginRight: 10 }}
 *               />
 *               <Text>{item.username}</Text>
 *             </View>
 *           )}
 *         />
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
 * @see {@link https://github.com/CrispenGari/reactite#usequerybypks-hook | useQueryByPKs Documentation}
 */
export const useQueryByPKs = <
  TData extends object,
  TPK extends string | number
>(
  tableName: string,
  options: TQueryQueryByPKs<TPK[]>,
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
  data: TData[] | null;
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
      const pks = options.pks;
      const pkName = getPKColumnName(client, tableName);
      const columns =
        typeof select !== "undefined"
          ? (typeof select === "string" ? [select] : select)
              .map((col) => `\`${col}\``)
              .join(", ")
          : "*";
      const data: any[] = await client.getAllAsync(
        `SELECT ${columns} FROM \`${tableName}\` WHERE ${pkName} IN (${Array(
          pks.length
        )
          .fill("?")
          .join(", ")});`,
        ...pks
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
