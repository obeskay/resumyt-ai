export class CustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class TranscriptNotFoundError extends CustomError {}
export class SummaryGenerationError extends CustomError {}
export class UserFetchError extends CustomError {}
export class VideoFetchError extends CustomError {}
export class SummaryFetchError extends CustomError {}
export class DatabaseInsertError extends CustomError {}
export class DatabaseUpdateError extends CustomError {}
