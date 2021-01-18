export class ResponseError extends Error {
	constructor(public status: number, message?: string) {
		super(message);
		this.name = 'ResponseError';
	}
}
