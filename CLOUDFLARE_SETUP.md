# ☁️ Cloudflare 설정 가이드

Cloudflare를 사용하면 DNS 관리, CDN, DDoS 보호, 무료 SSL 등을 제공받을 수 있습니다.

---

## 📋 Cloudflare vs Let's Encrypt

| 항목 | Cloudflare | Let's Encrypt |
|------|-----------|---------------|
| **SSL 인증서** | Cloudflare 무료 SSL | Let's Encrypt 무료 SSL |
| **CDN** | ✅ 제공 (전세계 엣지 서버) | ❌ 없음 |
| **DDoS 보호** | ✅ 무료 제공 | ❌ 없음 |
| **WAF** | ✅ 제공 (유료) | ❌ 없음 |
| **설정 난이도** | 쉬움 (클릭 몇 번) | 중간 (certbot 실행) |
| **갱신** | 자동 (관리 불필요) | 자동 (60일마다) |
| **권장 사용** | 프로덕션 환경 | 소규모 또는 테스트 |

**권장**: 프로덕션 환경에서는 **Cloudflare** 사용을 권장합니다.

---

## 🚀 Cloudflare 설정 (3단계)

### Step 1: Cloudflare에 도메인 추가

1. **Cloudflare 가입**
   - https://www.cloudflare.com 접속
   - 무료 계정 생성

2. **도메인 추가**
   ```
   Add a Site → jb2.kr 입력 → Add site
   → Free 플랜 선택 → Continue
   ```

3. **DNS 레코드 확인**
   - Cloudflare가 기존 DNS 레코드를 자동으로 가져옵니다
   - 다음 레코드가 있는지 확인:

   | Type | Name | Content | Proxy |
   |------|------|---------|-------|
   | A | jb2.kr | `<EC2-PUBLIC-IP>` | ✅ Proxied (주황색 구름) |
   | A | www | `<EC2-PUBLIC-IP>` | ✅ Proxied |

4. **없으면 직접 추가:**
   ```
   Add record 클릭:
   - Type: A
   - Name: @ (또는 jb2.kr)
   - IPv4 address: <EC2-PUBLIC-IP>
   - Proxy status: Proxied (주황색 구름)
   - Save

   Add record 클릭 (www):
   - Type: A
   - Name: www
   - IPv4 address: <EC2-PUBLIC-IP>
   - Proxy status: Proxied
   - Save
   ```

### Step 2: Nameserver 변경

1. **Cloudflare Nameserver 확인**
   - Cloudflare가 제공하는 Nameserver 2개를 메모:
   ```
   예시:
   alex.ns.cloudflare.com
   lynn.ns.cloudflare.com
   ```

2. **도메인 등록업체에서 Nameserver 변경**

   **가비아 (gabia.com):**
   ```
   1. My가비아 로그인
   2. 서비스 관리 → 도메인 → 관리
   3. 네임서버 설정 클릭
   4. 네임서버 1차: alex.ns.cloudflare.com
      네임서버 2차: lynn.ns.cloudflare.com
   5. 적용하기
   ```

   **후이즈 (whois.co.kr):**
   ```
   1. 로그인 → 도메인 관리
   2. 네임서버 변경
   3. Cloudflare 네임서버 입력
   4. 확인
   ```

3. **DNS 전파 대기**
   - 보통 5분~48시간 소요 (평균 1~2시간)
   - Cloudflare에서 자동으로 확인됨
   - 확인: https://www.whatsmydns.net/#A/jb2.kr

### Step 3: Cloudflare SSL/TLS 설정

1. **SSL/TLS 모드 설정**
   ```
   Cloudflare Dashboard → SSL/TLS → Overview

   ✅ Full (strict) 선택 (권장)
   ```

   **SSL 모드 설명:**
   - **Off**: SSL 사용 안 함 (❌ 권장하지 않음)
   - **Flexible**: Cloudflare ↔ 사용자만 암호화, Cloudflare ↔ Origin 서버는 HTTP
   - **Full**: Cloudflare ↔ Origin 서버도 암호화 (자체 서명 인증서 허용)
   - **Full (strict)**: Origin 서버에 유효한 SSL 인증서 필요 (✅ 권장)

