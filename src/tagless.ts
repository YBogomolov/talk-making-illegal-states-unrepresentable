/* eslint-disable @typescript-eslint/naming-convention */
import { constVoid, pipe } from 'fp-ts/function';
import { task, option as O } from 'fp-ts';
import { Do } from 'fp-ts-contrib/Do';
import type { Kind, URIS } from 'fp-ts/HKT';
import type { Monad1 } from 'fp-ts/Monad';

import type { AtLeastOne } from './typelevel';
import type { Opaque } from './opaque';

import Option = O.Option;

const UserIdS = Symbol.for('UserId');
const PostIdS = Symbol.for('PostId');
type UserId = Opaque<number, typeof UserIdS>;
type PostId = Opaque<number, typeof PostIdS>;

interface PostUser {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
}

interface Post {
  readonly id: PostId;
  readonly title: string;
  readonly body: string;
  readonly tags: string[];
  readonly author: PostUser;
}
type PostUpdate = AtLeastOne<Partial<Omit<Post, 'id' | 'author'>>> & Pick<Post, 'author'>;

//* Step 1: defining eDSL:

interface Database<F extends URIS> {
  readonly getPosts: (userId: UserId) => Kind<F, Post[]>;
  readonly createPost: (post: Omit<Post, 'id'>) => Kind<F, Post>;
  readonly updatePost: (postId: PostId, update: PostUpdate) => Kind<F, Option<Post>>;
}

interface NetSend<F extends URIS> {
  readonly netSend: <T>(payload: T, address: string) => Kind<F, void>;
}

type Program<F extends URIS> = Database<F> & NetSend<F> & Monad1<F>;

//* Step 2: writing programs using eDSL:

const doSomething = <F extends URIS>(F: Program<F>): Kind<F, void> =>
  Do(F)
    .bind(
      'post',
      F.createPost({
        author: { id: 1 as UserId, name: 'John', email: 'john@example.com' },
        body: 'First post',
        tags: ['post', 'first'],
        title: 'Welcome!',
      })
    )
    .bindL('updatedPost', ({ post }) => F.updatePost(post.id, { author: post.author, tags: post.tags.concat('cool') }))
    .bindL('sendPost', ({ updatedPost }) =>
      pipe(
        updatedPost,
        O.match(
          () => F.of(console.log('Nothing to do')),
          post => F.netSend(post, 'https://api.example.com/posts')
        )
      )
    )
    .return(constVoid);

//* Step 3: defining interpreters:

const fakeDb = new Map<PostId, Post>();

const taskInterpreter: Program<task.URI> = {
  ...task.Monad,
  netSend: (payload, address) => {
    console.log(`Sending ${JSON.stringify(payload)} to ${address}`);
    return task.of(void 0);
  },
  getPosts: userId => task.of(Array.from(fakeDb.values()).filter(post => post.author.id === userId)),
  createPost: post => {
    const maxId = (Math.max(...fakeDb.keys(), 0) + 1) as PostId;
    const newPost = { id: maxId, ...post };
    fakeDb.set(maxId, newPost);
    return task.of(newPost);
  },
  updatePost: (id, update) => {
    return task.of(
      pipe(
        fakeDb.get(id),
        O.fromNullable,
        O.map(post => {
          const updatedPost = { ...post, ...update };
          fakeDb.set(id, updatedPost);
          return updatedPost;
        })
      )
    );
  },
};

//* Step 4: execute program:
void doSomething(taskInterpreter)();
