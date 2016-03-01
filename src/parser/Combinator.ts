import {CombinatorResult} from './CombinatorResult';

export interface ICombinatorAction {
    (matches: string[][], result: CombinatorResult): void;
}

export abstract class Combinator {
    protected action: ICombinatorAction;
    protected productions: Combinator[];

    // constructor(protected action: ICombinatorAction, ...productions: Combinator[]) {
    //     this.productions = productions;
    // }

    abstract recognizer(inbound: CombinatorResult): CombinatorResult;
}