2. **Always Use HTTPS 활성화**
   ```
   SSL/TLS → Edge Certificates → Always Use HTTPS: ON
   ```

3. **HSTS 설정 (선택사항, 보안 강화)**
   ```
   SSL/TLS → Edge Certificates → HSTS 설정
   - Enable HSTS: ON
   - Max Age: 12 months
   - Include subdomains: ON
   - Preload: OFF (나중에 설정)
   ```

---

## 🔐 Origin 서버 SSL 인증서 설정

Cloudflare의 **Full (strict)** 모드를 사용하려면 EC2에 SSL 인증서가 필요합니다.

### 방법 1: Cloudflare Origin CA 인증서 (권장)

**장점**: 15년 유효, 갱신 불필요, 설정 간단

```bash
# EC2에 SSH 접속
ssh -i ~/.ssh/jb2-key.pem ec2-user@<EC2-PUBLIC-IP>
cd ~/jb_square
```

1. **Cloudflare에서 Origin 인증서 생성**
   ```
   Cloudflare Dashboard → SSL/TLS → Origin Server → Create Certificate

   - Private key type: RSA (2048)
   - Hostnames: jb2.kr, *.jb2.kr, jb2.co.kr, *.jb2.co.kr
   - Certificate Validity: 15 years
   - Create
   ```

2. **인증서 복사 (2개 파일 생성됨)**
   - Origin Certificate (PEM 형식)
   - Private Key

3. **EC2에 인증서 저장**
   ```bash
   # nginx/ssl 디렉토리 생성
   mkdir -p ~/jb_square/nginx/ssl

   # Origin Certificate 저장
   nano ~/jb_square/nginx/ssl/cloudflare-origin.pem
   # (Cloudflare에서 복사한 Origin Certificate 붙여넣기)

   # Private Key 저장
   nano ~/jb_square/nginx/ssl/cloudflare-origin-key.pem
   # (Cloudflare에서 복사한 Private Key 붙여넣기)

   # 권한 설정
   chmod 644 ~/jb_square/nginx/ssl/cloudflare-origin.pem
   chmod 600 ~/jb_square/nginx/ssl/cloudflare-origin-key.pem
   ```

4. **nginx 설정 수정**
   ```bash
   nano ~/jb_square/nginx/conf.d/default.conf
   ```

   HTTPS 블록의 주석을 제거하고 인증서 경로 수정:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name jb2.kr www.jb2.kr jb2.co.kr www.jb2.co.kr;

       # Cloudflare Origin CA 인증서
       ssl_certificate /etc/nginx/ssl/cloudflare-origin.pem;
       ssl_certificate_key /etc/nginx/ssl/cloudflare-origin-key.pem;

       # ... (나머지 설정)
   }
   ```

5. **Docker 컨테이너 재시작**
   ```bash
   cd ~/jb_square
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

### 방법 2: Let's Encrypt 인증서 사용

```bash
# 이미 만들어둔 스크립트 사용
sudo bash scripts/setup-ssl.sh
```

**단점**: 60일마다 갱신 필요 (자동 갱신 설정됨)

---

## ⚡ Cloudflare 성능 최적화

### 1. Caching 설정

```
Cloudflare Dashboard → Caching → Configuration

- Caching Level: Standard
- Browser Cache TTL: 4 hours (권장)
- Crawler Hints: ON
```

### 2. Auto Minify (자동 압축)

```
Speed → Optimization

- Auto Minify:
  ✅ JavaScript
  ✅ CSS
  ✅ HTML
```

### 3. Brotli 압축

```
Speed → Optimization

- Brotli: ON
```

### 4. HTTP/3 활성화

```
Network → HTTP/3: ON
```

---

