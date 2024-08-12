import { SQLiteDatabase } from "expo-sqlite";

export const getPKColumnName = (client: SQLiteDatabase, tableName: string) => {
  const rows = client.getAllSync(`PRAGMA table_info(\`${tableName}\`);`);
  const pk: any = rows.find((r: any) => r.pk === 1);
  if (!!!pk)
    throw new Error(
      `The table "${tableName}" does not have a primary key column or the table does not exists.`
    );
  return `\`${pk.name}\``;
};
