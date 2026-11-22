# Kitsunesia

Web belajar bahasa Jepang berbahasa Indonesia untuk JLPT N5 sampai N1. Frontend memakai React, Vite, TypeScript, React Router, Tailwind CSS, dan TanStack Query. Supabase menangani Auth, PostgreSQL, RLS, dan Storage.

## Struktur proyek

```text
supabase/
  migrations/001_schema.sql          Skema awal, RLS, Storage, dan RPC
  migrations/002_seed.sql            Kana dasar dan materi awal N5/N4
  migrations/003_five_levels.sql     Level, konten, progres, SRS, indeks, impor
  migrations/004_level_routines.sql  Penempatan, jadwal, statistik, dan tampilan SQL
  migrations/005_level_seed.sql      Target dan seed tambahan N5–N1
  migrations/006_practical_lessons.sql  Kanji tambahan dan materi berita latihan
  migrations/007_curriculum_catalog.sql  Topik, indeks, dan akses katalog
  migrations/008_curriculum_units.sql  30 unit tematik N5–N1
  migrations/009_kanji_expansion.sql  Perluasan kanji N4–N1
  migrations/010_practice_sampling.sql  Pengambilan soal acak per bagian
  audio/                            Klip untuk bucket privat
public/
  kana-audio/                       Klip kana dasar, dakuten, dan yōon
  kanjivg/                          Diagram goresan dan lisensi
  templates/                        Template CSV kosakata, kanji, tata bahasa, soal
  kitsu.png                         Kitsu melambaikan tangan
  kitsu-sedih.png                    Kitsu memberi semangat
src/
  data.ts                           Klien Supabase, tipe, dan fungsi bersama
  Auth.tsx                          Registrasi, login email/Google, dan reset
  Landing.tsx                       Beranda publik dan demo kana
  main.tsx                          Router dan tata letak
  Levels.tsx                        Level aktif, penempatan, dan ringkasan level
  Paging.tsx                        Pencarian dan pagination server
  Curriculum.tsx                    Jalur belajar dan navigasi unit per level
  Dashboard.tsx                     Statistik, progres, target, dan pengingat
  Kana.tsx                          Kana, audio, dan canvas kana/kanji
  Content.tsx                       Kosakata, kanji, tata bahasa, dan SM-2
  Lessons.tsx                       Bacaan dan mendengar
  Quiz.tsx                          Soal, riwayat, simulasi, dan timer
  Plan.tsx                          Rencana mingguan dan kecepatan belajar
  Collection.tsx                    Bookmark, catatan, dan target harian
  Admin.tsx                         CRUD, target level, cakupan, dan daftar pengguna
  Import.tsx                        Validasi, pratinjau, dan laporan CSV
  ui.tsx                            Komponen antarmuka
  styles.css, levels.css, experience.css  Tema dan tata letak
.env.example                       Variabel lingkungan frontend
index.html, vite.config.ts         Entrypoint dan Vite
package.json, package-lock.json     Dependensi dan perintah
tsconfig.json, vercel.json         TypeScript dan routing Vercel
```

## Setup Supabase

1. Buka **SQL Editor** pada proyek Supabase. Untuk proyek baru, jalankan `001` sampai `010` berurutan, satu file per eksekusi. Jika versi N5/N4 sudah terpasang dan `001` serta `002` sudah dijalankan, mulai dari `003`. Migrasi membawa ulasan kosakata lama ke `srs_cards`, mempertahankan rencana, dan menggunakan level rencana lama sebagai level aktif jika ada. Jika `001`–`006` sudah terpasang, jalankan `007`–`010`. Pada proyek yang sudah berjalan, mulai dari migrasi pertama yang belum tercatat.
2. Di **Storage**, buka bucket privat `learning-audio`. Unggah `supabase/audio/n5.mp3` dan `n4.mp3` ke folder `seed`. Unggah lima file di `supabase/audio/levels/` ke folder `levels` di bucket. Unggah 50 file dari `supabase/audio/words/` ke folder `words`. Contoh path objek adalah `levels/n1.mp3` untuk Mendengar dan `words/n1-01.mp3` untuk Kosakata.
3. Di **Authentication → URL Configuration**, isi **Site URL** dengan `http://localhost:5173` untuk pengembangan. Tambahkan URL lokal dan `http://localhost:5173/reset` ke daftar redirect. Tambahkan URL produksi dan versi `/reset` setelah deploy.
4. Aktifkan provider **Email**. Untuk Google, buat OAuth client **Web application** di Google Cloud, masukkan callback yang ditampilkan di provider Google Supabase ke **Authorized redirect URIs**, lalu masukkan Client ID dan Client Secret ke pengaturan Supabase. Jika consent screen masih dalam mode pengujian, tambahkan akun penguji. [Panduan Google OAuth Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)
5. Daftarkan akun admin pertama. Salin UUID dari **Authentication → Users**, ganti UUID contoh pada SQL berikut, lalu jalankan lewat SQL Editor. Masuk kembali agar menu Administrasi muncul.

