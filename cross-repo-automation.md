# Cross-Repository 자동화 가이드

## 전체 흐름

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           자동화 워크플로우                               │
└─────────────────────────────────────────────────────────────────────────┘

  Source Repo                                         Doc Repo
  ──────────                                         ────────
      │                                                  │
      │  1. [bug] 로그인 실패 이슈 등록                    │
      ▼                                                  │
  ┌─────────┐                                           │
  │  Issue  │                                           │
  │ Created │                                           │
  └────┬────┘                                           │
       │                                                │
       │  2. GitHub Actions 트리거                       │
       ▼                                                │
  ┌──────────────┐      3. API 호출          ┌──────────▼──────────┐
  │   Workflow   │ ─────────────────────────▶│  Spec 문서 자동생성   │
  │  (Actions)   │                           │  + Issue 생성        │
  └──────────────┘                           └──────────┬──────────┘
                                                        │
       ┌────────────────────────────────────────────────┘
       │  4. Spec 작성 완료 후 Source Issue에 코멘트
       ▼
  ┌─────────┐
  │ 구현    │  5. 개발자가 Spec 참조하여 구현
  │ 시작    │
  └─────────┘
```

---

## 1. 사전 준비

### 1.1 GitHub Personal Access Token (PAT) 생성

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 새 토큰 생성:
   - **Token name**: `cross-repo-automation`
   - **Repository access**: `doc-repo`, `source-repo` 선택
   - **Permissions**:
     - Issues: Read and Write
     - Contents: Read and Write
     - Pull requests: Read and Write

3. 생성된 토큰 복사

### 1.2 Source Repo에 Secret 등록

1. Source Repo → Settings → Secrets and variables → Actions
2. New repository secret:
   - **Name**: `DOC_REPO_TOKEN`
   - **Value**: 위에서 생성한 PAT

---

## 2. Source Repo 설정

### 2.1 이슈 템플릿 생성

```
.github/
└── ISSUE_TEMPLATE/
    ├── bug_report.yml
    ├── feature_request.yml
    └── enhancement.yml
```

#### `.github/ISSUE_TEMPLATE/bug_report.yml`

```yaml
name: 🐛 버그 리포트
description: 버그를 발견했을 때 사용합니다
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        버그 리포트를 작성해주세요. 이 이슈는 자동으로 Doc Repo에 Spec 문서를 생성합니다.

  - type: input
    id: title
    attributes:
      label: 버그 제목
      description: 간단히 버그를 설명해주세요
      placeholder: "예: 로그인 시 비밀번호 검증 실패"
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: 버그 설명
      description: 버그에 대해 상세히 설명해주세요
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: 재현 단계
      description: 버그를 재현하는 단계를 작성해주세요
      placeholder: |
        1. '...'로 이동
        2. '...' 클릭
        3. '...' 입력
        4. 에러 발생
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: 기대 동작
      description: 정상적으로 동작해야 하는 방식을 설명해주세요
    validations:
      required: true

  - type: dropdown
    id: module
    attributes:
      label: 관련 모듈
      options:
        - user (사용자 관리)
        - menu (메뉴 관리)
        - category (카테고리 관리)
        - common-code (공통코드 관리)
        - layout (화면 레이아웃 관리)
        - notification (알림 관리)
        - board (게시판 관리)
        - other (기타)
    validations:
      required: true

  - type: dropdown
    id: severity
    attributes:
      label: 심각도
      options:
        - critical (서비스 불가)
        - high (주요 기능 장애)
        - medium (일부 기능 장애)
        - low (경미한 문제)
    validations:
      required: true
```

#### `.github/ISSUE_TEMPLATE/feature_request.yml`

```yaml
name: ✨ 새 기능 요청
description: 새로운 기능을 제안합니다
labels: ["feature"]
body:
  - type: textarea
    id: description
    attributes:
      label: 기능 설명
      description: 원하는 기능을 상세히 설명해주세요
    validations:
      required: true

  - type: textarea
    id: usecase
    attributes:
      label: 사용 사례
      description: 이 기능이 필요한 상황을 설명해주세요
    validations:
      required: true

  - type: dropdown
    id: module
    attributes:
      label: 관련 모듈
      options:
        - user (사용자 관리)
        - menu (메뉴 관리)
        - category (카테고리 관리)
        - common-code (공통코드 관리)
        - layout (화면 레이아웃 관리)
        - notification (알림 관리)
        - board (게시판 관리)
        - new-module (신규 모듈)
        - other (기타)
    validations:
      required: true
