import { IsString, IsArray, IsEnum,ArrayMinSize, ValidateNested, IsObject, isNotEmptyObject, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer'
import "reflect-metadata";


const actions = [
  'read',
  'write',
  'edit',
  'delete',
  '*'
]

class EMAIL {
  @IsString()
  @IsNotEmpty()
  public USER: string;

  @IsString()
  @IsNotEmpty()
  public PASSWORD: string;
}

export class ConfigDto {

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => EMAIL)
  public EMAIL: EMAIL[];

}
