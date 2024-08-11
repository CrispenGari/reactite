import { CreateSQLTableValidator } from "./CreateSQLTableValidator";
import { DefaultValue, FieldType, Prettify, SQLITE_TYPE } from "./types";

interface FieldInstanceMethods<T extends SQLITE_TYPE = SQLITE_TYPE> {
  values: FieldType<T>;
  type(type: T): this;
  default(value: DefaultValue<T> | null): this;
  nullable(): this;
  unique(): this;
  autoIncrement(): this;
  pk(): this;
  stmt(): string;
}

interface FieldStaticMethods {
  type<T extends SQLITE_TYPE>(type: T): FieldInstanceMethods<T>;
  default<T extends SQLITE_TYPE>(
    value: DefaultValue<T> | null
  ): FieldInstanceMethods<T>;
  nullable<T extends SQLITE_TYPE>(): FieldInstanceMethods<T>;
  unique<T extends SQLITE_TYPE>(): FieldInstanceMethods<T>;
  autoIncrement<T extends SQLITE_TYPE>(): FieldInstanceMethods<T>;
  pk<T extends SQLITE_TYPE>(): FieldInstanceMethods<T>;
}

const createFieldInstance = <
  T extends SQLITE_TYPE = SQLITE_TYPE
>(): FieldInstanceMethods<T> => {
  const instanceMethods: FieldInstanceMethods<T> = {
    values: {
      type: "INTEGER" as T,
      autoIncrement: false,
      defaultValue: null,
      nullable: false,
      primaryKey: false,
      unique: false,
    },

    type(type: T) {
      this.values = { ...this.values, type };
      return this;
    },
    default(value: DefaultValue<T> | null) {
      this.values = { ...this.values, defaultValue: value };
      return this;
    },
    nullable() {
      this.values = { ...this.values, nullable: true };
      return this;
    },
    unique() {
      this.values = { ...this.values, unique: true };
      return this;
    },
    autoIncrement() {
      this.values = { ...this.values, autoIncrement: true };
      return this;
    },
    pk() {
      this.values = { ...this.values, primaryKey: true };
      return this;
    },
    stmt() {
      const {
        type,
        defaultValue,
        nullable,
        unique,
        autoIncrement,
        primaryKey,
      } = this.values;

      const stmt = ` ${CreateSQLTableValidator.type(
        type
      )} ${CreateSQLTableValidator.pk(
        type,
        primaryKey
      )} ${CreateSQLTableValidator.nullable(
        primaryKey,
        nullable
      )} ${CreateSQLTableValidator.default(
        type,
        defaultValue
      )} ${CreateSQLTableValidator.autoIncrement(
        type,
        autoIncrement
      )} ${CreateSQLTableValidator.unique(unique)}`;
      return stmt;
    },
  };

  return instanceMethods;
};

const createStaticMethods = (): FieldStaticMethods => {
  const staticMethods: FieldStaticMethods = {
    type<T extends SQLITE_TYPE>(type: T) {
      const instance = createFieldInstance<T>();
      return instance.type(type);
    },
    default<T extends SQLITE_TYPE>(value: DefaultValue<T> | null) {
      const instance = createFieldInstance<T>();
      return instance.default(value);
    },
    nullable<T extends SQLITE_TYPE>() {
      const instance = createFieldInstance<T>();
      return instance.nullable();
    },
    unique<T extends SQLITE_TYPE>() {
      const instance = createFieldInstance<T>();
      return instance.unique();
    },
    autoIncrement<T extends SQLITE_TYPE>() {
      const instance = createFieldInstance<T>();
      return instance.autoIncrement();
    },
    pk<T extends SQLITE_TYPE>() {
      const instance = createFieldInstance<T>();
      return instance.pk();
    },
  };

  return staticMethods;
};

// Define the factory function
export const field: Prettify<
  ReturnType<typeof createStaticMethods & typeof createFieldInstance>
> = Object.assign(createFieldInstance(), createStaticMethods());
