import { SQLiteDatabase } from "expo-sqlite";
import { TFilter } from "../filter";
import { TOperand } from "../operand";
import { getPKColumnName } from ".";

export const updateValues = <T extends Record<string, any>>(values: T) => {
  const entries = Object.entries(values);
  const stmts: string[] = [];
  const vs: Record<string, any>[] = [];
  for (const [key, value] of entries) {
    const stmt = `\`${key}\` = $${key}`;
    const v = {
      [`$${key}`]: value,
    };
    vs.push(v);
    stmts.push(stmt);
  }

  return {
    values: vs
      .flat()
      .reduce((acc: Record<string, any>, current: Record<string, any>) => {
        return { ...acc, ...current };
      }, {}),
    stmt: stmts.join(", "),
  };
};

export const updateTransaction = async <TValue, TData extends object>(
  client: SQLiteDatabase,
  tableName: string,
  filters: TFilter<TValue> | TOperand<TValue>,
  values: Partial<TData>
) => {
  const filterValues = Array.isArray(filters.values)
    ? filters.values.reduce((a: any, b: any) => {
        return { ...a, ...b };
      }, {})
    : filters.values;

  await client.withExclusiveTransactionAsync(async (tnx) => {
    const { stmt: _stmt, values: _values } = updateValues(values);
    const stmt = `UPDATE \`${tableName}\` SET ${_stmt} WHERE ${filters.stmt};`;
    const v = { ...filterValues, ..._values };
    await tnx.runAsync(stmt, v as any);
  });
  const stmt = `SELECT * FROM \`${tableName}\` WHERE ${filters.stmt};`;
  const d = await client.getAllAsync(stmt, filterValues as any);
  return d;
};

export const updateByPKTransaction = async <
  TValue extends string | number,
  TData extends object
>(
  client: SQLiteDatabase,
  tableName: string,
  pk: TValue,
  values: Partial<TData>
) => {
  const pkName = getPKColumnName(client, tableName);
  const _pkName = `$${pkName.replace(/`/g, "")}` as const;
  await client.withExclusiveTransactionAsync(async (tnx) => {
    const { stmt: _stmt, values: _values } = updateValues(values);
    const stmt = `UPDATE \`${tableName}\` SET ${_stmt} WHERE ${pkName}=${_pkName};;`;
    const args = { [_pkName]: pk, ..._values };
    await tnx.runAsync(stmt, args);
  });
  const stmt = `SELECT * FROM \`${tableName}\` WHERE ${pkName}=?;`;
  const d = await client.getFirstAsync(stmt, pk);
  return d;
};

export const updateByPKsTransaction = async <
  TValue extends Array<string | number>,
  TData extends object
>(
  client: SQLiteDatabase,
  tableName: string,
  pks: TValue,
  values: Partial<TData>
) => {
  const data: any[] = [];
  for (const pk of pks) {
    const pkName = getPKColumnName(client, tableName);
    const _pkName = `$${pkName.replace(/`/g, "")}` as const;
    await client.withExclusiveTransactionAsync(async (tnx) => {
      const { stmt: _stmt, values: _values } = updateValues(values);
      const stmt = `UPDATE \`${tableName}\` SET ${_stmt} WHERE ${pkName} = ${_pkName};`;
      const args = { [_pkName]: pk, ..._values };
      await tnx.runAsync(stmt, args as any);
      const stmt2 = `SELECT * FROM \`${tableName}\` WHERE ${pkName} = ?;`;
      const d: any = await client.getFirstAsync(stmt2, pk);
      data.push(d);
    });
  }
  return data;
};
