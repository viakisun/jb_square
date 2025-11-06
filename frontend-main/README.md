# JB SQUARE 와이어프레임 시스템

전북 바이오 클러스터 지원을 위한 JB SQUARE 웹사이트의 완전한 와이어프레임 시스템입니다.

## 📋 프로젝트 개요

### 목적
- **의견 공유 및 검토**: 본격적인 개발 전 디자인과 구조에 대한 피드백 수집
- **완전한 와이어프레임**: 29개 페이지의 상세한 와이어프레임 제공
- **일관된 디자인 시스템**: 그레이스케일 기반의 통일된 UI/UX

### 주요 특징
- ✅ **29개 완전한 페이지** - 모든 서브페이지 포함
- ✅ **그레이스케일 디자인** - 자극적이지 않은 와이어프레임 전용 색상
- ✅ **체계적인 라벨링** - `[SECTION]`, `[BUTTON]`, `[TABLE]` 등 명확한 구분
- ✅ **반응형 디자인** - 데스크탑/모바일 대응
- ✅ **재사용 가능한 컴포넌트** - Header, Footer, Breadcrumb
- ✅ **실시간 피드백 시스템** - 각 페이지 하단의 메모 기능으로 의견 수집

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/viakisun/jb2_wireframe.git
cd jb2_wireframe
```

2. **의존성 설치**
```bash
npm install
```

3. **개발 서버 실행**
```bash
npm run dev
```

4. **브라우저에서 확인**
```
http://localhost:3000
```

## 🌐 EC2 프로덕션 배포

### 배포 방법
```bash
# 1. EC2에 접속
ssh -i ~/.ssh/your-key.pem ec2-user@your-ec2-host

# 2. 프로젝트 디렉토리로 이동
cd /home/ec2-user/jb2_wireframe

# 3. 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh

# 4. 애플리케이션 접속
# 도메인: https://jb2.viahub.dev
# IP 직접: https://your-ec2-public-ip
# 헬스체크: https://jb2.viahub.dev/healthz
```

### 배포 후 관리
```bash
# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs jb-square-wireframe

# 애플리케이션 재시작
pm2 restart jb-square-wireframe

