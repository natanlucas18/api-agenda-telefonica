import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import jwtConfig from "../config/jwt.config";
import type { ConfigType } from "@nestjs/config";
import { Request } from "express";
import { JwtPayload } from "src/types/jwt-payload";
import { AuthRequest } from "src/types/auth-request";


@Injectable()
export class AuthTokenGuard implements CanActivate {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthRequest>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('token inválido ou inexistente');
        }
        try {
            const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });
            const user = await this.userRepo.findOneBy({
                id: String(payload.sub)
            });
            if (!user) {
                throw new UnauthorizedException('Usuário não autorizado!');
            }
            request.user = user;
            request.tokenPayload = payload;
        } catch {
            throw new UnauthorizedException('Validação do token falhou');
        }
        return true;
    }

    extractTokenFromHeader(request: Request): string | undefined {
        const authorization = request.headers?.authorization;
        if (!authorization || typeof authorization !== 'string') {
            return;
        };
        return authorization.split(' ')[1];
    }
}