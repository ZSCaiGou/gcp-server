import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 获取请求对象
        const req = context.switchToHttp().getRequest<Request>();

        this.logger.log('Path:' + req.path);
        // 获取token
        const token = this.extractTokenFromHeader(req);

        // 获取是否为公开路由
        const isPublic = this.reflector.get(
            IS_PUBLIC_KEY,
            context.getHandler(),
        );

        // 如果是公开路由，直接返回true
        if (!token) {
            if (isPublic) {
                return true;
            }
            throw new UnauthorizedException();
        }
        try {
            // 验证token
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });
            req['user'] = payload;
        } catch (err) {
            throw err;
        }
        return true;
    }

    private extractTokenFromHeader(req: Request) {
        const authorization = req.headers.authorization as string;
        // 从header中提取token
        const [type, token] = authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
