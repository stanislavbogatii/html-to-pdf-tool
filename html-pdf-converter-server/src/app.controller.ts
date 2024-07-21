import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
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
  
  @ApiProperty({
    example: 10
  })
  @IsOptional()
  bottom?: number

  @ApiProperty({
    example: "container"
  })
  @IsOptional()
  containerId?: string

  @ApiProperty({
    example: 10
  })

  @IsOptional()
  top?: number

  @ApiProperty({
    example: 10
  })
  @IsOptional()
  left?: number
  
  @ApiProperty({
    example: 10
  })
  @IsOptional()
  right?: number
}

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('html-pdf/convert')
  async convertHtmlToPdf(
      @Body() {
        url, 
        format, 
        landscape = false, 
        scale, 
        left, 
        right, 
        top, 
        bottom,
        containerId
      }: HtmlPdfConvertDto, @Res() res: Response
  ) {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--enable-local-file-accesses']
      });

      if (!url.startsWith('http://') && !url.startsWith('http://'))
        url = 'https://' + url
      
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0'});
      
      if (containerId) {
        const { headHtml, contentHtml } = await page.evaluate((containerId) => {
          const headHtml = document.head.innerHTML;
          const contentElement = document.getElementById(containerId);
          const contentHtml = contentElement ? contentElement.innerHTML : '<div>No content found</div>';
          return { headHtml, contentHtml };
        }, containerId);

        const newHtmlContent = `
          <!DOCTYPE html>
          <html>
            <head>${headHtml}</head>
            <body>${contentHtml}</body>
          </html>
        `;
        await page.setContent(newHtmlContent);
      }

      const pdfBuffer = await page.pdf({
        printBackground: true , 
        format, width: 2000, 
        height: 4000, 
        scale: Number(scale), 
        waitForFonts: true, 
        landscape,
        margin: {
          bottom: bottom ? Number(bottom) + 'mm' : undefined,
          top: top ? Number(top) + 'mm' : undefined,
          left: left ? Number(left) + 'mm': undefined,
          right: right ? Number(right) + 'mm' : undefined
        }
      });

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
