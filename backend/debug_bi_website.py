"""
Debug BI Center Website Structure
"""
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select
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

    print("페이지 로드 완료")

    # 지역 선택
    wait = WebDriverWait(driver, 10)
    area_select = wait.until(
        EC.presence_of_element_located((By.NAME, 'searchCenterVO.areaCodeSearch'))
    )
    select = Select(area_select)

    print(f"\n사용 가능한 지역 옵션:")
    for option in select.options:
        print(f"  value='{option.get_attribute('value')}' text='{option.text}'")

    # 전북 선택
    select.select_by_value('063')
    driver.execute_script('fncSelectList();')
    time.sleep(3)

    print(f"\n테이블 구조 분석:")

    # 테이블 찾기
    table = driver.find_element(By.TAG_NAME, 'table')
    rows = table.find_elements(By.TAG_NAME, 'tr')

    print(f"총 {len(rows)}개 행 발견")

    # 헤더 확인
    if len(rows) > 0:
        header_row = rows[0]
        headers = header_row.find_elements(By.TAG_NAME, 'th')
        if not headers:
            headers = header_row.find_elements(By.TAG_NAME, 'td')

        print(f"\n헤더 ({len(headers)}개 컬럼):")
        for i, h in enumerate(headers):
            print(f"  [{i}] {h.text}")

    # 첫 3개 데이터 행 확인
    print(f"\n첫 3개 데이터 행:")
    data_rows = rows[1:4] if len(rows) > 3 else rows[1:]

    for idx, row in enumerate(data_rows):
        cols = row.find_elements(By.TAG_NAME, 'td')
        print(f"\n  행 {idx + 1} ({len(cols)}개 컬럼):")
        for i, col in enumerate(cols):
            text = col.text.strip()
            print(f"    [{i}] {text[:50] if len(text) > 50 else text}")

    # HTML 구조도 확인
    print(f"\n테이블 HTML 샘플 (첫 2000자):")
    print(table.get_attribute('outerHTML')[:2000])

finally:
    driver.quit()
