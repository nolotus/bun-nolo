import {getLogger} from 'utils/logger';
import FormData from 'form-data';
import {getOpenAIHeaders} from './openAIConfig';

const openAiLogger = getLogger('OpenAI');

export async function handleAudioReq(req: Request, res: Response) {
  openAiLogger.info('Handling audio request');

  const openAIHeader = getOpenAIHeaders();
  const requestBody = req.body as any;

  if (!requestBody.file) {
    openAiLogger.error('No audio file provided');
    return res.status(400).json({error: 'No audio file provided'});
  }

  const apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
  const form = new FormData();
  form.append('model', requestBody.model || 'whisper-1');
  form.append('file', requestBody.file as Buffer, {filename: 'audio.mp3'});

  const openAIHeaders = {
    Authorization: openAIHeader.Authorization,
    ...form.getHeaders(),
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: openAIHeaders,
    body: form,
  });

  if (!response.ok) {
    openAiLogger.error(`Failed to fetch from OpenAI: ${response.statusText}`);
    throw new Error(`Failed to fetch from OpenAI: ${response.statusText}`);
  }

  const data = await response.json();
  res.json(data);
}
