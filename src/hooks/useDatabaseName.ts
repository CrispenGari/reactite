import { useReactiteClient } from "./useReactiteClient";

export const useDatabaseName = () => {
  const client = useReactiteClient();
  return {
    db: client.databaseName,
  };
};
