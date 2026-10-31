import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './Dtos/Login.dto.js';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { RegisterDto } from './Dtos/register.dto.js';
import { enumRoles } from '../common/enums/enumRoles.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(d: RegisterDto , role: enumRoles = enumRoles.TRAINEE) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: d.email },
                    { username: d.username },
                ],
            },
        });

        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(d.password, 10);

        const user = await this.prisma.user.create({
            data: {
                firstName: d.firstName,
                lastName: d.lastName,
                username: d.username,
                email: d.email,
                age: d.age,
                role ,
                password: hashedPassword,
            },
        });

        return {
            username: user.username,
            role: user.role,
        };
    }

    //1
    private async validateUser(d: LoginDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: d.identifier },
                    { username: d.identifier },
                ]
            }
        });

        if (!user) {
            throw new UnauthorizedException('Email or password incorrect');
        }

        const isMatch = await bcrypt.compare(d.password, user.password);

        if (!isMatch) {
            throw new UnauthorizedException('Email or password incorrect');
        }
        return user;
    }
    //2
    private async signTokens(user: { id: number; role: string }, sid: number) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                { id: user.id, role: user.role, sid },
                { secret: this.configService.getOrThrow<string>('JWT_SECRET'), expiresIn: '15m' },
            ),
            this.jwtService.signAsync(
                { id: user.id, sid },
                { secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'), expiresIn: '7d' },
            ),
        ]);
        return { accessToken, refreshToken };
    }

    private hash(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }
    //3
    private saveRefreshHash(sid: number, token: string) {
        return this.prisma.session.update({
            where: { id: sid },
            data: { refreshTokenHash: this.hash(token) },
        });
    }



    async login(d: LoginDto) {
        //1
        const user = await this.validateUser(d);

        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                refreshTokenHash: '',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        //2
        const tokens = await this.signTokens(user, session.id);
        //3
        await this.saveRefreshHash(session.id, tokens.refreshToken);

        return tokens;

    }

    async refresh(refreshToken: string) {
        let payload: { id: number; sid: number };
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            throw new UnauthorizedException();
        }

        const session = await this.prisma.session.findUnique({
            where: { id: payload.sid },
        });

        if (!session || session.revokedAt || session.expiresAt < new Date()) {
            throw new UnauthorizedException();
        }

        if (session.refreshTokenHash !== this.hash(refreshToken)) {
            await this.prisma.session.update({
                where: { id: session.id },
                data: { revokedAt: new Date() },
            });
            throw new UnauthorizedException();
        }

        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: payload.id },
        });

        const tokens = await this.signTokens(user, session.id);

        await this.saveRefreshHash(session.id, tokens.refreshToken);

        return tokens;

    }

    logout(sid: number) {
        return this.prisma.session.update({
            where: { id: sid },
            data: { revokedAt: new Date() },
        });
    }

    logoutOthers(userId: number, currentSid: number) {
        return this.prisma.session.updateMany({
            where: { userId, id: { not: currentSid }, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
}