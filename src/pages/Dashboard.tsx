import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../utils/axios";

// Thêm style vào phần head của component
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

// CSS cho range input
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

const Dashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>("Team 1");
  const [scores, setScores] = useState<any>({});
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    if (Object.keys(scores).length > 0 && !selectedTeam) {
      setSelectedTeam("Team 1");
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

    // Kiểm tra tất cả các mục đã được chấm điểm
    return Object.entries(teamScores).every(([category, values]: any) => {
      if (category === "submitted") return true;
      return Object.values(values).every((score: any) => score > 0);
    });
  };

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async () => {
    const unScoredTeams = Object.keys(scores).filter(
      (teamId) => !isTeamFullyScored(teamId)
    );

    if (unScoredTeams.length > 0) {
      setValidationErrors(unScoredTeams);
      alert(
        `Vui lòng chấm điểm đầy đủ cho các team: ${unScoredTeams.join(", ")}`
      );
      return;
    }

    try {
      const updatedScores = {
        ...scores,
        [selectedTeam as string]: {
          scores: {
            ...scores[selectedTeam as string].scores,
            [user.email]: {
              ...scores[selectedTeam as string].scores[user.email],
              submitted: true,
            },
          },
        },
      };

      await api.post("/api/submit-scores", { scores: updatedScores });
      setScores(updatedScores);
      setValidationErrors([]);
      alert("Scores submitted successfully!");
    } catch (error) {
      console.error("Error submitting scores:", error);
      alert("Failed to submit scores");
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

  const renderScoreInputs = () => {
    if (!selectedTeam) return null;

    const teamScores = scores[selectedTeam]?.scores[user.email];
    if (!teamScores) return null;

    return (
      <div className="space-y-6">
        {/* Dấu hiệu nhận diện thương hiệu */}
        <div className="border p-3 md:p-4 rounded">
          <h3 className="font-bold mb-4 text-sm md:text-base">
            Dấu hiệu nhận diện thương hiệu (20 điểm)
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Trên 50% nhân vật mặc đồng phục hoặc đeo thẻ nhân viên xuất hiện
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="10"
                  value={teamScores.branding.uniformity}
                  onChange={(e) =>
                    handleScoreChange(
                      "branding",
                      "uniformity",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.branding.uniformity,
                    10
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.branding.uniformity, 10)} 0%,
                      ${getRangeColor(teamScores.branding.uniformity, 10)} ${
                      (teamScores.branding.uniformity / 10) * 100
                    }%,
                      #E5E7EB ${(teamScores.branding.uniformity / 10) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.branding.uniformity}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Có sử dụng vật phẩm nhận diện như sổ tay, ly nước,...
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="10"
                  value={teamScores.branding.props}
                  onChange={(e) =>
                    handleScoreChange(
                      "branding",
                      "props",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.branding.props,
                    10
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.branding.props, 10)} 0%,
                      ${getRangeColor(teamScores.branding.props, 10)} ${
                      (teamScores.branding.props / 10) * 100
                    }%,
                      #E5E7EB ${(teamScores.branding.props / 10) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.branding.props}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung video */}
        <div className="border p-3 md:p-4 rounded">
          <h3 className="font-bold mb-4 text-sm md:text-base">
            30 điểm - Nội dung video (Thang điểm 10 mỗi mục)
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Có giới thiệu, tôn vinh về công ty, slogan, văn hóa bộ phận của
                mình
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="10"
                  value={teamScores.content.introduction}
                  onChange={(e) =>
                    handleScoreChange(
                      "content",
                      "introduction",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.content.introduction,
                    10
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.content.introduction, 10)} 0%,
                      ${getRangeColor(teamScores.content.introduction, 10)} ${
                      (teamScores.content.introduction / 10) * 100
                    }%,
                      #E5E7EB ${(teamScores.content.introduction / 10) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.content.introduction}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Liên quan chủ đề Unbreakable 17 và chủ đề về ngành IT.
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="10"
                  value={teamScores.content.theme}
                  onChange={(e) =>
                    handleScoreChange(
                      "content",
                      "theme",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.content.theme,
                    10
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.content.theme, 10)} 0%,
                      ${getRangeColor(teamScores.content.theme, 10)} ${
                      (teamScores.content.theme / 10) * 100
                    }%,
                      #E5E7EB ${(teamScores.content.theme / 10) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.content.theme}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Nội dung truyền tải: độc đáo, sáng tạo, thẩm mỹ, hài hước, trao
                đi nhiều giá trị,...
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="10"
                  value={teamScores.content.creativity}
                  onChange={(e) =>
                    handleScoreChange(
                      "content",
                      "creativity",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.content.creativity,
                    10
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.content.creativity, 10)} 0%,
                      ${getRangeColor(teamScores.content.creativity, 10)} ${
                      (teamScores.content.creativity / 10) * 100
                    }%,
                      #E5E7EB ${(teamScores.content.creativity / 10) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.content.creativity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kỹ thuật */}
        <div className="border p-3 md:p-4 rounded">
          <h3 className="font-bold mb-4 text-sm md:text-base">
            15 điểm - Kỹ thuật (Thang điểm 5 mỗi mục)
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Hiệu ứng video ấn tượng, chuyển cảnh hợp lý, mượt mà
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="5"
                  value={teamScores.technical.videoEffect}
                  onChange={(e) =>
                    handleScoreChange(
                      "technical",
                      "videoEffect",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.technical.videoEffect,
                    5
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.technical.videoEffect, 5)} 0%,
                      ${getRangeColor(teamScores.technical.videoEffect, 5)} ${
                      (teamScores.technical.videoEffect / 5) * 100
                    }%,
                      #E5E7EB ${(teamScores.technical.videoEffect / 5) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.technical.videoEffect}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Video rõ nét, cảnh quay, nhân vật rõ ràng, màu sắc đẹp
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="5"
                  value={teamScores.technical.videoQuality}
                  onChange={(e) =>
                    handleScoreChange(
                      "technical",
                      "videoQuality",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.technical.videoQuality,
                    5
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.technical.videoQuality, 5)} 0%,
                      ${getRangeColor(teamScores.technical.videoQuality, 5)} ${
                      (teamScores.technical.videoQuality / 5) * 100
                    }%,
                      #E5E7EB ${(teamScores.technical.videoQuality / 5) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.technical.videoQuality}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Âm thanh rõ nét, có sự cân nhắc nhạc nền phù hợp
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="5"
                  value={teamScores.technical.audioQuality}
                  onChange={(e) =>
                    handleScoreChange(
                      "technical",
                      "audioQuality",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.technical.audioQuality,
                    5
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.technical.audioQuality, 5)} 0%,
                      ${getRangeColor(teamScores.technical.audioQuality, 5)} ${
                      (teamScores.technical.audioQuality / 5) * 100
                    }%,
                      #E5E7EB ${(teamScores.technical.audioQuality / 5) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.technical.audioQuality}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ứng dụng AI */}
        <div className="border p-3 md:p-4 rounded">
          <h3 className="font-bold mb-4 text-sm md:text-base">
            20 điểm - Ứng dụng AI (Thang điểm 5 mỗi mục)
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                AI - cải thiện chất lượng hình ảnh (rõ nét, thẩm mỹ, màu sắc,
                chuyển động...)
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="5"
                  value={teamScores.ai.imageQuality}
                  onChange={(e) =>
                    handleScoreChange(
                      "ai",
                      "imageQuality",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.ai.imageQuality,
                    5
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.ai.imageQuality, 5)} 0%,
                      ${getRangeColor(teamScores.ai.imageQuality, 5)} ${
                      (teamScores.ai.imageQuality / 5) * 100
                    }%,
                      #E5E7EB ${(teamScores.ai.imageQuality / 5) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.ai.imageQuality}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                AI - cải thiện chất lượng âm thanh (lồng tiếng, điều chỉnh...)
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="5"
                  value={teamScores.ai.audioQuality}
                  onChange={(e) =>
                    handleScoreChange(
                      "ai",
                      "audioQuality",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.ai.audioQuality,
                    5
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.ai.audioQuality, 5)} 0%,
                      ${getRangeColor(teamScores.ai.audioQuality, 5)} ${
                      (teamScores.ai.audioQuality / 5) * 100
                    }%,
                      #E5E7EB ${(teamScores.ai.audioQuality / 5) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.ai.audioQuality}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                AI - hỗ trợ lên ý tưởng kịch bản, câu thoại, nội dung
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="5"
                  value={teamScores.ai.scriptIdea}
                  onChange={(e) =>
                    handleScoreChange(
                      "ai",
                      "scriptIdea",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.ai.scriptIdea,
                    5
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.ai.scriptIdea, 5)} 0%,
                      ${getRangeColor(teamScores.ai.scriptIdea, 5)} ${
                      (teamScores.ai.scriptIdea / 5) * 100
                    }%,
                      #E5E7EB ${(teamScores.ai.scriptIdea / 5) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.ai.scriptIdea}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                AI - sáng tạo đột phá, không trùng lặp với các nội dung phổ biến
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="5"
                  value={teamScores.ai.creativity}
                  onChange={(e) =>
                    handleScoreChange(
                      "ai",
                      "creativity",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.ai.creativity,
                    5
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.ai.creativity, 5)} 0%,
                      ${getRangeColor(teamScores.ai.creativity, 5)} ${
                      (teamScores.ai.creativity / 5) * 100
                    }%,
                      #E5E7EB ${(teamScores.ai.creativity / 5) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.ai.creativity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thuyết trình */}
        <div className="border p-3 md:p-4 rounded">
          <h3 className="font-bold mb-4 text-sm md:text-base">
            15 điểm - Thuyết trình (Thang điểm 5 mỗi mục)
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Giọng nói rõ ràng, âm lượng phù hợp, tốc độ vừa phải
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="5"
                  value={teamScores.presentation.speaking}
                  onChange={(e) =>
                    handleScoreChange(
                      "presentation",
                      "speaking",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.presentation.speaking,
                    5
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.presentation.speaking, 5)} 0%,
                      ${getRangeColor(teamScores.presentation.speaking, 5)} ${
                      (teamScores.presentation.speaking / 5) * 100
                    }%,
                      #E5E7EB ${(teamScores.presentation.speaking / 5) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.presentation.speaking}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Người thuyết trình tự tin, có tương tác với khán giả
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="5"
                  value={teamScores.presentation.confidence}
                  onChange={(e) =>
                    handleScoreChange(
                      "presentation",
                      "confidence",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.presentation.confidence,
                    5
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(
                        teamScores.presentation.confidence,
                        5
                      )} 0%,
                      ${getRangeColor(teamScores.presentation.confidence, 5)} ${
                      (teamScores.presentation.confidence / 5) * 100
                    }%,
                      #E5E7EB ${
                        (teamScores.presentation.confidence / 5) * 100
                      }%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.presentation.confidence}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <label className="md:w-2/3 text-sm md:text-base">
                Thông điệp rõ ràng, tập trung, không lan man
              </label>
              <div className="flex items-center space-x-2 md:w-1/3">
                <input
                  disabled={teamScores.submitted}
                  type="range"
                  min="1"
                  max="5"
                  value={teamScores.presentation.timing}
                  onChange={(e) =>
                    handleScoreChange(
                      "presentation",
                      "timing",
                      parseInt(e.target.value)
                    )
                  }
                  className={`w-full h-7 border-2 border-gray-300 rounded-lg appearance-none cursor-pointer range-lg   ${getRangeColor(
                    teamScores.presentation.timing,
                    5
                  )}`}
                  style={{
                    background: `linear-gradient(to right, 
                      ${getRangeColor(teamScores.presentation.timing, 5)} 0%,
                      ${getRangeColor(teamScores.presentation.timing, 5)} ${
                      (teamScores.presentation.timing / 5) * 100
                    }%,
                      #E5E7EB ${(teamScores.presentation.timing / 5) * 100}%,
                      #E5E7EB 100%)`,
                  }}
                />
                <span className="w-8 text-center text-sm md:text-base font-black text-gray-900">
                  {teamScores.presentation.timing}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="w-1/3 h-55 text-white text-3xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            disabled={teamScores.submitted}
          >
            {teamScores.submitted ? "Đã nộp" : "Nộp điểm"}
          </button>
        </div>
      </div>
    );
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
    </div>
  );
};

export default Dashboard;
