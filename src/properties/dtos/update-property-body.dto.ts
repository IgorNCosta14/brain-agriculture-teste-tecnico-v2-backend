import { Transform } from "class-transformer";
import {
    IsOptional,
    IsString,
    MaxLength,
    Matches,
    Length,
} from "class-validator";

export class UpdatePropertyBodyDto {
    @IsString({ message: "name must be a string" })
    @IsOptional()
    @MaxLength(150, { message: "name must not exceed 150 characters" })
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    name?: string;

    @IsString({ message: "city must be a string" })
    @IsOptional()
    @MaxLength(100, { message: "city must not exceed 100 characters" })
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    city?: string;

    @IsString({ message: "state must be a string" })
    @IsOptional()
    @MaxLength(100, { message: "state must not exceed 100 characters" })
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    state?: string;

    @IsString({ message: "totalAreaHa must be a string" })
    @IsOptional()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: "totalAreaHa must be a valid number with up to 2 decimal places",
    })
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    totalAreaHa?: string;

    @IsString({ message: "arableAreaHa must be a string" })
    @IsOptional()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: "arableAreaHa must be a valid number with up to 2 decimal places",
    })
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    arableAreaHa?: string;

    @IsString({ message: "vegetationAreaHa must be a string" })
    @IsOptional()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: "vegetationAreaHa must be a valid number with up to 2 decimal places",
    })
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    vegetationAreaHa?: string;

    @IsString({ message: "cep must be a string" })
    @IsOptional()
    @Length(8, 20, { message: "cep must be between 8 and 20 digits" })
    @Transform(({ value }) =>
        typeof value === "string" ? value.replace(/\D/g, "").trim() : value
    )
    cep?: string;

    @IsString({ message: "complement must be a string" })
    @IsOptional()
    @MaxLength(255, { message: "complement must not exceed 255 characters" })
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    complement?: string;

    @IsString({ message: "latitude must be a string" })
    @IsOptional()
    @Matches(/^-?\d+(\.\d{1,6})?$/, {
        message: "latitude must be a valid number with up to 6 decimal places",
    })
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    latitude?: string;

    @IsString({ message: "longitude must be a string" })
    @IsOptional()
    @Matches(/^-?\d+(\.\d{1,6})?$/, {
        message: "longitude must be a valid number with up to 6 decimal places",
    })
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    longitude?: string;
}