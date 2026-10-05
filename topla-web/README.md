# Topla — Frontend

Arenio backend-i üzərində işləyən **Topla** platformasının frontend-i.
Futbol meydançalarını tapmaq, boş saatları görmək və onlayn rezervasiya etmək üçün.

> Backend layihəsi (ASP.NET 8, Clean Architecture) `Arenio` adı ilə qalır.
> **Frontend-də məhsulun adı hər yerdə "Topla"dır.**

---

## Sürətli başlanğıc

```bash
npm install
cp .env.example .env      # ünvanları yoxla
npm run dev               # http://localhost:5173
```

Backend-i `http://localhost:5077` ünvanında işə sal (`Arenio.WebAPI` → `http` profili).
Vite `/api` və `/Storage` sorğularını ora proxy edir — dev-də CORS problemi yaşanmır.

| Skript | İş |
|---|---|
| `npm run dev` | Dev server (HMR) |
| `npm run build` | `tsc -b` + production build |
| `npm run preview` | Build-i lokal yoxla |
| `npm run lint` | ESLint |
| `npm run typecheck` | Yalnız tip yoxlaması |

### Mühit dəyişənləri

| Dəyişən | Təyinat |
|---|---|
| `VITE_API_BASE_URL` | Prod-da API-nin tam ünvanı. **Boş buraxsan** nisbi `/api` işlədilir (dev proxy / reverse proxy). |
| `VITE_API_PROXY_TARGET` | Dev proxy hədəfi (default `http://localhost:5077`). |
| `VITE_MEDIA_BASE_URL` | Stadion şəkillərinin host-u. Boşdursa `VITE_API_BASE_URL` istifadə olunur. |

Frontend-də **heç bir gizli açar saxlanmır** — yalnız public ünvanlar.

---

## Texnologiyalar

React 19 · TypeScript (strict) · Vite · React Router 7 · TanStack Query 5 · Axios ·
Tailwind CSS 4 · Radix UI primitivləri · React Hook Form + Zod · Recharts · Lucide · Sonner

Hazır UI kitabxanası (shadcn CLI, MUI, Bootstrap) **istifadə edilməyib** — bütün primitivlər
Radix + `cva` üzərində əl ilə yazılıb ki, interfeys şablon kimi görünməsin.

---

## Qovluq strukturu

```
src/
├─ api/           axios instance, endpoint xəritəsi, xəta normalizasiyası, cavab unwrap
├─ services/      hər domen üçün tipli servis (komponentlər birbaşa axios çağırmır)
├─ hooks/         useAuth, useToast, useDebouncedValue, useInView, usePageMeta
│  └─ queries/    TanStack Query hook-ları (server state)
├─ contexts/      AuthProvider + auth context (auth state)
├─ types/         backend DTO-larına uyğun tiplər (BaseResponse, PagedResult, domen tipləri)
├─ schemas/       Zod validasiya sxemləri
├─ components/
│  ├─ ui/         dizayn sistemi primitivləri (Button, Field, Dialog, Table, Chart…)
│  ├─ brand/      Logo, PitchImage
│  └─ common/     ProtectedRoute, RoleGate, StatusBadge, ErrorBoundary
├─ features/      domen komponentləri (stadiums, booking, reviews, owner, admin, dashboard)
├─ layouts/       PublicLayout, AuthLayout, ConsoleLayout (+ user/owner/admin variantları)
├─ pages/         marşrutlara bağlanan səhifələr (hamısı lazy yüklənir)
├─ routes/        marşrut ağacı və rol mühafizəsi
└─ utils/         format, tarix, icazə, storage, JWT parse, sabitlər
```

**Qaydalar:** komponentin içində `axios` yoxdur; API çağırışı yalnız `services/` → `hooks/queries/`
zəncirindən keçir; server state (TanStack Query), UI state (local), auth state (context) ayrıdır.

---

## Dizayn sistemi

Bütün tokenlər **tək yerdə**: `src/index.css` (`@theme` bloku). Komponentlərdə hardcoded hex yoxdur.

| Token | Dəyər |
|---|---|
| Brend | `brand-50…950`, əsas ton `brand-700` = `#14532D` (dərin çəmən yaşılı) |
| Aksent | `volt-300…700` — yalnız vurğu üçün (reytinq ulduzu, kiçik nişanlar) |
| Neytral | `ink-50…900` — yaşıla çalan qrafit |
| Semantik | `success` / `warning` / `danger` / `info` (+ `-soft` fonlar) |
| Səth | `canvas` (səhifə fonu), `surface` (kart), `line` / `line-strong` (sərhəd) |
| Radius | `rounded-xs…xl` (6–18px) — həddindən artıq yuvarlaq deyil |
| Kölgə | `shadow-card`, `shadow-raised`, `shadow-overlay` |
| Şrift | Inter Variable (self-hosted, `@fontsource-variable/inter`) |

