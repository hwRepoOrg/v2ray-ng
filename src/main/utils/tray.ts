import { NativeImage, nativeTheme } from 'electron';
import { macOS } from 'electron-is';
import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';
import dogDark from '../assets/dog-dark.png';
import dogLight from '../assets/dog-light.png';
import dogColorful from '../assets/dog-colorful.png';

export function getTrayImageUrl() {
  if (macOS()) {
    if (nativeTheme.shouldUseDarkColors) {
      return dogDark;
    } else {
      return dogLight;
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

export async function getTrayImage(upload: number, download: number): Promise<NativeImage> {
  const canvas = createCanvas(100, 32);
  const ctx = canvas.getContext('2d');
  const image = await loadImage(getTrayImageUrl());
  ctx.drawImage(image, 0, 0, 200, 200, 0, 0, 32, 32);
  ctx.beginPath();
  ctx.strokeText(formatSpeedText(upload), 38, 2, 60);
  ctx.strokeText(formatSpeedText(download), 38, 18, 60);
  ctx.closePath();
  writeFileSync('./tray.png', canvas.toBuffer());
  return NativeImage.createFromDataURL(canvas.toDataURL('image/png'));
}
