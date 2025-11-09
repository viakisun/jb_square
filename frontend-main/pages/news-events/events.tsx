/**
 * 📅 행사일정 페이지
 *
 * 전북테크노파크 교육/행사 정보
 * - 행사 목록 표시
 * - 마감일, 주최, 등록일 정보
 * - useNotices 훅을 통한 데이터 관리
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import { useNotices } from "@/hooks/useNotices";

const EventsPage: React.FC = () => {
  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: "뉴스/행사", href: "/news-events" },
    { label: "행사일정" },
  ];

  /**
   * useNotices 훅으로 JBTP 행사 데이터 관리
   * - source_id로 행사 필터링
   * - 로딩/에러 상태 자동 처리
   * - 페이지네이션 지원
   */
  const {
    notices: events,
    loading,
    error,
  } = useNotices({
    source_id: "source:jbtp:events",
    status: "published",
    limit: 50,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            행사일정
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            전북테크노파크 교육/행사 정보
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-2 border-gray-400 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              행사 목록 ({events.length}건)
            </h2>
            <div className="border-2 border-gray-300 p-4 bg-white">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">로딩 중...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">등록된 행사가 없습니다.</p>
                </div>
              ) : (
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 p-3 text-left">
                        행사명
                      </th>
                      <th className="border border-gray-300 p-3 text-left">
                        마감일
                      </th>
                      <th className="border border-gray-300 p-3 text-left">
                        주최
                      </th>
                      <th className="border border-gray-300 p-3 text-left">
                        등록일
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">
                          {event.link ? (
                            <a
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {event.title}
                            </a>
                          ) : (
                            <span>{event.title}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-3">
                          {formatDate(event.deadline)}
                        </td>
                        <td className="border border-gray-300 p-3">
                          {event.organization || '전북테크노파크'}
                        </td>
                        <td className="border border-gray-300 p-3">
                          {formatDate(event.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventsPage;
