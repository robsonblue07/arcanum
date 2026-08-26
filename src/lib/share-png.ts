import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PixelRatio, Platform, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';

const SCALE_CAP = 3;

export async function captureViewPng(
  viewRef: RefObject<View | null>,
  fileName: string,
  size?: { width: number; height: number } | undefined,
): Promise<string> {
  const node = viewRef.current;
  if (node === null) {
    throw new Error('Não foi possível capturar a imagem. Tente novamente.');
  }

  const scale = Math.min(SCALE_CAP, Math.max(2, PixelRatio.get()));
  const sized =
    size !== undefined && size.width > 8 && size.height > 8
      ? {
          width: Math.round(size.width * scale),
          height: Math.round(size.height * scale),
        }
      : {};

  const uri = await captureRef(node, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
    fileName,
    ...sized,
  });

  if (!uri.startsWith('data:')) {
    return uri;
  }

  return persistDataUrl(uri, fileName);
}

export async function sharePng(uri: string, dialogTitle: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      UTI: 'public.png',
      dialogTitle,
    });
    return;
  }

  if (Platform.OS === 'web') {
    const dataUrl = uri.startsWith('data:')
      ? uri
      : `data:image/png;base64,${await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        })}`;
    downloadDataUrl(dataUrl, `${dialogTitle.replace(/\s+/g, '-').toLowerCase()}.png`);
    return;
  }

  throw new Error('O compartilhamento nativo não está disponível neste aparelho.');
}

async function persistDataUrl(dataUrl: string, fileName: string): Promise<string> {
  const match = /^data:image\/png;base64,(.+)$/i.exec(dataUrl);
  const base64 = match?.[1];
  if (base64 === undefined) {
    return dataUrl;
  }

  const directory = FileSystem.cacheDirectory;
  if (directory === null) {
    return dataUrl;
  }

  const path = `${directory}${fileName}-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return path;
}

function downloadDataUrl(dataUrl: string, fileName: string): void {
  if (typeof document === 'undefined') {
    throw new Error('Download indisponível neste ambiente.');
  }
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
