import {CombinatorResult} from './CombinatorResult';

export abstract class Combinator {
    abstract recognizer(inbound: CombinatorResult): CombinatorResult;
    abstract action(matchValue: string[]): void;
}
