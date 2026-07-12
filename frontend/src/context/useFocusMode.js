import { useContext } from 'react';
import { FocusModeContext } from './FocusModeContext';

export function useFocusMode() {
  return useContext(FocusModeContext);
}
