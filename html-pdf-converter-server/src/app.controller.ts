import { Body, Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { HtmlPdfConvertDto } from './dto';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('html-pdf/convert')
  async convertHtmlToPdf(
    @Body() htmlPdfConvertDto: HtmlPdfConvertDto, 
    @Res() res: Response
  ) {
    try {
      const { pdfBuffer } = await this.appService.convertHtmlToPdf(htmlPdfConvertDto)

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

  @Get('html-pdf/convert')
  async getConvertHtmlToPdf(
    @Res() res: Response, 
    @Query() htmlPdfConvertDto?: HtmlPdfConvertDto,
  ) {
    try {
      const { pdfBuffer } = await this.appService.convertHtmlToPdf(htmlPdfConvertDto)
      
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
