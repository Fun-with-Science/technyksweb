import { Injectable, BadRequestException, UnauthorizedException, OnModuleInit, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async onModuleInit() {
    await this.seedDefaultAdmin();
  }

  async seedDefaultAdmin() {
    const adminEmail = 'admin@technyks.com';
    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminUser = {
      id: 'usr_admin_default',
      email: adminEmail,
      passwordHash,
      name: 'Technyks Principal Admin',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.prisma.isDbConnected) {
      try {
        const existing = await this.prisma.user.findUnique({ where: { email: adminEmail } });
        if (!existing) {
          await this.prisma.user.create({ data: adminUser as any });
        }
      } catch (e) {
        this.logger.warn('Prisma seed admin check deferred to in-memory store.');
      }
    }

    // Always seed in-memory store
    const inMemExisting = this.prisma.inMemoryUsers.find(u => u.email === adminEmail);
    if (!inMemExisting) {
      this.prisma.inMemoryUsers.push(adminUser);
    }
  }

  async signup(dto: { email: string; password?: string; name: string; googleId?: string }) {
    const cleanEmail = dto.email.toLowerCase().trim();

    // Check existing user
    let existing: any = null;
    if (this.prisma.isDbConnected) {
      try {
        existing = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
      } catch (e) {
        existing = this.prisma.inMemoryUsers.find(u => u.email === cleanEmail);
      }
    } else {
      existing = this.prisma.inMemoryUsers.find(u => u.email === cleanEmail);
    }

    if (existing) {
      throw new BadRequestException('An account with this email already exists.');
    }

    let passwordHash: string | null = null;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const role = cleanEmail.includes('admin') ? 'ADMIN' : 'STUDENT';
    const newUser = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      passwordHash,
      googleId: dto.googleId || null,
      name: dto.name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.prisma.isDbConnected) {
      try {
        await this.prisma.user.create({ data: newUser as any });
      } catch (e) {
        this.prisma.inMemoryUsers.push(newUser);
      }
    }

    this.prisma.inMemoryUsers.push(newUser);

    const token = this.generateToken(newUser.id, newUser.email, newUser.role);

    return {
      accessToken: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatarUrl: null,
      },
    };
  }

  async login(dto: { email: string; password?: string; googleId?: string }) {
    const cleanEmail = dto.email.toLowerCase().trim();

    let user: any = null;
    if (this.prisma.isDbConnected) {
      try {
        user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
      } catch (e) {
        user = this.prisma.inMemoryUsers.find(u => u.email === cleanEmail);
      }
    }
    
    if (!user) {
      user = this.prisma.inMemoryUsers.find(u => u.email === cleanEmail);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (dto.password) {
      if (!user.passwordHash) {
        throw new UnauthorizedException('Please sign in using Google OAuth.');
      }
      const valid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Invalid email or password.');
      }
    } else if (dto.googleId) {
      if (user.googleId !== dto.googleId) {
        throw new UnauthorizedException('Google authentication failed.');
      }
    } else {
      throw new BadRequestException('Password or Google ID required.');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl || null,
      },
    };
  }

  async forgotPassword(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    let user: any = null;
    if (this.prisma.isDbConnected) {
      try {
        user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
      } catch (e) {
        user = this.prisma.inMemoryUsers.find(u => u.email === cleanEmail);
      }
    } else {
      user = this.prisma.inMemoryUsers.find(u => u.email === cleanEmail);
    }

    if (!user) {
      return { message: 'If an account exists with this email, a reset link has been dispatched.' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'reset-password' },
      { expiresIn: '1h' }
    );

    return {
      message: 'Password reset link dispatched successfully.',
      resetToken,
    };
  }

  async resetPassword(resetToken: string, newPassword?: string) {
    try {
      const payload = this.jwtService.verify(resetToken);
      if (payload.purpose !== 'reset-password') {
        throw new BadRequestException('Invalid reset token.');
      }

      if (!newPassword || newPassword.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters.');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      if (this.prisma.isDbConnected) {
        try {
          await this.prisma.user.update({
            where: { id: payload.sub },
            data: { passwordHash },
          });
        } catch (e) {
          const u = this.prisma.inMemoryUsers.find(x => x.id === payload.sub);
          if (u) u.passwordHash = passwordHash;
        }
      }
      
      const u = this.prisma.inMemoryUsers.find(x => x.id === payload.sub);
      if (u) u.passwordHash = passwordHash;

      return { message: 'Password has been reset successfully. You can now login.' };
    } catch (e) {
      throw new BadRequestException('Expired or invalid reset token.');
    }
  }

  private generateToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }
}
