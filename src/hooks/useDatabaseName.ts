import { useReactiteClient } from "./useReactiteClient";

export const useDatabaseName = (): {
  db: string;
} => {
  const client = useReactiteClient();
  return {
    db: client.databaseName,
  };
};
