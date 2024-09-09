import React from "react";
import { ReactiteClient } from "./ReactiteClient";

/**
 * DatabaseContext is a React context that holds the ReactiteClient instance.
 * This context is used to provide the client throughout the component tree for database access.
 *
 * @see [Getting Started](https://github.com/CrispenGari/reactite?tab=readme-ov-file#getting-started)
 */
export const DatabaseContext = React.createContext<ReactiteClient | null>(null);

/**
 * ReactiteClientProvider component is responsible for wrapping the application or part of it
 * and providing the ReactiteClient instance through context.
 *
 * @param {Object} props - The props object.
 * @param {ReactiteClient} props.client - The Reactite client instance to be provided to the context.
 * @param {React.ReactNode} props.children - The children components that will have access to the Reactite client.
 *
 * @example
 * import { ReactiteClient, ReactiteClientProvider } from "reactite";
 *
 * const client = new ReactiteClient({ dbName: "hi" });
 * const Layout = () => {
 *   return (
 *     <ReactiteClientProvider client={client}>
 *       <App />
 *     </ReactiteClientProvider>
 *   );
 * };
 *
 * @returns {JSX.Element}  The context provider that wraps the children and passes down the client instance.
 *
 * @see [Getting Started](https://github.com/CrispenGari/reactite?tab=readme-ov-file#getting-started)
 */
export const ReactiteClientProvider = ({
  children,
  client,
}: {
  client: ReactiteClient;
  children: React.ReactNode;
}) => {
  return (
    <DatabaseContext.Provider value={client}>
      {children}
    </DatabaseContext.Provider>
  );
};