```

### 2.2 GitHub Actions 워크플로우

#### `.github/workflows/sync-to-doc-repo.yml`

```yaml
name: Sync Issue to Doc Repo

on:
  issues:
    types: [opened, labeled]

env:
  DOC_REPO: your-org/doc-repo  # Doc Repo 경로로 변경
  SOURCE_REPO: ${{ github.repository }}

jobs:
  create-spec:
    runs-on: ubuntu-latest
    # bug, feature, enhancement 라벨이 있을 때만 실행
    if: |
      contains(github.event.issue.labels.*.name, 'bug') ||
      contains(github.event.issue.labels.*.name, 'feature') ||
      contains(github.event.issue.labels.*.name, 'enhancement')
    
    steps:
      - name: Checkout Doc Repo
        uses: actions/checkout@v4
        with:
          repository: ${{ env.DOC_REPO }}
          token: ${{ secrets.DOC_REPO_TOKEN }}
          path: doc-repo

      - name: Determine Issue Type
        id: issue-type
        run: |
          if [[ "${{ contains(github.event.issue.labels.*.name, 'bug') }}" == "true" ]]; then
            echo "type=bug" >> $GITHUB_OUTPUT
            echo "folder=bugs" >> $GITHUB_OUTPUT
            echo "prefix=BUG" >> $GITHUB_OUTPUT
          elif [[ "${{ contains(github.event.issue.labels.*.name, 'feature') }}" == "true" ]]; then
            echo "type=feature" >> $GITHUB_OUTPUT
            echo "folder=features" >> $GITHUB_OUTPUT
            echo "prefix=FEAT" >> $GITHUB_OUTPUT
          else
            echo "type=enhancement" >> $GITHUB_OUTPUT
            echo "folder=enhancements" >> $GITHUB_OUTPUT
            echo "prefix=ENH" >> $GITHUB_OUTPUT
          fi

      - name: Extract Module from Issue Body
        id: module
        run: |
          BODY="${{ github.event.issue.body }}"
          if [[ "$BODY" == *"user"* ]]; then
            echo "name=user" >> $GITHUB_OUTPUT
          elif [[ "$BODY" == *"menu"* ]]; then
            echo "name=menu" >> $GITHUB_OUTPUT
          elif [[ "$BODY" == *"category"* ]]; then
            echo "name=category" >> $GITHUB_OUTPUT
          elif [[ "$BODY" == *"common-code"* ]]; then
            echo "name=common-code" >> $GITHUB_OUTPUT
          elif [[ "$BODY" == *"layout"* ]]; then
            echo "name=layout" >> $GITHUB_OUTPUT
          elif [[ "$BODY" == *"notification"* ]]; then
            echo "name=notification" >> $GITHUB_OUTPUT
          elif [[ "$BODY" == *"board"* ]]; then
            echo "name=board" >> $GITHUB_OUTPUT
          else
            echo "name=general" >> $GITHUB_OUTPUT
          fi

      - name: Create Spec Document
        run: |
          ISSUE_NUMBER=${{ github.event.issue.number }}
          ISSUE_TITLE="${{ github.event.issue.title }}"
          ISSUE_BODY="${{ github.event.issue.body }}"
          ISSUE_URL="${{ github.event.issue.html_url }}"
          TYPE="${{ steps.issue-type.outputs.type }}"
          FOLDER="${{ steps.issue-type.outputs.folder }}"
          PREFIX="${{ steps.issue-type.outputs.prefix }}"
          MODULE="${{ steps.module.outputs.name }}"
          
          # 파일명 생성 (특수문자 제거)
          SAFE_TITLE=$(echo "$ISSUE_TITLE" | sed 's/[^a-zA-Z0-9가-힣]/-/g' | sed 's/--*/-/g')
          SPEC_FILE="doc-repo/specs/${FOLDER}/${PREFIX}-${ISSUE_NUMBER}-${SAFE_TITLE}.md"
          
          # 디렉토리 생성
          mkdir -p "doc-repo/specs/${FOLDER}"
          
          # Spec 문서 생성
          cat > "$SPEC_FILE" << 'SPEC_TEMPLATE'
          # $PREFIX-$ISSUE_NUMBER: $ISSUE_TITLE

          ## 메타 정보

          | 항목 | 내용 |
          |------|------|
          | **Source Issue** | [#$ISSUE_NUMBER]($ISSUE_URL) |
          | **유형** | $TYPE |
          | **모듈** | $MODULE |
          | **상태** | 🔴 분석중 |
          | **작성일** | $(date +%Y-%m-%d) |
          | **작성자** | - |

          ---

          ## 1. 개요

          ### 1.1 원본 이슈 내용

          $ISSUE_BODY

          ---

          ## 2. 분석

          ### 2.1 현재 상태
          <!-- 현재 동작 방식 또는 문제 상황 기술 -->

          ### 2.2 원인 분석 (버그의 경우)
          <!-- 버그 원인 분석 -->

          ### 2.3 영향 범위
          <!-- 영향받는 기능, 모듈, 화면 등 -->

          ---

          ## 3. 해결 방안

          ### 3.1 제안 방안
          <!-- 해결/구현 방안 기술 -->

          ### 3.2 대안
          <!-- 대안이 있다면 기술 -->

          ---

          ## 4. 상세 설계

          ### 4.1 API 변경사항
          <!-- API 변경이 필요한 경우 -->

          ```
          [Method] /api/endpoint
          Request: { }
          Response: { }
          ```

          ### 4.2 DB 변경사항
          <!-- DB 스키마 변경이 필요한 경우 -->

          ### 4.3 UI 변경사항
          <!-- UI 변경이 필요한 경우 -->

          ---

          ## 5. 테스트 계획

          ### 5.1 테스트 케이스
          - [ ] 케이스 1
          - [ ] 케이스 2

          ---

          ## 6. 체크리스트

          - [ ] 분석 완료
          - [ ] 설계 완료
          - [ ] 리뷰 완료
          - [ ] Source Repo 구현 시작 알림
          SPEC_TEMPLATE
          
          # 변수 치환
          sed -i "s|\$PREFIX|$PREFIX|g" "$SPEC_FILE"
          sed -i "s|\$ISSUE_NUMBER|$ISSUE_NUMBER|g" "$SPEC_FILE"
          sed -i "s|\$ISSUE_TITLE|$ISSUE_TITLE|g" "$SPEC_FILE"
          sed -i "s|\$ISSUE_URL|$ISSUE_URL|g" "$SPEC_FILE"
          sed -i "s|\$TYPE|$TYPE|g" "$SPEC_FILE"
          sed -i "s|\$MODULE|$MODULE|g" "$SPEC_FILE"
          sed -i "s|\$ISSUE_BODY|$ISSUE_BODY|g" "$SPEC_FILE"
          
          echo "SPEC_FILE=$SPEC_FILE" >> $GITHUB_ENV
          echo "SPEC_PATH=specs/${FOLDER}/${PREFIX}-${ISSUE_NUMBER}-${SAFE_TITLE}.md" >> $GITHUB_ENV

      - name: Commit and Push to Doc Repo
        working-directory: doc-repo
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .
          git commit -m "docs: Add spec for ${{ env.SOURCE_REPO }}#${{ github.event.issue.number }}"
          git push

      - name: Create Issue in Doc Repo
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.DOC_REPO_TOKEN }}
          script: |
            const [owner, repo] = process.env.DOC_REPO.split('/');
            const issue = await github.rest.issues.create({
              owner,
              repo,
              title: `[SPEC] ${{ github.event.issue.title }}`,
              body: `## 연결된 Source Issue
              
            - **Source**: ${{ github.event.issue.html_url }}
            - **Spec 문서**: \`${{ env.SPEC_PATH }}\`
            
            ## 할 일
            
            - [ ] Spec 문서 분석 내용 작성
            - [ ] 해결 방안 설계
            - [ ] 리뷰 요청
            - [ ] Source Repo에 구현 시작 알림
            
            ---
            
            ### 원본 이슈 내용
            
            ${{ github.event.issue.body }}
            `,
              labels: ['spec', '${{ steps.issue-type.outputs.type }}']
            });
            
            core.setOutput('doc_issue_number', issue.data.number);
            core.setOutput('doc_issue_url', issue.data.html_url);

      - name: Comment on Source Issue
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## 📋 Spec 문서가 생성되었습니다
              
            Doc Repo에 Spec 문서가 자동 생성되었습니다.
            
            - **Spec 문서**: \`${{ env.SPEC_PATH }}\`
            - **Doc Issue**: [링크](https://github.com/${{ env.DOC_REPO }}/issues)
            
            ### 다음 단계
            
            1. Doc Repo에서 Spec 문서 작성 완료
            2. Spec 리뷰 및 승인
            3. 이 이슈에 \`ready-to-implement\` 라벨 추가됨
            4. 구현 시작
            
            ---
            🤖 *이 코멘트는 자동으로 생성되었습니다.*
            `
            });
