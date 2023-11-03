// useProfileData.ts
import { useAuth } from 'app/hooks';
import { saveData } from 'database/client/save';
import { useState } from 'react';
import { useUserData } from 'user/hooks/useUserData';

export const useProfileData = (customId: string) => {
  const data = useUserData(customId);
  const auth = useAuth();
  const [formData, setFormData] = useState(data);
  const [error, setError] = useState<string | null>(null);

  const handleSaveClick = async () => {
    try {
      const flags = { isJSON: true };
      await saveData(auth.user?.userId, formData, customId, flags);
      setError(null);
    } catch (error) {
      console.error('保存失败:', error);
      setError('保存失败');
    }
  };

  return { formData, setFormData, handleSaveClick, error };
};
