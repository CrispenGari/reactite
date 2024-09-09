import { TFilter } from "./filter";

/**
 * `op`  - Is an operation that allows you to join multiple filters using the `and` and `or` operand.
 *
 * @example
 * ```tsx
 * import { View, Text } from 'react-native'
 * import { flt, op, useQuery } from 'reactite'
 * const App = ()=>{
 *  const { data } = useQuery(
 *    'users',
 *    {
 *      select: ['id', 'avatar'],
 *      filters: op.and(flt.like('name', 'john%'), flt.in('id', [1, 2, 3, 5])),
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
 * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#operands | Operands Documentation}
 */
export const op = {
  /**
   * `op.and` - is an operand that is used to join filters using the `AND` operand.
   * @param filters - Filters to be joined using the `op.and`
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, op, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: op.and(flt.like('name', 'john%'), flt.in('id', [1, 2, 3, 5])),
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
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#operands | Operands Documentation}
   */
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
  /**
   * `op.or` - is an operand that is used to join filters using the `OR` operand.
   * @param filters - Filters to be joined using the `op.or`
   *
   * @example
   * ```tsx
   * import { View, Text } from 'react-native'
   * import { flt, op, useQuery } from 'reactite'
   * const App = ()=>{
   *  const { data } = useQuery(
   *    'users',
   *    {
   *      select: ['id', 'avatar'],
   *      filters: op.or(flt.like('name', 'john%'), flt.in('id', [1, 2, 3, 5])),
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
   * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#operands | Operands Documentation}
   */
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
