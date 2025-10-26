"""
Debug BI Center Website - Click on Jeonbuk region
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

    # 전북 지역 클릭 (JavaScript 함수 호출)
    print("전북 지역 선택 중...")
    driver.execute_script("fncSelectArea('063');")
    time.sleep(3)

    print("페이지 전환 완료\n")

    # 테이블 찾기
    tables = driver.find_elements(By.TAG_NAME, 'table')
    print(f"테이블 {len(tables)}개 발견\n")

    for table_idx, table in enumerate(tables):
        print(f"=== 테이블 {table_idx + 1} ===")
        rows = table.find_elements(By.TAG_NAME, 'tr')
        print(f"총 {len(rows)}개 행\n")

        if len(rows) > 0:
            # 헤더
            header_row = rows[0]
            headers = header_row.find_elements(By.TAG_NAME, 'th')
            if not headers:
                headers = header_row.find_elements(By.TAG_NAME, 'td')

            print(f"헤더 ({len(headers)}개 컬럼):")
            for i, h in enumerate(headers):
                print(f"  [{i}] {h.text}")

            # 첫 3개 데이터 행
            print(f"\n첫 3개 데이터 행:")
            data_rows = rows[1:4] if len(rows) > 3 else rows[1:]

            for idx, row in enumerate(data_rows):
                cols = row.find_elements(By.TAG_NAME, 'td')
                print(f"\n  행 {idx + 1} ({len(cols)}개 컬럼):")
                for i, col in enumerate(cols):
                    text = col.text.strip()
                    # Check for links
                    links = col.find_elements(By.TAG_NAME, 'a')
                    if links:
                        onclick = links[0].get_attribute('onclick')
                        print(f"    [{i}] {text[:40]} (link: {onclick[:50] if onclick else 'N/A'})")
                    else:
                        print(f"    [{i}] {text[:40]}")

        print("\n")

finally:
    driver.quit()
