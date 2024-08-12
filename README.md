### reactite

`reactite` is a powerful and lightweight `ORM` designed specifically for React Native applications using `SQLite3`. It simplifies database management, offering a seamless way to interact with SQLite databases within your React Native apps.

<p align="center">
  <a href="https://npmjs.com/package/reactite"><img src="https://img.shields.io/npm/v/reactite.svg"></a>
  <a href="https://github.com/crispengari/reactite/actions/workflows/main.yml"><img src="https://github.com/crispengari/reactite/actions/workflows/main.yml/badge.svg"></a>
    <a href="https://github.com/crispengari/reactite/actions/workflows/publish.yml"><img src="https://github.com/crispengari/reactite/actions/workflows/publish.yml/badge.svg"></a>
  <a href="https://github.com/crispengari/reactite/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/reactite.svg?maxAge=2592000"></a>
<a href="https://img.shields.io/node/v/reactite.svg?label=node"><img src="https://img.shields.io/node/v/reactite.svg?label=node"></a>
  <a href="https://npmjs.com/package/reactite"><img src="https://img.shields.io/npm/dm/reactite.svg"></a>
  <a href="https://typescriptlang.org/"><img src="https://img.shields.io/badge/language-typescript-blue.svg"></a>
</p>

### Table of Contents

