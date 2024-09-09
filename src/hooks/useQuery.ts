import React from "react";
import { useReactiteClient } from "./useReactiteClient";
import { TCallBacks, TQueryOptions } from "../types";
import { getQueryOptionSQL } from "../utils/query";

type TStatus = "error" | "success" | "querying" | null;
type TState<T> = {
  querying: boolean;
  data: T[] | null;
  error: string | null;
  status: TStatus;
  success: boolean;
};

/**
 * A hook that performs queries on a given table.
 *
 * @template TData - The shape of the data returned from the query.
 * @template TValue - The type of value used for filtering or options.
 *
 * @param {string} tableName - The name of the table to query.
 * @param {TQueryOptions<TValue>} [options] - The query options, including filters, columns to select, distinct rows, ordering, limiting results, and more.
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
 * import { useQuery, flt } from 'reactite';
 *
 * const UsersList: React.FC = () => {
 *   const { data, error, querying, status, success, refetchQuery } = useQuery<
 *     { username: string; id: number; avatar: string },
 *     any
 *   >(
 *     'users', // The table to query
 *     {
 *       filters: flt.gt('id', 5), // Filters users with id > 5
 *       select: ['id', 'username', 'avatar'], // Selects specific columns
 *       distinct: true, // Ensures distinct rows
 *       order: { column: 'id', order: 'asc' }, // Orders by 'id' ascending
 *       limit: 2, // Limits to 2 users
 *       offset: 1, // Skips the first user
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
 *       <Text>User List</Text>
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
 * @see {@link https://github.com/CrispenGari/reactite#usequery-hook | useQuery documentation}
 */
export const useQuery = <TData extends object, TValue>(
  tableName: string,
  options?: TQueryOptions<TValue>,
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

  const get = React.useCallback(async () => {
    if (typeof onStart !== "undefined")
      onStart({ data: null, status: "querying" });
    setState((s) => ({
      ...s,
      mutating: true,
      status: "querying",
    }));
    try {
      const filters = options?.filters;
      const select = options?.select;
      const columns =
        typeof select !== "undefined"
          ? (typeof select === "string" ? [select] : select)
              .map((col) => `\`${col}\``)
              .join(", ")
          : "*";
      if (typeof filters === "undefined") {
        const { optionsSQL, optionsVars } =
          typeof options === "undefined"
            ? { optionsSQL: "", optionsVars: {} }
            : getQueryOptionSQL(options);

        const stmt = `SELECT ${
          options?.distinct ? "DISTINCT" : ""
        } ${columns} FROM \`${tableName}\` ${optionsSQL};`;
        const data: TData[] = await client.getAllAsync(
          stmt,
          optionsVars as any
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
      } else {
        const { optionsSQL, optionsVars } =
          typeof options === "undefined"
            ? { optionsSQL: "", optionsVars: {} }
            : getQueryOptionSQL(options);

        const stmt = `SELECT ${
          options?.distinct ? "DISTINCT" : ""
        } ${columns} FROM \`${tableName}\` WHERE ${
          filters.stmt
        }  ${optionsSQL};`;
        const values = Array.isArray(filters.values)
          ? filters.values.flat().reduce((acc: any, current: any) => {
              return { ...acc, ...current };
            }, {})
          : filters.values;
        const data: TData[] = await client.getAllAsync(stmt, {
          ...values,
          ...optionsVars,
        });
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
          data: data as any,
          error: null,
        }));
      }
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
    get();
  }, []);

  return {
    ...state,
    refetchQuery: get,
  };
};
