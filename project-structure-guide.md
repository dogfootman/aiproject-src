# 프로젝트 구조 및 관리 방안

## 1. Repository 구조

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Organization                     │
├─────────────────────────┬───────────────────────────────────┤
│      Spec Repository    │       Source Repository           │
│  (설계 & 문서 관리)      │      (구현 & 실행)                 │
├─────────────────────────┼───────────────────────────────────┤
│  • Spec Kit 기반 문서    │  • Spec Repo 참조                 │
│  • API 설계서           │  • 실제 구현 코드                  │
│  • DB 스키마 설계        │  • 테스트 코드                    │
│  • UI/UX 설계           │  • 배포 설정                      │
└─────────────────────────┴───────────────────────────────────┘
```

---

## 2. 이슈 관리 워크플로우

### 2.1 이슈 분류 체계

| 분류 | Label | 설명 | Spec 작업 |
|------|-------|------|-----------|
| 새기능 | `feature` | 신규 기능 개발 | 전체 설계 문서 작성 |
| 보완 | `enhancement` | 기존 기능 개선 | 변경 사항 설계 추가 |
| 버그 | `bug` | 오류 수정 | 원인 분석 및 수정 방안 기록 |

### 2.2 이슈 처리 흐름

```
Source Repo Issue 등록
        │
        ▼
    분류 (Triage)
    ┌───┼───┐
    │   │   │
    ▼   ▼   ▼
 feature  enhancement  bug
    │   │   │
    └───┼───┘
        ▼
  Spec Repo 설계 작성
        │
        ▼
  설계 Review & Merge
        │
        ▼
  Source Repo 구현 시작
        │
        ▼
  PR → Review → Merge
```

### 2.3 이슈 템플릿

**Source Repo Issue Template:**
```markdown
## 이슈 유형
- [ ] 새기능 (feature)
- [ ] 보완 (enhancement)  
- [ ] 버그 (bug)

## 설명
[이슈에 대한 상세 설명]

## 기대 결과
[예상되는 결과물]

## 관련 Spec
[Spec Repo 문서 링크 - 작성 후 업데이트]
```

---

## 3. 기본 제공 기능 (Core Modules)

### 3.1 기능 목록

| 모듈 | 설명 | 주요 기능 |
|------|------|----------|
| **사용자 관리** | 사용자 CRUD 및 인증 | 회원가입, 로그인, 권한관리, 프로필 |
| **메뉴 관리** | 메뉴 구조 관리 | 메뉴 등록, 순서 변경, 권한 설정 |
| **카테고리 관리** | 계층형 카테고리 | 다단계 카테고리, 정렬, 활성화 |
| **공통코드 관리** | 코드성 데이터 관리 | 코드 그룹, 코드 항목, 다국어 |
| **화면 레이아웃 관리** | UI 레이아웃 설정 | 템플릿, 위젯 배치, 테마 |
| **알림 관리** | 알림 발송 및 관리 | 푸시, 이메일, SMS, 알림 이력 |
| **게시판 관리** | 게시판 생성 및 운영 | 게시판 유형, 권한, 첨부파일 |

### 3.2 모듈 구조

```
src/
├── modules/
│   ├── user/           # 사용자 관리
│   ├── menu/           # 메뉴 관리
│   ├── category/       # 카테고리 관리
│   ├── common-code/    # 공통코드 관리
│   ├── layout/         # 화면 레이아웃 관리
│   ├── notification/   # 알림 관리
│   └── board/          # 게시판 관리
├── core/               # 핵심 유틸리티
├── config/             # 환경 설정
└── shared/             # 공유 컴포넌트
```

---

## 4. 단계별 환경 설정

### 4.1 단계 비교표

| 구분 | PoC | Dev | Production |
|------|-----|-----|------------|
| **데이터** | Mock/File 기반 | 실제 DB | 실제 DB |
| **로그 레벨** | INFO | DEBUG | WARN/ERROR |
| **브랜치** | feature/* | develop | main |
| **소스 수정** | 자유 | 가능 (PR) | 불가 |
| **배포 방식** | 로컬 | 개발 서버 | 운영 서버 |
| **인증** | 우회 가능 | 테스트 계정 | 실제 인증 |

### 4.2 PoC 단계

```yaml
# config/poc.yaml
stage: poc
database:
  type: file          # file | mock | memory
  path: ./data/mock
logging:
  level: info
  format: simple
features:
  auth_bypass: true
  mock_delay: 500ms   # 실제 환경 시뮬레이션
```

**특징:**
- 모든 데이터는 JSON 파일 또는 메모리 기반
- 빠른 프로토타이핑 가능
- 외부 의존성 없음

### 4.3 Dev 단계

```yaml
# config/dev.yaml
stage: dev
database:
  type: postgresql
  host: dev-db.internal
  port: 5432
logging:
  level: debug
  format: detailed
  include_trace: true
features:
  hot_reload: true
  debug_panel: true
```

**브랜치 전략:**
```
main (protected)
  │
  └── develop
        │
        ├── feature/user-management
        ├── feature/notification-system
        └── bugfix/login-issue
```

### 4.4 운영(Production) 단계

```yaml
# config/prod.yaml
stage: production
database:
  type: postgresql
  host: ${DB_HOST}
  port: ${DB_PORT}
  ssl: required
logging:
  level: warn
  format: json
  external: true      # 외부 로깅 시스템 연동
