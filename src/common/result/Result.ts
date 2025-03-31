import { HttpStatus } from '@nestjs/common';

export class Result<T> {
    private code: number;
    private message: string;
    private data: T | null;
    private errno: number;

    constructor(code: number, message: string, data: T,errno: number = 0) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.errno = errno;
    }

    get StatuCode(): number {
        return this.code;
    }
    get Data(): T | null {
        return this.data;
    }
    public static success<T>(message: string = 'success', data: T): Result<T> {
        return new Result<T>(HttpStatus.OK, message, data);
    }

    public static error<T>(
        message: string,
        code: number = HttpStatus.INTERNAL_SERVER_ERROR,
        data: T,
    ): Result<T> {
        return new Result<T>(code, message, data);
    }
}
