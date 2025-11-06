"""
Organization Model
SQLAlchemy ORM model for biotech companies with KSIC code classification
"""

from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, BigInteger, Boolean
from src.core.database import Base


class Organization(Base):
    """
    Biotech Organizations/Companies Model
    Includes financial data, patent data, and KSIC-based industry classification
    """
    __tablename__ = 'organizations'

    # Primary Key
    id = Column(Integer, primary_key=True)

    # Basic Information
    kedcd = Column(String(50))  # 기업 식별 코드
    company_name = Column(String(255), nullable=False)  # 업체명
    company_name_with_type = Column(String(255))  # 업체명_형태포함
    business_registration_number = Column(String(20))  # 사업자등록번호
    corporate_registration_number = Column(String(20))  # 법인등록번호
    corporation_number = Column(String(20))  # 법인번호

    # Representative & Contact
    ceo_name = Column(String(100))  # 대표자명
    email = Column(String(200))  # 이메일

    # Company Status
    company_status = Column(String(50))  # 기업상태
    company_scale = Column(String(50))  # 기업규모
    company_type = Column(String(50))  # 기업형태

    # Industry Classification (KSIC)
    ksic_11th_code = Column(String(10))  # 업종코드11차_세세분류
    ksic_11th_name = Column(String(255))  # 업종명11차_세세분류
    ksic_10th_code = Column(String(10))  # 업종코드10차_세세분류
    ksic_10th_name = Column(String(255))  # 업종명10차_세세분류
    main_ksic_10th = Column(String(10))  # KSIC(10차) 주업종

    # Bio Industry Classification
    industry_type = Column(String(20), default='NON_BIO')  # BIO_CORE/BIO_RELATED/NON_BIO

    # Business Details
    main_products = Column(Text)  # 주요제품명
    main_industry_name = Column(String(255))  # 주축산업명
    cultivation_item = Column(String(255))  # 육성품목명

    # Establishment & Listing
    established_date = Column(Date)  # 설립일자
    is_listed = Column(Boolean, default=False)  # 상장여부
    listed_date = Column(Date)  # 상장일자
    delisted_date = Column(Date)  # 상장폐지일자
    has_research_institute = Column(Boolean, default=False)  # 기업부설연구소유무

    # Financial Data (2020-2024) - Revenue
    revenue_2020 = Column(BigInteger)
    revenue_2021 = Column(BigInteger)
    revenue_2022 = Column(BigInteger)
    revenue_2023 = Column(BigInteger)
    revenue_2024 = Column(BigInteger)

    # Employees
    employees_2020 = Column(Integer)
    employees_2021 = Column(Integer)
    employees_2022 = Column(Integer)
    employees_2023 = Column(Integer)
    employees_2024 = Column(Integer)

    # Export Amount
    export_amount_2020 = Column(BigInteger)
    export_amount_2021 = Column(BigInteger)
    export_amount_2022 = Column(BigInteger)
    export_amount_2023 = Column(BigInteger)
    export_amount_2024 = Column(BigInteger)

    # Operating Profit
    operating_profit_2020 = Column(BigInteger)
    operating_profit_2021 = Column(BigInteger)
    operating_profit_2022 = Column(BigInteger)
    operating_profit_2023 = Column(BigInteger)
    operating_profit_2024 = Column(BigInteger)

    # Net Income
    net_income_2020 = Column(BigInteger)
    net_income_2021 = Column(BigInteger)
    net_income_2022 = Column(BigInteger)
    net_income_2023 = Column(BigInteger)
    net_income_2024 = Column(BigInteger)

    # R&D Expense
    rd_expense_2020 = Column(BigInteger)
    rd_expense_2021 = Column(BigInteger)
    rd_expense_2022 = Column(BigInteger)
    rd_expense_2023 = Column(BigInteger)
    rd_expense_2024 = Column(BigInteger)

    # Value Added
    value_added_2020 = Column(BigInteger)
    value_added_2021 = Column(BigInteger)
    value_added_2022 = Column(BigInteger)
    value_added_2023 = Column(BigInteger)
    value_added_2024 = Column(BigInteger)

    # Total Assets
    total_assets_2020 = Column(BigInteger)
    total_assets_2021 = Column(BigInteger)
    total_assets_2022 = Column(BigInteger)
    total_assets_2023 = Column(BigInteger)
    total_assets_2024 = Column(BigInteger)

    # Total Liabilities
    total_liabilities_2020 = Column(BigInteger)
    total_liabilities_2021 = Column(BigInteger)
    total_liabilities_2022 = Column(BigInteger)
    total_liabilities_2023 = Column(BigInteger)
    total_liabilities_2024 = Column(BigInteger)

    # Retained Earnings
    retained_earnings_2020 = Column(BigInteger)
    retained_earnings_2021 = Column(BigInteger)
    retained_earnings_2022 = Column(BigInteger)
    retained_earnings_2023 = Column(BigInteger)
    retained_earnings_2024 = Column(BigInteger)

    # Working Capital
    working_capital_2020 = Column(BigInteger)
    working_capital_2021 = Column(BigInteger)
    working_capital_2022 = Column(BigInteger)
    working_capital_2023 = Column(BigInteger)
    working_capital_2024 = Column(BigInteger)

    # Patent Registrations
    patent_registrations_2020 = Column(Integer)
    patent_registrations_2021 = Column(Integer)
    patent_registrations_2022 = Column(Integer)
    patent_registrations_2023 = Column(Integer)
    patent_registrations_2024 = Column(Integer)

    # Patent Applications
    patent_applications_2020 = Column(Integer)
    patent_applications_2021 = Column(Integer)
    patent_applications_2022 = Column(Integer)
    patent_applications_2023 = Column(Integer)
    patent_applications_2024 = Column(Integer)

    # Metadata
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def get_yearly_data(self, field: str, year: int) -> Optional[Any]:
        """
        Get data for a specific field and year

        Args:
            field: Base field name (e.g., 'revenue', 'employees')
            year: Year (2020-2024)

        Returns:
            Value for the specified field and year
        """
        if year < 2020 or year > 2024:
            return None

        attr_name = f"{field}_{year}"
        return getattr(self, attr_name, None)

    def get_yearly_series(self, field: str) -> Dict[int, Any]:
        """
        Get time series data for a specific field (2020-2024)

        Args:
            field: Base field name (e.g., 'revenue', 'employees')

        Returns:
            Dictionary mapping year to value
        """
        return {
            year: self.get_yearly_data(field, year)
            for year in range(2020, 2025)
        }

    def to_dict(self, include_yearly: bool = False) -> dict:
        """
        Convert to dictionary for JSON serialization

        Args:
            include_yearly: If True, include structured yearly data

        Returns:
            Dictionary representation of the organization
        """
        base_dict = {
            'id': self.id,
            'kedcd': self.kedcd,
            'company_name': self.company_name,
            'company_name_with_type': self.company_name_with_type,
            'business_registration_number': self.business_registration_number,
            'corporate_registration_number': self.corporate_registration_number,
            'corporation_number': self.corporation_number,
            'ceo_name': self.ceo_name,
            'email': self.email,
            'company_status': self.company_status,
            'company_scale': self.company_scale,
            'company_type': self.company_type,
            'ksic_11th_code': self.ksic_11th_code,
            'ksic_11th_name': self.ksic_11th_name,
            'ksic_10th_code': self.ksic_10th_code,
            'ksic_10th_name': self.ksic_10th_name,
            'main_ksic_10th': self.main_ksic_10th,
            'industry_type': self.industry_type,
            'main_products': self.main_products,
            'main_industry_name': self.main_industry_name,
            'cultivation_item': self.cultivation_item,
            'established_date': self.established_date.isoformat() if self.established_date else None,
            'is_listed': self.is_listed,
            'listed_date': self.listed_date.isoformat() if self.listed_date else None,
            'delisted_date': self.delisted_date.isoformat() if self.delisted_date else None,
            'has_research_institute': self.has_research_institute,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_yearly:
            # Add structured yearly data
            base_dict['yearly_data'] = {
                'revenue': self.get_yearly_series('revenue'),
                'employees': self.get_yearly_series('employees'),
                'export_amount': self.get_yearly_series('export_amount'),
                'operating_profit': self.get_yearly_series('operating_profit'),
                'net_income': self.get_yearly_series('net_income'),
                'rd_expense': self.get_yearly_series('rd_expense'),
                'value_added': self.get_yearly_series('value_added'),
                'total_assets': self.get_yearly_series('total_assets'),
                'total_liabilities': self.get_yearly_series('total_liabilities'),
                'retained_earnings': self.get_yearly_series('retained_earnings'),
                'working_capital': self.get_yearly_series('working_capital'),
                'patent_registrations': self.get_yearly_series('patent_registrations'),
                'patent_applications': self.get_yearly_series('patent_applications'),
            }
        else:
            # Add all yearly columns individually (for backward compatibility)
            for year in range(2020, 2025):
                for field in ['revenue', 'employees', 'export_amount', 'operating_profit',
                             'net_income', 'rd_expense', 'value_added', 'total_assets',
                             'total_liabilities', 'retained_earnings', 'working_capital',
                             'patent_registrations', 'patent_applications']:
                    base_dict[f'{field}_{year}'] = self.get_yearly_data(field, year)

        return base_dict

    def __repr__(self):
        return f"<Organization(id={self.id}, name='{self.company_name}', industry_type='{self.industry_type}')>"
