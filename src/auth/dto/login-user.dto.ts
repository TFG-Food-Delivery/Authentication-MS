import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(18)
  password: string;
}