```

---

## 3. Doc Repo 설정

### 3.1 Spec 완료 시 Source Repo 알림

#### `.github/workflows/notify-source-repo.yml`

```yaml
name: Notify Source Repo on Spec Complete

on:
  issues:
    types: [closed]
  pull_request:
    types: [closed]
    branches: [main]

env:
  SOURCE_REPO: your-org/source-repo  # Source Repo 경로로 변경

jobs:
  notify-ready:
    runs-on: ubuntu-latest
    # spec 라벨이 있고, completed 라벨이 추가된 경우
    if: |
      contains(github.event.issue.labels.*.name, 'spec') &&
      contains(github.event.issue.labels.*.name, 'completed')
    
    steps:
      - name: Extract Source Issue Number
        id: extract
        run: |
          # Issue body에서 Source Issue 번호 추출
          BODY="${{ github.event.issue.body }}"
          SOURCE_ISSUE=$(echo "$BODY" | grep -oP 'issues/\K[0-9]+' | head -1)
          echo "source_issue=$SOURCE_ISSUE" >> $GITHUB_OUTPUT

      - name: Add Label to Source Issue
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.SOURCE_REPO_TOKEN }}
          script: |
            const [owner, repo] = process.env.SOURCE_REPO.split('/');
            const issueNumber = ${{ steps.extract.outputs.source_issue }};
            
            // ready-to-implement 라벨 추가
            await github.rest.issues.addLabels({
              owner,
              repo,
              issue_number: issueNumber,
              labels: ['ready-to-implement']
            });
            
            // 코멘트 추가
            await github.rest.issues.createComment({
              owner,
              repo,
              issue_number: issueNumber,
              body: `## ✅ Spec 작성 완료
              
            Doc Repo에서 Spec 문서 작성이 완료되었습니다.
            
            - **Spec Issue**: ${{ github.event.issue.html_url }}
            
            ### 구현 시작 가이드
            
            1. \`develop\` 브랜치에서 새 브랜치 생성
               \`\`\`bash
               git checkout develop
               git pull origin develop
               git checkout -b bugfix/${issueNumber}-description
               \`\`\`
            
            2. Spec 문서 참고하여 구현
            
            3. PR 생성 시 이 이슈 연결
               \`\`\`
               Closes #${issueNumber}
               \`\`\`
            
            ---
            🤖 *이 코멘트는 자동으로 생성되었습니다.*
            `
            });
