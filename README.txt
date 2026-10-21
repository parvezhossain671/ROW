ROW CLEAN FIXED VERSION

Features:
- Professional dashboard style based on the supplied reference.
- GIS removed.
- 5 Areas: বরিশাল সদর 9, মুলাদী 6, বাকেরগঞ্জ 7, মেহেন্দিগঞ্জ 3, হিজলা 3.
- Daily ROW and Labour are entered together, side-by-side.
- Admin can update Target KM and any day's ROW/Labour after Supabase RLS SQL is applied.
- Excel export uses Blob download instead of XLSX.writeFile, avoiding the file:// save-file error.
- Admin login accepts the configured admin UID/email after successful Supabase password authentication.

IMPORTANT:
1. Run ADMIN-RLS-FIX.sql in Supabase SQL Editor once.
2. Use the real Supabase Auth password for parvezhossain89@gmail.com.
3. Do NOT put service_role/secret key in the HTML/JS.
4. Open index.html and press Ctrl+F5.
