import { Category } from './segment.model';

export type Vote = { UUID: string; type: 'down' | 'up' | 0 | 1 };
export type CategoryVote = { UUID: string; category: Category };

// export default class Vote {
// 	constructor(public UUID: string, public type: VoteType) {}
// }

// export class CategoryVote {
// 	constructor(public UUID: string, public category: Category) {}
// }

// export enum VoteType {
// 	DOWN,
// 	UP,
// }