features:
  debug_panel: false
  maintenance_mode: false
```

**특징:**
- main 브랜치만 배포 가능
- 소스 수정 불가 (설정만 변경 가능)
- 환경 변수 기반 설정

---

## 5. 데이터 관리 전략

### 5.1 단계별 데이터 소스

```
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
├─────────────┬─────────────────┬─────────────────────────┤
│     PoC     │       Dev       │      Production         │
├─────────────┼─────────────────┼─────────────────────────┤
│  Mock JSON  │   Dev Database  │   Production Database   │
│  File Store │   (PostgreSQL)  │   (PostgreSQL + Redis)  │
│  In-Memory  │   Local Cache   │   Distributed Cache     │
└─────────────┴─────────────────┴─────────────────────────┘
```

### 5.2 데이터 추상화 레이어

```typescript
// Repository Pattern으로 단계별 데이터 소스 전환
interface UserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

// PoC: File-based
class FileUserRepository implements UserRepository { ... }

// Dev/Prod: Database
class DbUserRepository implements UserRepository { ... }
```

### 5.3 Mock 데이터 구조

```
data/
├── mock/
│   ├── users.json
│   ├── menus.json
│   ├── categories.json
│   ├── common-codes.json
│   ├── layouts.json
│   ├── notifications.json
│   └── boards.json
└── seed/
    └── initial-data.sql
```

---

## 6. Spec Repository 구조

```
spec-repo/
├── README.md
├── specs/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── overview.md
│   │   │   ├── api.md
│   │   │   ├── database.md
│   │   │   └── ui.md
│   │   ├── menu/
│   │   ├── category/
│   │   ├── common-code/
│   │   ├── layout/
│   │   ├── notification/
│   │   └── board/
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── deployment.md
│   │   └── security.md
│   └── guides/
│       ├── development.md
│       ├── testing.md
│       └── contribution.md
├── schemas/
│   ├── database/
│   │   └── erd.md
│   └── api/
│       └── openapi.yaml
└── decisions/
    └── ADR-001-database-choice.md
```

---

## 7. Source Repository 구조

```
source-repo/
├── README.md
├── package.json
├── config/
│   ├── poc.yaml
│   ├── dev.yaml
│   └── prod.yaml
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   └── user.entity.ts
│   │   └── ...
│   ├── core/
│   ├── config/
│   └── shared/
├── data/
│   └── mock/
├── tests/
├── scripts/
│   ├── start-poc.sh
│   ├── start-dev.sh
│   └── deploy-prod.sh
└── docker/
    ├── Dockerfile.poc
    ├── Dockerfile.dev
    └── Dockerfile.prod
```

---

## 8. 브랜치 및 배포 전략

### 8.1 브랜치 규칙

```
main (protected)
│   └── 운영 배포 전용
│       • PR만 허용
│       • 2명 이상 승인 필요
│       • CI/CD 통과 필수
│
└── develop
    │   └── 개발 통합 브랜치
    │       • feature 브랜치 머지 대상
    │       • Dev 서버 자동 배포
    │
    ├── feature/{issue-number}-{description}
    │   └── 새기능 개발
    │
    ├── enhancement/{issue-number}-{description}
    │   └── 기능 개선
    │
    └── bugfix/{issue-number}-{description}
        └── 버그 수정
```

### 8.2 CI/CD 파이프라인

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Tests
        run: npm test

  deploy-dev:
    if: github.ref == 'refs/heads/develop'
    needs: test
    # Dev 서버 배포

  deploy-prod:
    if: github.ref == 'refs/heads/main'
    needs: test
    # Production 서버 배포
```

---

## 9. 개발 가이드

### 9.1 로컬 환경 실행

```bash
# PoC 모드 실행
npm run start:poc

# Dev 모드 실행  
npm run start:dev

# 테스트 실행
npm test
```

### 9.2 새 기능 개발 프로세스

1. **Source Repo에 Issue 등록**
2. **Spec Repo에 설계 문서 작성**
3. **설계 Review 및 Merge**
4. **feature 브랜치 생성**
5. **구현 및 테스트**
6. **PR 생성 → develop 머지**
7. **Dev 환경 검증**
8. **main 머지 → 운영 배포**

---

## 10. 환경 변수 관리

### 10.1 환경별 변수

| 변수 | PoC | Dev | Production |
|------|-----|-----|------------|
| `STAGE` | poc | dev | production |
| `DB_TYPE` | file | postgresql | postgresql |
| `LOG_LEVEL` | info | debug | warn |
| `AUTH_BYPASS` | true | false | false |

### 10.2 보안 변수 (Production Only)

```bash
# .env.production (gitignore)
DB_HOST=prod-db.example.com
DB_PASSWORD=<secret>
JWT_SECRET=<secret>
API_KEY=<secret>
```

---

## 부록: 체크리스트

### 신규 기능 개발 체크리스트
- [ ] Source Repo Issue 등록
- [ ] Spec Repo 설계 문서 작성
- [ ] API 명세 작성
- [ ] DB 스키마 설계
- [ ] Mock 데이터 준비
- [ ] 구현 완료
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] Code Review 완료
- [ ] Dev 환경 검증
- [ ] 문서 업데이트

### 배포 체크리스트
- [ ] 모든 테스트 통과
- [ ] 설정 파일 검증
- [ ] 환경 변수 확인
- [ ] 롤백 계획 수립
- [ ] 모니터링 대시보드 확인
