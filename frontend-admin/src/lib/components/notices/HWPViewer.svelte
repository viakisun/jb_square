<script lang="ts">
	import { onMount } from 'svelte';
	import * as pdfjsLib from 'pdfjs-dist';
	import { API_BASE_URL } from '$lib/config/api';

	interface Props {
		url: string;
		filename: string;
	}

	let { url, filename }: Props = $props();

	let converting = $state(true); // HWP -> PDF 변환 중
	let rendering = $state(false); // PDF 렌더링 중
	let error = $state<string | null>(null);
	let pdfUrl = $state<string | null>(null);
	let cached = $state(false);
	let numPages = $state<number>(0);
	let renderedPages = $state<number>(0);
	let containerRef = $state<HTMLDivElement | null>(null);

	// PDF.js worker 설정
	onMount(() => {
		pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
	});

	// HWP -> PDF 변환
	$effect(() => {
		const convertHWPToPDF = async () => {
			console.log('[HWPViewer] HWP -> PDF 변환 시작:', url);
			converting = true;
			error = null;

			try {
				const conversionUrl = `${API_BASE_URL}/notices/convert-hwp-to-pdf?hwp_url=${encodeURIComponent(url)}`;
				console.log('[HWPViewer] Conversion URL:', conversionUrl);

				const response = await fetch(conversionUrl);
				console.log('[HWPViewer] Conversion response:', {
					ok: response.ok,
					status: response.status,
					statusText: response.statusText
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ detail: response.statusText }));
					throw new Error(errorData.detail || '파일 변환 실패');
				}

				const data = await response.json();
				console.log('[HWPViewer] Conversion result:', data);

				if (data.success && data.pdf_url) {
					const fullPdfUrl = data.pdf_url.startsWith('http')
						? data.pdf_url
						: `${API_BASE_URL}${data.pdf_url}`;
					console.log('[HWPViewer] Final PDF URL:', fullPdfUrl);
					pdfUrl = fullPdfUrl;
					cached = data.cached || false;
					// PDF URL을 받았으니 변환 완료
					converting = false;
				} else {
					throw new Error('PDF URL을 받지 못했습니다');
				}
			} catch (err) {
				console.error('[HWPViewer] HWP to PDF conversion error:', err);
				error = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
				converting = false;
			}
		};

		convertHWPToPDF();
	});

	// PDF 렌더링
	$effect(() => {
		if (!pdfUrl) {
			console.log('[HWPViewer] PDF URL 없음, 렌더링 스킵');
			return;
		}

		const renderPDF = async () => {
			if (!containerRef) {
				console.warn('[HWPViewer] Container ref not available');
				return;
			}
			try {
				console.log('[HWPViewer] PDF 렌더링 시작:', pdfUrl);
				rendering = true;
				renderedPages = 0;

				// PDF 파일을 먼저 fetch로 다운로드 (CORS 우회)
				console.log('[HWPViewer] Step 1: Fetching PDF...');
				if (!pdfUrl) {
					throw new Error('PDF URL이 없습니다.');
				}
				const response = await fetch(pdfUrl);
				console.log('[HWPViewer] Fetch response:', {
					ok: response.ok,
					status: response.status,
					contentType: response.headers.get('content-type'),
					contentLength: response.headers.get('content-length')
				});

				if (!response.ok) {
					throw new Error(`PDF 다운로드 실패: ${response.status}`);
				}

				console.log('[HWPViewer] Step 2: Converting to ArrayBuffer...');
				const pdfData = await response.arrayBuffer();
				console.log('[HWPViewer] ArrayBuffer size:', pdfData.byteLength);

				// PDF 로드 (ArrayBuffer 사용)
				console.log('[HWPViewer] Step 3: Loading PDF with PDF.js...');
				const loadingTask = pdfjsLib.getDocument({ data: pdfData });

				loadingTask.onProgress = (progress: any) => {
					console.log('[HWPViewer] PDF loading progress:', progress);
				};

				const pdf = await loadingTask.promise;
				console.log('[HWPViewer] PDF loaded successfully. Pages:', pdf.numPages);
				numPages = pdf.numPages;

				// 컨테이너 초기화
				if (containerRef) {
					containerRef.innerHTML = '';
				}

				// 각 페이지 렌더링
				console.log('[HWPViewer] Step 4: Rendering pages...');
				for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
					console.log(`[HWPViewer] Rendering page ${pageNum}/${pdf.numPages}...`);

					const page = await pdf.getPage(pageNum);
					console.log(`[HWPViewer] Page ${pageNum} loaded`);

					// 컨테이너 너비에 맞게 scale 계산
					const containerWidth = containerRef.clientWidth - 32; // padding 제외
					const pageViewport = page.getViewport({ scale: 1.0 });
					const scale = containerWidth / pageViewport.width;

					const viewport = page.getViewport({ scale });
					console.log(`[HWPViewer] Viewport for page ${pageNum}:`, {
						width: viewport.width,
						height: viewport.height,
						scale
					});

					// Canvas 생성
					const canvas = document.createElement('canvas');
					const context = canvas.getContext('2d');
					if (!context) {
						console.warn(`[HWPViewer] Failed to get canvas context for page ${pageNum}`);
						continue;
					}

					canvas.height = viewport.height;
					canvas.width = viewport.width;
					canvas.style.display = 'block';
					canvas.style.margin = '0 auto 20px';
					canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
					canvas.style.maxWidth = '100%';
					canvas.style.height = 'auto';

					// 페이지 래퍼
					const pageWrapper = document.createElement('div');
					pageWrapper.className = 'pdf-page-wrapper';
					pageWrapper.style.marginBottom = '20px';
					pageWrapper.appendChild(canvas);

					if (containerRef) {
						containerRef.appendChild(pageWrapper);
					}

					// 페이지 렌더링
					const renderContext = {
						canvasContext: context,
						viewport: viewport
					};

					console.log(`[HWPViewer] Starting render for page ${pageNum}...`);
					await page.render(renderContext).promise;
					console.log(`[HWPViewer] Page ${pageNum} rendered successfully`);
					renderedPages = pageNum;
				}

				console.log('[HWPViewer] All pages rendered successfully');
				rendering = false;
			} catch (err) {
				console.error('PDF rendering error:', err);
				error = err instanceof Error ? err.message : 'PDF 렌더링 실패';
				rendering = false;
			}
		};

		// containerRef가 준비될 때까지 약간의 지연
		const timer = setTimeout(() => {
			renderPDF();
		}, 100);

		return () => clearTimeout(timer);
	});

	const isLoading = $derived(converting || rendering);
