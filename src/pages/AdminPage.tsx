// src/pages/AdminPage.tsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import styled from "styled-components";
//css icon-rank thêm box-shadow
const IconRank = styled.span`
  box-shadow: 5px 5px 8px 1px rgba(0, 0, 0, 0.2);
`;
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

interface Account {
  email: string;
  name: string;
  role: string;
}

const AdminPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [scores, setScores] = useState<Scores>({});
  const [loading, setLoading] = useState(true);
  const [selectedTeamDetail, setSelectedTeamDetail] = useState<string | null>(
    null
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "bgk")) {
      navigate("/login");
      return;
    }
    fetchData();
    fetchAccounts();
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

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/api/get-accounts");
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleResetScores = async () => {
    try {
      await api.post("/api/reset-scores");
      await fetchData();
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error resetting scores:", error);
      setShowErrorModal(true);
    }
  };

  const calculateCategoryScore = (scores: Score, category: keyof Score) => {
    if (category === "submitted") return 0;
    const values = Object.values(scores[category] as Record<string, number>);
    return values.reduce((sum, score) => sum + score, 0);
  };

  const calculateTeamResults = (): TeamResult[] => {
    const results = Object.entries(scores).map(([teamId, teamData]) => {
      const judgeScores = Object.entries(teamData.scores);

      // Categorize scores by role
      const roleScores = {
        admin: [] as number[],
        bgk: [] as number[],
        member: [] as number[],
      };

      judgeScores.forEach(([email, score]) => {
        if (!score.submitted) return;

        const account = accounts.find((acc) => acc.email === email);
        if (!account) return;

        const totalScore =
          calculateCategoryScore(score, "branding") +
          calculateCategoryScore(score, "content") +
          calculateCategoryScore(score, "technical") +
          calculateCategoryScore(score, "ai") +
          calculateCategoryScore(score, "presentation");

        switch (account.role) {
          case "admin":
            roleScores.admin.push(totalScore);
            break;
          case "bgk":
            roleScores.bgk.push(totalScore);
            break;
          case "member":
            roleScores.member.push(totalScore);
            break;
        }
      });

      // Calculate average score for each role
      const getAverageScore = (scores: number[]) =>
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;

      const adminAvg = getAverageScore(roleScores.admin);
      const bgkAvg = getAverageScore(roleScores.bgk);
      const memberAvg = getAverageScore(roleScores.member);

      // Calculate total score according to the formula: 50% Admin + 50% BGK + 50% Member
      const averageScore = adminAvg * 0.5 + bgkAvg * 0.5 + memberAvg * 0.5;

      // Calculate score for each category similarly
      const calculateCategoryByRole = (category: keyof Score) => {
        const adminCatAvg = getAverageScore(
          judgeScores
            .filter(
              ([email]) =>
                accounts.find((acc) => acc.email === email)?.role === "admin" &&
                teamData.scores[email].submitted
            )
            .map(([_, score]) => calculateCategoryScore(score, category))
        );

        const bgkCatAvg = getAverageScore(
          judgeScores
            .filter(
              ([email]) =>
                accounts.find((acc) => acc.email === email)?.role === "bgk" &&
                teamData.scores[email].submitted
            )
            .map(([_, score]) => calculateCategoryScore(score, category))
        );

        const memberCatAvg = getAverageScore(
          judgeScores
            .filter(
              ([email]) =>
                accounts.find((acc) => acc.email === email)?.role ===
                  "member" && teamData.scores[email].submitted
            )
            .map(([_, score]) => calculateCategoryScore(score, category))
        );

        return adminCatAvg * 0.5 + bgkCatAvg * 0.5 + memberCatAvg * 0.5;
      };

      return {
        teamId,
        averageScore,
        brandingScore: calculateCategoryByRole("branding"),
        contentScore: calculateCategoryByRole("content"),
        technicalScore: calculateCategoryByRole("technical"),
        aiScore: calculateCategoryByRole("ai"),
        presentationScore: calculateCategoryByRole("presentation"),
        submittedCount: judgeScores.filter(([_, score]) => score.submitted)
          .length,
        totalJudges: judgeScores.length,
      };
    });

    return results.sort((a, b) => b.averageScore - a.averageScore);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const teamResults = calculateTeamResults();

  const renderTeamDetail = (teamId: string) => {
    const teamData = scores[teamId];
    if (!teamData) return null;

    return (
      <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Chi tiết điểm {teamId}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border-2 border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên giám khảo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhận diện
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kỹ thuật
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thuyết trình
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng điểm
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(teamData.scores).map(([email, score]) => {
                const account = accounts.find((acc) => acc.email === email);
                return (
                  <tr key={email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {account?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          account?.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : account?.role === "bgk"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {account?.role || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {calculateCategoryScore(score, "branding")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {calculateCategoryScore(score, "content")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {calculateCategoryScore(score, "technical")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {calculateCategoryScore(score, "ai")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {calculateCategoryScore(score, "presentation")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {(
                        calculateCategoryScore(score, "branding") +
                        calculateCategoryScore(score, "content") +
                        calculateCategoryScore(score, "technical") +
                        calculateCategoryScore(score, "ai") +
                        calculateCategoryScore(score, "presentation")
                      ).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          score.submitted
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {score.submitted ? "Đã chấm" : "Chưa chấm"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ResetModal = () => {
    if (!showResetModal) return null;

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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mt-4 mb-2">Xác nhận reset điểm</h3>
            <p className="text-gray-600">
              Bạn có chắc chắn muốn reset tất cả điểm về 0? Hành động này không
              thể hoàn tác.
            </p>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                setShowResetModal(false);
                handleResetScores();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Xác nhận Reset
            </button>
          </div>
        </div>
      </div>
    );
  };

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
              Reset điểm thành công!
            </h3>
            <p className="text-gray-600">Tất cả điểm đã được reset về 0.</p>
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
            <h3 className="text-xl font-bold mt-4 mb-2">
              Reset điểm thất bại!
            </h3>
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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bảng Xếp Hạng</h1>
        {user?.role === "admin" && (
          <button
            onClick={() => setShowResetModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Reset điểm
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 border-2 border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Xếp hạng
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhận diện (20đ)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nội dung (30đ)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kỹ thuật (15đ)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                AI (20đ)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thuyết trình (15đ)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng điểm
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đã chấm
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamResults.map((result, index) => (
              <tr
                key={result.teamId}
                className={`${
                  index < 3 && selectedTeamDetail !== result.teamId
                    ? "bg-yellow-50"
                    : ""
                } ${
                  selectedTeamDetail === result.teamId ? "bg-blue-100" : ""
                } cursor-pointer hover:bg-blue-50`}
                onClick={() =>
                  setSelectedTeamDetail(
                    selectedTeamDetail === result.teamId ? null : result.teamId
                  )
                }
              >
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <IconRank
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full icon-rank ${
                      index === 0
                        ? "bg-yellow-400"
                        : index === 1
                        ? "bg-gray-300"
                        : index === 2
                        ? "bg-yellow-600"
                        : "bg-gray-100"
                    } font-bold`}
                  >
                    {index + 1}
                  </IconRank>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                  {result.teamId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {result.brandingScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {result.contentScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {result.technicalScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {result.aiScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {result.presentationScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center font-bold">
                  {result.averageScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      result.submittedCount === result.totalJudges
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {result.submittedCount}/{result.totalJudges}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTeamDetail && renderTeamDetail(selectedTeamDetail)}
      <ResetModal />
      <SuccessModal />
      <ErrorModal />
    </div>
  );
};

export default AdminPage;
