import { TPaginatedQueryOptions, TQueryOptions } from "../types";

export const getQueryOptionSQL = <TValue>({
  limit,
  offset,
  order,
}: TQueryOptions<TValue>) => {
  const column = order?.column ? `\`${order.column}\`` : "";
  const sql = `
        ${!!order ? `ORDER BY ${column} ${order.order.toUpperCase()}` : ""} 
        ${!!limit ? `LIMIT $limit` : ""}
        ${!!offset ? `OFFSET $offset` : ""}
    `;
  return {
    optionsSQL: sql,
    optionsVars: { $limit: limit, $offset: offset },
  };
};

export const getPaginatedQueryOptionSQL = <TValue>({
  pageSize,
  order,
}: TPaginatedQueryOptions<TValue>) => {
  const column = order?.column ? `\`${order.column}\`` : "";
  const sql = `
        ${!!order ? `ORDER BY ${column} ${order.order.toUpperCase()}` : ""} 
        ${!!pageSize ? `LIMIT $pageSize` : ""}
    
    `;
  return {
    optionsSQL: sql,
    optionsVars: { $pageSize: pageSize },
  };
};
