// app/changelog.tsx
import ChangelogEntry from "@/components/ChangeLogEntry";
import { CameraIcon } from "lucide-react";

const changelog_112 = {
  version: "v1.1.2",
  date: "31 Mei 2025",
  appName: "Cekrek! Photobooth",
  icon: <CameraIcon className="w-8 h-8" />,
  sections: [
    {
      title: "✨ Fitur Baru & Penyempurnaan",
      items: [
        {
          main: "Splash Screen Interaktif:",
          subItems: [
            "Menampilkan layar pembuka dengan logo dan teks <strong>“Cekrek!”</strong> saat awal aplikasi dimuat.",
            "Animasi <code>bounce</code> pada <code>CameraIcon</code> menggunakan GSAP untuk kesan dinamis.",
            "Transisi <em>fade-out</em> halus setelah 2 detik sebelum menampilkan aplikasi utama.",
            "Komponen <code>SplashScreen</code> ditambahkan ke root layout dan bekerja dengan <code>useRef</code> serta <code>setTimeout</code>.",
          ],
        },
      ],
    },
    {
      title: "🛠️ Refaktorisasi",
      items: [
        {
          main: "Integrasi Animasi GSAP:",
          subItems: [
            "Gunakan <code>useRef</code> untuk kontrol animasi <code>CameraIcon</code> dan kontainer splash.",
            "Animasi <code>bounce</code> dikombinasikan dengan <code>fade-out</code> menggunakan <code>gsap.fromTo</code> dan <code>gsap.to</code>.",
            "Durasi splash screen dan animasi kini dapat disesuaikan secara fleksibel.",
          ],
        },
      ],
    },
  ],
};
const changelog_111 = {
  version: "v1.1.1",
  date: "30 Mei 2025",
  appName: "Cekrek! Photobooth",
  icon: <CameraIcon className="w-8 h-8" />,
  sections: [
    {
      title: "✨ Fitur Baru & Peningkatan",
      items: [
        {
          main: "Peningkatan Kualitas Gambar Strip & Anti-Distorsi:",
          subItems: [
            "Implementasi <code>drawRoundedImageWithCover</code> memastikan setiap foto dalam strip mengisi frame target (4:3) tanpa distorsi visual (gepeng), mirip efek <code>object-fit: cover</code>.",
            "<strong>Penyesuaian Cerdas Hasil Kamera HP:</strong> Sistem kini memproses gambar mentah dari berbagai kamera ponsel dan secara otomatis menyesuaikannya agar presisi dalam format 4:3 tanpa merusak proporsi objek.",
            "Resolusi ideal stream kamera sumber disarankan 1280x720.",
          ],
        },
        {
          main: "Pengalaman Pengguna (UX):",
          subItems: [
            "<strong>Pratinjau Video Responsif:</strong> Tampilan pratinjau video kini menyesuaikan ukuran layar.<ul class='list-disc ml-6'><li>Di layar kecil (mobile): Aspect ratio 4:3.</li><li>Di layar besar (desktop): Aspect ratio 16:9.</li><li>Perubahan ini dicapai dengan CSS, stream tetap 16:9 untuk kualitas optimal.</li></ul>",
            "Pesan placeholder informatif saat strip kosong.",
            "Tombol <em>Download Strip</em> hanya muncul ketika strip penuh dan tidak sedang <em>Retake</em>.",
            "Logika tombol \"Capture\" diperjelas (dengan <code>canCapture</code>).",
            "Perubahan <code>stripCount</code> akan memangkas gambar jika melebihi batas.",
            "Placeholder ditampilkan saat gambar individual gagal dimuat.",
          ],
        },
        {
          main: "Kustomisasi:",
          subItems: [
            'Teks default untuk strip: "Cekrek! © 2025", bisa diubah oleh pengguna.',
          ],
        },
        {
          main: "Performa:",
          subItems: [
            "Debouncing update pratinjau strip ditangani di <code>usePhotoStrip</code>.",
          ],
        },
      ],
    },
    {
      title: "🛠️ Refaktorisasi & Perubahan Internal",
      items: [
        {
          main: "Struktur Kode yang Lebih Modular:",
          subItems: [
            "Logika inti dipisah ke hooks: <code>useCameraStream</code>, <code>useImageCapture</code>, <code>usePhotoStrip</code>.",
            "Fungsi utilitas dipindah ke <code>canvasUtils.ts</code> dan <code>filterUtils.ts</code>.",
            "Konfigurasi dan TypeScript types ke <code>photoBooth.config.ts</code> dan <code>photoBooth.types.ts</code>.",
          ],
        },
        "Stream video disetel konsisten ke 16:9 (via <code>useCameraStream</code>) dan disesuaikan di CSS untuk output 4:3.",
        "Komponen <code>Camera.tsx</code> difokuskan pada UI dan manajemen state.",
        "<code>calculateFrameLayout</code> jadi satu-satunya sumber layout posisi foto.",
        "Pemeriksaan kesiapan video diperkuat sebelum proses capture.",
      ],
    },
    {
      title: "🐛 Perbaikan Bug",
      items: [
        "Perbaikan tipe <code>RefObject</code>: dari <code>RefObject&lt;Element&gt;</code> ke <code>RefObject&lt;Element | null&gt;</code>.",
        "Gambar gepeng di strip telah diatasi dengan <code>drawRoundedImageWithCover</code> + aspect ratio tetap.",
      ],
    },
  ],
};

const changelog_110 = {
  version: "v1.1.0",
  date: "27 Mei 2025",
  appName: "Cekrek! Photobooth",
  icon: <CameraIcon className="w-8 h-8" />,
  sections: [
    {
      title: "🚀 Versi Perdana!",
      items: [
        {
          main: "Fitur Awal:",
          subItems: [
            "Capture foto dari kamera device",
            "Tampilkan strip preview (4 atau 8 gambar)",
            "Unduh hasil strip sebagai PNG",
            "Mirror mode, Filter, dan Text Stamp",
          ],
        },
        {
          main: "Struktur Modular:",
          subItems: [
            "Komponen terpisah: VideoCapture, StripPreview, ControlPanel",
            "Support untuk pengembangan fitur baru",
          ],
        },
      ],
    },
  ],
};

export default function Changelog() {
  return (
    <div className="flex flex-col">
      <ChangelogEntry
        {...changelog_112}
      />
      <ChangelogEntry {...changelog_111}/>
      <ChangelogEntry {...changelog_110}/>
    </div>
  );
}
