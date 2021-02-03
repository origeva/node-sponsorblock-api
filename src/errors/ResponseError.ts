export class ResponseError extends Error {
	constructor(public status: number, message?: string) {
		super(message ?? `ResponseError: ${status}`);
		this.name = 'ResponseError';
	}
}
