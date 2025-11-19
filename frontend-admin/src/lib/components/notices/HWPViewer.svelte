<script lang="ts">
	import { onMount } from 'svelte';
	import * as pdfjsLib from 'pdfjs-dist';
	import { API_BASE_URL } from '$lib/config/api';

	interface Props {
		url: string;
		filename: string;
	}

	let { url, filename }: Props = $props();

	// Detect file type
	const isPDF = filename.toLowerCase().endsWith('.pdf');
	const isHWP = filename.toLowerCase().endsWith('.hwp') || filename.toLowerCase().endsWith('.hwpx');

	let converting = $state(!isPDF); // PDF는 변환 불필요
	let rendering = $state(false); // PDF 렌더링 중
	let error = $state<string | null>(null);
	let pdfUrl = $state<string | null>(isPDF ? url : null); // PDF면 바로 URL 사용
	let cached = $state(false);
	let numPages = $state<number>(0);
	let renderedPages = $state<number>(0);
	let containerRef = $state<HTMLDivElement | null>(null);

	// PDF.js worker 설정
	onMount(() => {
		pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
	});

	// HWP -> PDF 변환 (PDF 파일은 변환 불필요)
	$effect(() => {
		// PDF 파일이면 변환 스킵
		if (isPDF) {
			converting = false;
			return;
		}

		// HWP 파일만 변환 수행
		if (!isHWP) {
			error = '지원하지 않는 파일 형식입니다';
			converting = false;
			return;
		}

		const convertHWPToPDF = async () => {
			converting = true;
			error = null;

			try {
				const conversionUrl = `${API_BASE_URL}/notices/convert-hwp-to-pdf?hwp_url=${encodeURIComponent(url)}`;
				const response = await fetch(conversionUrl);

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ detail: response.statusText }));
					throw new Error(errorData.detail || '파일 변환 실패');
				}

				const data = await response.json();

				if (data.success && data.pdf_url) {
					const fullPdfUrl = data.pdf_url.startsWith('http')
						? data.pdf_url
						: `${API_BASE_URL}${data.pdf_url}`;
					pdfUrl = fullPdfUrl;
					cached = data.cached || false;
					converting = false;
				} else {
					throw new Error('PDF URL을 받지 못했습니다');
				}
			} catch (err) {
				error = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
				converting = false;
			}
		};

		convertHWPToPDF();
	});

	// PDF 렌더링
	$effect(() => {
		if (!pdfUrl) {
			return;
		}

		const renderPDF = async () => {
			if (!containerRef) {
				return;
			}
			try {
				rendering = true;
				renderedPages = 0;

				// PDF 파일을 먼저 fetch로 다운로드 (CORS 우회)
				if (!pdfUrl) {
					throw new Error('PDF URL이 없습니다.');
				}
				const response = await fetch(pdfUrl);

				if (!response.ok) {
					throw new Error(`PDF 다운로드 실패: ${response.status}`);
				}

				const pdfData = await response.arrayBuffer();

				// PDF 로드 (ArrayBuffer 사용)
				const loadingTask = pdfjsLib.getDocument({ data: pdfData });
				const pdf = await loadingTask.promise;
				numPages = pdf.numPages;

				// 컨테이너 초기화
				if (containerRef) {
					containerRef.innerHTML = '';
				}

				// 각 페이지 렌더링
				for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
					const page = await pdf.getPage(pageNum);

					// 컨테이너 너비에 맞게 scale 계산
					const containerWidth = containerRef.clientWidth - 32; // padding 제외
					const pageViewport = page.getViewport({ scale: 1.0 });
					const scale = containerWidth / pageViewport.width;

					const viewport = page.getViewport({ scale });

					// Canvas 생성
					const canvas = document.createElement('canvas');
					const context = canvas.getContext('2d');
					if (!context) {
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

					await page.render(renderContext).promise;
					renderedPages = pageNum;
				}

				rendering = false;
			} catch (err) {
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
			<p class="text-gray-600">{isHWP ? 'HWP 파일을 PDF로 변환하는 중...' : '파일 로딩 중...'}</p>
			<p class="text-gray-500 text-sm mt-2">잠시만 기다려주세요</p>
		</div>
	</div>
{:else if error}
	<div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
		<p class="text-red-700 mb-2">파일을 불러올 수 없습니다: {error}</p>
		<p class="text-red-600 text-sm mb-4">원본 파일을 다운로드하여 확인해주세요.</p>
		<a
			href={url}
			download={filename}
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
	<div class="hwp-viewer-wrapper">
		<!-- PDF 렌더링 진행 상황 -->
		{#if rendering && numPages > 0}
			<div class="rendering-progress">
				<div class="progress-content">
					<div class="spinner"></div>
					<span class="progress-text">
						PDF 렌더링 중... ({renderedPages}/{numPages})
					</span>
				</div>
			</div>
		{/if}

		<!-- PDF 렌더링 컨테이너 -->
		<div bind:this={containerRef} class="pdf-container"></div>
	</div>
{/if}

<style>
	.hwp-viewer-wrapper {
		position: relative;
	}

	.rendering-progress {
		margin-bottom: 1rem;
		padding: 0.75rem;
		background-color: #eff6ff;
		border: 1px solid #bfdbfe;
		border-radius: 0.5rem;
	}

	.progress-content {
		display: flex;
		align-items: center;
	}

	.spinner {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		border: 2px solid transparent;
		border-top-color: #2563eb;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.progress-text {
		font-size: 0.875rem;
		color: #1e40af;
	}

	.pdf-container {
		background-color: white;
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		max-width: 1200px;
		max-height: 1200px;
		margin: 0 auto;
		overflow-y: auto;
	}
</style>
