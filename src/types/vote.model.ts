import { Category } from './segment.model';

export default class Vote {
	constructor(public UUID: string, public type: VoteType) {}
}

export class CategoryVote {
	constructor(public UUID: string, public category: Category) {}
}

export enum VoteType {
	DOWN,
	UP,
}
