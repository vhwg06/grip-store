#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ENV_FILE=".env"
COMPOSE_FILE="docker-compose.yml"
IMAGE="ghcr.io/chatgptuk/grip-store:latest"

# Detect docker compose command (V2 plugin or V1 standalone)
detect_compose() {
    if docker compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null 2>&1; then
        COMPOSE_CMD="docker-compose"
    else
        return 1
    fi
    return 0
}

if ! detect_compose; then
    echo -e "${YELLOW}Chua phat hien Docker Compose, dang tu dong cai dat...${NC}"
    if [ -f /etc/debian_version ]; then
        apt-get update -qq > /dev/null 2>&1
        apt-get install -y docker-compose-plugin > /dev/null 2>&1 || apt-get install -y docker-compose > /dev/null 2>&1
    elif [ -f /etc/redhat-release ]; then
        yum install -y docker-compose-plugin > /dev/null 2>&1 || yum install -y docker-compose > /dev/null 2>&1
    fi

    if ! detect_compose; then
        echo -e "${RED}Cai dat Docker Compose that bai, vui long cai dat thu cong roi thu lai${NC}"
        echo -e "  Debian/Ubuntu: apt-get install docker-compose-plugin"
        echo -e "  CentOS/RHEL:   yum install docker-compose-plugin"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Cai dat Docker Compose thanh cong"
fi

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║   Grip Store Docker trien khai 1 lenh (pull image)   ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════╝${NC}"
echo ""

# Helper: prompt with default value
prompt() {
    local var_name="$1"
    local prompt_text="$2"
    local default_val="$3"
    local is_secret="$4"

    if [ -n "$default_val" ]; then
        prompt_text="${prompt_text} [${default_val}]"
    fi

    if [ "$is_secret" = "true" ]; then
        echo -en "${BOLD}${prompt_text}: ${NC}"
        value=""
        while IFS= read -rs -n1 char; do
            if [[ -z "$char" ]]; then
                break
            elif [[ "$char" == $'\x7f' || "$char" == $'\b' ]]; then
                if [ -n "$value" ]; then
                    value="${value%?}"
                    echo -en "\b \b"
                fi
            else
                value+="$char"
                echo -en "*"
            fi
        done
        echo ""
    else
        echo -en "${BOLD}${prompt_text}: ${NC}"
        read -r value
    fi

    if [ -z "$value" ]; then
        value="$default_val"
    fi

    eval "$var_name='$value'"
}

# Helper: prompt yes/no
prompt_yn() {
    local var_name="$1"
    local prompt_text="$2"
    local default_val="$3"

    echo -en "${BOLD}${prompt_text} (y/n) [${default_val}]: ${NC}"
    read -r value

    if [ -z "$value" ]; then
        value="$default_val"
    fi

    case "$value" in
        [Yy]*) eval "$var_name=true" ;;
        *) eval "$var_name=false" ;;
    esac
}

# Generate random secret
generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    else
        head -c 32 /dev/urandom | base64
    fi
}

echo -e "${GREEN}━━━ Cau hinh co ban (bat buoc)━━━${NC}"
echo ""

prompt APP_URL "URL trang web (vi du https://shop.example.com)" ""
while [ -z "$APP_URL" ]; do
    echo -e "${RED}URL trang web khong duoc de trong, vui long nhap domain (kem https://)${NC}"
    prompt APP_URL "URL trang web (vi du https://shop.example.com)" ""
done
prompt PORT "Cong anh xa" "3000"

echo ""
echo -e "${GREEN}━━━ Linux DO Connect OAuth (bat buoc)━━━${NC}"
echo -e "${YELLOW}Tao ung dung tai https://connect.linux.do de lay thong tin${NC}"
echo ""

prompt OAUTH_CLIENT_ID "Client ID" ""
while [ -z "$OAUTH_CLIENT_ID" ]; do
    echo -e "${RED}Client ID khong duoc de trong${NC}"
    prompt OAUTH_CLIENT_ID "Client ID" ""