</script>

{#if isLoading && !pdfUrl}
	<!-- PDF URL이 없으면 변환 중 -->
	<div class="flex justify-center items-center py-20 bg-gray-50 border border-gray-300 rounded-lg">
		<div class="text-center">
			<div
				class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"
			></div>
			<p class="text-gray-600">HWP 파일을 PDF로 변환하는 중...</p>
			<p class="text-gray-500 text-sm mt-2">잠시만 기다려주세요</p>
		</div>
	</div>
{:else if error}
	<div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
		<p class="text-red-700 mb-2">파일을 불러올 수 없습니다: {error}</p>
		<p class="text-red-600 text-sm mb-4">원본 HWP 파일을 다운로드하여 확인해주세요.</p>
		<a
			href={url}
			download
			class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
		>
			<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width={2}
					d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			원본 다운로드
		</a>
	</div>
{:else}
	<div class="relative">
		{#if cached}
			<div class="mb-4 text-xs text-green-600 flex items-center">
				<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
				캐시된 PDF 사용 중
			</div>
		{/if}

		<!-- PDF 렌더링 진행 상황 -->
		{#if rendering && numPages > 0}
			<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
				<div class="flex items-center">
					<div
						class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"
					></div>
					<span class="text-sm text-blue-700">
						PDF 렌더링 중... ({renderedPages}/{numPages})
					</span>
				</div>
			</div>
		{/if}

		<!-- PDF 다운로드 링크 -->
		{#if pdfUrl}
			<div class="mb-4 text-right">
				<a
					href={pdfUrl}
					download={filename}
					class="inline-flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
				>
					<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width={2}
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
						/>
					</svg>
					다운로드
				</a>
			</div>
		{/if}

		<!-- PDF 렌더링 컨테이너 -->
		<div
			bind:this={containerRef}
			class="bg-white p-4 rounded-lg border border-gray-200"
			style="max-width: 1200px; margin: 0 auto; overflow: auto;"
		/>
	</div>
{/if}
