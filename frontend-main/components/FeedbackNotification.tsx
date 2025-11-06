import React, { useState, useEffect } from "react";

interface FeedbackNotificationProps {
  onNewFeedback: (feedback: any) => void;
}

interface Feedback {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  pagePath: string;
  pageTitle: string;
}

const FeedbackNotification: React.FC<FeedbackNotificationProps> = ({
  onNewFeedback,
}) => {
  const [notifications, setNotifications] = useState<Feedback[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 로컬 스토리지에서 모든 피드백 수집
  useEffect(() => {
    const collectAllFeedback = () => {
      const allFeedback: Feedback[] = [];

      // 모든 페이지의 피드백 수집
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("memos_")) {
          const pagePath = key.replace("memos_", "");
          const memos = JSON.parse(localStorage.getItem(key) || "[]");

          memos.forEach((memo: any) => {
            allFeedback.push({
              ...memo,
              pagePath,
              pageTitle: getPageTitle(pagePath),
            });
          });
        }
      }

      // 최신순으로 정렬
      allFeedback.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setNotifications(allFeedback);
      setUnreadCount(allFeedback.length);
    };

    collectAllFeedback();

    // 실시간 피드백 이벤트 리스너
    const handleNewFeedback = (event: any) => {
      const newFeedback = event.detail;
      setNotifications((prev) => [newFeedback, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // 슬랙 스타일 토스트 알림
      showToastNotification(newFeedback);
    };

    window.addEventListener("newFeedback", handleNewFeedback);

    // 주기적으로 새로운 피드백 확인 (백업)
    const interval = setInterval(collectAllFeedback, 5000);

    return () => {
      window.removeEventListener("newFeedback", handleNewFeedback);
      clearInterval(interval);
    };
  }, []);

  const getPageTitle = (pagePath: string): string => {
    const titles: { [key: string]: string } = {
      "/": "홈페이지",
      "/bio-cluster/cluster": "바이오 클러스터",
      "/bio-cluster/valley": "지역 바이오밸리",
      "/bio-cluster/community/ceo-forum": "CEO포럼",
      "/bio-cluster/community/economic-forum": "전북경제포럼",
      "/bio-cluster/community/pharma-salon": "혁신신약살롱",
      "/bio-cluster/community/tech-forum": "전북과학기술포럼",
      "/organizations/related": "유관기관",
      "/organizations/academic": "대학",
      "/organizations/research": "연구소",
      "/policy/investment/foreign": "외국인투자제도",
      "/policy/investment/process": "투자 절차",
      "/policy/investment/jbfez": "JBFEZ",
      "/policy/incentives/tax": "세제감면",
      "/policy/incentives/business-support": "경영활동지원",
      "/policy/products": "투자상품",
      "/policy/guide": "투자가이드",
      "/policy/regulations": "기업 및 투자 유치촉진조례",
      "/announcements/government": "정부/지자체 공고",
      "/announcements/customized": "기업 맞춤형 지원",
      "/announcements/rd": "R&D",
      "/announcements/startup": "창업 및 기술이전",
      "/announcements/all": "최신공고 모아보기",
      "/incubator/regional": "지역별 입주기업",
      "/incubator/vacancy": "공실현황",
      "/incubator/incubatee": "보육기업",
      "/incubator/graduate": "졸업기업",
      "/incubator/incubator": "보육센터",
      "/news-events/news": "최신뉴스",
      "/news-events/events": "행사일정",
      "/companies/directory": "지역 기업 정보",
      "/companies/company": "기업상세",
    };
    return titles[pagePath] || pagePath;
  };

  const formatTime = (timestamp: string): string => {
    const now = new Date();
    const feedbackTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - feedbackTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return feedbackTime.toLocaleDateString("ko-KR");
  };

  const handleNotificationClick = (feedback: Feedback) => {
    // 해당 페이지로 이동
    window.location.href = feedback.pagePath;
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const showToastNotification = (feedback: Feedback) => {
    // 토스트 알림 생성
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 bg-white border-2 border-gray-400 shadow-lg rounded-lg p-4 z-50 max-w-sm transform transition-all duration-300 translate-x-full";
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            ${feedback.author.charAt(0)}
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <span class="font-medium text-sm text-gray-800">${feedback.author}</span>
            <span class="text-xs text-gray-500">${feedback.pageTitle}</span>
          </div>
          <p class="text-sm text-gray-700 line-clamp-2">${feedback.content}</p>
          <p class="text-xs text-gray-500 mt-1">방금 전</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // 애니메이션으로 나타나기
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 100);

    // 5초 후 자동 제거
    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, 5000);
  };

  return (
    <>
      {/* 알림 버튼 */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 5h5V1h-5v4z"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* 알림 패널 */}
      {isVisible && (
        <div className="fixed bottom-24 right-6 w-96 bg-white border-2 border-gray-400 shadow-xl rounded-lg z-50 max-h-96 overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">💬 피드백 알림</h3>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  모두 읽음
                </button>
              )}
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                아직 피드백이 없습니다
              </div>
            ) : (
              notifications.map((feedback) => (
                <div
                  key={feedback.id}
                  onClick={() => handleNotificationClick(feedback)}
                  className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-gray-800">
                        {feedback.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(feedback.timestamp)}
                      </span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {feedback.pageTitle}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-2">
                    {feedback.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-gray-50 px-4 py-2 border-t border-gray-300">
            <p className="text-xs text-gray-600 text-center">
              💡 클릭하면 해당 페이지로 이동합니다
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackNotification;
