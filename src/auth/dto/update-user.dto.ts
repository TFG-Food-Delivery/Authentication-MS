import { IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../sagas/dto';
import { UserDto } from './user.dto';

export class UpdateCustomerUserDto {
  @IsUUID(4)
  id: string;

  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
