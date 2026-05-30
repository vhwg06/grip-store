# Runbook Deploy Frontend (GitHub Actions -> GHCR -> VM Docker Compose)

## 1) Mục tiêu và phạm vi

Runbook này mô tả quy trình vận hành deploy frontend production qua GitHub Actions, với nguyên tắc bắt buộc:

- `lint` pass
- `build` pass
- Full Playwright pass
- Chỉ khi các bước trên pass mới được deploy lên VM

Phạm vi bao gồm:

- Trigger deploy (`push main` hoặc `workflow_dispatch`)
- Theo dõi pipeline
- Verify sau deploy
- Rollback
- Xử lý sự cố thường gặp

Không thay đổi API/runtime frontend trong tài liệu này.

## 2) Kiến trúc deploy

- Source: GitHub repository
- CI/CD: GitHub Actions
- Registry: GHCR (`ghcr.io`)
- Artifact deploy: Docker image `ghcr.io/<owner>/grip-store-fe:<tag>`
- Target: VM Linux, chạy Docker Compose tại `/opt/grip-store-fe`
- Quy tắc gate: test fail thì không deploy

Luồng chuẩn:

1. `quality-gate`: `npm ci` -> `npm run lint` -> `npm run build`
2. `full-e2e`: chạy full Playwright (shard + merge report)
3. `deploy`: build image -> push GHCR -> SSH lên VM -> `docker compose pull && up -d`

## 3) Preconditions

### 3.1 GitHub secrets bắt buộc

- Deploy:
  - `NEXT_PUBLIC_API_URL`
  - `GCP_VM_HOST`
  - `GCP_VM_USER`
  - `GCP_VM_SSH_KEY`
  - `GHCR_TOKEN` (quyền `read:packages` cho VM pull private image)
- Full test (Playwright):
  - `GO_BACKEND_URL`
  - `NEXT_PUBLIC_APP_URL`

Ghi chú:

- Runner dùng `GITHUB_TOKEN` để push GHCR (workflow có `packages: write`).
- VM dùng `github.repository_owner` làm username đăng nhập GHCR và `GHCR_TOKEN` làm password.
- Full E2E dùng trực tiếp tài khoản seed từ migration backend:
  - `test_buyer@example.com` / `Password123!`
  - `test_admin@example.com` / `Password123!`
- Trong job `full-e2e`, frontend test được ép `NEXT_PUBLIC_API_URL = GO_BACKEND_URL` để FE và API tests cùng trỏ về cùng backend dev/staging.
- Khuyến nghị vận hành: luôn set `NEXT_PUBLIC_APP_URL` trong Secrets, không rely vào fallback `http://localhost:3000`.

### 3.4 Switch env local (dev/prod)

Repo hỗ trợ switch nhanh profile môi trường:

```bash
npm run env:dev
npm run env:prod
```

- `env:dev` dùng API dev `http://104.199.183.42`
- `env:prod` dùng profile production (cần điền endpoint thật trong `.env.prod`)
- Lệnh sẽ cập nhật `.env.local` từ profile tương ứng.

### 3.2 Điều kiện trên VM

- Docker và Docker Compose plugin đã cài
- SSH key trong GitHub secret có quyền đăng nhập `GCP_VM_USER`
- User có quyền chạy `sudo docker ...`
- Thư mục đích deploy cho frontend: `/opt/grip-store-fe`

Kiểm tra nhanh trên VM:

```bash
docker --version
docker compose version
sudo docker ps
```

### 3.3 Điều kiện backend cho full test

- `GO_BACKEND_URL` trỏ tới môi trường staging/production-like ổn định
- Health endpoint backend trả về ổn định trong thời gian chạy test

## 4) Trigger và theo dõi deploy

### 4.1 Trigger tự động (`push main`)

Khi merge/push commit vào `main`, pipeline deploy chạy tự động.

Kỳ vọng:

- Full test gate chạy trước
- Nếu test fail, pipeline dừng ở gate và không chạy deploy

### 4.2 Trigger thủ công (`workflow_dispatch`)

Dùng khi cần chủ động deploy theo thời điểm vận hành.

Kỳ vọng mặc định:

- Dùng cùng gate như `push main`
- Chỉ deploy khi toàn bộ gate pass

### 4.3 Theo dõi job và tiêu chí pass/fail

- `quality-gate` pass:
  - `npm ci` thành công
  - `npm run lint` exit code 0
  - `npm run build` exit code 0
- `full-e2e` pass:
  - Tất cả shard pass
  - Merge report thành công
- `deploy` pass:
  - Docker build thành công
  - Push GHCR thành công (`:<sha>` và `:latest`)
  - SSH script trên VM thành công
  - `docker compose pull` và `up -d` thành công
  - `sudo docker ps --filter "name=grip-store-fe"` có container đang chạy

