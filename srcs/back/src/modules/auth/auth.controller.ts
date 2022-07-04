import { Controller, Get, Logger, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(
    private usersService: UsersService,
    private userRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard('42'))
  @Get('42/callback')
  async fortyTwoCallback(
    @Req()
    request,
    @Res()
    response: Response,
  ): Promise<void> {
    this.logger.log(request.user);
    const { username, email, photo } = request.user;
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      const createUserDto: CreateUserDto = { username, email, photo };
      await this.usersService.createUser(createUserDto);
    }
    this.logger.log(user);
    const payload = { email };
    const accessToken = this.jwtService.sign(payload);
    this.logger.log(accessToken);
    response.cookie('access_token', accessToken);
    response.redirect(302, 'http://127.0.0.1:3000');
  }
}
