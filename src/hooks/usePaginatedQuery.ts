import React from "react";
import { useReactiteClient } from "./useReactiteClient";
import {
  Prettify,
  TPaginatedCallBacks,
  TPaginatedQueryOptions,
} from "../types";
import { getPaginatedQueryOptionSQL } from "../utils/query";
import { getPKColumnName } from "../utils";

type TStatus =
  | "error"
  | "success"
  | "querying-first-page"
  | "querying-next-page"
  | "exhausted"
  | "refetching"
  | null;

type TPaginatedData<TData> = {
  nextCursor: string | number | undefined;
  page: TData[];
  hasNextPage: boolean;
  items: number;
  isFirstPage: boolean;
  isLastPage: boolean;
};
type TState<T> = {
  querying: boolean;
  data: TPaginatedData<T>;
  error: string | null;
  status: TStatus;
  success: boolean;
  hasNextPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
};

/**
 * A hook that performs paginated queries on a given table.
 *
 * @template TData - The shape of the data returned from the query.
 * @template TValue - The type of value used for filtering or options.
 *
 * @param {string} tableName - The name of the table to query.
 * @param {TPaginatedQueryOptions<TValue>} options - The query options, including filters, columns to select, distinct rows, page size, and more.
 * @param {TPaginatedCallBacks<TPaginatedData<TData>, TStatus>} callbacks - Optional callbacks for lifecycle events like `onData`, `onError`, `onFinish`, `onSettled`, `onStart`, and `onSuccess`.
 *
 * @returns {Object} - An object containing:
 *   - `refetchPage`: Function to refetch the current page.
 *   - `fetchNextPage`: Function to fetch the next page of data.
 *   - `querying`: Boolean indicating if the query is in progress.
 *   - `data`: The paginated data result.
 *   - `error`: Error message if the query fails.
 *   - `status`: The status of the query (e.g., 'success', 'error', etc.).
 *   - `success`: Boolean indicating if the query was successful.
 *   - `hasNextPage`: Boolean indicating if there are more pages to fetch.
 *   - `isFirstPage`: Boolean indicating if the current page is the first page.
 *   - `isLastPage`: Boolean indicating if the current page is the last page.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { View, Text, Button, FlatList, Image } from 'react-native';
 * import { usePaginatedQuery, flt } from 'reactite';
 *
 * const UsersList: React.FC = () => {
 *   const { data, error, querying, status, success, fetchNextPage, refetchPage } = usePaginatedQuery<
 *     { username: string; id: number; avatar: string },
 *     any
 *   >(
 *     'users', // The table to query
 *     {
 *       filters: flt.gt('id', 5), // Filters users with id > 5
 *       select: ['id', 'username', 'avatar'], // Selects specific columns
 *       distinct: true, // Ensures distinct rows
 *       pageSize: 2, // Limits to 2 users per page
 *       order: { column: 'id', order: 'asc' }, // Orders by 'id' ascending
 *       cursor: 1, // Starts from cursor 1
 *     },
 *     {
 *       onSettled({ data: { page, hasNextPage, isFirstPage, isLastPage, items, nextCursor } }) {
 *         console.log('Query settled with page data:', page);
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
 *           data={data.page}
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
 *         title="Load Next Page"
 *         onPress={fetchNextPage}
 *         disabled={querying || !data.hasNextPage}
 *       />
 *       <Button
 *         title="Refetch Page"
 *         onPress={refetchPage}
 *         disabled={querying}
 *       />
 *     </View>
 *   );
 * };
 * ```
 *
 * @see {@link https://github.com/CrispenGari/reactite#usepaginatedquery-hook | usePaginatedQuery documentation}
 */
