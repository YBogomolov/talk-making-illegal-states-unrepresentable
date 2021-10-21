/* eslint-disable prettier/prettier */
import { pipe } from 'fp-ts/function';
import * as IxBB from './ix-burger';

const validBurgerRecipe = pipe(
  IxBB.getEmptyPlate,
  IxBB.ixchain(IxBB.placeEmptyBun),
  // condiments
  IxBB.ixchain(IxBB.addKetchup),
  IxBB.ixchain(IxBB.addMustard),
  // patties
  IxBB.ixchain(IxBB.addPatty),
  IxBB.ixchain(IxBB.addSecondPatty),
  // toppings
  IxBB.ixchain(IxBB.addCheese),
  IxBB.ixchain(IxBB.addOnions),
  IxBB.ixchain(IxBB.addLettuce),

  // ❗️Oops, we forgot to add tomato and get
  // Type '"LettuceOn"' is not assignable
  // to type '"TomatoOn"'
  IxBB.ixchain(IxBB.addTopBun),
  // done
  IxBB.runIxBurgerBuilder
);



validBurgerRecipe;
