export const flt = {
  eq<T extends string | number>(column: string, value: T) {
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const _v: Record<string, T> = {
      [`$${column}${namedParameterKey}`]: value,
    };
    return {
      stmt: `\`${column}\` = $${column}${namedParameterKey}`,
      values: _v,
    };
  },
  neq<T extends string | number>(column: string, value: T) {
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const _v: Record<string, T> = {
      [`$${column}${namedParameterKey}`]: value,
    };
    return {
      stmt: `\`${column}\` != $${column}${namedParameterKey}`,
      values: _v,
    };
  },
  in<T extends any[]>(column: string, value: T) {
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const columns: any[] = value.map(
      (_, i) => `$${column}${i}${namedParameterKey}`
    );
    const _v: Record<string, T>[] = value.map((v, i) => ({
      [`$${column}${i}${namedParameterKey}`]: v,
    }));
    return { stmt: `\`${column}\` IN (${columns.join(", ")})`, values: _v };
  },
  notIn<T extends any[]>(column: string, value: T) {
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const columns: any[] = value.map(
      (_, i) => `$${column}${i}${namedParameterKey}`
    );
    const _v: Record<string, T>[] = value.map((v, i) => ({
      [`$${column}${i}${namedParameterKey}`]: v,
    }));
    return {
      stmt: `\`${column}\` NOT IN (${columns.join(", ")})`,
      values: _v,
    };
  },

  lt<T extends number>(column: string, value: T) {
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const _v: Record<string, T> = {
      [`$${column}${namedParameterKey}`]: value,
    };
    return {
      stmt: `\`${column}\` < $${column}${namedParameterKey}`,
      values: _v,
    };
  },
  leq<T extends number>(column: string, value: T) {
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const _v: Record<string, T> = {
      [`$${column}${namedParameterKey}`]: value,
    };
    return {
      stmt: `\`${column}\` <= $${column}${namedParameterKey}`,
      values: _v,
    };
  },
  gt<T extends number>(column: string, value: T) {
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const _v: Record<string, T> = {
      [`$${column}${namedParameterKey}`]: value,
    };
    return {
      stmt: `\`${column}\` > $${column}${namedParameterKey}`,
      values: _v,
    };
  },
  geq<T extends number>(column: string, value: T) {
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const _v: Record<string, T> = {
      [`$${column}${namedParameterKey}`]: value,
    };
    return {
      stmt: `\`${column}\` >= $${column}${namedParameterKey}`,
      values: _v,
    };
  },
  like<T extends string | number>(column: string, value: T) {
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const _v: Record<string, T> = {
      [`$${column}${namedParameterKey}`]: value,
    };
    return {
      stmt: `\`${column}\` LIKE $${column}${namedParameterKey}`,
      values: _v,
    };
  },
  not<T extends string | number>(column: string, value: T) {
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const _v: Record<string, T> = {
      [`$${column}${namedParameterKey}`]: value,
    };
    return {
      stmt: `NOT \`${column}\` = $${column}${namedParameterKey}`,
      values: _v,
    };
  },
  between<T extends number[]>(column: string, value: T) {
    if (value.length !== 2)
      throw new Error(
        `The "between" filter takes in exactly 2 numbers as array of [min, max] but got something else.`
      );
    const namedParameterKey: string = Math.random().toString().slice(2, 10);
    const columns: any[] = value.map(
      (_, i) => `$${column}${i}${namedParameterKey}`
    );
    const _v: Record<string, number>[] = value.map((v, i) => ({
      [`$${column}${i}${namedParameterKey}`]: v,
    }));
    return {
      stmt: `\`${column}\` BETWEEN ${columns.join(" AND ")}`,
      values: _v,
    };
  },
};

export type TFilter<TValue> = {
  stmt: string;
  values: TValue;
};
