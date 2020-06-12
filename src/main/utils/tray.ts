import { createCanvas, loadImage } from 'canvas';
import { nativeImage, nativeTheme } from 'electron';
import { macOS } from 'electron-is';
import { writeFileSync } from 'fs';
import dogColorful from '../assets/dog-colorful.png';
import dogDark from '../assets/dog-dark.png';
import dogLight from '../assets/dog-light.png';

export async function getTrayImage(upload: number, download: number) {
  if (macOS()) {
    if (nativeTheme.shouldUseDarkColors) {
      return await getMacOSTrayImage(dogDark, upload, download, true);
    } else {
      return await getMacOSTrayImage(dogLight, upload, download, false);
    }
  }
  return dogColorful;
}

export function formatSpeedText(speed: number) {
  if (speed < 1024) {
    return `${Math.round(speed)}KB/s`;
  } else {
    return `${Math.round((speed / 1024) * Math.pow(10, 2)) / Math.pow(10, 2)}MB/s`;
  }
}

export async function getMacOSTrayImage(imgUrl: string, upload: number, download: number, isDark: boolean) {
  const canvas = createCanvas(300, 96);
  const ctx = canvas.getContext('2d');
  const image = await loadImage(imgUrl);
  ctx.drawImage(image, 0, 0, 200, 200, 5, 0, 96, 96);
  ctx.beginPath();
  ctx.fillStyle = isDark ? '#ffffff' : '#333';
  ctx.font = '35px "PingFang SF"';
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(formatSpeedText(upload), 290, 15);
  ctx.fillText(formatSpeedText(download), 290, 55);
  ctx.closePath();
  return nativeImage.createFromBuffer(canvas.toBuffer(), { scaleFactor: 4 });
}
