import { Body, Controller, Get, HttpStatus, Injectable, Post, Res } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { Response } from 'express';
import { HtmlPdfConvertDto } from './dto';

@Injectable()
export class AppService {
  async convertHtmlToPdf({
      url, 
      format, 
      landscape = false, 
      scale, 
      left, 
      right, 
      top, 
      bottom,
      containerId
    }: HtmlPdfConvertDto
  ) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--enable-local-file-accesses']
    });

    if (!url.startsWith('https://') && !url.startsWith('http://'))
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
      scale: scale ? Number(scale): undefined, 
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
    return { pdfBuffer };
  }
}
