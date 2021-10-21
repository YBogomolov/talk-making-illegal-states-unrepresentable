/* eslint-disable max-classes-per-file, @typescript-eslint/no-namespace, init-declarations */

//* Part 1: Opaque types

namespace Tag {
  declare const OpaqueTagSymbol: unique symbol;
  declare class OpaqueTag<S extends symbol> {
    private [OpaqueTagSymbol]: S;
  }
  export type OpaqueType<T, S extends symbol> = T & OpaqueTag<S>;
}

export type Opaque<T, S extends symbol> = Tag.OpaqueType<T, S>;

const UserIdS = Symbol.for('UserId');
type UserId = Opaque<string, typeof UserIdS>;

const doSomethingWithUser = (id: UserId): void => {
  console.log(id);
};

doSomethingWithUser('123');

const userId = '123' as UserId;
doSomethingWithUser(userId);

//* Part 2: io-ts and smart validators

import * as t from 'io-ts';
import { withMessage } from 'io-ts-types';

const EmailS = Symbol.for('Email');
const Email = withMessage(
  t.brand(t.string, (str): str is Email => /.+@.+\..+/gu.test(str), 'Email'),
  input => `Email should contain at-sign and a dot, got instead: ${JSON.stringify(input)}`
);
type Email = t.Branded<string, { readonly Email: typeof EmailS }>;

const email1: Email = 'foo@bar';

const email2 = Email.decode('foo@bar'); // y: Validation<Email>

console.log(email1, email2);
