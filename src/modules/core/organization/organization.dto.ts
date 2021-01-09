import { IsBoolean, IsOptional, IsString} from 'class-validator';

export class OrganizationDto {
  @IsString()
  public name: string;

  @IsString()
  @IsOptional()
  public logo?: string;

  @IsBoolean()
  @IsOptional()
  public active?: boolean;

}