done

prompt OAUTH_CLIENT_SECRET "Client Secret" "" true
while [ -z "$OAUTH_CLIENT_SECRET" ]; do
    echo -e "${RED}Client Secret khong duoc de trong${NC}"
    prompt OAUTH_CLIENT_SECRET "Client Secret" "" true
done

echo ""
echo -e "${GREEN}━━━ Cau hinh thanh toan EPay (bat buoc)━━━${NC}"
echo ""

prompt MERCHANT_ID "Merchant ID" ""
while [ -z "$MERCHANT_ID" ]; do
    echo -e "${RED}Merchant ID khong duoc de trong${NC}"
    prompt MERCHANT_ID "Merchant ID" ""
done

prompt MERCHANT_KEY "Merchant Key" "" true
while [ -z "$MERCHANT_KEY" ]; do
    echo -e "${RED}Merchant Keykhong duoc de trong${NC}"
    prompt MERCHANT_KEY "Merchant Key" "" true
done

echo ""
echo -e "${GREEN}━━━ Cau hinh quan tri vien ━━━${NC}"
echo ""

prompt ADMIN_USERS "Username admin (nhieu username tach bang dau phay)" "admin"

PAY_URL="https://credit.linux.do/epay/pay/submit.php"

echo ""
echo -e "${GREEN}━━━ GitHub OAuth (tuy chon, Enter de bo qua)━━━${NC}"
echo -e "${YELLOW}Tao OAuth App tai https://github.com/settings/developers${NC}"
echo ""

prompt GITHUB_ID "GitHub Client ID" ""
prompt GITHUB_SECRET "GitHub Client Secret" "" true

# Generate AUTH_SECRET
AUTH_SECRET=$(generate_secret)

echo ""
echo -e "${CYAN}━━━ Tao file cau hinh ━━━${NC}"
echo ""

# Write .env file
cat > "$ENV_FILE" <<EOF
# === Cau hinh Docker Grip Store ===
# Duoc tao tu dong boi pull-setup.sh vao $(date)

# Site (dia chi truy cap ben ngoai, runtime phia server)
APP_URL=${APP_URL}
NEXT_PUBLIC_APP_URL=${APP_URL}
# NextAuth: AUTH_URL duoc entrypoint.sh suy ra tu APP_URL, khong can set tay
AUTH_TRUST_HOST=true
AUTH_SECRET=${AUTH_SECRET}

# Linux DO Connect OAuth
OAUTH_CLIENT_ID=${OAUTH_CLIENT_ID}
OAUTH_CLIENT_SECRET=${OAUTH_CLIENT_SECRET}

# EPay payment
MERCHANT_ID=${MERCHANT_ID}
MERCHANT_KEY=${MERCHANT_KEY}
PAY_URL=${PAY_URL}

# Admin users
ADMIN_USERS=${ADMIN_USERS}

# SQLite database
DATABASE_PATH=/app/data/grip-store.sqlite

# GitHub OAuth login (tuy chon)
GITHUB_ID=${GITHUB_ID}
GITHUB_SECRET=${GITHUB_SECRET}

# Telegram / Bark / email notification: cau hinh trong trang quan tri sau khi dang nhap
EOF

echo -e "${GREEN}✓${NC} .env da duoc tao"

# Write docker-compose.yml
cat > "$COMPOSE_FILE" <<EOF
services:
  app:
    container_name: grip-store
    image: ${IMAGE}
    restart: always
    ports:
      - "${PORT}:3000"
    volumes:
      - ./data:/app/data
    env_file:
      - .env
EOF

echo -e "${GREEN}✓${NC} docker-compose.yml da duoc tao"

# Create data directory with open permissions for container
mkdir -p data && chmod 777 data
echo -e "${GREEN}✓${NC} Da tao thu muc data"

