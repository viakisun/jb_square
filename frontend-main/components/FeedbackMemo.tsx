import React, { useState } from 'react';

interface FeedbackMemoProps {
  pagePath: string;
  pageTitle: string;
}

interface Memo {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  pagePath: string;
}

const FeedbackMemo: React.FC<FeedbackMemoProps> = ({ pagePath, pageTitle }) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState('');
  const [author, setAuthor] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // 로컬 스토리지에서 메모 불러오기
  React.useEffect(() => {
    const savedMemos = localStorage.getItem(`memos_${pagePath}`);
    if (savedMemos) {
      setMemos(JSON.parse(savedMemos));
    }
  }, [pagePath]);

  // 메모 저장
  const saveMemo = () => {
    if (!newMemo.trim() || !author.trim()) return;

    const memo: Memo = {
      id: Date.now().toString(),
      content: newMemo,
      author: author,
      timestamp: new Date().toLocaleString('ko-KR'),
      pagePath: pagePath
    };

    const updatedMemos = [...memos, memo];
    setMemos(updatedMemos);
    localStorage.setItem(`memos_${pagePath}`, JSON.stringify(updatedMemos));
    
    // 실시간 알림을 위한 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('newFeedback', { 
      detail: { ...memo, pageTitle } 
    }));
    
    setNewMemo('');
    setAuthor('');
  };

  // 메모 삭제
  const deleteMemo = (id: string) => {
    const updatedMemos = memos.filter(memo => memo.id !== id);
    setMemos(updatedMemos);
    localStorage.setItem(`memos_${pagePath}`, JSON.stringify(updatedMemos));
  };

  return (
    <div className="mt-12 border-2 border-dashed border-gray-500 bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            [FEEDBACK] {pageTitle} - 피드백 메모
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="border border-gray-300 px-3 py-1 bg-white hover:bg-gray-100 text-sm"
          >
            {isExpanded ? '접기' : '펼치기'} ({memos.length})
          </button>
        </div>

        {isExpanded && (
          <>
            {/* 새 메모 작성 */}
            <div className="mb-6 p-4 border border-gray-300 bg-white">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  작성자
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  피드백 내용
                </label>
                <textarea
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  placeholder="이 페이지에 대한 의견이나 개선사항을 남겨주세요..."
                  rows={3}
                  className="w-full border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={saveMemo}
                disabled={!newMemo.trim() || !author.trim()}
                className="border border-gray-300 px-4 py-2 bg-white hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                [BTN] 메모 저장
              </button>
            </div>

            {/* 메모 목록 */}
            <div className="space-y-3">
              {memos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  아직 피드백이 없습니다. 첫 번째 의견을 남겨보세요!
                </div>
              ) : (
                memos.map((memo) => (
                  <div key={memo.id} className="border border-gray-300 bg-white p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800 text-sm">
                          {memo.author}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {memo.timestamp}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteMemo(memo.id)}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                      >
                        [BTN] 삭제
                      </button>
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">
                      {memo.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 안내 메시지 */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                💡 <strong>피드백 가이드:</strong> 이 페이지의 디자인, 기능, 사용성에 대한 의견을 자유롭게 남겨주세요. 
                "이랬으면 좋겠다", "저랬으면 좋겠다" 같은 구체적인 제안도 환영합니다!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackMemo;
