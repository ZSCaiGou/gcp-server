import {
    CanActivate,
    ExecutionContext,
    Injectable,
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
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 获取请求对象
        const req = context.switchToHttp().getRequest<Request>();
        // 获取token
        const token = this.extractTokenFromHeader(req);

        // 获取是否为公开路由
        const isPublic = this.reflector.get(
            IS_PUBLIC_KEY,
            context.getHandler(),
        );
        // 如果为公开路由，则直接返回true
        if (isPublic) {
            return true;
        }

        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            // 验证token
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            req.user = payload;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(req: Request) {
        // 从header中提取token
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        return token === 'Bearer' ? token : undefined;
    }
}
