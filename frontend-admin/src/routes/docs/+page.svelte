<script lang="ts">
	import { BookOpen } from 'lucide-svelte';
	import DocNav from '$lib/components/docs/DocNav.svelte';
	import DocSection from '$lib/components/docs/DocSection.svelte';

	let activeSection = $state('overview');

	function scrollToSection(id: string) {
		activeSection = id;
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
</script>

<svelte:head>
	<title>사용자 가이드 - JB2 Backoffice</title>
</svelte:head>

<div class="docs-container">
	<aside class="docs-sidebar">
		<DocNav {activeSection} onNavigate={scrollToSection} />
	</aside>

	<main class="docs-content">
		<div class="docs-header">
			<div class="header-icon">
				<BookOpen size={32} />
			</div>
			<div>
				<h1>JB SQUARE 백오피스 사용자 가이드</h1>
				<p class="subtitle">전북 바이오 플랫폼 관리 시스템 사용 설명서</p>
			</div>
		</div>

		<!-- 1. 시작하기 -->
		<DocSection id="overview" title="시스템 개요">
			<p>
				JB SQUARE 백오피스는 전북 지역 바이오 산업 관련 공고, 뉴스, 기업 정보를 자동으로 수집하고
				관리하는 시스템입니다. 관리자는 이 시스템을 통해 다양한 출처에서 수집된 데이터를 검토하고,
				승인하며, 태그를 관리하여 최종 사용자에게 제공할 수 있습니다.
			</p>

			<h3>주요 기능</h3>
			<ul>
				<li>자동 크롤링: 정부 기관, 지자체, 유관기관에서 공고 및 뉴스 자동 수집</li>
				<li>공고 관리: 수집된 데이터 검토, 승인, 수정, 삭제</li>
				<li>태그 시스템: 공고 분류를 위한 태그 생성 및 관리</li>
				<li>BI 센터 관리: 창업보육센터 및 입주기업 정보 관리</li>
				<li>통계 및 모니터링: 시스템 성능 및 데이터 현황 확인</li>
			</ul>

			<h3>접근 권한</h3>
			<p>
				이 시스템은 관리자 권한이 필요합니다. 로그인 후 모든 기능에 접근할 수 있으며, 현재 세션
				정보는 상단 우측에 표시됩니다.
			</p>
		</DocSection>

		<DocSection id="dashboard" title="대시보드">
			<p>
				대시보드는 시스템의 현재 상태를 한눈에 확인할 수 있는 화면입니다. 로그인 후 처음
				표시되는 페이지이며, 주요 통계와 최근 활동 내역을 보여줍니다.
			</p>

			<h3>표시 정보</h3>
			<ul>
				<li>전체 공고 수 및 바이오 관련 공고 수</li>
				<li>오늘 수집된 공고 건수</li>
				<li>등록된 기업 및 기관 수</li>
				<li>마감 임박 공고 (7일 이내 마감)</li>
				<li>최근 크롤링 실행 내역</li>
			</ul>

			<h3>사용 방법</h3>
			<p>
				좌측 사이드바에서 "대시보드"를 클릭하면 언제든지 이 화면으로 돌아올 수 있습니다. 각 통계
				카드를 클릭하면 해당 상세 페이지로 이동합니다.
			</p>
		</DocSection>

		<!-- 2. 크롤링 관리 -->
		<DocSection id="crawling-overview" title="크롤링 시스템 이해하기">
			<p>
				크롤링 시스템은 외부 웹사이트에서 자동으로 데이터를 수집하는 기능입니다. 시스템은
				설정된 주기에 따라 자동으로 실행되거나, 관리자가 수동으로 실행할 수 있습니다.
			</p>

			<h3>크롤러 종류</h3>
			<table>
				<thead>
					<tr>
						<th>크롤러명</th>
						<th>출처</th>
						<th>수집 내용</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>JBTP 지자체</td>
						<td>전북테크노파크</td>
						<td>지자체 사업공고</td>
					</tr>
					<tr>
						<td>JBTP 유관기관</td>
						<td>전북테크노파크</td>
						<td>유관기관 공고</td>
					</tr>
					<tr>
						<td>JBTP 행사</td>
						<td>전북테크노파크</td>
						<td>교육 및 행사 정보</td>
					</tr>
					<tr>
						<td>NTIS</td>
						<td>국가과학기술정보서비스</td>
						<td>정부 R&D 과제공고</td>
					</tr>
					<tr>
						<td>기업마당</td>
						<td>중소기업 비즈니스</td>
						<td>중소기업 지원사업</td>
					</tr>
					<tr>
						<td>식약처 뉴스</td>
						<td>식품의약품안전처</td>
						<td>식약처 보도자료</td>
					</tr>
					<tr>
						<td>복지부 뉴스</td>
						<td>보건복지부</td>
						<td>복지부 보도자료</td>
					</tr>
					<tr>
						<td>BI 센터</td>
						<td>중소벤처기업부</td>
						<td>창업보육센터 정보</td>
					</tr>
				</tbody>
			</table>

			<h3>키워드 매칭 시스템</h3>
			<p>
				크롤링된 데이터는 설정된 키워드와 자동으로 매칭됩니다. 제목, 내용, 기관명에서 키워드가
				발견되면 해당 키워드를 기록하고, 관련 태그를 자동으로 제안합니다.
			</p>
			<p>
				예를 들어, "바이오", "헬스케어", "의료기기" 등의 키워드가 설정되어 있다면, 공고 내용에
				이러한 단어가 포함된 경우 자동으로 감지되어 표시됩니다.
			</p>

			<h3>크롤링 프로세스</h3>
			<ol>
				<li>목록 수집: 각 사이트의 공고 목록 페이지 접근</li>
				<li>필터링: 키워드 매칭 및 중복 검사</li>
				<li>상세 수집: 본문 내용 및 첨부파일 정보 수집</li>
				<li>저장: 크롤링 큐에 임시 저장 (관리자 검토 대기)</li>
			</ol>
		</DocSection>

		<DocSection id="crawler-config" title="크롤러 설정하기">
			<p>
				각 크롤러의 동작을 설정하고 관리할 수 있습니다. 크롤러 설정은 API를 통해 변경 가능하며,
				다음 항목을 조정할 수 있습니다.
			</p>

			<h3>설정 항목</h3>
			<ul>
				<li>활성화 상태: 크롤러 실행 여부 (enabled/disabled)</li>
				<li>키워드 목록: 필터링에 사용할 키워드 배열</li>
				<li>수집 기간: 과거 몇 일치 데이터를 수집할지 설정 (date_range_days)</li>
				<li>URL 설정: 크롤링 대상 URL (변경 시 주의 필요)</li>
			</ul>

			<h3>API 엔드포인트</h3>
			<div class="code-block">
				<code>GET /api/crawling/configs</code>
				<p>전체 크롤러 설정 조회</p>
			</div>
			<div class="code-block">
				<code>GET /api/crawling/configs/&#123;source_id&#125;</code>
				<p>특정 크롤러 설정 조회</p>
			</div>
			<div class="code-block">
				<code>PUT /api/crawling/configs/&#123;source_id&#125;/keywords</code>
				<p>키워드 목록 업데이트</p>
			</div>
			<div class="code-block">
				<code>PUT /api/crawling/configs/&#123;source_id&#125;/enabled</code>
				<p>크롤러 활성화/비활성화</p>
			</div>

			<h3>키워드 설정 예시</h3>
			<p>바이오 산업 관련 공고를 수집하기 위한 키워드 예시:</p>
			<ul>
				<li>바이오, 생명과학, 의료기기, 헬스케어</li>
				<li>제약, 바이오시밀러, 백신</li>
				<li>유전자, 세포치료제, 재생의료</li>
				<li>농생명, 식품안전, 동물의약</li>
			</ul>
		</DocSection>

		<DocSection id="manual-crawl" title="수동 크롤링 실행">
			<p>
				자동 스케줄 외에도 필요 시 즉시 크롤링을 실행할 수 있습니다. 수동 실행 시 실시간으로
				진행 상황을 확인할 수 있습니다.
			</p>

			<h3>실행 방법</h3>
			<ol>
				<li>각 공고 페이지 (예: 정부 공고, 지자체 사업공고 등)로 이동</li>
				<li>상단의 "크롤링 시작" 버튼 클릭</li>
				<li>WebSocket 연결을 통해 실시간 진행 상황 확인</li>
				<li>완료 후 크롤링 큐에서 결과 검토</li>
			</ol>

			<h3>진행 상황 모니터링</h3>
			<p>크롤링 실행 중 다음 정보가 실시간으로 표시됩니다:</p>
			<ul>
				<li>현재 단계: 목록 수집, 필터링, 상세 수집, 저장 중 어느 단계인지 표시</li>
				<li>진행률: 전체 항목 중 몇 개가 처리되었는지 백분율로 표시</li>
				<li>로그 메시지: 상세한 처리 내역 및 오류 메시지</li>
			</ul>

			<h3>주의 사항</h3>
			<ul>
				<li>크롤링 실행 중에는 브라우저를 닫지 마십시오.</li>
				<li>동일한 크롤러를 중복으로 실행하지 마십시오.</li>
				<li>외부 사이트 부하를 고려하여 과도하게 자주 실행하지 마십시오.</li>
				<li>오류 발생 시 로그를 확인하여 원인을 파악하십시오.</li>
			</ul>
		</DocSection>

		<!-- 3. 공고 관리 -->
		<DocSection id="notice-queue" title="크롤링 큐 검토하기">
			<p>
				크롤링된 데이터는 자동으로 게시되지 않고, 크롤링 큐에 임시 저장됩니다. 관리자가 내용을
				검토한 후 승인하면 최종 사용자에게 표시됩니다.
			</p>

			<h3>큐 확인 방법</h3>
			<ol>
				<li>각 공고 페이지로 이동 (예: 정부 공고, 지자체 사업공고)</li>
				<li>"크롤링 큐" 탭 선택</li>
				<li>대기 중인 항목 목록 확인</li>
			</ol>

			<h3>검토 항목</h3>
			<p>다음 사항을 확인하여 승인 여부를 결정하십시오:</p>
			<ul>
				<li>제목 및 내용이 바이오 산업과 관련이 있는가?</li>
				<li>중복된 공고는 아닌가?</li>
				<li>마감일이 올바르게 파싱되었는가?</li>
				<li>첨부파일 링크가 정상적으로 수집되었는가?</li>
				<li>키워드 매칭이 적절한가?</li>
			</ul>

			<h3>승인 및 거부</h3>
			<ul>
				<li>승인: "게시" 버튼을 클릭하면 공고가 즉시 게시되어 사용자에게 표시됩니다.</li>
				<li>거부: "숨기기" 버튼을 클릭하면 큐에서 제거되며 게시되지 않습니다.</li>
				<li>일괄 처리: 여러 항목을 선택하여 한 번에 승인하거나 거부할 수 있습니다.</li>
			</ul>
		</DocSection>

		<DocSection id="notice-manage" title="공고 게시 관리">
			<p>
				게시된 공고는 언제든지 수정, 삭제, 상태 변경이 가능합니다. 각 공고 페이지에서 게시된
				공고 목록을 확인하고 관리할 수 있습니다.
			</p>

			<h3>공고 목록 보기</h3>
			<p>
				각 공고 페이지의 "게시된 공고" 탭에서 현재 게시 중인 공고를 확인할 수 있습니다. 검색,
				필터, 정렬 기능을 사용하여 원하는 공고를 찾을 수 있습니다.
			</p>

			<h3>필터 및 검색</h3>
			<ul>
				<li>상태: pending (대기), published (게시), archived (보관)</li>
				<li>태그: 특정 태그가 적용된 공고만 표시</li>
				<li>검색: 제목, 내용, 기관명으로 검색</li>
				<li>날짜: 게시일, 마감일 기준 필터링</li>
			</ul>

			<h3>공고 수정</h3>
			<ol>
				<li>수정할 공고를 클릭하여 상세 화면 열기</li>
				<li>"수정" 버튼 클릭</li>
				<li>제목, 내용, 마감일, 태그 등 수정</li>
				<li>"저장" 버튼으로 변경사항 적용</li>
			</ol>

			<h3>공고 삭제</h3>
			<p>
				삭제된 공고는 복구할 수 없으므로 신중하게 진행하십시오. 삭제 대신 상태를 "archived"로
				변경하여 보관하는 것을 권장합니다.
			</p>
			<ul>
				<li>단일 삭제: 공고 상세 화면에서 "삭제" 버튼 클릭</li>
				<li>일괄 삭제: 목록에서 여러 항목 선택 후 "선택 삭제" 버튼 클릭</li>
			</ul>

			<h3>태그 관리</h3>
			<p>
				각 공고에 태그를 추가하여 분류할 수 있습니다. 태그는 사용자가 공고를 검색하고 필터링하는
				데 사용됩니다.
			</p>
			<ul>
				<li>태그 추가: 공고 수정 화면에서 태그 선택기를 통해 추가</li>
				<li>태그 제거: 선택된 태그를 클릭하여 제거</li>
				<li>일괄 태그 적용: 여러 공고 선택 후 "태그 일괄 적용" 버튼 사용</li>
			</ul>
		</DocSection>

		<DocSection id="notice-create" title="수동 공고 등록">
			<p>
				크롤링으로 수집되지 않은 공고는 수동으로 직접 등록할 수 있습니다. 오프라인 행사, 내부
				프로그램 등을 등록할 때 사용합니다.
			</p>

			<h3>등록 방법</h3>
			<ol>
				<li>해당 공고 페이지로 이동</li>
				<li>"새 공고 작성" 버튼 클릭</li>
				<li>필수 정보 입력</li>
				<li>"저장" 버튼으로 게시</li>
			</ol>

			<h3>필수 입력 항목</h3>
			<ul>
				<li>제목: 공고 제목 (최대 200자)</li>
				<li>내용: 공고 본문 (HTML 형식 지원)</li>
				<li>출처: 공고 제공 기관명</li>
				<li>출처 ID: 크롤러 구분을 위한 source_id</li>
				<li>상태: pending, published, archived 중 선택</li>
			</ul>

			<h3>선택 입력 항목</h3>
			<ul>
				<li>마감일: 신청 또는 제출 마감일</li>
				<li>원본 URL: 원본 공고 페이지 링크</li>
				<li>첨부파일 URL: 파일 다운로드 링크</li>
				<li>태그: 분류를 위한 태그 선택</li>
				<li>매칭된 키워드: 관련 키워드 입력</li>
			</ul>

			<h3>주의 사항</h3>
			<ul>
				<li>제목과 내용은 반드시 입력해야 합니다.</li>
				<li>마감일은 YYYY-MM-DD 형식으로 입력하십시오.</li>
				<li>URL은 http:// 또는 https://로 시작해야 합니다.</li>
				<li>저장 후에도 수정 및 삭제가 가능합니다.</li>
			</ul>
		</DocSection>

		<!-- 4. 태그 관리 -->
		<DocSection id="tag-overview" title="태그 시스템 이해하기">
			<p>
				태그는 공고를 분류하고 사용자가 원하는 정보를 쉽게 찾을 수 있도록 돕는 라벨입니다.
				관리자는 태그를 생성, 수정, 삭제하고, 각 공고에 적절한 태그를 적용할 수 있습니다.
			</p>

			<h3>태그와 키워드의 차이</h3>
			<ul>
				<li>
					키워드: 크롤링 시 데이터를 필터링하기 위한 검색어. 시스템 내부에서 자동으로 사용됨.
				</li>
				<li>태그: 사용자에게 표시되는 분류 라벨. 수동으로 관리하며 UI에 표시됨.</li>
			</ul>

			<h3>태그 카테고리</h3>
			<p>태그는 다음과 같은 카테고리로 분류할 수 있습니다:</p>
			<ul>
				<li>bio: 바이오 산업 관련 (예: 레드바이오, 그린바이오, 화이트바이오)</li>
				<li>region: 지역 구분 (예: 전북, 전주, 익산, 군산)</li>
				<li>support_type: 지원 유형 (예: R&D, 비R&D, 창업지원, 인력양성)</li>
				<li>기타: 사용자 정의 카테고리</li>
			</ul>

			<h3>태그 사용 통계</h3>
			<p>
				각 태그는 사용 횟수를 자동으로 추적합니다. 많이 사용된 태그는 사용자에게 우선적으로
				표시되며, 사용되지 않는 태그는 정리할 수 있습니다.
			</p>
		</DocSection>

		<DocSection id="tag-create" title="태그 생성 및 편집">
			<p>좌측 메뉴의 "콘텐츠 관리" 페이지에서 태그를 관리할 수 있습니다.</p>

			<h3>새 태그 만들기</h3>
			<ol>
				<li>"콘텐츠 관리" 페이지로 이동</li>
				<li>"새 태그 추가" 버튼 클릭</li>
				<li>태그 정보 입력</li>
				<li>"저장" 버튼으로 생성</li>
			</ol>

			<h3>태그 정보 입력 항목</h3>
			<ul>
				<li>이름: 사용자에게 표시될 태그명 (예: "레드바이오")</li>
				<li>슬러그: URL에 사용될 영문 식별자 (예: "red-bio")</li>
				<li>설명: 태그에 대한 간단한 설명</li>
				<li>카테고리: bio, region, support_type 등</li>
				<li>색상: 태그 배경색 (색상 프리셋에서 선택 또는 직접 입력)</li>
				<li>아이콘: 태그 앞에 표시될 아이콘 (선택 사항)</li>
				<li>표시 순서: 목록에서 표시될 순서 (숫자가 낮을수록 먼저 표시)</li>
				<li>활성화 상태: 사용 여부 (비활성화 시 사용자에게 표시 안 됨)</li>
			</ul>

			<h3>색상 설정</h3>
			<p>
				태그의 배경색과 텍스트 색상을 설정할 수 있습니다. 색상 프리셋을 사용하면 미리 정의된
				조화로운 색상 조합을 선택할 수 있습니다.
			</p>

			<h3>태그 수정</h3>
			<ol>
				<li>태그 목록에서 수정할 태그 클릭</li>
				<li>정보 수정</li>
				<li>"저장" 버튼으로 변경사항 적용</li>
			</ol>

			<h3>태그 순서 변경</h3>
			<p>
				태그 목록에서 드래그 앤 드롭으로 순서를 변경할 수 있습니다. 변경된 순서는 자동으로
				저장되며, 사용자 화면에 즉시 반영됩니다.
			</p>

			<h3>태그 삭제</h3>
			<p>
				태그를 삭제하면 해당 태그가 적용된 모든 공고에서 태그가 제거됩니다. 삭제 전 사용 중인
				공고가 있는지 확인하십시오.
			</p>
			<ul>
				<li>사용 중인 태그: 삭제 시 경고 메시지 표시</li>
				<li>사용되지 않는 태그: 즉시 삭제 가능</li>
			</ul>
		</DocSection>

		<!-- 5. BI 센터 관리 -->
		<DocSection id="bi-center" title="BI 센터 디렉토리">
			<p>
				창업보육센터 (Business Incubator) 정보를 관리하고, 각 센터에 입주한 기업 정보를 확인할 수
				있습니다. 데이터는 중소벤처기업부 BI센터 사이트에서 자동으로 수집됩니다.
			</p>

			<h3>센터 목록 보기</h3>
			<ol>
				<li>좌측 메뉴에서 "기업·기관" 클릭</li>
				<li>전북 지역 BI 센터 목록 확인</li>
				<li>필터 및 검색 기능으로 원하는 센터 찾기</li>
			</ol>

			<h3>필터 옵션</h3>
			<ul>
				<li>지역: 전주, 익산, 군산 등 시군구 필터</li>
				<li>공실 여부: 입주 가능한 센터만 표시</li>
				<li>검색: 센터명, 기관명, 대표자명으로 검색</li>
			</ul>

			<h3>센터 상세 정보</h3>
			<p>각 센터 카드를 클릭하면 다음 정보를 확인할 수 있습니다:</p>
			<ul>
				<li>센터명 및 운영 기관</li>
				<li>소재지 및 연락처 (전화, 팩스, 이메일)</li>
				<li>홈페이지 링크</li>
				<li>대표자 및 설립일</li>
				<li>총 면적 및 공실 현황</li>
				<li>현재 입주 기업 수 및 최대 수용 가능 수</li>
			</ul>

			<h3>BI 센터 크롤링</h3>
			<p>
				BI 센터 정보는 Selenium을 사용하여 자동으로 수집됩니다. 수동 크롤링을 실행하면 전북
				지역의 모든 BI 센터 정보가 업데이트됩니다.
			</p>
			<ol>
				<li>"기업·기관" 페이지로 이동</li>
				<li>"BI 센터 크롤링 시작" 버튼 클릭</li>
				<li>진행 상황 모니터링</li>
				<li>완료 후 새로운 데이터 확인</li>
			</ol>
		</DocSection>

		<DocSection id="bi-company" title="입주 기업 관리">
			<p>
				각 BI 센터에 입주한 기업 정보를 확인하고 검색할 수 있습니다. 기업 정보는 센터 크롤링 시
				함께 수집됩니다.
			</p>

			<h3>기업 목록 보기</h3>
			<ol>
				<li>BI 센터 상세 화면에서 "입주 기업" 탭 선택</li>
				<li>해당 센터에 입주한 기업 목록 확인</li>
			</ol>

			<h3>기업 정보</h3>
			<p>각 기업에 대해 다음 정보가 제공됩니다:</p>
			<ul>
				<li>기업명 및 대표자</li>
				<li>제품 및 사업 분야</li>
				<li>연락처 및 주소</li>
				<li>입주일 및 상태</li>
			</ul>

			<h3>전체 기업 검색</h3>
			<p>
				API 엔드포인트 <code>/api/bi-centers/companies/all</code>을 사용하면 모든 센터의 입주 기업을
				한 번에 검색할 수 있습니다.
			</p>

			<h3>통계 확인</h3>
			<p>
				<code>/api/bi-centers/stats/overview</code> 엔드포인트에서 다음 통계를 확인할 수 있습니다:
			</p>
			<ul>
				<li>전체 BI 센터 수</li>
				<li>전체 입주 기업 수</li>
				<li>지역별 분포</li>
				<li>공실률</li>
			</ul>
		</DocSection>

		<!-- 6. 통계 및 분석 -->
		<DocSection id="analytics" title="통계 및 분석">
			<p>
				시스템 사용 현황과 데이터 통계를 확인할 수 있습니다. 대시보드에서 주요 지표를 확인하고,
				상세 통계는 각 페이지에서 확인할 수 있습니다.
			</p>

			<h3>대시보드 통계</h3>
			<ul>
				<li>전체 공고 수 및 바이오 관련 공고 수</li>
				<li>오늘 수집된 공고 건수</li>
				<li>기업 및 기관 통계</li>
				<li>최근 크롤링 실행 내역</li>
			</ul>

			<h3>마감 임박 공고</h3>
			<p>
				마감일이 7일 이내인 공고는 대시보드 상단에 별도로 표시됩니다. 이를 통해 긴급하게 홍보가
				필요한 공고를 빠르게 확인할 수 있습니다.
			</p>

			<h3>크롤링 실행 로그</h3>
			<p>각 크롤러의 실행 내역과 결과를 확인할 수 있습니다:</p>
			<ul>
				<li>실행 시각</li>
				<li>수집된 항목 수</li>
				<li>성공/실패 여부</li>
				<li>오류 메시지 (실패 시)</li>
			</ul>

			<h3>태그 사용 통계</h3>
			<p>각 태그가 몇 개의 공고에 사용되었는지 확인할 수 있습니다. 사용되지 않는 태그는 정리할 수 있습니다.</p>
		</DocSection>

		<!-- 7. 시스템 관리 -->
		<DocSection id="system-monitor" title="시스템 모니터링">
			<p>
				Docker 컨테이너 상태 및 시스템 리소스 사용량을 모니터링할 수 있습니다. 좌측 메뉴에서
				"시스템 모니터링"을 선택하여 접근합니다.
			</p>

			<h3>컨테이너 상태</h3>
			<p>실행 중인 Docker 컨테이너 목록과 각 컨테이너의 상태를 확인할 수 있습니다:</p>
			<ul>
				<li>backend: FastAPI 백엔드 서버</li>
				<li>frontend: Next.js 프론트엔드 서버 (사용자 화면)</li>
				<li>frontend-admin: SvelteKit 관리자 화면</li>
				<li>nginx: 리버스 프록시 및 SSL 처리</li>
				<li>postgres: PostgreSQL 데이터베이스 (RDS 사용 시 표시 안 됨)</li>
			</ul>

			<h3>리소스 사용량</h3>
			<ul>
				<li>CPU 사용률</li>
				<li>메모리 사용량</li>
				<li>디스크 사용량</li>
				<li>네트워크 트래픽</li>
			</ul>

			<h3>컨테이너 로그</h3>
			<p>
				각 컨테이너의 로그를 실시간으로 확인할 수 있습니다. 오류 발생 시 로그를 통해 원인을
				파악할 수 있습니다.
			</p>

			<h3>헬스 체크</h3>
			<p>
				각 서비스의 헬스 체크 엔드포인트를 호출하여 정상 작동 여부를 확인합니다. 비정상 상태 시
				알림이 표시됩니다.
			</p>
		</DocSection>

		<DocSection id="ksic" title="KSIC 코드 관리">
			<p>
				한국표준산업분류 (KSIC) 코드를 관리할 수 있습니다. 기업 정보를 분류하는 데 사용되며,
				통계청 기준을 따릅니다.
			</p>

			<h3>KSIC 코드란</h3>
			<p>
				한국표준산업분류는 산업 관련 통계자료의 정확성 및 비교성을 확보하기 위하여 경제 활동을
				그 유사성에 따라 체계적으로 분류한 것입니다.
			</p>

			<h3>코드 구조</h3>
			<ul>
				<li>대분류: 알파벳 1자리 (예: C - 제조업)</li>
				<li>중분류: 숫자 2자리 (예: 21 - 의료용 물질 및 의약품 제조업)</li>
				<li>소분류: 숫자 3자리</li>
				<li>세분류: 숫자 4자리</li>
				<li>세세분류: 숫자 5자리</li>
			</ul>

			<h3>관리 기능</h3>
			<ul>
				<li>KSIC 코드 조회 및 검색</li>
				<li>코드별 설명 확인</li>
				<li>기업 정보와 연동</li>
			</ul>
		</DocSection>

		<!-- 8. API 레퍼런스 -->
		<DocSection id="api-crawling" title="크롤링 API">
			<h3>크롤러 설정 조회</h3>
			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/crawling/configs</code>
			</div>
			<p>전체 크롤러 설정 목록을 조회합니다.</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/crawling/configs/&#123;source_id&#125;</code>
			</div>
			<p>특정 크롤러의 설정을 조회합니다.</p>

			<h3>크롤러 설정 수정</h3>
			<div class="api-endpoint">
				<div class="method put">PUT</div>
				<code>/api/crawling/configs/&#123;source_id&#125;</code>
			</div>
			<p>크롤러 전체 설정을 수정합니다.</p>

			<div class="api-endpoint">
				<div class="method put">PUT</div>
				<code>/api/crawling/configs/&#123;source_id&#125;/keywords</code>
			</div>
			<p>키워드 목록만 수정합니다.</p>

			<div class="api-endpoint">
				<div class="method put">PUT</div>
				<code>/api/crawling/configs/&#123;source_id&#125;/enabled</code>
			</div>
			<p>크롤러 활성화 상태를 변경합니다.</p>

			<h3>WebSocket 크롤링</h3>
			<div class="api-endpoint">
				<div class="method ws">WS</div>
				<code>/api/notices/crawl/&#123;source_id&#125;</code>
			</div>
			<p>
				WebSocket 연결을 통해 실시간으로 크롤링을 실행하고 진행 상황을 수신합니다.
			</p>
			<p>이벤트 타입: start, phase_change, progress, log, complete, error</p>
		</DocSection>

		<DocSection id="api-notices" title="공고 API">
			<h3>공고 조회</h3>
			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/notices</code>
			</div>
			<p>게시된 공고 목록을 조회합니다. 필터, 검색, 페이지네이션 지원.</p>
			<p>쿼리 파라미터: status, source_id, tag_id, search, page, limit</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/notices/queue</code>
			</div>
			<p>크롤링 큐에 대기 중인 공고 목록을 조회합니다.</p>

			<h3>공고 생성/수정</h3>
			<div class="api-endpoint">
				<div class="method post">POST</div>
				<code>/api/notices</code>
			</div>
			<p>새 공고를 수동으로 생성합니다.</p>

			<div class="api-endpoint">
				<div class="method put">PUT</div>
				<code>/api/notices/&#123;notice_id&#125;</code>
			</div>
			<p>기존 공고를 수정합니다.</p>

			<div class="api-endpoint">
				<div class="method delete">DELETE</div>
				<code>/api/notices/&#123;notice_id&#125;</code>
			</div>
			<p>공고를 삭제합니다.</p>

			<h3>일괄 처리</h3>
			<div class="api-endpoint">
				<div class="method post">POST</div>
				<code>/api/notices/publish</code>
			</div>
			<p>크롤링 큐의 공고를 게시합니다. 여러 개를 한 번에 처리 가능.</p>

			<div class="api-endpoint">
				<div class="method post">POST</div>
				<code>/api/notices/bulk-delete</code>
			</div>
			<p>여러 공고를 한 번에 삭제합니다.</p>

			<div class="api-endpoint">
				<div class="method post">POST</div>
				<code>/api/notices/bulk-update-tags</code>
			</div>
			<p>여러 공고에 태그를 일괄 적용합니다.</p>
		</DocSection>

		<DocSection id="api-tags" title="태그 API">
			<h3>태그 조회</h3>
			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/tags</code>
			</div>
			<p>전체 태그 목록을 조회합니다.</p>
			<p>쿼리 파라미터: is_active, category</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/tags/active</code>
			</div>
			<p>활성화된 태그만 조회합니다.</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/tags/&#123;tag_id&#125;</code>
			</div>
			<p>특정 태그의 상세 정보를 조회합니다.</p>

			<h3>태그 생성/수정</h3>
			<div class="api-endpoint">
				<div class="method post">POST</div>
				<code>/api/tags</code>
			</div>
			<p>새 태그를 생성합니다.</p>

			<div class="api-endpoint">
				<div class="method put">PUT</div>
				<code>/api/tags/&#123;tag_id&#125;</code>
			</div>
			<p>태그를 수정합니다.</p>

			<div class="api-endpoint">
				<div class="method delete">DELETE</div>
				<code>/api/tags/&#123;tag_id&#125;</code>
			</div>
			<p>태그를 삭제합니다. 사용 중인 태그는 삭제할 수 없습니다.</p>

			<h3>태그 관리</h3>
			<div class="api-endpoint">
				<div class="method put">PUT</div>
				<code>/api/tags/reorder</code>
			</div>
			<p>태그 표시 순서를 변경합니다.</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/tags/stats/categories</code>
			</div>
			<p>사용 중인 태그 카테고리 목록을 조회합니다.</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/tags/color-presets</code>
			</div>
			<p>색상 프리셋 목록을 조회합니다.</p>
		</DocSection>

		<DocSection id="api-bi-centers" title="BI 센터 API">
			<h3>센터 조회</h3>
			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/bi-centers/list</code>
			</div>
			<p>BI 센터 목록을 조회합니다.</p>
			<p>쿼리 파라미터: region, has_vacancy</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/bi-centers/&#123;center_id&#125;</code>
			</div>
			<p>특정 센터의 상세 정보를 조회합니다.</p>

			<h3>입주 기업 조회</h3>
			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/bi-centers/&#123;center_id&#125;/companies</code>
			</div>
			<p>특정 센터의 입주 기업 목록을 조회합니다.</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/bi-centers/companies/all</code>
			</div>
			<p>전체 입주 기업 목록을 조회합니다.</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/bi-centers/companies/search</code>
			</div>
			<p>기업명 또는 제품명으로 검색합니다.</p>

			<h3>통계</h3>
			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/bi-centers/stats/overview</code>
			</div>
			<p>BI 센터 및 입주 기업 통계를 조회합니다.</p>
		</DocSection>

		<DocSection id="api-dashboard" title="대시보드 API">
			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/dashboard/summary</code>
			</div>
			<p>전체 통계 요약을 조회합니다.</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/dashboard/urgent-notices</code>
			</div>
			<p>마감 임박 공고 (7일 이내)를 조회합니다.</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/dashboard/recent-organizations</code>
			</div>
			<p>최근 업데이트된 기업 및 기관 정보를 조회합니다.</p>

			<div class="api-endpoint">
				<div class="method get">GET</div>
				<code>/api/dashboard/recent-logs</code>
			</div>
			<p>최근 크롤링 실행 로그를 조회합니다.</p>
		</DocSection>

		<!-- 9. 문제 해결 -->
		<DocSection id="faq" title="자주 묻는 질문">
			<h3>크롤링이 실패합니다</h3>
			<p>다음 사항을 확인하십시오:</p>
			<ul>
				<li>외부 사이트가 정상 작동하는지 확인</li>
				<li>API 키가 올바르게 설정되었는지 확인 (NTIS, BIZINFO)</li>
				<li>네트워크 연결 상태 확인</li>
				<li>크롤러 로그에서 구체적인 오류 메시지 확인</li>
				<li>rate limiting으로 인한 차단 여부 확인</li>
			</ul>

			<h3>크롤링 큐에 공고가 보이지 않습니다</h3>
			<p>다음을 확인하십시오:</p>
			<ul>
				<li>크롤러가 정상적으로 실행 완료되었는지 확인</li>
				<li>키워드 매칭 조건이 너무 엄격하지 않은지 확인</li>
				<li>이미 게시된 공고인지 확인 (중복 필터링됨)</li>
				<li>날짜 범위 설정 확인</li>
			</ul>

			<h3>태그가 공고에 적용되지 않습니다</h3>
			<ul>
				<li>태그가 활성화 상태인지 확인</li>
				<li>브라우저 캐시를 새로고침</li>
				<li>공고를 저장한 후 다시 확인</li>
			</ul>

			<h3>시스템이 느립니다</h3>
			<ul>
				<li>시스템 모니터에서 리소스 사용량 확인</li>
				<li>데이터베이스 쿼리 성능 확인</li>
				<li>대용량 크롤링 작업 진행 중인지 확인</li>
				<li>EC2 인스턴스 타입 확인 (t3.small 권장)</li>
			</ul>
		</DocSection>

		<DocSection id="troubleshoot-crawling" title="크롤링 오류 해결">
			<h3>NTIS API 오류</h3>
			<p>NTIS API 키가 만료되었거나 잘못된 경우 다음과 같이 해결합니다:</p>
			<ol>
				<li>환경 변수에 NTIS_API_KEY가 올바르게 설정되었는지 확인</li>
				<li>API 키 유효성을 NTIS 사이트에서 확인</li>
				<li>키 갱신 후 Docker 컨테이너 재시작</li>
			</ol>

			<h3>웹 스크래핑 실패</h3>
			<p>대상 사이트의 구조가 변경된 경우:</p>
			<ul>
				<li>크롤러 코드에서 CSS 셀렉터 확인 및 업데이트</li>
				<li>대상 사이트의 HTML 구조 변경 여부 확인</li>
				<li>개발자에게 문의하여 크롤러 코드 수정</li>
			</ul>

			<h3>타임아웃 오류</h3>
			<p>크롤링 시간이 너무 오래 걸리는 경우:</p>
			<ul>
				<li>수집 기간 (date_range_days)을 줄임</li>
				<li>대상 사이트의 응답 속도 확인</li>
				<li>rate limiting 설정 확인</li>
			</ul>

			<h3>중복 데이터 수집</h3>
			<p>이미 수집된 데이터가 다시 수집되는 경우:</p>
			<ul>
				<li>원본 URL 기반 중복 검사가 정상 작동하는지 확인</li>
				<li>데이터베이스 unique 제약 조건 확인</li>
				<li>크롤러 로직에서 중복 검사 코드 확인</li>
			</ul>
		</DocSection>

		<DocSection id="api-keys" title="API 키 설정">
			<p>일부 크롤러는 API 키가 필요합니다. 환경 변수로 설정해야 합니다.</p>

			<h3>필수 API 키</h3>
			<ul>
				<li>
					NTIS_API_KEY: 국가과학기술정보서비스 API 키<br />
					발급: <a href="https://www.ntis.go.kr" target="_blank">https://www.ntis.go.kr</a>
				</li>
			</ul>

			<h3>선택 API 키</h3>
			<ul>
				<li>BIZINFO_API_KEY: 기업마당 API 키 (웹 스크래핑으로 대체 가능)</li>
				<li>JBTP_API_KEY: JBTP API 키 (현재 사용되지 않음)</li>
			</ul>

			<h3>설정 방법</h3>
			<ol>
				<li>.env 파일에 API 키 추가</li>
				<li>Docker Compose를 사용하는 경우 컨테이너 재시작</li>
				<li>EC2 배포 시 GitHub Secrets에 추가</li>
			</ol>

			<h3>환경 변수 예시</h3>
			<div class="code-block">
				<code>
					NTIS_API_KEY=your_ntis_api_key_here<br />
					BIZINFO_API_KEY=your_bizinfo_api_key_here
				</code>
			</div>
		</DocSection>

		<DocSection id="support" title="지원 요청">
			<p>문제 해결이 어려운 경우 다음 정보를 포함하여 지원을 요청하십시오:</p>

			<h3>필요 정보</h3>
			<ul>
				<li>발생한 문제에 대한 상세한 설명</li>
				<li>문제 발생 시각</li>
				<li>재현 단계</li>
				<li>오류 메시지 또는 스크린샷</li>
				<li>크롤링 로그 (크롤링 관련 문제인 경우)</li>
				<li>시스템 모니터 정보 (성능 문제인 경우)</li>
			</ul>

			<h3>로그 확인 방법</h3>
			<ul>
				<li>Docker 로그: <code>docker-compose logs -f backend</code></li>
				<li>시스템 모니터: 좌측 메뉴에서 "시스템 모니터링" 선택</li>
				<li>크롤링 로그: 각 크롤링 실행 화면에서 확인</li>
			</ul>

			<h3>API 문서</h3>
			<p>
				Swagger UI에서 전체 API 문서를 확인할 수 있습니다:<br />
				<a href="http://localhost:8000/docs" target="_blank">http://localhost:8000/docs</a>
			</p>
		</DocSection>
	</main>
</div>

<style>
	.docs-container {
		display: flex;
		min-height: calc(100vh - var(--topbar-height));
		background-color: var(--bg);
	}

	.docs-sidebar {
		width: 280px;
		min-width: 280px;
		background-color: var(--bg);
		border-right: var(--border-width) solid var(--hair);
		overflow-y: auto;
		position: sticky;
		top: var(--topbar-height);
		height: calc(100vh - var(--topbar-height));
	}

	.docs-content {
		flex: 1;
		max-width: 900px;
		padding: var(--space-12) var(--space-16);
		overflow-y: auto;
	}

	.docs-header {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-bottom: var(--space-12);
		padding-bottom: var(--space-8);
		border-bottom: 2px solid var(--hair);
	}

	.header-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		background-color: var(--ghost);
		border-radius: var(--radius-md);
		color: var(--fg);
	}

	.docs-header h1 {
		font-size: var(--text-3xl);
		font-weight: var(--font-bold);
		color: var(--fg);
		margin: 0;
	}

	.subtitle {
		font-size: var(--text-base);
		color: var(--muted);
		margin: var(--space-2) 0 0 0;
	}

	.code-block {
		background-color: var(--ghost);
		border: var(--border-width) solid var(--hair);
		border-radius: var(--radius-sm);
		padding: var(--space-4);
		margin: var(--space-4) 0;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: var(--text-sm);
	}

	.code-block code {
		color: var(--fg);
	}

	.code-block p {
		margin: var(--space-2) 0 0 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--muted);
	}

	.api-endpoint {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		background-color: var(--ghost);
		border: var(--border-width) solid var(--hair);
		border-radius: var(--radius-sm);
		padding: var(--space-4);
		margin: var(--space-4) 0;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: var(--text-sm);
	}

	.method {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-xs);
		font-weight: var(--font-bold);
		font-size: var(--text-xs);
		text-transform: uppercase;
	}

	.method.get {
		background-color: #4caf50;
		color: white;
	}

	.method.post {
		background-color: #2196f3;
		color: white;
	}

	.method.put {
		background-color: #ff9800;
		color: white;
	}

	.method.delete {
		background-color: #f44336;
		color: white;
	}

	.method.ws {
		background-color: #9c27b0;
		color: white;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin: var(--space-4) 0;
		font-size: var(--text-sm);
	}

	thead {
		background-color: var(--ghost);
	}

	th,
	td {
		padding: var(--space-3) var(--space-4);
		text-align: left;
		border: var(--border-width) solid var(--hair);
	}

	th {
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	td {
		color: var(--muted);
	}

	a {
		color: #2196f3;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	ul,
	ol {
		margin: var(--space-4) 0;
		padding-left: var(--space-8);
	}

	li {
		margin: var(--space-2) 0;
		color: var(--muted);
		line-height: 1.6;
	}
</style>