# Nginx 재시작
sudo systemctl restart nginx
```

## 📁 프로젝트 구조

```
jb2_wireframe/
├── components/           # 재사용 가능한 컴포넌트
│   ├── Header.tsx       # 글로벌 헤더 (네비게이션 포함)
│   ├── Footer.tsx       # 글로벌 푸터
│   └── Breadcrumb.tsx   # 브레드크럼 네비게이션
├── pages/               # Next.js 페이지 라우팅
│   ├── index.tsx        # 홈페이지
│   ├── bio-cluster/     # JB BIO 클러스터 (6개 페이지)
│   ├── organizations/   # 지원기관 (3개 페이지)
│   ├── policy/          # 바이오지원정책 (7개 페이지)
│   ├── announcements/   # 지원사업공고 (5개 페이지)
│   ├── incubator/       # 창업보육센터 (5개 페이지)
│   ├── news-events/     # 뉴스/행사 (2개 페이지)
│   └── companies/       # 기업정보 (2개 페이지)
├── styles/
│   └── globals.css      # 글로벌 스타일
└── package.json         # 프로젝트 설정
```

## 🎯 페이지 목록

### JB BIO 클러스터 (6개)
- [바이오 클러스터](/bio-cluster/cluster)
- [지역 바이오밸리](/bio-cluster/valley)
- [CEO포럼](/bio-cluster/community/ceo-forum)
- [전북경제포럼](/bio-cluster/community/economic-forum)
- [혁신신약살롱](/bio-cluster/community/pharma-salon)
- [전북과학기술포럼](/bio-cluster/community/tech-forum)

### 지원기관 (3개)
- [유관기관](/organizations/related)
- [대학](/organizations/academic)
- [연구소](/organizations/research)

### 바이오지원정책 (7개)
- [외국인투자제도](/policy/investment/foreign)
- [투자 절차](/policy/investment/process)
- [JBFEZ](/policy/investment/jbfez)
- [세제감면](/policy/incentives/tax)
- [경영활동지원](/policy/incentives/business-support)
- [투자상품](/policy/products)
- [투자가이드](/policy/guide)
- [기업 및 투자 유치촉진조례](/policy/regulations)

### 지원사업공고 (5개)
- [정부/지자체](/announcements/government)
- [기업 맞춤형 지원](/announcements/customized)
- [R&D](/announcements/rd)
- [창업 및 기술이전](/announcements/startup)
- [최신공고 모아보기](/announcements/all)

### 창업보육센터 (5개)
- [지역별 입주기업](/incubator/regional)
- [공실현황](/incubator/vacancy)
- [보육기업](/incubator/incubatee)
- [졸업기업](/incubator/graduate)
- [보육센터](/incubator/incubator)

### 뉴스/행사 (2개)
- [최신뉴스](/news-events/news)
- [행사일정](/news-events/events)

### 기업정보 (2개)
- [지역 기업 정보](/companies/directory)
- [기업상세](/companies/company)

## 🎨 디자인 시스템

### 색상 팔레트
- **그레이스케일 전용**: `bg-gray-50`, `border-gray-300`, `text-gray-600` 등
- **자극적 색상 금지**: 파란색, 초록색, 빨간색, 주황색 등 사용 안함

### 라벨링 시스템
- `[SECTION]` - 주요 섹션 구분
- `[BUTTON]` - 버튼 요소
- `[TABLE]` - 테이블 데이터
- `[MENU]` - 메뉴 항목
- `[SUBMENU]` - 서브메뉴 항목
- `[FORM]` - 폼 요소
- `[CARD]` - 카드 컴포넌트

### 테두리 스타일
- **주요 섹션**: `border-2 border-gray-400`
- **일반 컴포넌트**: `border border-gray-300`
- **특별 영역**: `border-2 border-dashed border-gray-500`

## 🔧 기술 스택

- **Framework**: Next.js 14.2.32
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## 📝 개발 가이드

### 컴포넌트 구조
- **재사용성**: Header, Footer, Breadcrumb 컴포넌트 활용
- **일관성**: 모든 페이지에서 동일한 레이아웃 구조 사용
- **반응형**: 데스크탑 우선, 모바일 적응형 디자인

### 상태 관리
- **useState**: 드롭다운 메뉴, 모바일 메뉴 상태 관리
- **이벤트 핸들링**: 마우스 호버, 클릭 이벤트 처리

## 🤝 피드백 및 의견 공유

### 실시간 피드백 시스템
각 페이지 하단에 **피드백 메모 섹션**이 있어 실시간으로 의견을 수집할 수 있습니다:

- **📝 메모 작성**: 이름과 함께 구체적인 피드백 작성
- **💾 로컬 저장**: 브라우저 로컬 스토리지에 자동 저장
- **👥 실시간 공유**: 팀원들과 즉시 의견 공유 가능
- **🗑️ 관리 기능**: 작성한 메모 수정/삭제 가능
- **🔔 슬랙 스타일 알림**: 새 피드백이 올라오면 실시간 토스트 알림
- **📱 알림 패널**: 우하단 알림 버튼으로 모든 피드백 확인 가능

### 검토 포인트
1. **전체적인 구조와 네비게이션**
2. **각 페이지의 콘텐츠 구성**
3. **사용자 경험 (UX) 흐름**
4. **반응형 디자인 적합성**
5. **접근성 및 사용성**

### 피드백 방법
- **📱 실시간 메모**: 각 페이지 하단의 피드백 섹션 활용
- **📋 이슈 등록**: GitHub Issues를 통한 구체적인 피드백
- **💬 토론**: 각 페이지별 디자인 및 기능에 대한 의견 교환
- **💡 개선 제안**: "이랬으면 좋겠다", "저랬으면 좋겠다" 같은 구체적 제안

## 🚧 다음 단계

1. **와이어프레임 검토 및 피드백 수집**
2. **디자인 시스템 정립**
3. **실제 콘텐츠 및 데이터 구조 설계**
4. **백엔드 API 설계**
5. **본격적인 개발 시작**

## 📞 문의

프로젝트에 대한 문의사항이나 피드백이 있으시면 GitHub Issues를 통해 연락해 주세요.

---

**참고**: 이 프로젝트는 와이어프레임 단계로, 실제 기능 구현은 본격적인 개발 단계에서 진행됩니다.