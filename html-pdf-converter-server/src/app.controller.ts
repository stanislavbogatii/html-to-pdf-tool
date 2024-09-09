import { Body, Controller, Get, HttpStatus, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { HtmlPdfConvertDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('html-pdf/convert')
  async convertHtmlToPdf(
    @Body() htmlPdfConvertDto: HtmlPdfConvertDto, 
    @Res() res: Response
  ) {
    console.log(htmlPdfConvertDto)

    try {
      const { pdfBuffer } = await this.appService.convertHtmlToPdfLightV(htmlPdfConvertDto)
      const title = htmlPdfConvertDto?.title || "converted"
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${title}.pdf`,
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
    console.log(htmlPdfConvertDto)
    try {
      const { pdfBuffer } = await this.appService.convertHtmlToPdfLightV(htmlPdfConvertDto)
      const title = htmlPdfConvertDto?.title || "converted"
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${title}.pdf`,
      });

      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Error converting HTML to PDF:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to convert HTML to PDF.');
    }
  }

  @Post('html-pdf/file')
  @ApiOperation({ summary: 'Convert HTML file to PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload HTML file',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Successfully converted HTML file to PDF.' })
  @ApiResponse({ status: 500, description: 'Failed to convert HTML file to PDF.' })
  @UseInterceptors(FileInterceptor('file'))
  async convertHtmlFileToPdf(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    try {
      const { pdfBuffer } = await this.appService.convertHtmlFileToPdf(file.buffer);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=converted.pdf',
      });

      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Error converting HTML file to PDF:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to convert HTML file to PDF.');
    }
  }
}
