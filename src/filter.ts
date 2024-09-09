/**
 * `flt` is an object that contains filters that can be applied when doing queries and mutations in `reactite`.
 *
 * @example
 * ```tsx
 * import { View, Text } from 'react-native'
 * import { flt, useQuery } from 'reactite'
 * const App = ()=>{
 *  const { data } = useQuery(
 *    'users',
 *    {
 *      select: ['id', 'avatar'],
 *      filters: flt.eq('id', 1),
 *    },
 *    {
 *      onData: (data)=>{
 *  	    console.log({data})
 *      }
 *    }
 *  )
 *
 *  return (
 *     <View>
 *       <Text>Hello Reactite!</Text>
 *    </View>
 *  )
 *}
 *```
 *
 * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
 */

export const flt = {
  /**
   * `flt.eq` is the filter that takes in the column name and column value and apply the equality in the sqlite database.
   * @param column - A string of the column name.
   * @param value - The value to compare with.
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.eq('id', 1),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
  /**
   * `flt.neq` is the filter that takes in the column name and column value and apply the non-equality in the sqlite database.
   * @param column - A string of the column name.
   * @param value - The value to compare with.
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.neq('id', 1),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
  /**
   * `flt.in` uses an array of values to find records in the database that matches the values in an array based on a column name.
   * @param column - A string of the column name.
   * @param value - The value to compare with which should be an array.
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.in('id', [1, 2]),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
  /**
   * `flt.in` uses an array of values to find records in the database that does not match the values in an array based on a column name.
   * @param column - A string of the column name.
   * @param value - The value to compare with which should be an array.
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.notIn('id', [1, 2]),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
  /**
   * `flt.lt`  use the less than (`<`) equality to compare and retrieves records that matches a given criteria.
   * @param column - A string of the column name.
   * @param value - The value to compare with.
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.lt('id', 5),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
  /**
   * `flt.leq`  use the less than or equal to (`<=`) equality to compare and retrieves records that matches a given criteria.
   * @param column - A string of the column name.
   * @param value - The value to compare with.
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.leq('id', 5),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
  /**
   * `flt.gt`  use the greater than (`>`) equality to compare and retrieves records that matches a given criteria.
   * @param column - A string of the column name.
   * @param value - The value to compare with.
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.gt('id', 5),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
  /**
   * `flt.geq`  use the greater than or equal to (`>=`) equality to compare and retrieves records that matches a given criteria.
   * @param column - A string of the column name.
   * @param value - The value to compare with.
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.geq('id', 5),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
  /**
   * `flt.like`  use the `LIKE` clause to compare values based on the filter column and filter value specified in the `flt.like` filter.
   * @param column - A string of the column name.
   * @param value - The value to compare with.
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.like('name', 'john%'),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
  /**
   * `flt.not`  use the `NOT` clause to compare values based on the filter column and filter value specified in the `flt.not` filter.
   * @param column - A string of the column name.
   * @param value - The value to compare with.
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.not('name', 'john'),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
  /**
   * `flt.between`  Filters records based on a range of `min` and `max` using the column name specified in the filter.
   * @param column - A string of the column name.
   * @param value - The value to compare with, which should be an array of exactly `2` elements [`min`, `max`].
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: flt.like('id', [2, 10]),
   *    },
   *    {
   *      onData: (data)=>{
   *  	    console.log({data})
   *      }
   *    }
   *  )
   *
   *  return (
   *     <View>
   *       <Text>Hello Reactite!</Text>
   *    </View>
   *  )
   *}
   *```
   *
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#filters | Filters Documentation}
   */
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
