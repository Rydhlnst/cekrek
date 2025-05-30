import { Card, CardContent } from "@/components/ui/card";
import { CameraIcon } from "lucide-react";

export default function Changelog() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div className="flex flex-row items-center space-x-3">
            <span><CameraIcon className="w-8 h-8"/></span> 
            <h1 className="text-3xl font-bold">Cekrek! Photobooth</h1>
        </div>
      <p className="text-muted-foreground">Versi: <strong>v1.1.0</strong> - 30 Mei 2025</p>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">✨ Fitur Baru & Peningkatan</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Peningkatan kualitas gambar strip dengan <code>drawRoundedImageWithCover</code> (mirip <code>object-fit: cover</code>).</li>
            <li>Resolusi kamera disarankan ke <strong>1280x720</strong> untuk hasil lebih tajam.</li>
            <li>Pesan placeholder informatif saat strip kosong.</li>
            <li>Tombol <em>Download Strip</em> hanya muncul saat strip penuh & tidak dalam mode <em>Retake</em>.</li>
            <li>Logika status tombol &quot;Capture&quot; diperjelas (melalui <code>canCapture</code>).</li>
            <li>Penyesuaian otomatis saat <code>stripCount</code> berubah (gambar dipotong jika melebihi batas baru).</li>
            <li>Penanganan error pemuatan gambar individual → tampilkan placeholder.</li>
            <li>Teks default strip: <em>&quot;Cekrek! © 2025&quot;</em> (dapat dikustom).</li>
            <li>Debouncing update pratinjau strip ditangani di <code>usePhotoStrip</code>.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">🛠️ Refaktorisasi & Perubahan Internal</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Custom hooks modular:
              <ul className="list-disc list-inside ml-6">
                <li><code>useCameraStream</code> → kontrol stream kamera.</li>
                <li><code>useImageCapture</code> → logika capture, countdown, filter.</li>
                <li><code>usePhotoStrip</code> → generate/update strip foto (DataURL).</li>
              </ul>
            </li>
            <li>Utilitas kanvas: <code>canvasUtils.ts</code> & <code>filterUtils.ts</code>.</li>
            <li>Konfigurasi & tipe TypeScript dipisah ke <code>photoBooth.config.ts</code> dan <code>photoBooth.types.ts</code>.</li>
            <li><code>Camera.tsx</code> kini fokus pada UI & state tinggi.</li>
            <li><code>calculateFrameLayout</code> jadi satu-satunya sumber layout frame foto.</li>
            <li>Pemeriksaan kesiapan video ditingkatkan sebelum capture dimulai.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">🐛 Perbaikan Bug</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>RefObject TypeScript error: <code>RefObject&lt;Element&gt;</code> → <code>RefObject&lt;Element | null&gt;</code>.</li>
            <li>Masalah gambar gepeng di strip telah diatasi dengan <code>drawRoundedImageWithCover</code>.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
