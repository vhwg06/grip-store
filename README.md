# Grip Store (Docker Edition)

Phiên bản Docker của Grip Store, xây dựng bằng **Next.js 16**, **SQLite** và **Shadcn UI**.

Dự án được điều chỉnh từ bản `_workers_next` (Cloudflare Workers), thay Cloudflare D1 bằng SQLite local (`better-sqlite3`) để phù hợp triển khai VPS/self-host.

## Runbook CI/CD (GitHub Actions -> VM Ubuntu/Debian)

Frontend deploy theo mô hình: `Next.js static export + Nginx`.
Container publish cổng `80`, image được build trên GitHub Actions và đẩy xuống VM qua SSH.

### 1) Điều kiện tiên quyết trên VM

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
docker --version
docker compose version
```

### 2) Secrets cần cấu hình trong GitHub

- `NEXT_PUBLIC_API_URL`: URL API dùng lúc build frontend
- `GCP_VM_HOST`: IP public hoặc domain của VM
- `GCP_VM_USER`: user SSH trên VM
- `GCP_VM_SSH_KEY`: private key SSH (nội dung PEM)

### 3) Luồng deploy tự động

1. Push code vào nhánh `main` hoặc chạy tay workflow `Deploy Frontend`.
2. Workflow build image `grip-store-fe:latest`.
3. Export image thành `grip-store-fe-image.tar.gz` và đóng gói cùng `template.docker-compose.yml`.
4. Upload bundle lên VM tại `/tmp`, sau đó giải nén vào `/opt/grip-store-fe`.
5. Trên VM sẽ chạy:
   - `docker load < grip-store-fe-image.tar.gz`
   - `docker compose up -d --remove-orphans`

### 4) Kiểm tra sau deploy

Chạy trên VM:

```bash
cd /opt/grip-store-fe
sudo docker compose ps
sudo docker ps --filter "name=grip-store-fe"
curl -I http://127.0.0.1/
```

Kiểm tra từ bên ngoài:

```bash
curl -I http://<VM_IP_OR_DOMAIN>/
```

### 5) Rollback

Nếu đã giữ lại file image của bản trước (`grip-store-fe-image-prev.tar.gz`), rollback trên VM như sau:

```bash
cd /opt/grip-store-fe
sudo docker load < grip-store-fe-image-prev.tar.gz
sudo docker compose up -d --remove-orphans
```

### 6) Lệnh vận hành thường dùng

```bash
# Xem log
sudo docker logs -f grip-store-fe

# Khởi động lại service
cd /opt/grip-store-fe && sudo docker compose restart

# Dừng service
cd /opt/grip-store-fe && sudo docker compose down
```

## Kiến trúc kỹ thuật

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: SQLite (`better-sqlite3`), dữ liệu bền vững qua Docker volume
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth (Linux DO Connect + GitHub OAuth)
- **Payment**: EPay
- **UI**: Tailwind CSS + Shadcn UI + Framer Motion

---

## Cách deploy 1: Kéo image có sẵn

Không cần clone source, dùng image Docker đã build sẵn.

### Script một lệnh

```bash
mkdir grip-store && cd grip-store
curl -fsSL https://raw.githubusercontent.com/chatgptuk/grip-store/main/_docker/pull-setup.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

Script sẽ hỏi cấu hình cần thiết (URL site, OAuth, payment, GitHub login...), sau đó tự sinh `.env` + `docker-compose.yml`, kéo image và chạy container.

### Cập nhật image

```bash
docker compose pull && docker compose up -d
```

---

## Cách deploy 2: Tự build image

Dành cho trường hợp cần sửa source hoặc tùy biến build.

### Cách A: Script tương tác

```bash
git clone https://github.com/chatgptuk/grip-store.git
cd grip-store/_docker
chmod +x setup.sh
./setup.sh
```

### Cách B: Build thủ công

```bash
git clone https://github.com/chatgptuk/grip-store.git
cd grip-store/_docker
```

Sửa file `.env` rồi chạy:

```bash
mkdir -p data && chmod 777 data
docker compose up -d --build
```

---

## Cấu hình reverse proxy

Container ứng dụng lắng nghe cổng `3000`. Môi trường production nên đặt sau Nginx/Caddy và bật HTTPS.

### Ví dụ Nginx

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

### Ví dụ Caddy (tự cấp HTTPS)

```caddy
your-domain.com {
    reverse_proxy localhost:3000
}
```

---

## Biến môi trường

| Biến | Bắt buộc | Mô tả |
|------|----------|------|
| `APP_URL` | Có | URL truy cập ngoài, ví dụ `https://your-domain.com` |
| `NEXT_PUBLIC_APP_URL` | Có | Giống `APP_URL` |
| `AUTH_TRUST_HOST` | Có | Đặt `true` để tin cậy Host header từ reverse proxy |
| `AUTH_SECRET` | Có | Chuỗi bí mật để mã hóa session |
| `OAUTH_CLIENT_ID` | Có | Linux DO Connect OAuth Client ID |
| `OAUTH_CLIENT_SECRET` | Có | Linux DO Connect OAuth Client Secret |
| `MERCHANT_ID` | Có | EPay Merchant ID |
| `MERCHANT_KEY` | Có | EPay Merchant Key |
| `PAY_URL` | Không | URL cổng thanh toán, mặc định Linux DO Credit |
| `ADMIN_USERS` | Có | Danh sách username admin, ngăn cách bởi dấu phẩy |
| `DATABASE_PATH` | Không | Đường dẫn SQLite, mặc định `/app/data/grip-store.sqlite` |
| `GITHUB_ID` | Không | GitHub OAuth Client ID |
| `GITHUB_SECRET` | Không | GitHub OAuth Client Secret |

> Telegram/Bark/email notification cấu hình trong trang quản trị sau khi đăng nhập, không cần đặt qua env.

---

## Tạo GitHub OAuth App

Nếu muốn bật đăng nhập GitHub (fallback cho Linux DO Connect):

1. Vào [GitHub Developer Settings](https://github.com/settings/developers)
2. Chọn **New OAuth App**
3. Khai báo:
   - **Application name**: `Grip Store`
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-domain.com/api/auth/callback/github`
4. Chọn **Register application**
5. Lấy **Client ID** và tạo **Client Secret**
6. Điền vào `.env` với `GITHUB_ID`, `GITHUB_SECRET`
7. Khởi động lại container:
   - `docker compose down && docker compose up -d`

---

## Dữ liệu và backup

File SQLite nằm tại `./data/grip-store.sqlite` (map từ volume container).

```bash
# Backup
cp -r ./data ./data-backup-$(date +%Y%m%d)

# Restore
cp -r ./data-backup-20260304 ./data
docker restart grip-store
```

## Cron job

Container có cron chạy mỗi phút để:

- Dọn đơn hàng quá hạn chưa thanh toán
- Giải phóng giữ chỗ card đã hết hạn

## Áp dụng thay đổi cấu hình

```bash
# Sau khi sửa .env: cần recreate container
docker compose down && docker compose up -d

# Nếu có sửa source: build lại image
docker compose up -d --build
```
