import { RootState } from 'app/store';

export const selectMessage = (state: RootState) => state.message;