export const usePaginatedQuery = <TData extends object, TValue>(
  tableName: string,
  options: TPaginatedQueryOptions<TValue>,
  {
    onData,
    onError,
    onFinish,
    onSettled,
    onStart,
    onSuccess,
  }: TPaginatedCallBacks<TPaginatedData<TData>, TStatus> = {}
): {
  refetchPage: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  querying: boolean;
  data: TPaginatedData<TData>;
  error: string | null;
  status: TStatus;
  success: boolean;
  hasNextPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
} => {
  const client = useReactiteClient();
  const [state, setState] = React.useState<TState<TData>>({
    data: {
      hasNextPage: false,
      items: 0,
      nextCursor: undefined,
      page: [],
      isFirstPage: false,
      isLastPage: false,
    },
    isLastPage: false,
    error: null,
    querying: false,
    status: null,
    success: false,
    hasNextPage: false,
    isFirstPage: false,
  });
  const [previousCursor, setPreviousCursor] = React.useState<
    string | undefined | number
  >(undefined);

  const get = React.useCallback(
    async (isFirstPage: boolean, status: TStatus, cursor?: string | number) => {
      if (typeof onStart !== "undefined")
        onStart({
          data: {
            hasNextPage: false,
            isFirstPage: isFirstPage,
            isLastPage: false,
            items: 0,
            nextCursor: undefined,
            page: [],
          },
          status,
        });
      setState((s) => ({
        ...s,
        mutating: true,
        status,
      }));
      const noCursor = typeof cursor === "undefined";
      try {
        const select = options.select;
        const filters = options.filters;
        const columns =
          typeof select !== "undefined"
            ? (typeof select === "string" ? [select] : select)
                .map((col) => `\`${col}\``)
                .join(", ")
            : "*";
        const pkName = getPKColumnName(client, tableName);
        const paginatedVars = { $cursor: cursor };
        if (typeof filters === "undefined") {
          const { optionsSQL, optionsVars } =
            typeof options === "undefined"
              ? { optionsSQL: "", optionsVars: {} }
              : getPaginatedQueryOptionSQL(options);
          const stmt = noCursor
            ? `SELECT ${
                options?.distinct ? "DISTINCT" : ""
              } ${columns} FROM \`${tableName}\` ${optionsSQL};`
            : `SELECT ${
                options?.distinct ? "DISTINCT" : ""
              } ${columns} FROM \`${tableName}\` WHERE ${pkName} > $cursor ${optionsSQL};`;

          const data: TData[] = await client.getAllAsync(stmt, {
            ...optionsVars,
            ...paginatedVars,
          } as any);
          const lastItem: any = data.at(-1);
          const nextItems = await client.getAllAsync(
            `SELECT ${
              options?.distinct ? "DISTINCT" : ""
            } ${pkName} FROM \`${tableName}\` WHERE ${pkName} > $cursor;`,
            { $cursor: lastItem?.id }
          );
          const hasNextPage = nextItems.length !== 0;
          const nextCursor = !hasNextPage
            ? undefined
            : lastItem[pkName.replace(/`/g, "")];

          const paginatedResult: Prettify<TPaginatedData<TData>> = {
            hasNextPage,
            items: data.length,
            nextCursor,
            page: data,
            isFirstPage,
            isLastPage: typeof nextCursor === "undefined",
          };
          if (typeof onSettled !== "undefined")
            onSettled({
              data: paginatedResult,
              status: hasNextPage ? "success" : "exhausted",
            });
          if (typeof onData !== "undefined")
            onData({
              data: paginatedResult,
              status: hasNextPage ? "success" : "exhausted",
            });
          if (typeof onFinish !== "undefined")
            onFinish({
              data: paginatedResult,
              status: hasNextPage ? "success" : "exhausted",
            });
          if (typeof onSuccess !== "undefined")
            onSuccess({
              data: paginatedResult,
              status: hasNextPage ? "success" : "exhausted",
            });
          setState((s) => ({
            ...s,
            status: hasNextPage ? "success" : "exhausted",
            success: true,
            querying: false,
            data: paginatedResult,
            error: null,
          }));
        } else {
          const { optionsSQL, optionsVars } =
            typeof options === "undefined"
              ? { optionsSQL: "", optionsVars: {} }
              : getPaginatedQueryOptionSQL(options);

          const stmt = noCursor
            ? `SELECT ${
                options?.distinct ? "DISTINCT" : ""
              } ${columns} FROM \`${tableName}\` WHERE ${
                filters.stmt
              }  ${optionsSQL};`
            : `SELECT ${
                options?.distinct ? "DISTINCT" : ""
              } ${columns} FROM \`${tableName}\` WHERE ${pkName} > $cursor AND ${
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
            ...paginatedVars,
          });

          const lastItem: any = data.at(-1);
          const nextItems = await client.getAllAsync(
            `SELECT ${
              options?.distinct ? "DISTINCT" : ""
            } ${pkName} FROM \`${tableName}\` WHERE ${pkName} > $cursor AND ${
              filters.stmt
            };`,
            { ...values, $cursor: lastItem?.id }
          );
          const hasNextPage = nextItems.length !== 0;
          const nextCursor = !hasNextPage
            ? undefined
            : lastItem[pkName.replace(/`/g, "")];

          const paginatedResult: TPaginatedData<TData> = {
            hasNextPage,
            items: data.length,
            nextCursor,
            page: data,
            isFirstPage,
            isLastPage: typeof nextCursor === "undefined",
          };
          if (typeof onSettled !== "undefined")
            onSettled({
              data: paginatedResult,
              status: hasNextPage ? "success" : "exhausted",
            });
          if (typeof onData !== "undefined")
            onData({
              data: paginatedResult,
              status: hasNextPage ? "success" : "exhausted",
            });
          if (typeof onFinish !== "undefined")
            onFinish({
              data: paginatedResult,
              status: hasNextPage ? "success" : "exhausted",
            });
          if (typeof onSuccess !== "undefined")
            onSuccess({
              data: paginatedResult,
              status: hasNextPage ? "success" : "exhausted",
            });
          setState((s) => ({
            ...s,
            status: hasNextPage ? "success" : "exhausted",
            success: true,
            querying: false,
            data: paginatedResult,
            error: null,
          }));
        }
      } catch (error: any) {
        const msg = error.message;
        if (typeof onError !== "undefined")
          onError({ message: msg, status: "error" });
        if (typeof onSettled !== "undefined")
          onSettled({
            data: {
              page: [],
              hasNextPage: false,
              isFirstPage: false,
              isLastPage: false,
              items: 0,
              nextCursor: undefined,
            },
            status: "error",
          });

        setState((s) => ({
          ...s,
          error: msg,
          status: "error",
          success: false,
          mutating: false,
          data: {
            ...s.data,
            page: [],
            hasNextPage: false,
            isFirstPage: false,
            isLastPage: false,
            items: 0,
            nextCursor: undefined,
          },
        }));
      }
    },
    [tableName, options]
  );
  React.useEffect(() => {
    get(true, "querying-first-page", options.cursor);
  }, []);
  const fetchNextPage = async () => {
    if (state.data.hasNextPage) {
      setPreviousCursor(state.data.nextCursor);
      get(false, "querying-next-page", state.data.nextCursor);
    }
  };

  const refetchPage = async () => {
    get(!!state.data.nextCursor, "refetching", previousCursor);
  };
  return {
    ...state,
    refetchPage: refetchPage,
    fetchNextPage,
  };
};
