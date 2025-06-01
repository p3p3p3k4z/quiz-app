// src/interfaces/quiz.ts

export interface AnswerData {
  id: number;
  answer_text: string;
}

export interface QuestionAnswerData {
  answer: AnswerData;
  is_correct: boolean;
}

export interface QuestionData {
  id: number;
  question_text: string;
  topic: string | null;
  answers: QuestionAnswerData[];
}
