import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';
import { Result } from '../result/Result';

@Catch()
export class JwtExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(JwtExceptionFilter.name);
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const result = Result.error(exception.message, 401, null);
        this.logger.log('error: ' + exception.message);

        response.status(result.StatuCode).send(result);
    }
}