Xüsusi utility-lər: `pitch-surface` (şəkil olmayanda meydança teksturası), `card-hover`,
`scroll-shadow-x` (mobil cədvəl sürüşməsi), `animate-fade-up`, `sr-only-focusable`.

### Qrafiklər

Recharts. Qayda: **tək seriya, tək ox** (dual-axis qadağan), tək seriyada leqenda yoxdur,
sütunların ucu 4px yuvarlaq, xətt qalınlığı 2px, şəbəkə yalnız üfüqi və arxa planda,
tooltip xüsusi komponentdir (`ChartTooltip`), data yoxdursa qrafik əvəzinə anlamlı boş vəziyyət.
Rənglər `chartTheme`-dən gəlir (ağ fonda ≥ 3:1 kontrast).

---

## Rollar və marşrutlar

| Sahə | Yol | Rol |
|---|---|---|
| Public sayt | `/`, `/stadiums`, `/stadiums/:id`, `/how-it-works` | hamı |
| Auth | `/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password` | qonaq |
| Bron axını | `/booking/review`, `/booking/success/:id` | daxil olmuş |
| İstifadəçi paneli | `/dashboard/*` | daxil olmuş |
| Biznes paneli | `/owner/*` | `Owner`, `Worker` |
| Admin paneli | `/admin/*` | `Admin`, `Moderator` |

`Worker` **owner deyil**: işçi sahibkarın stadionlarını idarə edir, amma `/owner/staff`
bölməsi yalnız `Owner` roluna açıqdır.

> Frontend-dəki rol yoxlamaları **yalnız UX üçündür**. Səlahiyyətin yeganə həqiqi mənbəyi backend-dir.

### Autentifikasiya axını

1. `POST Accounts/create` → hesab **pending**, e-poçta OTP gedir
2. `POST Accounts/register/confirm-otp` → **birbaşa token qaytarır** (avtomatik giriş)
3. `POST Accounts/login` → token; e-poçt təsdiqlənməyibsə istifadəçi `/verify-otp`-a yönləndirilir
4. Şifrə bərpası OTP ilə deyil, e-poçtdakı `userId` + `token` linki ilə işləyir

Token `localStorage`-də saxlanılır, `axios` interceptor-u ilə əlavə olunur; 401 gələndə
bir dəfə refresh cəhdi edilir, alınmasa sessiya bağlanır. İstifadəçi məlumatı JWT claim-lərindən
oxunur (backend-də `/me` endpoint-i yoxdur).

---

## Backend boşluqları (uydurma data YOXDUR)

Aşağıdakı hallarda endpoint mövcud deyil. Heç bir yerdə saxta rəqəm göstərilmir —
ya real datadan hesablanır, ya da vəziyyət açıq şəkildə izah olunur.

| Ehtiyac | Vəziyyət | Frontend həlli |
|---|---|---|
| Owner analitikası / gəlir | endpoint yoxdur | `services/analyticsService.ts` — real bronlardan client-side aqreqasiya, UI-da mənbə qeyd olunur |
| Stadion filtri / sortu | `Stadiums/View` yalnız səhifələmə | kataloq bir dəfə çəkilir, filtr/sort client-side (`StadiumsPage`) |
| Admin istifadəçi siyahısı | servisdə var, controller-də açılmayıb | `FEATURES.adminUserList=false`; `/admin/users` block/unblock konsoluna çevrilib, çatışmazlıq açıq yazılıb |
| Pending stadion növbəsi | endpoint yoxdur | `/admin/stadiums` mövcud siyahı üzərində verify/rədd, izahlı qeyd |
| ~~Stadion detalı (anonim)~~ | **HƏLL OLUNDU** | `GET /api/Stadiums/view-detail/{id}` — anonim, Redis cache-li |
| ~~`Stadiums/my` cavabında `id` yoxdur~~ | **HƏLL OLUNDU** | `StadiumViewDetailDto`-ya `Id` əlavə edildi |
| "Mənim rəylərim" | endpoint yoxdur | bronlardan stadionlar çıxarılır, hər birinin rəyləri süzülür |
| OTP yenidən göndərmə | endpoint yoxdur | saxta düymə yoxdur — istifadəçiyə real yol izah olunur |
| Profil redaktəsi | endpoint yoxdur | profil read-only, səbəb yazılır (saxta forma yoxdur) |
| Booking statusu | enum yalnız `Pending/Confirmed/Cancelled` | `Tamamlandı` bitmə vaxtından, `Rədd edildi` səbəb sahəsindən törədilir (`utils/booking.ts`) |

