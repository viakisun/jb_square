"""
Debug BI Center Detail Page
"""
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=chrome_options
)

try:
    url = "https://www.smes.go.kr/binet/incu/center/list.do"
    driver.get(url)
    print("페이지 로드 완료\n")

    # 전북 지역 클릭
    print("전북 지역 선택 중...")
    driver.execute_script("fncSelectArea('063');")
    time.sleep(3)
    print("지역 선택 완료\n")

    # 첫 번째 센터 상세 클릭
    print("첫 번째 센터 상세 페이지 열기...")
    driver.execute_script("fncEditView('bicc0036');")  # 군산대학교
    time.sleep(3)

    # 팝업으로 전환
    driver.switch_to.window(driver.window_handles[-1])
    print("팝업 전환 완료\n")

    # 페이지 전체 HTML 확인 (테이블 찾기)
    tables = driver.find_elements(By.TAG_NAME, 'table')
    print(f"테이블 {len(tables)}개 발견\n")

    for table_idx, table in enumerate(tables):
        print(f"=== 테이블 {table_idx + 1} ===")
        rows = table.find_elements(By.TAG_NAME, 'tr')
        print(f"총 {len(rows)}개 행\n")

        for idx, row in enumerate(rows[:10]):  # 처음 10개 행만
            cols = row.find_elements(By.TAG_NAME, 'td')
            ths = row.find_elements(By.TAG_NAME, 'th')

            # th와 td를 모두 표시
            all_cells = []
            for th in ths:
                all_cells.append(('th', th.text.strip()))
            for td in cols:
                all_cells.append(('td', td.text.strip()))

            print(f"  행 {idx + 1} ({len(all_cells)}개 셀):")
            for i, (cell_type, text) in enumerate(all_cells):
                if text:
                    print(f"    [{i}] ({cell_type}) {text[:100]}")

        print("\n")

finally:
    driver.quit()
