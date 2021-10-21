/* eslint-disable @typescript-eslint/naming-convention */
import type { IxFunctor3 } from 'fp-ts-indexed-monad/IxFunctor';
import type { IxPointed3 } from 'fp-ts-indexed-monad/IxPointed';
import type { IxApplicative3 } from 'fp-ts-indexed-monad/lib/IxApplicative';
import type { IxApply3 } from 'fp-ts-indexed-monad/IxApply';
import type { IxChain3 } from 'fp-ts-indexed-monad/IxChain';
import type { IxMonad3 } from 'fp-ts-indexed-monad/IxMonad';
import { unsafeCoerce } from 'fp-ts/function';
import type { Functor2 } from 'fp-ts/Functor';
import type { Pointed2 } from 'fp-ts/Pointed';
import type { Apply2 } from 'fp-ts/Apply';
import type { Chain2 } from 'fp-ts/Chain';
import type { Applicative2 } from 'fp-ts/Applicative';
import type { Monad2 } from 'fp-ts/Monad';

const _URI: unique symbol = Symbol('URI');
const _I: unique symbol = Symbol('I');
const _O: unique symbol = Symbol('O');
const recipe: unique symbol = Symbol('IxBurgerBuilder.recipe');

export const URI = 'IxBurgerBuilder' as const;
export type URI = typeof URI;
declare module 'fp-ts/HKT' {
  export interface URItoKind3<R, E, A> {
    readonly IxBurgerBuilder: IxBurgerBuilder<R, E, A>;
  }
  export interface URItoKind2<E, A> {
    readonly IxBurgerBuilder: IxBurgerBuilder<E, E, A>;
  }
}

export interface IxBurgerBuilder<I, O, A> {
  readonly [_URI]: URI;
  readonly [_I]: I;
  readonly [_O]: O;
  readonly [recipe]: A;
}

function mkIxBurgerBuilder<I, O, A>(initialRecipe: A): IxBurgerBuilder<I, O, A> {
  return {
    [_URI]: URI,
    [_I]: unsafeCoerce(undefined),
    [_O]: unsafeCoerce(undefined),
    [recipe]: initialRecipe,
  };
}

export function runIxBurgerBuilder<I, O, A>(ibb: IxBurgerBuilder<I, O, A>): A {
  return ibb[recipe];
}

export const ixof: IxPointed3<URI>['ixof'] = a => mkIxBurgerBuilder(a);

export const ixmap: IxFunctor3<URI>['ixmap'] = f => fa => mkIxBurgerBuilder(f(runIxBurgerBuilder(fa)));

export const ixap: IxApply3<URI>['ixap'] = fa => fab =>
  mkIxBurgerBuilder(runIxBurgerBuilder(fab)(runIxBurgerBuilder(fa)));

export const ixchain: IxChain3<URI>['ixchain'] = f => fa =>
  mkIxBurgerBuilder(runIxBurgerBuilder(f(runIxBurgerBuilder(fa))));

export const of: Pointed2<URI>['of'] = mkIxBurgerBuilder;

const map_: Functor2<URI>['map'] = (fa, f) => mkIxBurgerBuilder(f(runIxBurgerBuilder(fa)));

const ap_: Apply2<URI>['ap'] = (fab, fa) => ixap(fa)(fab);

const chain_: Chain2<URI>['chain'] = (fa, f) => mkIxBurgerBuilder(runIxBurgerBuilder(f(runIxBurgerBuilder(fa))));

export const map: <A, B>(f: (a: A) => B) => <I>(fa: IxBurgerBuilder<I, I, A>) => IxBurgerBuilder<I, I, B> = f => fa =>
  map_(fa, f);

export const ap: <I, A, B>(
  fa: IxBurgerBuilder<I, I, A>
) => (fab: IxBurgerBuilder<I, I, (a: A) => B>) => IxBurgerBuilder<I, I, B> = fa => fab => ap_(fab, fa);

export const chain: <I, A, B>(
  f: (a: A) => IxBurgerBuilder<I, I, B>
) => (fa: IxBurgerBuilder<I, I, A>) => IxBurgerBuilder<I, I, B> = f => fa => chain_(fa, f);

export const IxPointed: IxPointed3<URI> = {
  URI,
  ixof,
};

export const IxFunctor: IxFunctor3<URI> = {
  URI,
  ixmap,
};

export const IxApply: IxApply3<URI> = {
  URI,
  ixmap,
  ixap,
};

export const IxApplicative: IxApplicative3<URI> = {
  URI,
  ixof,
  ixmap,
  ixap,
};

