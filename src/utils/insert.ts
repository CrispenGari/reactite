import { SQLiteDatabase } from "expo-sqlite";
import { getPKColumnName } from ".";

export const insertTransaction = async <T extends object>(
  client: SQLiteDatabase,
  tableName: string,
  values: T[]
) => {
  const data: T[] = [];
  await client.withExclusiveTransactionAsync(async (tnx) => {
    for (const value of values) {
      const entries = Object.entries(value);
      const columns = entries.map(([key, _]) => `\`${key}\``);
      const stmt = `INSERT INTO \`${tableName}\`(${columns.join(
        ", "
      )}) VALUES(${columns.map((_) => "?").join(", ")});`;
      const pkName = getPKColumnName(client, tableName);
      const res = await tnx.runAsync(
        stmt,
        entries.map(([_, v]) => v)
      );
      const d: any = await tnx.getFirstAsync(
        `SELECT * FROM \`${tableName}\` WHERE ${pkName} = $id`,
        {
          $id: res.lastInsertRowId,
        }
      );
      data.push(d);
    }
  });
  return data;
};
