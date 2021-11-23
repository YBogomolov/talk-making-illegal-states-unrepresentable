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

export type AtLeastOne<T, Keys extends keyof T = keyof T> = Partial<T> & { [K in Keys]: Required<Pick<T, K>> }[Keys];

interface Order {
  readonly id: OrderId;
  readonly issuer: User;
  readonly date: Date;
  readonly comment: string;
  readonly state: OrderState;
}

type OrderUpdate = AtLeastOne<Omit<Order, 'id'>>;

const updateOrder = (id: OrderId, update: OrderUpdate): boolean => {
  console.log({ id, update });
  return true;
};

const orderId: OrderId = '1';

updateOrder(orderId, {}); // ❌ Property 'state' is missing in type '{}' but required in type 'Required<Pick<Omit<Order, "id">, "state">>'
updateOrder(orderId, { comment: 'Ship, please' }); // ✅ Compiles
updateOrder(orderId, { date: new Date() }); // ✅ Compiles
updateOrder(orderId, { state: 'deleted' }); // ✅ Compiles
updateOrder(orderId, { id: orderId }); // ❌ Object literal may only specify known properties, and 'id' does not exist in type 'OrderUpdate'.
