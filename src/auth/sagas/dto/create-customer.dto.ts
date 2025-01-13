import { ValidateNested } from 'class-validator';
import { RegisterUserDto } from '../../dto/register-user.dto';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

export class CreateCustomerDto {
  @ValidateNested()
  @Type(() => RegisterUserDto)
  user: RegisterUserDto;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
