'use client';
import { useContext, useState, useCallback, useMemo } from "react";
import { createContext } from "react";
import type { QuestionsListApiResponse, Question } from "@/app/admin/questionbank/types/QuestionTypes.d.ts";

interface QueryParams {
    page?: number;
    limit?: number;
    subject?: string;
    topic?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    search?: string;
    tags?: string[];
    authorId?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'subject' | 'difficulty';
    sortOrder?: 'asc' | 'desc';
}

interface FilterOptions {
    subjects: string[];
    topics: string[];
    difficulties: string[];
    tags: string[];
}

type QuestionContextType = {
    questions: Question[] | null;
    setQuestions: React.Dispatch<React.SetStateAction<Question[] | null>>;
    fetchQuestionData: (params?: QueryParams) => Promise<void>;
    fetchFilterOptions: () => Promise<FilterOptions>;
    setQuestionApiResponse: React.Dispatch<React.SetStateAction<QuestionsListApiResponse | null>>;
    questionApiResponse: QuestionsListApiResponse | null;
    loading: boolean;
};

const QuestionContext = createContext<QuestionContextType | null>(null);

export function QuestionContextProvider({children}: {children: React.ReactNode}) {
    const [questions, setQuestions] = useState<Question[] | null>(null);
    const [questionApiResponse, setQuestionApiResponse] = useState<QuestionsListApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false); 

    // ✅ FIXED: Memoize the fetch function to prevent recreating on every render
    const fetchQuestionData = useCallback(async (params?: QueryParams): Promise<void> => {
        try {
            setLoading(true);
            const url = new URL('/api/questions', window.location.origin);
            
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        if (Array.isArray(value)) {
                            url.searchParams.append(key, value.join(','));
                        } else {
                            url.searchParams.append(key, String(value));
                        }
                    }
                });
            }

            console.log('🌐 Context making API call to:', url.toString()); // Debug log

            const response = await fetch(url.toString(), {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                setQuestions(data.data.questions);
                setQuestionApiResponse(data);
                console.log('✅ Context API call successful, got', data.data.questions?.length, 'questions');
            } else {
                throw new Error(data.error || 'Failed to fetch questions');
            }
        } catch (error) {
            console.error("❌ Context API error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []); // ✅ Empty dependency array since the function doesn't depend on any props/state

    // Fetch all available filter options (not paginated)
    const fetchFilterOptions = useCallback(async (): Promise<FilterOptions> => {
        try {
            const url = new URL('/api/questions/filters', window.location.origin);
            
            console.log('🌐 Context fetching filter options from:', url.toString());

            const response = await fetch(url.toString(), {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                console.log('✅ Context filter options fetched successfully');
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to fetch filter options');
            }
        } catch (error) {
            console.error("❌ Context filter options error:", error);
            // Return empty arrays as fallback
            return {
                subjects: [],
                topics: [],
                difficulties: ['EASY', 'MEDIUM', 'HARD'],
                tags: []
            };
        }
    }, []);

    // ✅ FIXED: Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        questions, 
        setQuestions, 
        fetchQuestionData, 
        questionApiResponse, 
        setQuestionApiResponse, 
        loading 
    }), [
        questions, 
        setQuestions, 
        fetchQuestionData, 
        questionApiResponse, 
        setQuestionApiResponse, 
        loading
    ]);

    return (
        <QuestionContext.Provider value={contextValue}>
            {children}
        </QuestionContext.Provider>
    );
}

export const useQuestionsContextData = () => {
    const context = useContext(QuestionContext);
    if (!context) {
        throw new Error('useQuestionsContextData must be used within a QuestionContextProvider');
    }
    return context;
};
