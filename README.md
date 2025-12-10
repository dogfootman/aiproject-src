# AI Project - Source Repository

## 프로젝트 개요

이 프로젝트는 **Spec Repository**와 **Source Repository**를 분리하여 관리하는 구조를 따릅니다.

| Repository | 역할 | 주소 |
|------------|------|------|
| **Spec Repo** | 설계 & 문서 관리 | [aiproject-doc](https://github.com/dogfootman/aiproject-doc) |
| **Source Repo** | 구현 & 실행 | 현재 Repository |

## 기술 스택

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: React 19

## 프로젝트 구조

```
src/
├── app/                # Next.js App Router
├── modules/            # 핵심 기능 모듈
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
    ├── components/
    ├── hooks/
    ├── utils/
    └── types/
config/                 # 환경별 설정 파일
data/mock/              # PoC용 Mock 데이터
```

## 환경별 실행

### PoC 단계 (기본)
```bash
npm run start:poc
# 또는
npm run dev
```
- Mock 데이터 기반
- 인증 우회 가능
- 빠른 프로토타이핑

### Dev 단계
```bash
npm run start:dev
```
- PostgreSQL 연동
- 디버그 패널 활성화
- 상세 로깅

### Production 빌드
```bash
npm run build
npm start
```

## 개발 워크플로우

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

## 브랜치 전략

```
main (protected)
│   └── 운영 배포 전용
│
└── develop
    │   └── 개발 통합 브랜치
    │
    ├── feature/{issue-number}-{description}
    ├── enhancement/{issue-number}-{description}
    └── bugfix/{issue-number}-{description}
```

## 환경 변수

| 변수 | PoC | Dev | Production |
|------|-----|-----|------------|
| `STAGE` | poc | dev | production |
| `DB_TYPE` | file | postgresql | postgresql |
| `LOG_LEVEL` | info | debug | warn |
| `AUTH_BYPASS` | true | false | false |

## 관련 문서

- [프로젝트 구조 가이드](./project-structure-guide.md)
- [Spec Repository](https://github.com/dogfootman/aiproject-doc)

## 라이선스

Private
