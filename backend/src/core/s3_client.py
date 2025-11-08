"""
S3 Client Utility
AWS S3 파일 업로드/삭제 관리
"""

import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple
import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile


class S3Client:
    """AWS S3 클라이언트"""

    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            region_name=os.getenv('AWS_S3_REGION', 'ap-northeast-2'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME', 'jb2_bucket')

    def upload_file(
        self,
        file: UploadFile,
        folder: str = "attachments"
    ) -> Tuple[str, str]:
        """
        파일을 S3에 업로드

        Args:
            file: 업로드할 파일 (FastAPI UploadFile)
            folder: S3 폴더명 (기본: 'attachments')

        Returns:
            Tuple[filename, url]: 원본 파일명과 S3 URL

        Raises:
            Exception: 업로드 실패 시
        """
        try:
            # 파일명 생성: UUID + 원본 확장자
            original_filename = file.filename or "unnamed"
            file_ext = Path(original_filename).suffix
            unique_filename = f"{uuid.uuid4()}{file_ext}"

            # S3 키 생성: attachments/{year}/{month}/{filename}
            now = datetime.now()
            s3_key = f"{folder}/{now.year}/{now.month:02d}/{unique_filename}"

            # 파일 업로드
            self.s3_client.upload_fileobj(
                file.file,
                self.bucket_name,
                s3_key,
                ExtraArgs={
                    'ContentType': file.content_type or 'application/octet-stream'
                }
            )

            # S3 URL 생성
            s3_url = f"https://{self.bucket_name}.s3.{os.getenv('AWS_S3_REGION')}.amazonaws.com/{s3_key}"

            return original_filename, s3_url

        except ClientError as e:
            raise Exception(f"S3 업로드 실패: {str(e)}")

    def delete_file(self, url: str) -> bool:
        """
        S3 파일 삭제

        Args:
            url: S3 파일 URL

        Returns:
            bool: 삭제 성공 여부
        """
        try:
            # URL에서 S3 키 추출
            # https://jb2_bucket.s3.ap-northeast-2.amazonaws.com/attachments/2025/01/abc.pdf
            # -> attachments/2025/01/abc.pdf
            s3_key = url.split(f"{self.bucket_name}.s3.")[1]
            s3_key = s3_key.split("/", 2)[2]  # 리전 이후 경로 추출

            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True

        except Exception as e:
            print(f"S3 삭제 실패: {str(e)}")
            return False


# Singleton instance
s3_client = S3Client()
