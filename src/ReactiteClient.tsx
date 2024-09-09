import { ReactiteClientProps } from "./types";
import * as SQLite from "expo-sqlite";

/**
 * The ReactiteClient class is responsible for managing the SQLite database connection.
 * It initializes the database using the provided name and options.
 *
 * @param {ReactiteClientProps} props - The properties for the Reactite client.
 * @param {string} props.dbName - The name of the database to open or create.
 * @param {SQLite.SQLiteDatabaseConfig} [props.options] - Optional configuration for the SQLite database.
 *
 * @example
 * import { ReactiteClient, ReactiteClientProvider } from "reactite";
 *
 * const client = new ReactiteClient({ dbName: "hi" });
 * const Layout = () => {
 *   return (
 *     <ReactiteClientProvider client={client}>
 *       <App />
 *     </ReactiteClientProvider>
 *   );
 * };
 *
 * @see [Getting Started with ReactiteClient](https://github.com/CrispenGari/reactite?tab=readme-ov-file#getting-started)
 */
export class ReactiteClient {
  public db: SQLite.SQLiteDatabase;
  constructor({ dbName, options }: ReactiteClientProps) {
    this.db = SQLite.openDatabaseSync(dbName, { ...options });
  }
}
