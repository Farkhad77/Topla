# Arenio — VPS Deploy Təlimatı (Ubuntu, Docker Compose, IP üzərindən)

Bu təlimat bir dəfə oxunub ardıcıl icra olunmaq üçündür. Hər blokda əmrləri
olduğu kimi kopyala. `SERVER_IP` yazılan yerlərə öz VPS IP-ni qoy.

---

## 0. Lokal hazırlıq (öz kompüterində, bir dəfə)

1. `.gitignore`-a bu sətirləri əlavə et (sirlər və data git-ə düşməsin):

   ```
   deploy/.env
   data/
   ```

2. Bütün yeni faylları commit + push et:

   ```
   git add -A
   git commit -m "Deploy: Docker Compose, nginx, env template"
   git push
   ```

---

## 1. Serverə giriş və baza qurulum (bir dəfə)

```bash
ssh root@SERVER_IP

# Sistemi yenilə
apt update && apt upgrade -y

# Firewall: yalnız SSH və HTTP
ufw allow OpenSSH
ufw allow 80/tcp
ufw --force enable

# Docker (rəsmi skript)
curl -fsSL https://get.docker.com | sh

# 2GB RAM üçün swap — build zamanı yaddaş çatışmazlığının qarşısını alır
fallocate -l 2G /swapfile && chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 2. Kodu serverə çək

Repo **public**-dirsə:

```bash
cd /opt
git clone https://github.com/SENIN_USERNAME/SENIN_REPO.git arenio
cd arenio
```

Repo **private**-dırsa (deploy key):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/arenio_deploy -N ""
cat ~/.ssh/arenio_deploy.pub
# Bu açarı GitHub → repo → Settings → Deploy keys → Add deploy key (read-only) et
GIT_SSH_COMMAND="ssh -i ~/.ssh/arenio_deploy" git clone git@github.com:Farkhad77/Arenio.git /opt/arenio
cd /opt/arenio
```

---

## 3. Sirləri doldur

```bash
cp deploy/env.example deploy/.env
nano deploy/.env
```

Doldurulacaqlar:

- `PUBLIC_URL=http://SERVER_IP`
- `POSTGRES_PASSWORD` → `openssl rand -base64 24` nəticəsi
- `RABBITMQ_PASSWORD` → güclü parol
- `JWT_SECRET` → `openssl rand -base64 48` nəticəsi (köhnə açarı İŞLƏTMƏ)
- SMTP dəyərləri (Gmail app password — köhnəsi git-də görünübsə, Google
  hesabında ləğv edib yenisini yarat)

---

## 4. İşə salma

```bash
cd /opt/arenio
docker compose --env-file deploy/.env up -d --build
```

İlk build 5–10 dəqiqə çəkə bilər. Sonra:

```bash
docker compose ps                  # hamısı "running (healthy)" olmalıdır
docker compose logs -f api         # migration-ların tətbiqinə bax, Ctrl+C ilə çıx
```

API konteyneri qalxanda migration-ları özü tətbiq edir
(`ApplyMigrationsOnStartup=true`), əl ilə `dotnet ef database update` lazım deyil.

---

## 5. Yoxlama siyahısı

Brauzerdə `http://SERVER_IP` aç:

1. Sayt açılır, stadion siyahısı gəlir.
2. Qeydiyyat → e-poçta OTP gəlir → giriş işləyir.
3. Booking yarat → dərhal «Təsdiqlənib» görünür.
4. Owner hesabı ilə şəkil yüklə → şəkil qalereyada görünür
   (`http://SERVER_IP/Storage/Stadiums/...` yolu ilə).
5. Şifrə bərpası → e-poçtdakı link `http://SERVER_IP/reset-password...` açır.
6. Axtarış (`/stadiums` səhifəsində) nəticə qaytarır.
7. Boş saatlar Bakı vaxtı ilə düzgündür (server UTC olsa belə).

---

## 6. Yenilənmə (hər dəfə kod dəyişəndə)

```bash
cd /opt/arenio
git pull
docker compose --env-file deploy/.env up -d --build
```

Yalnız dəyişən konteynerlər yenidən qurulur. Şəkillər (`data/storage`) və
DB (`data/postgres`) volume-larda qalır, itmir.

---

## 7. Backup (tövsiyə — bir dəfə qur)

```bash
crontab -e
# hər gecə 03:00-da DB dump + şəkillər (Bakı vaxtı ilə server UTC-dirsə 23:00 UTC):
0 23 * * * cd /opt/arenio && docker compose exec -T db pg_dump -U postgres ArenioDb | gzip > /root/backups/arenio-$(date +\%F).sql.gz && tar czf /root/backups/storage-$(date +\%F).tar.gz data/storage
```

Əvvəlcə `mkdir -p /root/backups` et. Köhnə backup-ları arada təmizlə.

---

## 8. Faydalı əmrlər

```bash
docker compose logs -f api        # backend logları
docker compose logs -f web        # nginx logları
docker compose restart api        # yalnız API restart
docker compose down               # hamısını dayandır (data qalır)
docker system prune -f            # köhnə image-ləri təmizlə (disk dolanda)
free -h                           # RAM/swap vəziyyəti
```

---

## 9. Domen alanda (gələcək addım)

1. Domenin A qeydini SERVER_IP-ə yönəlt.
2. `deploy/.env`-də `PUBLIC_URL=https://domen.az` et.
3. Serverdə host nginx + certbot qur və ya compose-a 443/SSL əlavə et —
   bu addıma çatanda konfiqi birlikdə yeniləyərik.
