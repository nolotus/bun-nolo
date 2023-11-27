import z from 'zod';
import {t} from 'i18next';

export const userFormSchema = z.object({
  username: z.string().nonempty({message: t('usernameRequired') || ''}),
  password: z.string().nonempty({message: t('passwordRequired') || ''}),
});
