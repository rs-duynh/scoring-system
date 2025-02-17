// src/pages/AdminPage.tsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

interface Score {
  judge?: number;
  member?: number;
  interaction?: number;
  submitted: boolean;
}

interface ExamScores {
  scores: {
    [email: string]: Score;
  };
  interactionScore?: number;
}

interface Scores {
  [examId: string]: ExamScores;
}

const AdminPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [scores, setScores] = useState<Scores>({});
  const [, setIsLocked] = useState(false);
  const [, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (!user || (user.role !== "admin" && user.role !== "bgk")) {
      navigate("/login");
      return;
    }

    // Fetch dữ liệu ban đầu
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [scoresRes, statusRes] = await Promise.all([
        api.get("/api/get-scores"),
        api.get("/api/scoring-status"),
      ]);

      setScores(scoresRes.data);
      setIsLocked(statusRes.data.isLocked);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInteractionScoreChange = (examId: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [examId]: {
        ...prev[examId],
        interactionScore: value,
      },
    }));
  };

  const calculateFinalScore = (examData: ExamScores) => {
    // Tính tổng điểm BGK (50%)
    const judgeScores = Object.values(examData.scores)
      .filter((score) => score.judge !== undefined && score.submitted)
      .map((score) => score.judge as number)
      .reduce((a, b) => a + b, 0);

    // Tính tổng điểm Member (25%)
    const memberScores = Object.values(examData.scores)
      .filter((score) => score.member !== undefined && score.submitted)
      .map((score) => score.member as number)
      .reduce((a, b) => a + b, 0);

    // Lấy điểm tương tác (25%)
    const interactionScore = examData.interactionScore || 0;

    return judgeScores * 0.5 + memberScores * 0.25 + interactionScore * 0.25;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="overflow-x-auto">
        {Object.entries(scores).map(([examId, examData]) => (
          <div key={examId} className="mb-8">
            <h2 className="text-xl font-bold mb-2">{examId}</h2>
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Judge Score</th>
                  <th className="border p-2">Member Score</th>
                  <th className="border p-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(examData.scores).map(([email, score]) => (
                  <tr key={email}>
                    <td className="border p-2">{email}</td>
                    <td className="border p-2 text-center">
                      {score.judge || "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {score.member || "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {score.submitted ? "✓" : "-"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={2} className="border p-2 font-bold">
                    Interaction Score (25%):
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={examData.interactionScore || 0}
                      onChange={(e) =>
                        handleInteractionScoreChange(
                          examId,
                          Number(e.target.value)
                        )
                      }
                      className="w-20 p-1 text-center border rounded"
                    />
                  </td>
                  <td className="border p-2"></td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="border p-2 font-bold text-right">
                    Final Score (50% BGK + 25% Member + 25% Interaction):
                  </td>
                  <td className="border p-2 text-center font-bold">
                    {calculateFinalScore(examData).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
