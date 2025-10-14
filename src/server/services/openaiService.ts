// OpenAI Service - ported from n8n-workflows/v3/parse-gpt-response.js logic
import OpenAI from 'openai';
import { GPTResponse } from '../types/survey.types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<GPTResponse> {
  
  console.log('🤖 Calling OpenAI with prompt...');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  let parsedContent: any;
  
  try {
    parsedContent = JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to parse OpenAI response:', content);
    throw new Error('Invalid JSON response from OpenAI');
  }

  // Validate response format
  if (!parsedContent.assistantMessage) {
    console.error('❌ Invalid GPT response format:', parsedContent);
    throw new Error('Invalid GPT response format - missing assistantMessage');
  }

  console.log('✅ OpenAI response parsed successfully');

  return {
    assistantMessage: parsedContent.assistantMessage,
    component: parsedContent.component,
    nextStep: parsedContent.nextStep
  };
}