## 5) Quy trình deploy chuẩn (SOP)

1. Xác nhận commit/release đã ở `main`.
2. Trigger pipeline (`push` hoặc `workflow_dispatch`).
3. Theo dõi `quality-gate`.
4. Theo dõi `full-e2e` (bao gồm merge report/artifacts).
5. Chỉ khi gate pass, theo dõi `deploy`.
6. Chạy post-deploy verification (mục 6).
7. Nếu verification fail, rollback theo mục 8.

## 6) Post-deploy verification

Trên VM:

```bash
cd /opt/grip-store-fe
sudo docker compose ps
sudo docker ps --filter "name=grip-store-fe"
curl -I http://127.0.0.1/
```

Từ bên ngoài VM:

```bash
curl -I http://<VM_IP_OR_DOMAIN>/
```

Nếu dùng reverse proxy/HTTPS, kiểm tra thêm:

```bash
curl -I https://<DOMAIN>/
```

## 7) Logs và diagnostics

### 7.1 GitHub Actions

- Mở run tương ứng và xem log theo job: `quality-gate`, `full-e2e`, `merge-reports`, `deploy`
- Tải artifacts Playwright khi test fail:
  - `playwright-report-shard-*`
  - `playwright-artifacts-shard-*`
  - `playwright-report-merged`

### 7.2 VM/container

```bash
sudo docker logs -f grip-store-fe
cd /opt/grip-store-fe && sudo docker compose ps
cd /opt/grip-store-fe && sudo docker compose logs --tail=200
```

## 8) Rollback

Rollback về image tag trước đó:

```bash
cd /opt/grip-store-fe
sudo docker login ghcr.io -u <GITHUB_REPO_OWNER>
sudo REGISTRY_IMAGE=ghcr.io/<owner>/grip-store-fe IMAGE_TAG=<PREVIOUS_TAG> docker compose pull
sudo REGISTRY_IMAGE=ghcr.io/<owner>/grip-store-fe IMAGE_TAG=<PREVIOUS_TAG> docker compose up -d --remove-orphans
sudo docker ps --filter "name=grip-store-fe"
```

Sau rollback, chạy lại bước verify ở mục 6.

## 9) Troubleshooting

### 9.1 Fail lint/build

Triệu chứng:

- Job `quality-gate` fail trước deploy

Xử lý:

1. Đọc log step fail (`lint` hoặc `build`)
2. Sửa lỗi trong codebase
3. Push lại `main` hoặc rerun sau khi fix

### 9.2 Fail Playwright shard/full suite

Triệu chứng:

- Một hoặc nhiều shard fail trong `full-e2e`
- Deploy không chạy

Xử lý:

1. Tải và mở `playwright-report-merged`
2. Kiểm tra screenshot/trace/video của test fail
3. Xác nhận `GO_BACKEND_URL` và test credentials còn hợp lệ
4. Fix flaky/logic test hoặc lỗi ứng dụng, chạy lại pipeline

### 9.3 Fail push/pull GHCR hoặc docker login

Triệu chứng:

- Fail ở bước push image lên GHCR hoặc VM pull image

Xử lý:

1. Xác nhận workflow có `permissions: packages: write`
2. Kiểm tra `GHCR_TOKEN` hợp lệ trên VM và owner repo đúng
3. Kiểm tra package visibility và quyền `read:packages`
4. Kiểm tra image path đúng định dạng `ghcr.io/<owner>/grip-store-fe:<tag>`

### 9.4 Container lên nhưng không truy cập được

Triệu chứng:

- `docker ps` có container nhưng URL public không phản hồi

Xử lý:

1. Kiểm tra port mapping trong `docker-compose.yml`
2. Kiểm tra security group/firewall của VM (80/443)
3. Kiểm tra reverse proxy (Nginx/Caddy), DNS, TLS cert
4. Kiểm tra log container `grip-store-fe`

## 10) Lưu ý khác biệt `push main` vs `workflow_dispatch`

- `push main`: tự động theo event push, phù hợp luồng release thường xuyên.
- `workflow_dispatch`: chạy thủ công, phù hợp hotfix/time-window deploy.
- Khuyến nghị vận hành: cả hai trigger dùng cùng full test gate, không bypass test trước deploy.

## 11) Mapping với repo hiện tại

- Workflow deploy FE: `.github/workflows/deploy-fe.yml`
- Workflow Playwright: `.github/workflows/playwright.yml`
- Compose template deploy: `template.docker-compose.yml`
- Playwright config (CI external backend switch): `playwright.config.ts`
