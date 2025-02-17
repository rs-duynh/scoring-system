import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ScoresState = {
  scores: Record<string, { judge: number; member: number; interaction: number }>;
};

const initialState: ScoresState = {
  scores: {},
};

const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    updateScore: (state, action: PayloadAction<{ examId: string; judge: number; member: number; interaction: number }>) => {
      state.scores[action.payload.examId] = {
        judge: action.payload.judge,
        member: action.payload.member,
        interaction: action.payload.interaction,
      };
    },
  },
});

export const { updateScore } = scoreSlice.actions;
export default scoreSlice.reducer;
