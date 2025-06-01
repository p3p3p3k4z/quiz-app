    // src/components/QuestionCard.tsx

    import { QuestionData } from '@/interfaces/quiz'; // Importa la interfaz

    interface QuestionCardProps {
      question: QuestionData;
    }

    export default function QuestionCard({ question }: QuestionCardProps) {
      return (
        <div key={question.id} className="mb-8 p-6 bg-blue-50 rounded-xl shadow-md border border-blue-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-baseline">
            {question.question_text}
            {question.topic && (
              <span className="ml-3 text-sm font-medium text-blue-700 px-3 py-1 bg-blue-200 rounded-full shadow-sm">
                {question.topic}
              </span>
            )}
          </h2>
          <ul className="space-y-3">
            {question.answers.map((qa) => (
              <li
                key={qa.answer.id}
                className={`p-4 rounded-lg border transition-all duration-300 ease-in-out
                  ${qa.is_correct ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}
                  hover:shadow-md`}
              >
                <span className={`text-base ${qa.is_correct ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                  {qa.answer.answer_text}
                </span>
                {qa.is_correct && (
                  <span className="ml-2 text-xs text-green-600 font-bold bg-green-200 px-2 py-0.5 rounded-full">
                    (Correcta)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    