export const IxChain: IxChain3<URI> = {
  URI,
  ixmap,
  ixap,
  ixchain,
};

export const IxMonad: IxMonad3<URI> = {
  URI,
  ixof,
  ixmap,
  ixap,
  ixchain,
};

export const Pointed: Pointed2<URI> = {
  URI,
  of,
};

export const Functor: Functor2<URI> = {
  URI,
  map: map_,
};

export const Apply: Apply2<URI> = {
  URI,
  map: map_,
  ap: ap_,
};

export const Applicative: Applicative2<URI> = {
  URI,
  of,
  map: map_,
  ap: ap_,
};

export const Chain: Chain2<URI> = {
  URI,
  map: map_,
  ap: ap_,
  chain: chain_,
};

export const Monad: Monad2<URI> = {
  URI,
  of,
  map: map_,
  ap: ap_,
  chain: chain_,
};

// ---------- Burger Builder DSL --------------

export type Ingredient =
  | 'BottomBun'
  | 'Patty'
  | 'Ketchup'
  | 'Mayo'
  | 'Mustard'
  | 'Cheese'
  | 'Onion'
  | 'Lettuce'
  | 'Tomato'
  | 'TopBun';

/**
 * Types we'll use to specify the state of the system in the index type params
 * to control the order in which commands can be issued.
 */
export type Ready = 'Ready';
export type EmptyPlate = 'EmptyPlate';
export type BottomBunOn = 'BottomBunOn';
export type PattyOn = 'PattyOn';
export type CheeseOn = 'CheeseOn';
export type OnionOn = 'OnionOn';
export type LettuceOn = 'LettuceOn';
export type TomatoOn = 'TomatoOn';
export type PicklesOn = 'PicklesOn';
export type TopBunOn = 'TopBunOn';

/* @internal */ type BurgerRecipe = Ingredient[];

/**
 * # Rules of burger building
 *
 * 1. Plate required before all else
 * 2. Empty bun must be first ingredient
 * 3. Condiments go beneath the patty
 * 4. Toppings go atop the patty
 * 5. Toppings are optional and may only appear in this order: cheese -> onion -> lettuce -> tomato
 * 6. Top bun must come last and nothing else can be added after
 */

export const getEmptyPlate = mkIxBurgerBuilder<Ready, EmptyPlate, BurgerRecipe>([]);

export const addIngredient =
  <I, O>(ingredient: Ingredient) =>
  (recipe: BurgerRecipe): IxBurgerBuilder<I, O, BurgerRecipe> =>
    mkIxBurgerBuilder<I, O, BurgerRecipe>([...recipe, ingredient]);

export const placeEmptyBun = addIngredient<EmptyPlate, BottomBunOn>('BottomBun');

export const addKetchup = addIngredient<BottomBunOn, BottomBunOn>('Ketchup');

export const addMayo = addIngredient<BottomBunOn, BottomBunOn>('Mayo');

export const addMustard = addIngredient<BottomBunOn, BottomBunOn>('Mustard');

export const addPatty = addIngredient<BottomBunOn, PattyOn>('Patty');

export const addSecondPatty = addIngredient<PattyOn, PattyOn>('Patty');

export const addCheese = addIngredient<PattyOn, CheeseOn>('Cheese');

export const noCheese = (recipe: BurgerRecipe): IxBurgerBuilder<'PattyOn', 'CheeseOn', BurgerRecipe> =>
  mkIxBurgerBuilder<PattyOn, CheeseOn, BurgerRecipe>(recipe);

export const addOnions = addIngredient<CheeseOn, OnionOn>('Onion');

export const noOnions = (recipe: BurgerRecipe): IxBurgerBuilder<'CheeseOn', 'OnionOn', BurgerRecipe> =>
  mkIxBurgerBuilder<CheeseOn, OnionOn, BurgerRecipe>(recipe);

export const addLettuce = addIngredient<OnionOn, LettuceOn>('Lettuce');
export const noLettuce = (recipe: BurgerRecipe): IxBurgerBuilder<'OnionOn', 'LettuceOn', BurgerRecipe> =>
  mkIxBurgerBuilder<OnionOn, LettuceOn, BurgerRecipe>(recipe);

export const addTomato = addIngredient<LettuceOn, TomatoOn>('Tomato');
export const noTomato = (recipe: BurgerRecipe): IxBurgerBuilder<'LettuceOn', 'TomatoOn', BurgerRecipe> =>
  mkIxBurgerBuilder<LettuceOn, TomatoOn, BurgerRecipe>(recipe);

export const addTopBun = addIngredient<TomatoOn, TopBunOn>('TopBun');
