import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../utils/axios";
import Slider from "../components/Slider";
import "../assets/css/styles.css";

// Add style to the component's head
const getRangeColor = (value: number, max: number) => {
  const percentage = (value / max) * 100;
  if (percentage >= 100) return "bg-green-900";
  if (percentage >= 90) return "bg-green-800";
  if (percentage >= 80) return "bg-green-700";
  if (percentage >= 70) return "bg-green-600";
  if (percentage >= 60) return "bg-green-500";
  if (percentage >= 50) return "bg-green-400";
  if (percentage >= 40) return "bg-green-300";
  if (percentage >= 30) return "bg-green-200";
  if (percentage >= 20) return "bg-green-100";
  if (percentage >= 10) return "bg-green-0";
  return "bg-green-0";
};

// CSS for range input
const rangeStyles = `
  .range-input {
    -webkit-appearance: none;
    width: 100%;
    height: 5px;
    border-radius: 5px;
    outline: none;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .range-input:hover {
    opacity: 1;
  }

  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #4B5563;
    cursor: pointer;
    transition: all 0.2s;
  }

  .range-input::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .range-input::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #4B5563;
    cursor: pointer;
    transition: all 0.2s;
  }

  .range-input::-moz-range-thumb:hover {
    transform: scale(1.2);
  }
`;

const SCORING_CRITERIA = {
  branding: {
    title: "Dấu hiệu nhận diện thương hiệu",
    maxPoints: 20,
    items: {
      uniformity: {
        label:
          "Trên 50% nhân vật mặc đồng phục hoặc đeo thẻ nhân viên xuất hiện",
        maxScore: 10,
      },
      props: {
        label: "Có sử dụng vật phẩm nhận diện như sổ tay, ly nước,...",
        maxScore: 10,
      },
    },
  },
  content: {
    title: "Nội dung video",
    maxPoints: 30,
    items: {
      introduction: {
        label:
          "Có giới thiệu, tôn vinh về công ty, slogan, văn hóa bộ phận của mình",
        maxScore: 10,
      },
      theme: {
        label: "Liên quan chủ đề Unbreakable 17 và chủ đề về ngành IT.",
        maxScore: 10,
      },
      creativity: {
        label:
          "Nội dung truyền tải: độc đáo, sáng tạo, thẩm mỹ, hài hước, trao đi nhiều giá trị,...",
        maxScore: 10,
      },
    },
  },
  technical: {
    title: "Kỹ thuật",
    maxPoints: 15,
    items: {
      videoEffect: {
        label: "Hiệu ứng video ấn tượng, chuyển cảnh hợp lý, mượt mà",
        maxScore: 5,
      },
      videoQuality: {
        label: "Video rõ nét, cảnh quay, nhân vật rõ ràng, màu sắc đẹp",
        maxScore: 5,
      },
      audioQuality: {
        label: "Âm thanh rõ nét, có sự cân nhắc nhạc nền phù hợp",
        maxScore: 5,
      },
    },
  },
  ai: {
    title: "Ứng dụng AI",
    maxPoints: 20,
    items: {
      imageQuality: {
        label:
          "AI - cải thiện chất lượng hình ảnh (rõ nét, thẩm mỹ, màu sắc, chuyển động...)",
        maxScore: 5,
      },
      audioQuality: {
        label: "AI - cải thiện chất lượng âm thanh (lồng tiếng, điều chỉnh...)",
        maxScore: 5,
      },
      scriptIdea: {
        label: "AI - hỗ trợ lên ý tưởng kịch bản, câu thoại, nội dung",
        maxScore: 5,
      },
      creativity: {
        label:
          "AI - sáng tạo đột phá, không trùng lặp với các nội dung phổ biến",
        maxScore: 5,
      },
    },
  },
  presentation: {
    title: "Thuyết trình",
    maxPoints: 15,
    items: {
      speaking: {
        label: "Giọng nói rõ ràng, âm lượng phù hợp, tốc độ vừa phải",
        maxScore: 5,
      },
      confidence: {
        label: "Người thuyết trình tự tin, có tương tác với khán giả",
        maxScore: 5,
      },
      timing: {
        label: "Thông điệp rõ ràng, tập trung, không lan man",
        maxScore: 5,
      },
    },
  },
};

const Dashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>("BIZSYSTEM");
  const [scores, setScores] = useState<any>({});
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    if (Object.keys(scores).length > 0 && !selectedTeam) {
      setSelectedTeam("BIZSYSTEM");
    }
  }, [scores]);

  const fetchScores = async () => {
    try {
      const response = await api.get("/api/get-scores");
      setScores(response.data);
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
  };

  const handleScoreChange = (
    category: string,
    subcategory: string,
    value: number
  ) => {
    if (!selectedTeam) return;

    setScores((prevScores: any) => ({
      ...prevScores,
      [selectedTeam]: {
        scores: {
          ...prevScores[selectedTeam].scores,
          [user.email]: {
            ...prevScores[selectedTeam].scores[user.email],
            [category]: {
              ...prevScores[selectedTeam].scores[user.email][category],
              [subcategory]: value,
            },
          },
        },
      },
    }));
  };

  const isTeamFullyScored = (teamId: string) => {
    const teamScores = scores[teamId]?.scores[user.email];
    if (!teamScores) return false;

    // Check if all items have been scored
    return Object.entries(teamScores).every(([category, values]: any) => {
      if (category === "submitted") return true;
      return Object.values(values).every((score: any) => score > 0);
    });
  };

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Add states for notification modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Add state for validation modal
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Fix handleSubmitClick function
  const handleSubmitClick = () => {
    const unScoredTeams = Object.keys(scores).filter(
      (teamId) => !isTeamFullyScored(teamId)
    );

    if (unScoredTeams.length > 0) {
      setValidationErrors(unScoredTeams);
      setShowValidationModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  // Add modal component
  const ConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4">Xác nhận chấm điểm</h3>
          <p className="text-gray-600 mb-6">
            Bạn đã xác nhận sẽ chấm chứ? Sẽ không thể chỉnh sửa sau khi đánh
            giá.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                setShowConfirmModal(false);
                handleSubmit();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    try {
      // Update the submitted status for all teams
      const updatedScores = { ...scores };
      Object.keys(scores).forEach((teamId) => {
        updatedScores[teamId] = {
          scores: {
            ...scores[teamId].scores,
            [user.email]: {
              ...scores[teamId].scores[user.email],
              submitted: true,
            },
          },
        };
      });

      await api.post("/api/submit-scores", { scores: updatedScores });
      setScores(updatedScores);
      setValidationErrors([]);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting scores:", error);
      setShowErrorModal(true);
    }
  };

  const getTeamButtonStyle = (teamId: string) => {
    const baseStyle =
      "w-full px-2 py-1 md:px-4 md:py-2 rounded text-sm md:text-base transition-colors duration-200";

    if (selectedTeam === teamId) {
      return `${baseStyle} bg-blue-500 text-white`;
    }

    if (isTeamFullyScored(teamId)) {
      return `${baseStyle} bg-green-500 text-white`;
    }

    if (validationErrors.includes(teamId)) {
      return `${baseStyle} bg-red-100 border-2 border-red-500`;
    }

    return `${baseStyle} bg-gray-200`;
  };
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
  }, []);
  const renderScoreInputs = () => {
    if (!selectedTeam) return null;

    const teamScores = scores[selectedTeam]?.scores[user.email];
    if (!teamScores) return null;

    return (
      <div className="space-y-6">
        {Object.entries(SCORING_CRITERIA).map(([category, criteria]) => (
          <div
            key={category}
            className="border border-gray-400 px-3 py-8 rounded"
          >
            <h3 className="font-bold mb-4 text-lg md:text-2xl">
              {criteria.title} ({criteria.maxPoints} điểm)
            </h3>
            <div className="space-y-20 sm:space-y-1">
              {Object.entries(criteria.items).map(([key, item]) => (
                <div
                  key={key}
                  className="flex flex-col md:flex-row md:items-end space-y-2 md:space-y-0 md:space-x-4"
                >
                  <label className="md:w-2/3 text-sm md:text-base">
                    - {item.label}
                  </label>
                  <Slider
                    min={0}
                    max={item.maxScore}
                    value={teamScores[category][key]}
                    onChange={(e: any) =>
                      handleScoreChange(category, key, parseInt(e.target.value))
                    }
                    disabled={teamScores.submitted}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="text-center d-flex">
          <button
            onClick={handlePrevTeam}
            className={`w-1. md:w-1/8 h-12 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 ${
              Object.keys(scores).indexOf(selectedTeam) === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={Object.keys(scores).indexOf(selectedTeam) === 0}
          >
            Prev
          </button>
          {isMobile && (
            <button
              onClick={handleNextTeam}
              className={`w-1. md:w-1/8 h-12 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 ${
                Object.keys(scores).indexOf(selectedTeam) ===
                Object.keys(scores).length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={
                Object.keys(scores).indexOf(selectedTeam) ===
                Object.keys(scores).length - 1
              }
            >
              Next
            </button>
          )}
          <button
            onClick={handleSubmitClick}
            className="w-full md:w-1/4 h-20 text-white text-3xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg  px-5 py-2.5 text-center me-2 mb-2"
            disabled={teamScores.submitted}
          >
            {teamScores.submitted ? "Đã chấm" : "Chấm điểm"}
          </button>
          {!isMobile && (
            <button
              onClick={handleNextTeam}
              className={`w-1. md:w-1/8 h-12 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 ${
                Object.keys(scores).indexOf(selectedTeam) ===
                Object.keys(scores).length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={
                Object.keys(scores).indexOf(selectedTeam) ===
                Object.keys(scores).length - 1
              }
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  };

  // Add components for success and failure modals
  const SuccessModal = () => {
    if (!showSuccessModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mt-4 mb-2">
              chấm điểm thành công!
            </h3>
            <p className="text-gray-600">Cảm ơn bạn đã hoàn thành đánh giá.</p>
          </div>
          <div className="text-center">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ErrorModal = () => {
    if (!showErrorModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mt-4 mb-2">chấm điểm thất bại!</h3>
            <p className="text-gray-600">Đã có lỗi xảy ra. Vui lòng thử lại.</p>
          </div>
          <div className="text-center">
            <button
              onClick={() => setShowErrorModal(false)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Thêm component ValidationModal
  const ValidationModal = () => {
    if (!showValidationModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mt-4 mb-2">
              Chưa chấm điểm đầy đủ!
            </h3>
            <p className="text-gray-600">
              Vui lòng chấm điểm đầy đủ cho các team:
            </p>
            <div className="mt-2 space-y-1">
              {validationErrors.map((teamId) => (
                <div key={teamId} className="font-medium text-yellow-600">
                  {teamId}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={() => setShowValidationModal(false)}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handlePrevTeam = () => {
    const teamIds = Object.keys(scores);
    console.log("🚀 ~ handlePrevTeam ~ teamIds:", teamIds)
    const currentIndex = teamIds.indexOf(selectedTeam);
    if (currentIndex > 0) {
      setSelectedTeam(teamIds[currentIndex - 1]);
    }
  };

  const handleNextTeam = () => {
    const teamIds = Object.keys(scores);
    const currentIndex = teamIds.indexOf(selectedTeam);
    if (currentIndex < teamIds.length - 1) {
      setSelectedTeam(teamIds[currentIndex + 1]);
    }
  };

  return (
    <div className="p-4 max-w-full">
      <style>{rangeStyles}</style>
      <h1 className="text-gray-900 text-6xl dark:text-white text-center my-10 font-black">
        CHẤM ĐIỂM
      </h1>

      {/* Team buttons - Responsive grid */}
      <div className="container mx-auto">
        <div className="grid grid-cols-3 md:flex md:space-x-4 gap-2 mb-4">
          {Object.keys(scores).map((teamId) => (
            <button
              key={teamId}
              onClick={() => setSelectedTeam(teamId)}
              className={getTeamButtonStyle(teamId)}
            >
              {teamId}
              {isTeamFullyScored(teamId) && (
                <span className="ml-1 text-sm">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Scoring Form */}
        <div className="space-y-4">{renderScoreInputs()}</div>
      </div>
      <ConfirmModal />
      <SuccessModal />
      <ErrorModal />
      <ValidationModal />
    </div>
  );
};

export default Dashboard;