echo ""
echo -e "${CYAN}━━━ Tom tat cau hinh ━━━${NC}"
echo ""
echo -e "  Image:            ${BOLD}${IMAGE}${NC}"
echo -e "  Dia chi site:        ${BOLD}${APP_URL}${NC}"
echo -e "  Cong anh xa:        ${BOLD}${PORT}${NC}"
echo -e "  Admin users:          ${BOLD}${ADMIN_USERS}${NC}"
if [ -n "$GITHUB_ID" ]; then
echo -e "  GitHub login:     ${GREEN}da cau hinh${NC}"
else
echo -e "  GitHub login:     ${YELLOW}chua cau hinh (co the sua .env de bo sung sau)${NC}"
fi
echo ""
echo -e "  ${YELLOW}Telegram/Bark/email notification: cau hinh trong trang quan tri sau khi dang nhap${NC}"
echo ""

prompt_yn DO_START "Co pull image va khoi dong ngay khong?" "y"

if [ "$DO_START" = "true" ]; then
    echo ""
    echo -e "${CYAN}Dang pull image va khoi dong container...${NC}"
    echo ""
    $COMPOSE_CMD pull
    $COMPOSE_CMD up -d
    echo ""
    echo -e "${GREEN}${BOLD}✓ Grip Store da khoi dong!${NC}"
    echo ""
else
    echo ""
    echo -e "${YELLOW}Ban co the khoi dong thu cong sau:${NC}"
    echo ""
    echo "  $COMPOSE_CMD pull && $COMPOSE_CMD up -d"
    echo ""
fi

# --- Reverse proxy config ---
DOMAIN="${APP_URL#https://}"
DOMAIN="${DOMAIN#http://}"

echo -e "${CYAN}━━━ Cau hinh reverse proxy ━━━${NC}"
echo ""
echo -e "  Container lang nghe cong ${BOLD}${PORT}${NC}，Can cau hinh reverse proxy de truy cap bang domain ${BOLD}${DOMAIN}${NC} ."
echo ""

HAS_NGINX=false
if command -v nginx &> /dev/null 2>&1 || systemctl is-active --quiet nginx 2>/dev/null; then
    HAS_NGINX=true
fi

if [ "$HAS_NGINX" = "true" ]; then
    echo -e "  ${GREEN}Da phat hien Nginx da duoc cai${NC}，Khuyen nghi dung Nginx reverse proxy truc tiep (neu dung panel thi cau hinh tren panel)."
    echo ""
    echo -e "  ${BOLD}Cau hinh Nginx reverse proxy:${NC}"
    echo ""
    echo "    server {"
    echo "        listen 443 ssl;"
    echo "        server_name ${DOMAIN};"
    echo ""
    echo "        ssl_certificate     /path/to/cert.pem;"
    echo "        ssl_certificate_key /path/to/key.pem;"
    echo ""
    echo "        location / {"
    echo "            proxy_pass http://127.0.0.1:${PORT};"
    echo "            proxy_set_header Host \$host;"
    echo "            proxy_set_header X-Real-IP \$remote_addr;"
    echo "            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo "            proxy_set_header X-Forwarded-Proto \$scheme;"
    echo "            proxy_set_header X-Forwarded-Host \$host;"
    echo "        }"
    echo "    }"
    echo ""
    echo -e "  ${YELLOW}Nguoi dung panel:${NC}tao site → domain dien ${BOLD}${DOMAIN}${NC} → cai dat → reverse proxy → Target URL dien ${BOLD}http://127.0.0.1:${PORT}${NC}"
    echo ""
