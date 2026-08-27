import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PixelRatio, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import {
  EXPORT_INK,
  SIGNATURE_STROKE_WIDTH,
  type Stroke,
} from './signature-geometry';

const EXPORT_SCALE_CAP = 4;

export async function captureSignaturePng(params: {
  viewRef: RefObject<View | null>;
  strokes: Stroke[];
  width: number;
  height: number;
}): Promise<string> {
  const { viewRef, strokes, width, height } = params;
  if (width < 8 || height < 8) {
    throw new Error('O ateliê ainda não está pronto para exportar.');
  }
  if (strokes.length === 0) {
    throw new Error('Trace a firma antes de salvar a imagem.');
  }

  if (Platform.OS === 'web') {
    return persistDataUrl(renderStrokesToDataUrl(strokes, width, height));
  }

  const node = viewRef.current;
  if (node === null) {
    throw new Error('Não foi possível capturar a firma. Tente novamente.');
  }

  const scale = Math.min(EXPORT_SCALE_CAP, Math.max(2, PixelRatio.get()));
  const uri = await captureRef(node, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
    fileName: 'arcanum-firma',
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  });

  return persistIfDataUrl(uri);
}

export async function shareSignaturePng(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      UTI: 'public.png',
      dialogTitle: 'Salvar ou compartilhar sua firma',
    });
    return;
  }

  if (Platform.OS === 'web') {
    const dataUrl = uri.startsWith('data:')
      ? uri
      : `data:image/png;base64,${await new File(uri).base64()}`;
    downloadDataUrl(dataUrl);
    return;
  }

  throw new Error('O compartilhamento nativo não está disponível neste aparelho.');
}

function renderStrokesToDataUrl(strokes: Stroke[], width: number, height: number): string {
  const scale = Math.min(EXPORT_SCALE_CAP, Math.max(2, PixelRatio.get()));
  const canvas = createCanvas(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)));
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error('Não foi possível gerar o PNG da firma.');
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = EXPORT_INK;
  ctx.lineWidth = SIGNATURE_STROKE_WIDTH * scale;

  for (const stroke of strokes) {
    const first = stroke[0];
    if (first === undefined) {
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(first.x * scale, first.y * scale);
    if (stroke.length === 1) {
      ctx.lineTo(first.x * scale + 0.01, first.y * scale);
    } else {
      for (let index = 1; index < stroke.length; index += 1) {
        const point = stroke[index];
        if (point === undefined) {
          continue;
        }
        ctx.lineTo(point.x * scale, point.y * scale);
      }
    }
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  if (typeof document === 'undefined') {
    throw new Error('Canvas 2D indisponível neste ambiente.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function persistIfDataUrl(uri: string): Promise<string> {
  if (!uri.startsWith('data:')) {
    return uri;
  }
  return persistDataUrl(uri);
}

async function persistDataUrl(dataUrl: string): Promise<string> {
  const match = /^data:image\/png;base64,(.+)$/i.exec(dataUrl);
  const base64 = match?.[1];
  if (base64 === undefined) {
    return dataUrl;
  }

  try {
    const file = new File(Paths.cache, `arcanum-firma-${Date.now()}.png`);
    file.write(base64, { encoding: 'base64' });
    return file.uri;
  } catch {
    return dataUrl;
  }
}

function downloadDataUrl(dataUrl: string): void {
  if (typeof document === 'undefined') {
    throw new Error('Download indisponível neste ambiente.');
  }
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'arcanum-firma.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
