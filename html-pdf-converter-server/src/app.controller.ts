import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import { Response } from 'express';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class HtmlPdfConvertDto {
  @ApiProperty( {
    example: "https://remax.totul.info"
  })
  @IsNotEmpty()
  url: string

  @ApiProperty({
    example: "A4"
  })
  @IsOptional()
  format?: "A4" | "A3" | "A2" | "A0" | "Letter" | "Legal" | "Tabloid"
  
  @ApiProperty({
    example: false
  })
  @IsOptional()
  landscape?: boolean

  @ApiProperty({
    example: 0.1
  })
  @Min(0.1)
  @Max(2)
  @IsOptional()
  scale?: number
}

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('html-pdf/convert')
  async convertHtmlToPdf(
      @Body() {url, format, landscape = false, scale}: HtmlPdfConvertDto, @Res() res: Response
  ) {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--enable-local-file-accesses']
      });

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        printBackground: true , 
        format, width: 2000, 
        height: 4000, 
        scale: Number(scale), waitForFonts: true, landscape  });

      await browser.close();

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=converted.pdf',
      });

      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Error converting HTML to PDF:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to convert HTML to PDF.');
    }
  }
}