Hər biri kodda `TODO(backend)` şərhi ilə işarələnib və **izolyasiya olunub** — endpoint
əlavə olunanda yalnız bir fayl dəyişir.

### Backend tərəfdə diqqət yetiriləsi məqamlar

- `POST /api/Accounts/refresh token` — route adında **boşluq** var (`refresh%20token`). Adı dəyişsən `src/api/endpoints.ts` yenilənməlidir.
- Refresh endpoint-i `[Authorize]`-dur və token `ValidateLifetime=true` ilə yoxlanır → **vaxtı bitmiş token ilə refresh mümkün deyil**. Frontend cəhd edir, alınmasa sessiyanı təmiz bağlayır.
- `BookingService.CreateBookingAsync` yerli `StartDateTime`-ı `DateTime.UtcNow` ilə müqayisə edir. Frontend divar saatı (`yyyy-MM-ddTHH:mm:ss`, sonluqsuz) göndərir — backend-də UTC/local uyğunsuzluğu qalır.
- `Stadiums/View` yalnız `IsActive && Verified` qaytarır — admin panelində pending stadion görünmür.
- `GET /api/Stadiums/view-detail/{id}` də yalnız `IsActive && Verified` qaytarır (deaktiv stadion 404 verir) — owner redaktə səhifəsi ona görə səlahiyyətli `GET /api/Stadiums/{id}` işlədir.
- CORS `AllowAnyOrigin` — prod üçün konkret domenlə əvəzlənməlidir.

---

## Cache strategiyası

| Data | Cache | Səbəb |
|---|---|---|
| Stadion siyahısı (`Stadiums/View`) | Redis, 10 dəq — açar prefiksi `stadiums:view:` | nadir dəyişir |
| Stadion detalı (`Stadiums/view-detail/{id}`) | Redis, 10 dəq — açar `stadium:detail:{id}` | nadir dəyişir |
| **Boş saatlar (`Booking/available-slots`)** | **CACHE YOXDUR** | real-time məlumatdır — cache-lənsə istifadəçi tutulmuş saatı boş görüb bron cəhdi edər və 409 alar |

Cache invalidasiyası `StadiumService.InvalidateStadiumCachesAsync(id)` metodundadır və
hər mutasiyadan sonra çağırılır: `UpdateStadiumAsync`, `DeleteStadium`, `ActivateStadiumAsync`,
`DeActivateStadiumAsync`, `VerifyStadiumAsync`. Həm detal açarı silinir, həm də
`RemoveByPrefixAsync("stadiums:view:")` ilə bütün səhifələnmiş siyahı açarları.

`RedisCacheService.RemoveByPrefixAsync` əvvəl `NotImplementedException` atırdı — indi
StackExchange.Redis `SCAN` ilə implementasiya olunub (`KEYS` kimi Redis-i bloklamır).

## Keyfiyyət qaydaları

- Hər asinxron ekranda **skeleton → xəta (retry) → boş vəziyyət** üçlüyü var; ağ ekran yoxdur.
- Boş vəziyyət həmişə **növbəti addımı** izah edir.
- Geri dönüşü olmayan əməliyyatlar (`ləğv`, `sil`, `rədd`) `ConfirmDialog`-dan keçir.
- Mutasiya düymələri `loading` vəziyyətindədir və uçuş zamanı bağlıdır — ikiqat göndərmə mümkün deyil.
- Backend exception mətni **heç vaxt** göstərilmir; `api/errors.ts` status koduna görə anlaşılan mesaj qaytarır (400/401/403/404/409/422/429/5xx + şəbəkə/timeout).
- Əlçatanlıq: semantik HTML, `Field` render-prop-u ilə avtomatik `label`/`aria-describedby`/`role="alert"`, ikon düymələrində `aria-label`, görünən fokus halqası, Radix sayəsində modal fokus tələsi və Esc, `prefers-reduced-motion` dəstəyi, status heç vaxt yalnız rənglə verilmir.
- Responsiv: 375 / 768 / 1024 / 1440. Mobildə sidebar → drawer, filtrlər → aşağıdan açılan panel, cədvəllər → kart və ya üfüqi sürüşmə. Üfüqi daşma yoxdur.
- Performans: marşrutlar lazy, `manualChunks` ilə vendor ayrılıb, axtarış debounce olunur, kart datası yalnız ekrana yaxınlaşanda yüklənir (`useInView`), TanStack Query keşi.

