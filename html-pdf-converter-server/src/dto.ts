import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, Min, Max } from "class-validator";

export class HtmlPdfConvertDto {
  @ApiProperty({
    example: "https://remax.totul.info",
    required: true,
  })
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: "A4",
    required: false,
  })
  @IsOptional()
  format?: "A4" | "A3" | "A2" | "A0" | "Letter" | "Legal" | "Tabloid";

  @ApiProperty({
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  landscape?: boolean;

  @ApiProperty({
    example: 0.1,
    required: false,
  })
  @Min(0.1)
  @Max(2)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  scale?: number;

  @ApiProperty({
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  bottom?: number;

  @ApiProperty({
    example: "container",
    required: false,
  })
  @IsOptional()
  containerId?: string;

  @ApiProperty({
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  top?: number;

  @ApiProperty({
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  left?: number;

  @ApiProperty({
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  right?: number;
}
