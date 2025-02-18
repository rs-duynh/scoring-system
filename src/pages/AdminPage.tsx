// src/pages/AdminPage.tsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

interface Score {
  branding: {
    uniformity: number;
    props: number;
  };
  content: {
    introduction: number;
    theme: number;
    creativity: number;
  };
  technical: {
    videoEffect: number;
    videoQuality: number;
    audioQuality: number;
  };
  ai: {
    imageQuality: number;
    audioQuality: number;
    scriptIdea: number;
    creativity: number;
  };
  presentation: {
    speaking: number;
    confidence: number;
    timing: number;
  };
  submitted: boolean;
}

interface TeamScores {
  [email: string]: Score;
}

interface Scores {
  [teamId: string]: {
    scores: TeamScores;
  };
}

interface TeamResult {
  teamId: string;
  averageScore: number;
  brandingScore: number;
  contentScore: number;
  technicalScore: number;
  aiScore: number;
  presentationScore: number;
  submittedCount: number;
  totalJudges: number;
}

const AdminPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [scores, setScores] = useState<Scores>({});
  const [loading, setLoading] = useState(true);
  const [selectedTeamDetail, setSelectedTeamDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "bgk")) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const response = await api.get("/api/get-scores");
      setScores(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetScores = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn reset tất cả điểm về 0?")) return;
    try {
      await api.post("/api/reset-scores");
      await fetchData();
      alert("Đã reset thành công!");
    } catch (error) {
      console.error("Error resetting scores:", error);
      alert("Không thể reset điểm!");
    }
  };

  const calculateCategoryScore = (scores: Score, category: keyof Score) => {
    if (category === 'submitted') return 0;
    const values = Object.values(scores[category] as Record<string, number>);
    return values.reduce((sum, score) => sum + score, 0);
  };

  const calculateTeamResults = (): TeamResult[] => {
    const results = Object.entries(scores).map(([teamId, teamData]) => {
      const judgeScores = Object.values(teamData.scores);
      const totalJudges = judgeScores.length;
      const submittedCount = judgeScores.filter(score => score.submitted).length;

      const totalScores = {
        branding: 0,
        content: 0,
        technical: 0,
        ai: 0,
        presentation: 0,
      };

      judgeScores.forEach(score => {
        if (score.submitted) {
          totalScores.branding += calculateCategoryScore(score, 'branding');
          totalScores.content += calculateCategoryScore(score, 'content');
          totalScores.technical += calculateCategoryScore(score, 'technical');
          totalScores.ai += calculateCategoryScore(score, 'ai');
          totalScores.presentation += calculateCategoryScore(score, 'presentation');
        }
      });

      const submittedJudges = Math.max(submittedCount, 1);
      const averageScore = (
        totalScores.branding +
        totalScores.content +
        totalScores.technical +
        totalScores.ai +
        totalScores.presentation
      ) / submittedJudges;

      return {
        teamId,
        averageScore,
        brandingScore: totalScores.branding / submittedJudges,
        contentScore: totalScores.content / submittedJudges,
        technicalScore: totalScores.technical / submittedJudges,
        aiScore: totalScores.ai / submittedJudges,
        presentationScore: totalScores.presentation / submittedJudges,
        submittedCount,
        totalJudges
      };
    });

    return results.sort((a, b) => b.averageScore - a.averageScore);
  };

  if (loading) return <div className="p-4">Đang tải...</div>;

  const teamResults = calculateTeamResults();

  const renderTeamDetail = (teamId: string) => {
    console.log("🚀 ~ renderTeamDetail ~ teamId:", teamId)
    const teamData = scores[teamId];
    console.log("🚀 ~ renderTeamDetail ~ teamData:", teamData)
    if (!teamData) return null;

    return (
      <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Chi tiết điểm {teamId}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giám khảo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhận diện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kỹ thuật
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thuyết trình
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(teamData.scores).map(([email, score]) => (
                <tr key={email} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {calculateCategoryScore(score, 'branding')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {calculateCategoryScore(score, 'content')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {calculateCategoryScore(score, 'technical')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {calculateCategoryScore(score, 'ai')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {calculateCategoryScore(score, 'presentation')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(
                      calculateCategoryScore(score, 'branding') +
                      calculateCategoryScore(score, 'content') +
                      calculateCategoryScore(score, 'technical') +
                      calculateCategoryScore(score, 'ai') +
                      calculateCategoryScore(score, 'presentation')
                    ).toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      score.submitted
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {score.submitted ? "Đã chấm" : "Chưa chấm"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bảng Xếp Hạng</h1>
        {user?.role === "admin" && (
          <button
            onClick={handleResetScores}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Reset điểm
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Xếp hạng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhận diện (20đ)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nội dung (30đ)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kỹ thuật (15đ)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AI (20đ)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thuyết trình (15đ)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng điểm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đã chấm
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamResults.map((result, index) => (
              <tr 
                key={result.teamId} 
                className={`${index < 3 ? 'bg-yellow-50' : ''} cursor-pointer hover:bg-gray-50`}
                onClick={() => setSelectedTeamDetail(selectedTeamDetail === result.teamId ? null : result.teamId)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                    index === 0 ? 'bg-yellow-400' :
                    index === 1 ? 'bg-gray-300' :
                    index === 2 ? 'bg-yellow-600' : 'bg-gray-100'
                  } font-bold`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {result.teamId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.brandingScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.contentScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.technicalScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.aiScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.presentationScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">
                  {result.averageScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    result.submittedCount === result.totalJudges
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {result.submittedCount}/{result.totalJudges}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTeamDetail && renderTeamDetail(selectedTeamDetail)}
    </div>
  );
};

export default AdminPage;