---

## Tez-tez rast gəlinən problemlər

### "Sessiya bitdi" — hər səlahiyyətli sorğu 401 qaytarır

Ən çox rast gəlinən səbəb **HTTPS yönləndirməsidir**. `Program.cs`-də `app.UseHttpsRedirection()`
sorğunu `http://localhost:5077`-dən `https://localhost:7171`-ə yönləndirir. Bu, **fərqli origin**
olduğu üçün brauzer təhlükəsizlik qaydasına görə `Authorization` başlığını **silir** —
backend token görmür və 401 qaytarır. Sonra frontend refresh cəhdi edir, o da eyni səbəbdən
401 alır və sessiya bağlanır.

Həll (artıq tətbiq olunub): `UseHttpsRedirection()` yalnız Development-dən kənarda çağırılır.
Konsolda bu baş verərsə frontend indi açıq xəbərdarlıq yazır (`[Topla] Sorğu başqa origin-ə yönləndirildi`).

Alternativ: backend-i `https` profili ilə işlədirsənsə `.env`-də
`VITE_API_PROXY_TARGET=https://localhost:7171` yaz (Vite proxy-də `secure: false` artıq qurulub).

### Refresh heç vaxt işləmir

`POST /api/Accounts/refresh token` endpoint-i `[Authorize]` ilə qorunmuşdu — vaxtı bitmiş token
JWT middleware-də rədd olunduğu üçün servisə heç çatmırdı. `UserService.RefreshTokenAsync`
onsuz da `ValidateLifetime = false` ilə tokeni özü yoxlayır, ona görə endpoint indi
`[AllowAnonymous]`-dur (imza + DB-dəki refresh token yoxlanışı qalır).

### /owner paneli açılmır — "İcazən yoxdur"

Owner paneli yazılıb (`/owner/*`, 9 səhifə), amma `Owner` və ya `Worker` rolu tələb edir.
Təzə bazada Admin/Moderator hesabı olmadığı üçün owner sorğusunu təsdiqləyən yoxdur.

Həlli: layihənin kökündəki **`db-setup.sql`** skriptini SSMS-də icra et — o, bütün rolları,
rol icazələrini (`AspNetRoleClaims`, `ClaimType = 'Permission'`) yaradır və seçdiyin
e-poçtu Admin edir. Sonra:

1. Admin hesabı ilə daxil ol
2. `/dashboard/become-owner` → sorğu göndər
3. `/admin/owner-requests` → Təsdiqlə
4. **Çıxıb yenidən daxil ol** — rollar JWT-yə yalnız login anında yazılır

Rol claim-ləri olmadan `[Authorize(Policy = "Stadium.Create")]` kimi endpoint-lər 403 verir,
yəni owner stadion belə yarada bilmir.

### "Bu tarix üçün cədvəl yoxdur" — slotlar bəzən görünmür

Səbəb backend-də idi: `GetAvailableSlotsAsync` `while (current < close)` dövrü işlədirdi.
İş saatları gecə yarısını keçəndə (məs. **10:00 – 02:00**) `close` `open`-dan kiçik olur,
dövr heç vaxt işləmir və boş siyahı qayıdır. Eyni problem bron yaradarkən iş saatı
yoxlamasında da var idi. İkisi də düzəldilib: pəncərə gecə yarısını keçirsə bağlanış
növbəti günə sürüşdürülür, bronlar isə tarixə görə deyil, pəncərə ilə kəsişməyə görə seçilir.

### Köhnə kod işləyir / dəyişikliklər görünmür

PowerShell-də `Expand-Archive` mövcud faylların üstünə **yazmır** və xəta verir:

```powershell
Expand-Archive .\topla-web.zip -DestinationPath . -Force
```

`-Force` olmadan köhnə build qalır. Zip-i açandan sonra `npm run dev`-i mütləq yenidən başlat.

## Bilinən məhdudiyyətlər

- **Dark mode yoxdur** — tələb olunmayıb; tokenlər tək yerdə olduğu üçün sonradan əlavə etmək asandır.
- Xəritə API açarı tələb etməyən OpenStreetMap embed-idir; interaktiv marker/klaster yoxdur.
- Şəkil sıralaması (drag & drop) backend-də dəstəklənsə də UI-da yalnız "əsas şəkil seç" var.
- Ödəniş inteqrasiyası yoxdur (backend-də `Payment` entity var, endpoint yoxdur) — bron sahibkar təsdiqi ilə tamamlanır.