else
    prompt_yn SETUP_CADDY "Chua phat hien Nginx, co tu dong cai Caddy (HTTPS tu dong) khong?" "n"

    if [ "$SETUP_CADDY" = "true" ]; then
        echo ""

        if ! command -v caddy &> /dev/null; then
            echo -e "${CYAN}Dang cai dat Caddy...${NC}"

            if [ -f /etc/debian_version ]; then
                apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl > /dev/null 2>&1 || true
                curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg 2>/dev/null
                curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null
                apt-get update -qq > /dev/null 2>&1
                apt-get install -y caddy > /dev/null 2>&1
            elif [ -f /etc/redhat-release ]; then
                yum install -y yum-plugin-copr > /dev/null 2>&1 || dnf install -y 'dnf-command(copr)' > /dev/null 2>&1 || true
                yum copr enable -y @caddy/caddy > /dev/null 2>&1 || dnf copr enable -y @caddy/caddy > /dev/null 2>&1 || true
                yum install -y caddy > /dev/null 2>&1 || dnf install -y caddy > /dev/null 2>&1
            else
                echo -e "${RED}Khong the tu dong cai Caddy, xem https://caddyserver.com/docs/install de cai thu cong${NC}"
                SETUP_CADDY=false
            fi

            if command -v caddy &> /dev/null; then
                echo -e "${GREEN}✓${NC} Caddy cai dat thanh cong"
            else
                echo -e "${RED}✗ Caddy cai dat that bai, vui long cai thu cong roi cau hinh${NC}"
                SETUP_CADDY=false
            fi
        else
            echo -e "${GREEN}✓${NC} Caddy da duoc cai"
        fi
    fi

    if [ "$SETUP_CADDY" = "true" ]; then
        CADDYFILE="/etc/caddy/Caddyfile"
        cat > "$CADDYFILE" <<CADDYEOF
${DOMAIN} {
    reverse_proxy localhost:${PORT}
}
CADDYEOF

        echo -e "${GREEN}✓${NC} Caddyfile da ghi vao ${CADDYFILE}"

        if systemctl is-active --quiet caddy 2>/dev/null; then
            systemctl reload caddy
            echo -e "${GREEN}✓${NC} Caddy da reload"
        else
            systemctl enable caddy > /dev/null 2>&1 || true
            systemctl start caddy
            echo -e "${GREEN}✓${NC} Caddy da khoi dong"
        fi

        echo ""
        echo -e "${GREEN}${BOLD}━━━ Trien khai hoan tat!━━━${NC}"
        echo ""
        echo -e "  ${BOLD}Buoc cuoi:${NC} vao DNS domain va them ban ghi A:"
        echo ""
        echo -e "    Host:  ${BOLD}${DOMAIN}${NC}"
        echo -e "    Type:  ${BOLD}A${NC}"
        echo -e "    Value:    ${BOLD}Public IP cua server${NC}"
        echo ""
        echo -e "  Cho DNS cap nhat, truy cap ${BOLD}${APP_URL}${NC} (Caddy tu dong xin chung chi HTTPS)."
        echo ""
    else
        echo ""
        echo -e "  Vi du cau hinh Nginx reverse proxy thu cong:"
        echo ""
        echo "    server {"
        echo "        listen 443 ssl;"
        echo "        server_name ${DOMAIN};"
        echo "        ssl_certificate     /path/to/cert.pem;"
        echo "        ssl_certificate_key /path/to/key.pem;"
        echo "        location / {"
        echo "            proxy_pass http://127.0.0.1:${PORT};"
        echo "            proxy_set_header Host \$host;"
        echo "            proxy_set_header X-Real-IP \$remote_addr;"
        echo "            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
        echo "            proxy_set_header X-Forwarded-Proto \$scheme;"
        echo "            proxy_set_header X-Forwarded-Host \$host;"
        echo "        }"
        echo "    }"
        echo ""
    fi
fi

echo -e "${CYAN}Lenh thuong dung:${NC}"
echo "  Xem log:   $COMPOSE_CMD logs -f"
echo "  Dung service:   $COMPOSE_CMD down"
echo "  Khoi dong lai service:   $COMPOSE_CMD down && $COMPOSE_CMD up -d"
echo "  Cap nhat image:   $COMPOSE_CMD pull && $COMPOSE_CMD up -d"
echo ""
