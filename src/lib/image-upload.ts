/** Convert any browser-decodable image to JPEG for reliable OCR upload */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.type === "image/jpeg" && file.size < 4 * 1024 * 1024) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const maxEdge = 2400;
  let { width, height } = bitmap;

  if (width > maxEdge || height > maxEdge) {
    const scale = maxEdge / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not convert image"))),
      "image/jpeg",
      0.88
    );
  });

  return new File([blob], "scan.jpg", { type: "image/jpeg" });
}
