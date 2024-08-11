import { ReactiteClientProps } from "./types";
import * as SQLite from "expo-sqlite";

export class ReactiteClient {
  public db: SQLite.SQLiteDatabase;
  constructor({ dbName, options }: ReactiteClientProps) {
    this.db = SQLite.openDatabaseSync(dbName, { ...options });
  }
}
