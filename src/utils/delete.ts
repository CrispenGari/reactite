import { SQLiteDatabase } from "expo-sqlite";
import { TFilter } from "../filter";
import { TOperand } from "../operand";
import { getPKColumnName } from ".";

export const deleteTransaction = async <TValue>(
  client: SQLiteDatabase,
  tableName: string,
  filters: TFilter<TValue> | TOperand<TValue>
) => {
  const filterValues = Array.isArray(filters.values)
    ? filters.values.reduce((a: any, b: any) => {
        return { ...a, ...b };
      }, {})
    : filters.values;

  await client.withExclusiveTransactionAsync(async (tnx) => {
    const stmt = `DELETE FROM \`${tableName}\` WHERE ${filters.stmt};`;
    await tnx.runAsync(stmt, filterValues as any);
  });
};
export const deleteByPKTransaction = async <TValue extends string | number>(
  client: SQLiteDatabase,
  tableName: string,
  pk: TValue
) => {
  const pkName = getPKColumnName(client, tableName);
  await client.withExclusiveTransactionAsync(async (tnx) => {
    const stmt = `DELETE FROM \`${tableName}\` WHERE ${pkName} = ?;`;
    await tnx.runAsync(stmt, pk);
  });
};
export const deleteByPKsTransaction = async <
  TValue extends Array<string | number>
>(
  client: SQLiteDatabase,
  tableName: string,
  pks: TValue
) => {
  for (const pk of pks) {
    const pkName = getPKColumnName(client, tableName);
    await client.withExclusiveTransactionAsync(async (tnx) => {
      const stmt = `DELETE FROM \`${tableName}\` WHERE ${pkName} = ?;`;
      await tnx.runAsync(stmt, pk);
    });
  }
};
