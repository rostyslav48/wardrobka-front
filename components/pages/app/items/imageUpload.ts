import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Phone cameras routinely hand back 3000-4000px originals. Neither the
// analyzer nor the generator needs more than this to work with, and the
// server's hard cap (IMAGE_UPLOAD_HARD_CAP_BYTES, gateway side) exists to
// reject whatever slips past this, not to be the everyday limit.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.75;

export interface PreparedImage {
  uri: string;
  mimeType: string;
  fileName: string;
}

/**
 * Downscales a picked photo when it exceeds MAX_DIMENSION on its longest
 * side; returns it unchanged otherwise, so a photo that is already small
 * skips the extra render/save round trip entirely.
 */
export async function downscaleIfNeeded(
  asset: ImagePicker.ImagePickerAsset,
): Promise<PreparedImage> {
  const fileName = asset.fileName ?? 'photo.jpg';
  const longestSide = Math.max(asset.width, asset.height);

  if (!longestSide || longestSide <= MAX_DIMENSION) {
    return { uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg', fileName };
  }

  const scale = MAX_DIMENSION / longestSide;
  const rendered = await ImageManipulator.manipulate(asset.uri)
    .resize({
      width: Math.round(asset.width * scale),
      height: Math.round(asset.height * scale),
    })
    .renderAsync();
  const saved = await rendered.saveAsync({
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  return { uri: saved.uri, mimeType: 'image/jpeg', fileName };
}

/**
 * Appends a prepared image to FormData. On web, `FormData.append` silently
 * stringifies a plain `{uri,type,name}` object instead of sending bytes —
 * the browser's FormData spec only accepts a real Blob/File — so the URI is
 * always fetched into one there, whether it came straight from the picker or
 * from `downscaleIfNeeded`. Native's FormData polyfill accepts the
 * `{uri,type,name}` shape directly, and fetching first would just be slower.
 */
export async function appendPreparedImage(
  formData: FormData,
  image: PreparedImage,
): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(image.uri);
    const blob = await response.blob();
    formData.append('image', blob, image.fileName);
    return;
  }

  formData.append('image', {
    uri: image.uri,
    type: image.mimeType,
    name: image.fileName,
  } as unknown as Blob);
}
