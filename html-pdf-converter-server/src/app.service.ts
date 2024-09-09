import { Body, Controller, Get, HttpStatus, Injectable, Post, Res } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { Response } from 'express';
import { HtmlPdfConvertDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';


@Injectable()
export class AppService {

  async convertHtmlToPdfLightV({
    url, 
    format = "A4", 
    landscape = false, 
    scale = 1, 
    left, 
    right, 
    excludeFonts = false,
    excludeImg = false,
    excludeStylesheet = false,
    top, 
    bottom,
    containerId
  }: HtmlPdfConvertDto) { 
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--enable-local-file-accesses']
    });
  
    if (!url.startsWith('https://') && !url.startsWith('http://'))
      url = 'https://' + url
  
    const page = await browser.newPage();
  
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (
        (excludeImg && resourceType === 'image') ||
        (excludeFonts && resourceType === 'font') ||
        (excludeStylesheet && resourceType === 'stylesheet')
      )  {
        request.abort();
      } else {
        request.continue();
      }
    });
  
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  
    if (containerId) {
      const { headHtml, contentHtml } = await page.evaluate((containerId) => {
        const headHtml = document.head.innerHTML;
        const contentElement = document.getElementById(containerId);
        if (contentElement) {
          const images = contentElement.getElementsByTagName('img');
          while (images.length > 0) {
            images[0].parentNode.removeChild(images[0]);
          }
        }
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
      printBackground: true, 
      format, 
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



  async convertHtmlToPdf({
      url, 
      format = "A4", 
      landscape = false, 
      scale = 1, 
      left, 
      right, 
      top, 
      title,
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
    await page.goto(url, { waitUntil: 'networkidle0' });
    
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


    const content = await page.content();
    // const filePath = await this.createHtmlFile(content)

    const pdfBuffer = await page.pdf({
      printBackground: true , 
      format, 
      width: 1000, 
      height: 1600, 
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




  async createHtmlFile(content: string) {
    const filePath = path.join(__dirname, '..', 'index.html');

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content);

    return filePath;
  }

  async convertHtmlFileToPdf(htmlBuffer: Buffer): Promise<{ pdfBuffer: Buffer }> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--enable-local-file-accesses']
    });

    const page = await browser.newPage();
    await page.setContent(htmlBuffer.toString());

    const pdfBuffer = await page.pdf({
      printBackground: true, 
      format: 'A4'
    });

    await browser.close();
    return { pdfBuffer };
  }
}