## 🛡️ 보안 설정

### 1. DDoS 보호

```
Security → Settings

- Security Level: Medium (권장)
- Challenge Passage: 30 minutes
- Browser Integrity Check: ON
```

### 2. Bot Fight Mode (봇 차단)

```
Security → Bots

- Bot Fight Mode: ON (무료)
```

### 3. Rate Limiting (속도 제한)

무료 플랜에서는 제한적, Pro 플랜 이상에서 사용 가능

---

## ✅ 설정 확인

### 1. DNS 전파 확인
```bash
nslookup jb2.kr
# Cloudflare IP가 나와야 함 (예: 104.21.x.x, 172.67.x.x)
```

### 2. SSL 확인
```bash
curl -I https://jb2.kr
# HTTP/2 200 OK가 나와야 함
```

### 3. 브라우저 테스트
```
https://jb2.kr
https://www.jb2.kr
https://jb2.co.kr
https://www.jb2.co.kr
```

### 4. SSL Labs 테스트
```
https://www.ssllabs.com/ssltest/analyze.html?d=jb2.kr
```
A+ 등급이 나와야 함

---

## 🔧 문제 해결

### 문제 1: "Too many redirects" 오류

**원인**: SSL 모드가 Flexible일 때 발생

**해결**:
```
Cloudflare → SSL/TLS → Full (strict)로 변경
```

### 문제 2: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"

**원인**: Origin 서버에 SSL 인증서가 없거나 잘못됨

**해결**:
```bash
# EC2에서 인증서 확인
ls -la ~/jb_square/nginx/ssl/

# nginx 로그 확인
docker-compose -f docker-compose.prod.yml logs nginx
```

### 문제 3: DNS 전파가 안됨

**확인**:
```bash
# 여러 지역에서 DNS 확인
https://www.whatsmydns.net/#A/jb2.kr
```

**해결**: 24~48시간 대기

---

## 📊 Cloudflare vs 직접 설정 비교

### ✅ Cloudflare 사용 (권장)

**장점**:
- 🚀 CDN으로 전세계 빠른 속도
- 🛡️ DDoS 보호 무료
- 🔒 SSL 인증서 자동 관리 (15년 유효)
- 📊 Analytics 제공
- 🤖 Bot 차단
- ⚡ HTTP/3, Brotli 압축 지원

**단점**:
- Cloudflare IP로 마스킹됨 (실제 사용자 IP는 X-Forwarded-For 헤더에)

### ❌ Let's Encrypt만 사용

**장점**:
- EC2 IP 직접 노출
- 설정이 단순

**단점**:
- CDN 없음 (느림)
- DDoS 공격에 취약
- 60일마다 인증서 갱신 필요

---

## 📝 권장 설정 요약

```yaml
DNS:
  - Cloudflare Nameserver 사용
  - A 레코드: Proxied (주황색 구름)

SSL/TLS:
  - 모드: Full (strict)
  - Always Use HTTPS: ON
  - HSTS: ON
  - Origin: Cloudflare Origin CA 인증서 (15년)

Speed:
  - Auto Minify: ON (JS, CSS, HTML)
  - Brotli: ON
  - HTTP/3: ON

Security:
  - Security Level: Medium
  - Bot Fight Mode: ON
```

---

## 🎯 최종 접속

설정 완료 후:
```
https://jb2.kr           → Cloudflare CDN → EC2
https://www.jb2.kr       → Cloudflare CDN → EC2
https://jb2.co.kr        → Cloudflare CDN → EC2
https://www.jb2.co.kr    → Cloudflare CDN → EC2
```

**속도**: Cloudflare 엣지 서버에서 캐싱되어 매우 빠름 ⚡
**보안**: DDoS 보호, WAF, Bot 차단 🛡️
**비용**: 무료 ✅

---

## 📞 추가 도움

- Cloudflare 문서: https://developers.cloudflare.com/
- Cloudflare 커뮤니티: https://community.cloudflare.com/
