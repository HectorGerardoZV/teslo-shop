import {
    IsString,
    IsNotEmpty,
    MinLength,
    MaxLength,
    IsNumber,
    IsPositive,
    IsOptional,
    IsArray,
    IsIn,
    IsInt
} from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(50)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @IsString()
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags: string[];
    
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];
}