```

### 3.2 Doc Repo 디렉토리 구조

```
doc-repo/
├── .github/
│   └── workflows/
│       └── notify-source-repo.yml
├── specs/
│   ├── bugs/
│   │   ├── BUG-1-로그인-실패.md
│   │   └── BUG-5-세션-만료.md
│   ├── features/
│   │   └── FEAT-3-소셜-로그인.md
│   └── enhancements/
│       └── ENH-7-성능-개선.md
├── templates/
│   ├── bug-spec.md
│   ├── feature-spec.md
│   └── enhancement-spec.md
└── README.md
```

---

## 4. 전체 워크플로우 요약

```
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Source Repo에 버그 이슈 등록                                        │
│  ────────────────────────────────────                                       │
│  개발자가 [bug] 라벨로 이슈 생성                                              │
│  예: "로그인 시 비밀번호 검증이 실패합니다"                                     │
└──────────────────────────────┬─────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: GitHub Actions 자동 트리거                                         │
│  ─────────────────────────────────                                         │
│  • Doc Repo에 Spec 문서 자동 생성 (BUG-123-로그인-실패.md)                    │
│  • Doc Repo에 연결된 Issue 생성                                             │
│  • Source Issue에 "Spec 생성됨" 코멘트 추가                                  │
└──────────────────────────────┬─────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Doc Repo에서 Spec 작성                                             │
│  ─────────────────────────────                                             │
│  설계 담당자가 Spec 문서 작성:                                                │
│  • 원인 분석                                                                │
│  • 해결 방안 설계                                                           │
│  • API/DB/UI 변경사항                                                       │
│  • 테스트 계획                                                              │
└──────────────────────────────┬─────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Spec 완료 & Source Repo 알림                                       │
│  ───────────────────────────────────                                       │
│  • Doc Issue에 'completed' 라벨 추가 후 Close                                │
│  • Source Issue에 'ready-to-implement' 라벨 자동 추가                        │
│  • Source Issue에 "구현 시작 가능" 코멘트 추가                                 │
└──────────────────────────────┬─────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Source Repo에서 구현                                               │
│  ─────────────────────────────                                             │
│  개발자가 Spec 참조하여 구현:                                                 │
│  • bugfix/123-login-validation 브랜치 생성                                  │
│  • 코드 구현 & 테스트                                                        │
│  • PR 생성 → Review → Merge                                                 │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 라벨 관리