```sql
update public.profiles
set role = 'admin'
where id = '00000000-0000-0000-0000-000000000000';
```

## Lokal dan Vercel

Pakai Node.js 22 atau 24. Salin `.env.example` menjadi `.env.local` di samping `index.html`. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` dari tombol **Connect** di proyek Supabase. Simpan secret key dan service role key di luar variabel frontend. [Panduan API key Supabase](https://supabase.com/docs/guides/getting-started/api-keys)

```sh
npm ci
npm run dev
```

Buka `http://localhost:5173` dari URL yang dicetak Vite. Pada Windows PowerShell, gunakan `npm.cmd` jika kebijakan eksekusi menolak `npm.ps1`. Build produksi tersedia melalui `npm run build` dan dapat dilihat dengan `npm run preview`.

Di Vercel, impor repositori, pilih preset **Vite**, set build command `npm run build` dan output `dist`. Salin kedua variabel `VITE_SUPABASE_*` ke Environment Variables. Setelah deploy, set Site URL dan allowlist redirect produksi di Supabase, lalu uji refresh di `/kanji`, login Google, dan reset kata sandi. `vercel.json` mengarahkan rute SPA ke React Router. [Panduan Vite untuk Vercel](https://vite.dev/guide/static-deploy.html#vercel)

## Level dan progres

Menu **Jalur Belajar** menampilkan enam unit per level dengan kosakata, tata bahasa, bacaan berfurigana, klip audio, dan latihan. Unit baru mencakup situasi seperti perkenalan, belanja, penggunaan transportasi, pengumuman publik, dan penilaian informasi. Teks, penjelasan, dan soal ditulis untuk Kitsunesia. Klip audio menggunakan suara sintetis. Semua level memakai pembagian JLPT sebagai panduan kurasi. [Irodori](https://www.irodori.jpf.go.jp/en/) · [Ringkasan kemampuan per level JLPT](https://www.jlpt.jp/e/about/levelsummary.html)

| Level | Target kanji | Target kosakata | Target tata bahasa |
| --- | ---: | ---: | ---: |
| N5 | 108 | 800 | 30 |
| N4 | 300 | 1.500 | 65 |
| N3 | 650 | 3.700 | 120 |
| N2 | 1.000 | 6.000 | 180 |
| N1 | 2.000 | 10.000 | 240 |

Target di atas kumulatif dan bisa diedit admin. Target tata bahasa adalah default proyek. Dashboard membandingkan jumlah dikuasai dengan target dan materi kumulatif yang sudah tersedia. Angka akurasi memakai jawaban di level aktif. Rekomendasi level berikutnya muncul saat 80% target kosakata sudah dikuasai dan akurasi mencapai 70%. Pengguna bebas mengganti level dari header. Tugas yang dibuka dari rencana memakai level target rencana untuk sesi itu.

Seed baru menambahkan 10 kata dengan audio, 5 kanji, 2 pola, satu bacaan, satu audio, dan tiga soal per level. Materi awal N5/N4 tetap tersedia. [PERLU DICEK] Klasifikasi level, terutama kosakata dan kanji tingkat menengah hingga lanjut, memakai perkiraan pedagogis. JLPT tidak menerbitkan daftar resmi kata, kanji, dan tata bahasa per level. [Panduan resmi JLPT](https://www.jlpt.jp/e/reference/pdf/guidebook_s_e.pdf) Simulasi menggunakan maksimal lima soal per bagian yang tersedia, dengan durasi yang dipilih pengguna.

Kartu menjadi dikuasai setelah tiga ulasan lulus beruntun. Batas kartu baru berlaku gabungan untuk kosakata dan kanji, per tanggal Asia/Jakarta, dan bisa diatur dari **Koleksi Saya**. Tugas rencana mendapat satu sesi sesuai durasi harian pada setiap hari belajar. Rencana dengan tanggal ujian membagi sisa target kata dan kanji ke hari belajar yang masih tersedia.

## Impor CSV dan sumber konten

1. Buka **Administrasi**, pilih **Kosakata**, **Kanji**, **Tata bahasa**, atau **Soal**, lalu unduh template yang sesuai.
2. Isi CSV UTF-8 dan pertahankan header. Bungkus nilai yang mengandung koma atau baris baru dengan kutip ganda. Untuk soal, pisahkan pilihan dan jawaban dengan `|`. Kosongkan pilihan untuk isian. Jika soal terhubung ke bacaan atau mendengar, isi UUID pada `passage_id` atau `listening_id`. Soal dengan audio memerlukan transkrip.
3. Unggah, klik **Validasi dan pratinjau**, lalu periksa laporan baris bermasalah. Tombol impor menyimpan baris yang valid. Server memeriksa ulang format, level, dan duplikat saat pengimporan.
4. Isi `audio_path` kosakata dengan path relatif di bucket privat atau unggah dari formulir admin. Untuk diagram kanji tambahan, salin SVG yang sesuai ke `public/kanjivg/` dengan lisensinya, isi `stroke_path` dengan nama berkas, lalu deploy ulang aset.

- **JMdict dan KANJIDIC2** dapat digunakan untuk lema, bacaan, bentuk tulis, dan data kanji. EDRDG menerbitkannya dengan CC BY-SA 4.0 dan ketentuan atribusi dalam halaman lisensinya. Periksa arti Indonesia dan pemetaan level sebelum impor. [Lisensi EDRDG](https://www.edrdg.org/edrdg/licence.html)
- **KanjiVG** menyediakan diagram goresan dengan CC BY-SA 3.0. Pertahankan atribusi Ulrich Apel dan kontributor serta lisensi untuk aset yang didistribusikan. Salin SVG untuk karakter yang dipilih sesuai kurikulum. [Repositori KanjiVG](https://github.com/KanjiVG/kanjivg)
- Bacaan, terjemahan, latihan, dan klip dapat dibuat sendiri atau diambil dari sumber berlisensi sesuai. Klip audio seed memakai ucapan sintetis.

Migrasi `006_practical_lessons.sql` menambah katalog kanji hingga 108 karakter N5 pada database seed. Metadata bacaan dan goresan tambahan diadaptasi dari KANJIDIC2 melalui kanji-data, dengan pengelompokan level dan glos Indonesia yang dikurasi untuk Kitsunesia. Distribusi metadata adaptasi mengikuti CC BY-SA 4.0. [kanji-data](https://github.com/davidluzgouveia/kanji-data) · [Lisensi EDRDG](https://www.edrdg.org/edrdg/licence.html)

Berita latihan dan rekaman pengumuman adalah materi orisinal dengan situasi sehari-hari, seperti agenda perpustakaan dan jadwal transportasi. Rujukan untuk pendekatan pembelajarannya tersedia dari penerbit. [Irodori Starter](https://www.irodori.jpf.go.jp/en/starter/pdf.html) · [Minna no Nihongo](https://www.3anet.co.jp/en/minnaqa.html)

Klip bawaan di `supabase/audio/` ikut dalam build Vite sehingga bisa diputar setelah build terbaru dijalankan. Materi baru yang diunggah lewat admin memakai signed URL dari bucket privat `learning-audio`.

## Checklist pengujian

Gunakan dua pengguna dan satu admin. Coba desktop dan ponsel.

| Fitur | Pemeriksaan |
| --- | --- |
| Auth | Daftar, konfirmasi email, masuk, refresh, keluar, reset kata sandi, dan Google OAuth. |
| Level | Lewati penempatan, ulang tes melalui `/penempatan`, ganti N5–N1 di header, lalu refresh. Periksa filter materi, rekomendasi, dan target. |
| RLS | Coba baca kartu, bookmark, progres, dan riwayat akun lain. Sebagai user biasa, coba ubah role, tulis konten, baca kunci jawaban, dan jalankan impor. |
| Kana | Uji hiragana, katakana, dakuten, dan yōon. Cari romaji, pindah halaman, putar audio, buka canvas. |
| Kanji dan menulis | Cari karakter atau bacaan. Buka goresan, tampilkan overlay, gambar dengan mouse dan sentuhan, hapus, lalu nilai sendiri. |
| Kartu | Pilih topik atau jenis kata, balik kartu, beri nilai 0–5, dan cek jatuh tempo SM-2. Atur batas kartu baru menjadi 1 dan pastikan kartu kanji dan kosakata berbagi batas. |
| Tata bahasa | Cari pola, periksa contoh dan kesalahan, tandai dipelajari, lalu cek progres dashboard. |
| Membaca | Pilih teks, toggle furigana dan terjemahan, simpan kalimat, jawab pertanyaan, cek skor. |
| Mendengar | Uji signed URL, putar ulang, jawab pertanyaan, lalu verifikasi transkrip muncul setelah jawaban. |
| Latihan dan simulasi | Uji empat bagian, pilihan ganda dan isian, skor dan riwayat. Biarkan timer habis dan periksa jumlah soal yang belum dijawab. |
| Jalur belajar | Pilih level, cari unit, buka kelima fitur dari kartu unit, dan cek bahwa topik atau materi tetap sesuai. Ulangi simulasi untuk memeriksa variasi soal. |
| Rencana | Buat rencana N1, pilih tanggal dan hari belajar, cek pace, buka tugas dari kalender dan selesaikan. Uji penjadwalan ulang sebelum tanggal ujian. |
| Koleksi | Tambah dan hapus bookmark kata, kanji, dan kalimat. Tambah/edit/hapus catatan dan uji pencarian. |
| Target dan badge | Ubah target harian. Dengan data historis pengujian, cek 7 hari streak dan 100 kosakata dikuasai. |
| Admin | Uji CRUD setiap jenis, filter, pencarian, daftar pengguna, unggah audio, dan edit target. Impor CSV dengan baris valid, duplikat, level salah, dan kutipan multiline. Bandingkan pratinjau dan hasil. |

Kedua aset Kitsu dibuat dengan imagegen bawaan. Prompt `public/kitsu.png` berbunyi:

> Original mascot Kitsu for Indonesian Japanese learning website, one centered full-body adorable orange kitsune fox with cream muzzle and large bushy tail, wearing indigo and gold Indonesian batik shirt, standing and waving with bright friendly smile, polished warm storybook illustration with clean silhouette, transparent background, no text.

Prompt `public/kitsu-sedih.png` memakai Kitsu pertama sebagai referensi:

> Create a single alternate feedback reaction of the same Kitsu fox from the reference, maintaining the same indigo Indonesian batik shirt, orange fur, cream muzzle and whimsical painted style. Full body holding a paw to the cheek, tilted head and gently concerned but encouraging, ears slightly lowered, no words, transparent background.

Ilustrasi `public/kitsunesia-postcard.jpg` dibuat dengan imagegen bawaan untuk beranda publik.

> Warm Japanese–Indonesian study postcard illustration, a quiet small Japanese neighborhood railway station with tiled roofs, distant Mount Fuji and soft afternoon clouds, subtle indigo patterning and a pathway winding into the distance. Visible paper grain, richly textured hand-painted gouache and vintage travel-print shapes. Restrained warm palette: pale ivory and ochre sky, indigo navy architecture, rust-red trim, muted green foreground. Landscape roughly 4:3. Composition leave calm clearing and soft clouds in center-right, to place a separate mascot later. This is an unobtrusive editorial backdrop, low-contrast and matte. No characters, no animals, no words or lettering, no photographic effects, no frame border.
