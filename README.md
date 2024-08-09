### reactite

`reactite` is a powerful and lightweight ORM designed specifically for React Native applications using `SQLite3`. It simplifies database management, offering a seamless way to interact with SQLite databases within your React Native apps.

### Table of Contents

- [reactite](#reactite)
- [Table of Contents](#table-of-contents)
- [Key Features](#key-features)
- [Installation](#installation)
- [Getting started](#getting-started)
- [`ReactiteClient`](#reactiteclient)
  - [`ReactiteClient Options`](#reactiteclient-options)
- [`useReactiteClient` hook.](#usereactiteclient-hook)
- [`useCreateTable`](#usecreatetable)
  - [`Arguments`](#arguments)
  - [`Return Values`](#return-values)

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

### `useReactiteClient` hook.

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

### `useCreateTable`

To create a table in your React Native component, use the `useCreateTable` hook provided by `reactite`. Here is an example of how it works:

```tsx
import { useCreateTable, field } from "reactite";

const Home = () => {
  const { created, creating, error, sql, tableName } = useCreateTable(
    "users",
    {
      username: field.unique().type("TEXT"),
      password: field.type("TEXT"),
      avatar: field.type("TEXT").nullable().default("hello.jpg"),
      id: field.type("INTEGER").pk().autoIncrement(),
    },
    { timestamps: true, skipIfExist: false }
  );
  return <View style={{ flex: 1, padding: 30 }}></View>;
};
```

#### `Arguments`

The following are the arguments that the `useCreateTable` hook takes:

| Argument      | Type      | Description                                                                                                  |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `tableName`   | `string`  | The name of the table to create.                                                                             |
| `fields`      | `object`  | An object defining the table schema. Each key represents a field name and its value is a `field` definition. |
| `options`     | `object`  | Optional settings for table creation.                                                                        |
| `timestamps`  | `boolean` | Adds `createdAt` and `updatedAt` fields to the table if `true`.                                              |
| `skipIfExist` | `boolean` | If `true`, skips table creation if the table already exists.                                                 |

#### `Return Values`

The following are the return values from the `useCreateTable` hook:

| Property    | Type           | Description                                                         |
| ----------- | -------------- | ------------------------------------------------------------------- |
| `created`   | `boolean`      | Indicates whether the table was successfully created.               |
| `creating`  | `boolean`      | Indicates whether the table creation process is ongoing.            |
| `error`     | `Error \|null` | Contains any error that occurred during the table creation process. |
| `sql`       | `string[]`     | The generated SQL statements used to create the table.              |
| `tableName` | `string`       | The name of the table that was created created.                     |
