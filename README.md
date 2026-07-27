# Dashboard Tuyen Sinh - Next.js

Dashboard online chuyen logic tu Google Apps Script sang Next.js, doc du lieu tu Google Sheets va tu dong lam moi moi 30 phut.

## Tinh nang

- Doc du lieu tu cac sheet `CQ_Status`, `NCQ_Status`, `Offline_Status`, `Data_TuChu`
- Giu nguyen logic gom nhom trang thai tu Apps Script
- Tong hop KPI theo sale va theo tung he
- Dashboard co auto refresh 30 phut
- Co che do demo fallback neu chua cau hinh Google API

## Chuan bi bien moi truong

Tao file `.env.local` dua theo `.env.example`.

Can chia se Google Sheet cho service account email o quyen Viewer.

## Chay local

```bash
npm install
npm run dev
```

Neu may dang loi `npm`, co the sua lai Node/npm hoac dung package manager khac tuong thich truoc khi chay.

## Trien khai

- Day len GitHub
- Deploy tren Vercel
- Khai bao cac env var trong Vercel

Khi deploy xong, dashboard se tu tai lai sau moi 30 phut. Ngoai ra trang cung duoc `revalidate` 1800 giay tren server.
