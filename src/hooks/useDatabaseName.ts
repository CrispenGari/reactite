import { useReactiteClient } from "./useReactiteClient";

/**
 * Retrieves the name of the database currently being used by the client.
 * This hook provides the database name which was set during the initialization
 * of the `ReactiteClient`.
 *
 * @returns {Object} - An object containing the database name.
 * @returns {string} db - The name of the database.
 *
 * @example
 * // Usage example within a component
 * import { useDatabaseName } from "reactite";
 *
 * const MyComponent = () => {
 *   const { db } = useDatabaseName();
 *
 *   return (
 *     <div>
 *       <p>Current Database: {db}</p>
 *     </div>
 *   );
 * };
 *
 * // Renders the name of the database on the screen
 *
 * @see {@link https://github.com/CrispenGari/reactite?tab=readme-ov-file#usedatabasename-hook | useDatabaseName Documentation}
 */
export const useDatabaseName = (): {
  db: string;
} => {
  const client = useReactiteClient();
  return {
    db: client.databaseName,
  };
};
