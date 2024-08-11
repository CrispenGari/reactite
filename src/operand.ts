import { TFilter } from "./filter";

export const op = {
  and<TValue>(...filters: TFilter<TValue | any>[]) {
    const stmt: string[] = [];
    const values: TValue[] = [];
    for (const filter of filters) {
      stmt.push(filter.stmt);
      values.push(filter.values);
    }
    return {
      stmt: stmt.join(" AND "),
      values: values as any,
    };
  },
  or<TValue>(...filters: TFilter<TValue | any>[]) {
    const stmt: string[] = [];
    const values: TValue[] = [];
    for (const filter of filters) {
      stmt.push(filter.stmt);
      values.push(filter.values);
    }
    return {
      stmt: stmt.join(" OR "),
      values: values as any,
    };
  },
};

export type TOperand<TValue> = {
  stmt: string;
  values: TValue[];
};
