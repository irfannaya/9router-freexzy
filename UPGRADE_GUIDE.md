# Panduan Pemeliharaan & Upgrade Upstream 9Router Custom

Repositori ini adalah build custom 9Router yang mengintegrasikan perbaikan stabilitas provider (Antigravity Google, Grok xAI, Kiro AWS, dan Cline Free Tier) di atas rilis resmi upstream.

---

## 1. Struktur Arsitektur Git & Remote

Repository ini menggunakan arsitektur branch terisolasi yang melacak dua remote:
- **`upstream`**: `https://github.com/decolua/9router.git` (Repository resmi pembuat 9Router)
- **`mibp`**: `https://github.com/mhiqrambg/9router-mibp-version.git` (Repository fork fitur Cline / Freebuff)
- **`custom-prod`**: Branch kerja produksi yang memuat semua custom patch modular di atas rilis resmi.

### Daftar Commit Modular di Branch `custom-prod`:
1. `83af3f18` — `# v0.5.75 (Official Upstream Release)`
2. `279f0b5c` — `feat(custom): baseline 0.5.75-custom production patches`
   - **Gemini Multi-turn Sanitizer & Dummy Tool Response** (mencegah error HTTP 400 Google Cloud Code).
   - **Circuit Breaker & Backoff 5 Detik** (menghapus penguncian akun 15 menit atau 30 detik).
   - **Auth Fail-Soft Single Priority** (menjaga fokus ke single connection dan mencegah rotasi liar yang rentan banned).
   - **Grok CLI & Kiro Auto-Refresh Service** (memastikan token diperpanjang di background secara aman).
   - **CJS Machine-ID & Safe Node Modules Bundling** (`node-machine-id`, `uuid`, `node-forge`).
3. `8ad52039` — `feat(cline): integrate cline free-tier models, api-key auth, unwrap envelope and cline-cli headers spoofing`
   - Bypass 403 gate Cline API via client headers `User-Agent: Cline/3.0.61` & `X-CLIENT-TYPE: cline-cli`.
   - Dukungan API Key (`sk_...`) langsung tanpa terbentur prefix `workos:`.
   - Auto-unwrap response `{ success: true, data: { choices: [...] } }`.
   - Registrasi model free-tier ($0 usage) Cline.

---

## 2. Cara Upgrade ke Versi Resmi 9Router Baru di Masa Depan (Contoh v0.5.76+)

Ketika ada versi resmi baru dari upstream, proses upgrade hanya butuh **1 perintah Git Rebase**:

```bash
# 1. Ambil update resmi terbaru dari upstream
git fetch upstream

# 2. Rebase custom commits kita ke atas tag/versi baru (misal v0.5.76)
git rebase upstream/master
# ATAU: git rebase <tag-versi-baru>
```

### Keunggulan Metode Rebase Ini:
* Jika suatu saat upstream resmi sudah memperbaiki sendiri masalah sanitizer atau Grok refresh, commit custom kita akan otomatis dilewati (*clean/skipped*).
* Jika ada konflik kecil pada file tertentu, cukup selesaikan sekali (`git add <file> && git rebase --continue`).
* Seluruh kustomisasi tidak akan pernah tercecer atau hilang.

---

## 3. Cara Build & Deploy Update ke Server Produksi

Setelah source code terupdate:
```bash
# 1. Build image Docker
docker build -t 9router:latest .

# 2. Transfer dan load image ke remote host (Stream pipe terkompresi)
docker save 9router:latest | gzip -1 | ssh user@remote-host "gunzip | docker load"

# 3. Lakukan hot-swap cepat container (~2 detik tanpa memutus koneksi DB)
ssh user@remote-host << 'EOF'
docker stop 9router
docker rename 9router 9router-old
docker run -d --name 9router --network host -v 9router_data:/app/data 9router:latest
docker rm 9router-old
EOF
```
Semua data koneksi, token, dan riwayat di database `9router_data` tetap aman 100%.
