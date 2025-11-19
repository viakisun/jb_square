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
        # Get required environment variables
        self.region = os.getenv('AWS_S3_REGION') or os.getenv('AWS_REGION', 'ap-northeast-2')
        self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME')

        if not self.bucket_name:
            raise ValueError("AWS_S3_BUCKET_NAME environment variable is required")

        self.s3_client = boto3.client(
            's3',
            region_name=self.region,
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )

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
                    'ContentType': file.content_type or 'application/octet-stream',
                    'ACL': 'public-read'
                }
            )

            # S3 URL 생성
            s3_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_key}"

            return original_filename, s3_url

        except ClientError as e:
            raise Exception(f"S3 업로드 실패: {str(e)}")

    def upload_file_content(
        self,
        content: bytes,
        key: str,
        content_type: str = 'application/octet-stream'
    ) -> bool:
        """
        바이너리 콘텐츠를 S3에 업로드

        Args:
            content: 업로드할 바이너리 콘텐츠
            key: S3 키 (경로 포함)
            content_type: 콘텐츠 타입 (기본: 'application/octet-stream')

        Returns:
            bool: 업로드 성공 여부
        """
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=content,
                ContentType=content_type,
                ACL='public-read'
            )
            return True

        except ClientError as e:
            print(f"S3 업로드 실패: {str(e)}")
            return False

    def get_public_url(self, key: str) -> str:
        """
        S3 키로부터 공개 URL 생성

        Args:
            key: S3 키 (경로 포함)

        Returns:
            str: S3 공개 URL
        """
        return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{key}"

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

    def copy_file(self, source_key: str, dest_key: str) -> bool:
        """
        S3 내에서 파일 복사

        Args:
            source_key: 원본 S3 키
            dest_key: 대상 S3 키

        Returns:
            bool: 복사 성공 여부
        """
        try:
            copy_source = {
                'Bucket': self.bucket_name,
                'Key': source_key
            }
            self.s3_client.copy_object(
                CopySource=copy_source,
                Bucket=self.bucket_name,
                Key=dest_key,
                ACL='public-read'
            )
            return True
        except Exception as e:
            print(f"S3 파일 복사 실패 ({source_key} -> {dest_key}): {str(e)}")
            return False

    def migrate_temp_files_to_notice(self, temp_urls: list, notice_id: int) -> list:
        """
        임시 폴더의 파일들을 공고 ID 폴더로 이동

        Args:
            temp_urls: 임시 S3 URL 리스트 (attachment_links)
            notice_id: 공고 ID

        Returns:
            list: 새로운 S3 URL 리스트 (attachment_links 형식)
        """
        new_attachments = []

        for attachment in temp_urls:
            # temp URL에서 파일명 추출
            temp_url = attachment.get('url', '')
            filename = attachment.get('filename', '')

            if not temp_url or not filename:
                continue

            # 원본 URL 보관
            original_url = attachment.get('original_url')

            try:
                # temp URL에서 S3 키 추출
                # https://jb2-bucket.s3.ap-northeast-2.amazonaws.com/notices/temp/{hash}/{filename}
                # -> notices/temp/{hash}/{filename}
                parts = temp_url.split('.amazonaws.com/')
                if len(parts) != 2:
                    print(f"Invalid S3 URL format: {temp_url}")
                    new_attachments.append(attachment)
                    continue

                old_key = parts[1]

                # 새로운 S3 키 생성
                new_key = f"notices/{notice_id}/{filename}"

                # S3에서 파일 복사
                if self.copy_file(old_key, new_key):
                    # 새로운 URL 생성
                    new_url = self.get_public_url(new_key)

                    # 새로운 attachment entry 생성
                    new_attachment = {
                        'filename': filename,
                        'url': new_url
                    }

                    if original_url:
                        new_attachment['original_url'] = original_url

                    new_attachments.append(new_attachment)
                    print(f"Migrated file: {filename} to notices/{notice_id}/")

                    # 원본 temp 파일 삭제
                    try:
                        self.s3_client.delete_object(
                            Bucket=self.bucket_name,
                            Key=old_key
                        )
                        print(f"Deleted temp file: {old_key}")
                    except Exception as e:
                        print(f"Failed to delete temp file {old_key}: {str(e)}")
                else:
                    # 복사 실패 시 원본 유지
                    new_attachments.append(attachment)

            except Exception as e:
                print(f"Error migrating file {filename}: {str(e)}")
                # 오류 발생 시 원본 유지
                new_attachments.append(attachment)

        return new_attachments

    def delete_notice_folder(self, notice_id: int) -> bool:
        """
        공고 ID에 해당하는 S3 폴더의 모든 파일 삭제

        Args:
            notice_id: 공고 ID

        Returns:
            bool: 삭제 성공 여부
        """
        try:
            # S3 폴더 prefix: notices/{notice_id}/
            prefix = f"notices/{notice_id}/"

            # 해당 폴더의 모든 객체 나열
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )

            # 객체가 없으면 성공으로 간주
            if 'Contents' not in response:
                print(f"No files found for notice {notice_id}")
                return True

            # 모든 객체 삭제
            objects_to_delete = [{'Key': obj['Key']} for obj in response['Contents']]

            if objects_to_delete:
                self.s3_client.delete_objects(
                    Bucket=self.bucket_name,
                    Delete={'Objects': objects_to_delete}
                )
                print(f"Deleted {len(objects_to_delete)} files for notice {notice_id}")

            return True

        except Exception as e:
            print(f"S3 폴더 삭제 실패 (notice_id: {notice_id}): {str(e)}")
            return False


# Singleton instance
s3_client = S3Client()
