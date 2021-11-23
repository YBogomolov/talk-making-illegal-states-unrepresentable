import { absurd } from 'fp-ts/function';

//* Usage of `never` type

type PrefixedWithSlash<S extends string> = S extends `/${string}` ? S : never;

const requiresSlash = <S extends string>(str: PrefixedWithSlash<S>): S => str;

requiresSlash('/hello'); // ✅
requiresSlash('hello!'); // ❌

type ADT =
  | { readonly tag: 'First'; readonly foo: string }
  | { readonly tag: 'Second'; readonly bar: number[] }
  | { readonly tag: 'Third'; readonly baz: boolean };

const doSomething = (x: ADT): string => {
  switch (x.tag) {
    case 'First':
      return x.foo; // x is narrowed to First
    case 'Second':
      return x.bar.join(); // x is narrowed to Second
    case 'Third':
      return x.baz.toString(); // x is narrowed to Third
    default:
      return absurd(x); // x is inferred as `never`
  }
};

doSomething({ tag: 'First', foo: 'a' });

//* ReplaceDeep

type ReplaceDeep<Type, Path extends string, With> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof Type
    ? Omit<Type, Key> & { [K in Key]: ReplaceDeep<Type[Key], Rest, With> }
    : Omit<Type, Key> & { [K in Key]: With }
  : Omit<Type, Path> & { [K in Path]: With };

interface User {
  readonly name: string;
  readonly isActive: boolean;
}

type ActiveUser = ReplaceDeep<User, 'isActive', true>;

const user: ActiveUser = {
  name: 'John',
  isActive: false, // ❌ Type 'false' is not assignable to type 'true'
};

console.log(user);

//* AtLeastOne

type OrderId = string;
type OrderState = 'active' | 'deleted';

//Construct type with all required keys and at least one of other
export type AtLeastOne<T, RequiredKeys extends keyof T = keyof T> = Required<Pick<T, RequiredKeys>> & { [K in Exclude<keyof T, RequiredKeys> ]: Record<K, T[K]> }[Exclude<keyof T, RequiredKeys>];

export type IsTrue<T extends true> = T;

export type IsFalse<T extends false> = T;

export type IfExtends<T, U, TOnTrue = true, TonFalse = false> = T extends U ? TOnTrue : TonFalse;

type Issuer01 = {
    a: string, 
    b: number,
    c: boolean
}

type TEST_CASE_ATLEASTONE = [
    IsFalse<IfExtends<{ a: string }, AtLeastOne<Issuer01, 'a'>>>,
    IsTrue<IfExtends<{ a: string, b: number }, AtLeastOne<Issuer01, 'a'>>>,
    IsFalse<IfExtends<{ a: string, b: number }, AtLeastOne<Issuer01, 'a' | 'b'>>>,
]

interface Order {
  readonly id: OrderId;
  readonly issuer: User;
  readonly date: Date;
  readonly comment: string;
  readonly state: OrderState;
}

type OrderUpdate = AtLeastOne<Order, 'id'>;

const updateOrder = (update: OrderUpdate): boolean => {
  console.log({ update });
  return true;
};

const orderId: OrderId = '1';

updateOrder({}); // ❌ Property 'state' is missing in type '{}' but required in type 'Required<Pick<Omit<Order, "id">, "state">>'
updateOrder({ id: orderId, comment: 'Ship, please' }); // ✅ Compiles
updateOrder({ id: orderId, date: new Date() }); // ✅ Compiles
updateOrder({ id: orderId, state: 'deleted' }); // ✅ Compiles
updateOrder({ id: orderId }); // ❌ Object literal may only specify known properties, and 'id' does not exist in type 'OrderUpdate'.