### Source Repo 라벨

| 라벨 | 색상 | 설명 |
|------|------|------|
| `bug` | 🔴 #d73a4a | 버그 리포트 |
| `feature` | 🟢 #0e8a16 | 새 기능 요청 |
| `enhancement` | 🔵 #a2eeef | 기능 개선 |
| `spec-pending` | 🟡 #fbca04 | Spec 작성 대기중 |
| `ready-to-implement` | 🟣 #7057ff | 구현 가능 |
| `in-progress` | 🟠 #f9d0c4 | 구현 진행중 |

### Doc Repo 라벨

| 라벨 | 색상 | 설명 |
|------|------|------|
| `spec` | 📋 #1d76db | Spec 문서 |
| `bug` | 🔴 #d73a4a | 버그 관련 |
| `feature` | 🟢 #0e8a16 | 기능 관련 |
| `in-review` | 🟡 #fbca04 | 리뷰중 |
| `completed` | ✅ #0e8a16 | 완료됨 |

---

## 6. 설정 체크리스트

### Source Repo
- [ ] PAT 토큰 생성 (repo, issues 권한)
- [ ] `DOC_REPO_TOKEN` Secret 등록
- [ ] Issue 템플릿 파일 생성
- [ ] `sync-to-doc-repo.yml` 워크플로우 추가
- [ ] 라벨 생성

### Doc Repo
- [ ] `SOURCE_REPO_TOKEN` Secret 등록
- [ ] `notify-source-repo.yml` 워크플로우 추가
- [ ] specs 디렉토리 구조 생성
- [ ] 라벨 생성

---

## 7. 트러블슈팅

### Actions가 실행되지 않는 경우
1. Repository Settings → Actions → General에서 권한 확인
2. PAT 토큰 만료 여부 확인
3. 워크플로우 파일 문법 오류 확인

### Cross-repo 접근 실패
1. PAT에 대상 repo 접근 권한 있는지 확인
2. Fine-grained token의 경우 Repository access 설정 확인