- [reactite](#reactite)
- [Table of Contents](#table-of-contents)
- [Key Features](#key-features)
- [Installation](#installation)
- [Getting started](#getting-started)
- [`ReactiteClient`](#reactiteclient)
  - [`ReactiteClient Options`](#reactiteclient-options)
- [`useReactiteClient()` hook.](#usereactiteclient-hook)
- [`useCreateTables()` hook](#usecreatetables-hook)
  - [`Arguments`](#arguments)
    - [`options`](#options)
    - [`callbacks`](#callbacks)
  - [`Return Values`](#return-values)
- [`useTables()` hook](#usetables-hook)
- [`useDatabaseName()` hook](#usedatabasename-hook)
- [`useQuery()` hook](#usequery-hook)
  - [`Arguments`](#arguments-1)
  - [`Return Values`](#return-values-1)
  - [`Usage Notes`](#usage-notes)
- [`useMutation()` hook](#usemutation-hook)
  - [`Arguments`](#arguments-2)
    - [`Mutation Callbacks`](#mutation-callbacks)
- [`useMutationByPK()` hook](#usemutationbypk-hook)
  - [`Arguments`](#arguments-3)
- [`useMutationByPKs()` hook](#usemutationbypks-hook)
  - [`Arguments`](#arguments-4)
- [`useQueryByPK()` hook](#usequerybypk-hook)
  - [`Arguments`](#arguments-5)
  - [`Return Values`](#return-values-2)
- [`useQueryByPKs()` hook.](#usequerybypks-hook)
  - [`Arguments`](#arguments-6)
  - [`Return Values`](#return-values-3)
- [`Operands`](#operands)
- [`Filters`](#filters)

### Key Features

- **Type-Safe API**: Ensures that database operations are type-checked at compile time, reducing runtime errors and enhancing code reliability.
- **Easy Setup**: Simplifies database setup and configuration with minimal boilerplate code.
- **React Integration**: Provides hooks and context-based components for easy integration with React Native, making it straightforward to access and manage database connections.
- **Schema Management**: Includes tools for defining and managing database schemas, allowing you to create, update, and manage tables effortlessly.
- **Flexible Configuration**: Offers customizable options to tailor database behavior to your specific needs, including support for timestamps and connection settings.

### Installation

To install `Reactite`, run one of the following commands based on your package manager:

```shell
# Using Yarn
yarn add reactite

# Using npm
npm install reactite

# Using pnpm
pnpm install reactite
```

### Getting started

After installation, follow these steps to set up `Reactite` in your application:

**Wrap Your Application**: Wrap your app with the `ReactiteClientProvider` and provide it with a `ReactiteClient` client.

```tsx
import { ReactiteClient, ReactiteClientProvider } from "reactite";

const client = new ReactiteClient({ dbName: "hi" });
const Layout = () => {
  return (
    <ReactiteClientProvider client={client}>
      <App />
    </ReactiteClientProvider>
  );
};
```

### `ReactiteClient`

The `ReactiteClient` constructor takes an options object to configure the client on the `sqlite3` database. The following table details the available arguments:

| Argument  | Type     | Description                                                                                               |
| --------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `dbName`  | `string` | The name of the SQLite database file to be used by `Reactite`. This is required to initialize the client. |
| `options` | `object` | Optional settings to configure the client.                                                                |

#### `ReactiteClient Options`

The `options` object can include the following properties:

| Option                                  | Type      | Description                                                                                        |
| --------------------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `enableChangeListener`                  | `boolean` | If `true`, enables the change listener for the database. Default is `false`.                       |
| `enableCRSQLite`                        | `boolean` | If `true`, enables compatibility mode with CRSQLite. Default is `false`.                           |
| `finalizeUnusedStatementsBeforeClosing` | `boolean` | If `true`, finalizes unused statements before closing the database. Default is `true`.             |
| `useNewConnection`                      | `boolean` | If `true`, uses a new database connection instead of reusing the existing one. Default is `false`. |

### `useReactiteClient()` hook.

The `useReactiteClient` hook is used to access the `SQLiteDatabase` instance within your React components. This hook simplifies interacting with the database by providing a direct reference to the database client.

Here's an example of how to use the `useReactiteClient` hook:

```tsx
import { useReactiteClient } from "reactite";

const MyComponent = () => {
  // Retrieve the SQLiteDatabase instance
  const client = useReactiteClient();

  // Use the client instance to perform database operations
  // Example: client.execute('SELECT * FROM users');

  return <View>{/* Your component code here */}</View>;
};
```

> The `client` gives you flexibility of excecuting `raw` sql statements on the sql database without using `reactite` hooks.

### `useCreateTables()` hook

A custom React hook that manages the creation of SQL tables with various options and lifecycle callbacks. This hook handles the creation, error management, and provides various callbacks for handling the state of the table creation process.

#### `Arguments`

| Parameter   | Type                     | Description                                                                                                                  |
| ----------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `table`     | `Record<string, TTable>` | An object where each key is a table name and the value is the table's configuration (columns and options).                   |
| `options`   | `CreateTableOptions`     | (Optional) Configuration options for table creation. Default is `{ skipIfExist: true, snakeCase: false, timestamps: true }`. |
| `callbacks` | `TCallBacks`             | (Optional) An object containing callback functions for various stages of the table creation process.                         |

##### `options`

| Option        | Type      | Description                                                                           |
| ------------- | --------- | ------------------------------------------------------------------------------------- |
| `skipIfExist` | `boolean` | If `true`, creates the table only if it does not already exist. Default is `true`.    |
| `snakeCase`   | `boolean` | If true, converts table names and columns to `snake_case`. Default is `false`.        |
| `timestamps`  | `boolean` | If true, adds `createdAt` and `updatedAt` timestamps to the table. Default is `true`. |

##### `callbacks`

| Callback    | Type                                                                                                         | Description                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `onError`   | `(error: { message: string; status: "error" \| "success" \| "creating" \| null; }) => void`                  | Called when an error occurs during the table creation.                                 |
| `onSuccess` | `(result: { tables: string[]; total: number; status: "error" \| "success" \| "creating" \| null; }) => void` | Called when the table creation is successful.                                          |
| `onSettled` | `(result: { tables: string[]; total: number; status: "error" \| "success" \| "creating" \| null; }) => void` | Called when the table creation process is settled, regardless of success or failure.   |
| `onStart`   | `(status: { tables: string[]; total: number; status: "error" \| "success" \| "creating" \| null; }) => void` | Called when the table creation process starts.                                         |
| `onFinish`  | `(result: { tables: string[]; total: number; status: "error" \| "success" \| "creating" \| null; }) => void` | Called when the table creation process finishes, either successfully or with an error. |

#### `Return Values`

| Return Value | Type                                         | Description                                                                                 |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `creating`   | `boolean`                                    | Indicates whether the table creation process is currently in progress.                      |
| `success`    | `boolean`                                    | Indicates whether the table creation was successful.                                        |
| `error`      | `string \| null`                             | Contains the error message if the table creation fails, or `null` if there is no error.     |
| `sql`        | `string[]`                                   | An array of SQL statements that were executed to create the tables.                         |
| `tables`     | `string[] \| null`                           | An array of the names of the tables that were created, or `null` if no tables were created. |
| `status`     | `"error" \| "success" \| "creating" \| null` | The current status of the table creation process.                                           |
| `retry`      | `() => void`                                 | A function that can be called to retry the table creation process.                          |

### `useTables()` hook

This hook allows you to get all the table names in your `sqlite` database.

```tsx
const { tables, loading } = useTables();
```

### `useDatabaseName()` hook

This hook is used to get the currenly connected database name with `reactite`.

```ts
const { db } = useDatabaseName();
```

### `useQuery()` hook

The `useQuery()` hook is a powerful utility for retrieving records from an `SQLite` database within a React Native application. It allows you to perform SQL queries while managing the state of the query process, including loading, success, and error states.

```tsx
const { data, error, querying, status, success, refetchQuery } = useQuery<
  {
    username: string;
    id: number;
  }[],
  any
>("users", flt.eq("id", 2), ["id", "username"]);
```

#### `Arguments`

| Argument    | Type                                                    | Description                                                                                                                                                           |
| ----------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tableName` | `string`                                                | The name of the table from which you want to retrieve data.                                                                                                           |
| `filters`   | `TFilter<TValue>` \| `TOperator<TValue>` \| `undefined` | Filters or conditions to be applied to the query, such as equality checks, ranges, etc. Can be an [operator](#operands) or [filter](#filters) provided by `reactite`. |
| `select`    | `string` \| `string[]` \| `undefined`                   | The columns you want to retrieve from the table. If not provided, all columns are selected by default.                                                                |

#### `Return Values`

The `useQuery()` hook returns an object containing the following properties:

| Property       | Type                                         | Description                                                                                    |
| -------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `refetchQuery` | `() => Promise<void>`                        | A function to manually re-execute the query, useful for refreshing the data.                   |
| `querying`     | `boolean`                                    | Indicates whether the query is currently being executed.                                       |
| `data`         | `TData \| null`                              | The records retrieved by the query, or `null` if no data is found or the query hasn't run yet. |
| `error`        | `string \| null`                             | Contains error information if the query fails, otherwise `null`.                               |
| `status`       | `"error" \| "success" \| "querying" \| null` | Represents the current status of the query (e.g., querying, success, error, or null if idle).  |
| `success`      | `boolean`                                    | Indicates whether the query was successful.                                                    |

#### `Usage Notes`

- The `useQuery()` hook is essential for fetching and displaying data from an SQLite database in your React Native components.
- Use the `refetchQuery` method to manually refresh the data when needed, such as in response to user actions.
- The `querying` state is useful for displaying loading indicators during data fetching.
- The `error` and `status` properties provide detailed error handling, allowing you to respond appropriately to query failures.

### `useMutation()` hook

The `useMutation` hook is a versatile hook used for performing asynchronous mutations (`insert`, `update`, `delete`) on a database table within a React Native component.

```tsx
import { useMutation } from "reactite";

const Post = () => {
  const [mutateAsync, { mutating }] = useMutation<{
    id: string;
    username: string;
    avatar: string | null;
    password: string;
    createAt: string;
    updatedAt: string;
  }>("users", "delete", {
    onData(result) {
      console.log(JSON.stringify(result, null, 2));
    },
    onError(error) {
      console.log(error);
    },
  });

  return (
    <Button
      title="Delete"
      onPress={async () => {
        await mutateAsync(op.or(flt.eq("id", 1), flt.in("id", [10, 11])));
      }}
    />
  );
};
```

This hooks takes the following as arguments:

#### `Arguments`

| Argument    | Type                                                                                    | Description                                                                                           |
| ----------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `tableName` | `string`                                                                                | The name of the table on which the mutation is to be performed.                                       |
| `operation` | `"insert" \| "update" \| "delete"`                                                      | The type of mutation operation to perform (`insert`, `update`, or `delete`).                          |
| `callbacks` | [`onError`\| `onSuccess`\| `onSettled`\| `onStart`\| `onFinish` \| `onData` ](optional) | An object containing optional callback functions for handling various stages of the mutation process. |

##### `Mutation Callbacks`

| Property    | Description                                                                       |
| ----------- | --------------------------------------------------------------------------------- |
| `onError`   | Called when an error occurs during the mutation process.                          |
| `onSuccess` | Called when the mutation is successful.                                           |
| `onSettled` | Called when the mutation process has completed, regardless of success or failure. |
| `onStart`   | Called when the mutation process starts.                                          |
| `onFinish`  | Called when the mutation process finishes.                                        |
| `onData`    | Called when data is returned during the mutation process.                         |

This hook return a tuple of `2` values, the mutation function and a result which is an object that contains the following properties

| Property   | Type                                         | Description                                   |
| ---------- | -------------------------------------------- | --------------------------------------------- |
| `mutating` | `boolean`                                    | Indicates if the mutation process is ongoing. |
| `data`     | `TData \| TData[] \| null`                   | The data returned from the mutation, if any.  |
| `error`    | `string \| null`                             | An error message if the mutation fails.       |
| `status`   | `"error" \| "success" \| "mutating" \| null` | The current status of the mutation process.   |
| `success`  | `boolean`                                    | Indicates if the mutation was successful.     |

> 👍 The `useMutation` hook is effective when you want to run mutations based on filters. However, there is a hook called [`useMutationByPK`](#usemutationbypk-hook), which does the same thing but doesn't accept filters as it uses the table's primary key to mutate documents. Note that this hook only works for the `delete` and `update` operations.

### `useMutationByPK()` hook

The `useMutationByPK` hook is a specialized hook for performing asynchronous mutations (`update`, `delete`) on a database table using the primary key of the records. This hook is a streamlined alternative to the `useMutation` hook, focusing on operations where only the primary key is needed.

```tsx
import { useMutationByPK } from "reactite";

const Post = () => {
  const [mutateAsync, { mutating }] = useMutationByPK<{
    id: string;
    username: string;
    avatar: string | null;
    password: string;
    createAt: string;
    updatedAt: string;
  }>("users", "delete", {
    onData(result) {
      console.log(JSON.stringify(result, null, 2));
    },
    onError(error) {
      console.log(error);
    },
  });

  return (
    <Button
      title="Delete"
      onPress={async () => {
        await mutateAsync(1);
      }}
    />
  );
};
```

#### `Arguments`

| Argument    | Description                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `tableName` | The name of the table on which the mutation is to be performed.                                       |
| `operation` | The type of mutation operation to perform (`update` or `delete`).                                     |
| `callbacks` | An optional object containing callback functions for handling various stages of the mutation process. |

> Note that the return types of this hooks and callbacks are the same as the ones in the [`useMutation()`](#usemutation-hook) hook.

> 👍 If you want to perform mutations based on multiple ids the `useMutationByPKs` do that.

### `useMutationByPKs()` hook

The `useMutationByPKs` hook is a specialized hook for performing asynchronous mutations (`update`, `delete`) on multiple records in a database table using their primary keys. This hook is designed for operations where multiple primary keys are needed for the mutation.

```tsx
import { useMutationByPKs } from "reactite";

const Post = () => {
  const [mutateAsync, { mutating }] = useMutationByPKs<{
    id: string;
    username: string;
    avatar: string | null;
    password: string;
    createAt: string;
    updatedAt: string;
  }>("users", "delete", {
    onData(result) {
      console.log(JSON.stringify(result, null, 2));
    },
    onError(error) {
      console.log(error);
    },
  });

  return (
    <Button
      title="Delete"
      onPress={async () => {
        await mutateAsync([1, 2, 7]);
      }}
    />
  );
};
```

#### `Arguments`

| Argument    | Description                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `tableName` | The name of the table on which the mutation is to be performed.                                       |
| `operation` | The type of mutation operation to perform (`update` or `delete`).                                     |
| `callbacks` | An optional object containing callback functions for handling various stages of the mutation process. |

> 👍 The `useMutationByPK` and `useMutationByPKs` hooks are quite similar. The key difference is that `useMutationByPK` accepts a single ID, while `useMutationByPKs` accepts an array of IDs.

### `useQueryByPK()` hook

The `useQueryByPK()` hook is designed to retrieve a record from a table in your SQLite database based on a primary key. It also allows you to specify which columns to retrieve. To use the `useQueryByPK()` hook, call it within your functional component, passing in the table name, an array of primary key values, and an optional array of column names you wish to retrieve. The hook returns an object containing the queried data and other useful states.

```tsx
import { useQueryByPK } from "reactite";
....

const { data, error, querying, status, success, refetchQuery } = useQueryByPK<
  {
    id: string;
    username: string;
  },
  number
>("users", 8, ["id", "username"]);

```

#### `Arguments`

| Argument    | Type                 | Description                                                                                                                            |
| ----------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `tableName` | `string`             | The name of the table from which to query the record.                                                                                  |
| `pk`        | `string \| number`   | The primary key value of the record you want to retrieve. Allows either a string or number type based on the table's primary key type. |
| `select`    | `string \| string[]` | An optional array of column names or a single column name to include in the result.                                                    |

#### `Return Values`

| Property       | Type                                         | Description                                                                                       |
| -------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `data`         | `TData \| null`                              | The record retrieved from the database based on the primary key, or `null` if no record is found. |
| `error`        | `string \| null`                             | Contains the error message if the query fails, otherwise `null`.                                  |
| `querying`     | `boolean`                                    | Indicates whether the query is currently in progress.                                             |
| `status`       | `"error" \| "success" \| "querying" \| null` | The current status of the query (`error`, `success`, `querying`, or `null`).                      |
| `success`      | `boolean`                                    | Indicates whether the query was successful.                                                       |
| `refetchQuery` | `Function`                                   | A function to refetch the query.                                                                  |

> 👍 **Note**: The difference between `useQuery` and `useQueryByPK` is that the former takes in filters, while the latter uses your primary key column to retrieve a single record by its value.

### `useQueryByPKs()` hook.

The `useQueryByPKs()` hook is designed to retrieve multiple records from a table in your SQLite database based on an array of primary keys. It also allows you to specify which columns to retrieve.

```tsx
import { useQueryByPKs } from "reactite";
....

 const { data, error, querying, status, success, refetchQuery } =
    useQueryByPKs<
      {
        id: string;
        username: string;
      },
      number
    >("users", [3, 8], ["id", "username"]);

```

#### `Arguments`

| Argument    | Type                 | Description                                                                                                                                                |
| ----------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tableName` | `string`             | The name of the table from which to query the records.                                                                                                     |
| `pks`       | `Array<TPK>`         | An array of primary key values for the records you want to retrieve. `TPK` can be either a `string` or `number` depending on the table's primary key type. |
| `select`    | `string \| string[]` | An optional array of column names or a single column name to include in the result.                                                                        |

#### `Return Values`

| Property       | Type                                         | Description                                                                                             |
| -------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `data`         | `TData[] \| null`                            | The records retrieved from the database based on the primary key(s), or `null` if no records are found. |
| `error`        | `string \| null`                             | Contains the error message if the query fails, otherwise `null`.                                        |
| `querying`     | `boolean`                                    | Indicates whether the query is currently in progress.                                                   |
| `status`       | `"error" \| "success" \| "querying" \| null` | The current status of the query (`error`, `success`, `querying`, or `null`).                            |
| `success`      | `boolean`                                    | Indicates whether the query was successful.                                                             |
| `refetchQuery` | `Function`                                   | A function to refetch the query.                                                                        |

> 👍 **Note**: The difference between `useQueryByPK` and `useQueryByBKs` is that the former takes in a single value of id, while the latter uses list or array primary keys to retrieve records by their primary keys.

### `Operands`

The `reactite` operands allows you to use one or more [`filters`](#filters) in a query.

```tsx
import { flt, op, useQuery } from "reactite";

// ....

const { data, error, querying, status, success, refetchQuery } = useQuery<
  {
    username: string;
    id: number;
  }[],
  any
>("users", op.or(flt.notIn("id", [8, 9]), flt.eq("id", 9)), ["id", "username"]);
```

Here are the supported `operands` in `reactite`.

| Operation | Explanation                                                                                                                                           | Example                                                                          |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **`and`** | Combines multiple [`filter`](#filters) conditions using a logical `AND`. All specified conditions must be true for the query to match.                | `op.and(filter1, filter2)` generates a SQL condition like `filter1 AND filter2`. |
| **`or`**  | Combines multiple [`filter`](#filters) conditions using a logical `OR`. At least one of the specified conditions must be true for the query to match. | `op.or(filter1, filter2)` generates a SQL condition like `filter1 OR filter2`.   |

### `Filters`

You can get all the supported filters from `reactite` as follows:

```tsx
import {flt} from `reactite`

 const { data, error, querying, status, success, refetchQuery } = useQuery<
    {
      username: string;
      id: number;
    }[],
    any
  >("users", flt.in("id", [8, 9]), ["id", "username"]);
```

Here are the filters that can be applied within `queries` and `mutations`.

| Filter    | Explanation                                                                                    | Example                                          |
| --------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `eq`      | Indicates equality. It checks if the value is equal to the specified criteria.                 | `column = $columnValue`                          |
| `neq`     | Indicates inequality. It checks if the value is not equal to the specified criteria.           | `column != $columnValue`                         |
| `in`      | Checks if the value is within a specified list of values.                                      | `column IN ($value1, $value2, ...)`              |
| `notIn`   | Checks if the value is not within a specified list of values.                                  | `column NOT IN ($value1, $value2, ...)`          |
| `lt`      | Checks if the value is less than the specified criteria.                                       | `column < $columnValue`                          |
| `leq`     | Checks if the value is less than or equal to the specified criteria.                           | `column <= $columnValue`                         |
| `gt`      | Checks if the value is greater than the specified criteria.                                    | `column > $columnValue`                          |
| `geq`     | Checks if the value is greater than or equal to the specified criteria.                        | `column >= $columnValue`                         |
| `like`    | Checks if the value matches a specified pattern.                                               | `column LIKE $columnValue`                       |
| `not`     | Checks if the value does not equal the specified criteria.                                     | `NOT column = $columnValue`                      |
| `between` | Checks if the value is between two specified values. Requires exactly two values in the array. | `column BETWEEN $columnValue1 AND $columnValue2` |
