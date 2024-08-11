import { DefaultValue, SQLITE_TYPE } from "./types";

export class CreateSQLTableValidator {
  private static types = [
    "INTEGER",
    "REAL",
    "TEXT",
    "BLOB",
    "NULL",
    "BOOLEAN",
    "NUMERIC",
    "DATETIME",
  ];

  public static pk(type: SQLITE_TYPE, pk?: boolean) {
    if (type !== "INTEGER" && !!pk)
      throw new Error(
        `Primary Key Column can only have type INTEGER but got '${type}'.`
      );
    if (pk) return "PRIMARY KEY";
    return "";
  }
  public static type(type: SQLITE_TYPE) {
    if (this.types.includes(type)) return type;
    throw new Error(`Column got unexpected type '${type}'.`);
  }
  public static default<T extends SQLITE_TYPE>(
    type: SQLITE_TYPE,
    defaultValue?: DefaultValue<T> | null
  ) {
    if (!!!defaultValue) return "";
    if (type === "BOOLEAN") return `DEFAULT ${Number(defaultValue as boolean)}`;
    if (type === "NUMERIC" || type === "REAL" || type === "INTEGER")
      return `DEFAULT ${defaultValue}`;
    if (type === "DATETIME" || type === "TEXT")
      return `DEFAULT '${defaultValue}'`;
    if (type === "NULL" || type === "BLOB") return `DEFAULT NULL`;
    return "";
  }
  public static nullable(pk?: boolean, nullable?: boolean) {
    if (typeof nullable === "undefined" || nullable || !!pk) return "";
    return "NOT NULL";
  }
  public static unique(unique?: boolean) {
    if (typeof unique === "undefined" || unique) return "UNIQUE";
    return "";
  }
  public static autoIncrement(type: SQLITE_TYPE, autoIncrement?: boolean) {
    if (typeof autoIncrement === "undefined" || !autoIncrement) return "";
    if (type !== "INTEGER")
      throw new Error(
        `Auto increment works only on INTEGER types but implemented on type '${type}'.`
      );

    return "AUTOINCREMENT";
  }
}
