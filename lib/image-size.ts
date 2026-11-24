import "server-only";
import path from "node:path";
import sharp from "sharp";

/** Medidas reales de una imagen de public/ (se usa en build, páginas estáticas). */
export async function getImageSize(src: string): Promise<{ width: number; height: number }> {
  const metadata = await sharp(path.join(process.cwd(), "public", src)).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Sin medidas: ${src}`);
  return { width: metadata.width, height: metadata.height };
}
