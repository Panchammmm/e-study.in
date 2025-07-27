'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useApiAuth';
import { useExams, useQuestions, useUsers, useAdmin } from '@/hooks/useApiServices';
import { Exam, Question, User } from '@/constants/types';
import { AdminStats, ExamFilter } from '../types';

export const useDashboardData = () => {
  const { user } = useAuth();
  
  // API hooks
  const examsApi = useExams();
  const questionsApi = useQuestions();
  const usersApi = useUsers();
  const adminApi = useAdmin();
  
  // Use ref to track if data has been loaded to prevent infinite loops
  const dataLoadedRef = useRef(false);
  
  // Local state
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState<ExamFilter>('all');
  const [refreshingData, setRefreshingData] = useState(false);

  // Function to fetch exam data based on filter
  const fetchExamsByFilter = async (filter: ExamFilter) => {
    if (!user?.id) return;
    
    try {
      setRefreshingData(true);
      console.log(`🔄 Fetching ${filter} exams...`);
      
      let examResult;
      
      if (filter === 'all') {
        examResult = await examsApi.getAllExams({ page: 1, limit: 100, published: false });
      } else if (filter === 'published') {
        examResult = await examsApi.getAllExams({ page: 1, limit: 100, published: true });
      } else if (filter === 'draft') {
        examResult = await examsApi.getAllExams({ page: 1, limit: 100, published: false });
      }
      
      if (examResult) {
        console.log(`✅ ${filter} Exams API Response:`, examResult);
        const examData = examResult as { data: { exams: Exam[] } };
        const examsArray = examData.data?.exams || [];

        let filteredExams = examsArray;
        
        if (filter === 'draft') {
          filteredExams = examsArray.filter(exam => exam.isPublished === false || exam.isDraft === true);
        } else if (filter === 'all') {
          filteredExams = examsArray;
        }
        
        const sortedExams = Array.isArray(filteredExams) ? 
          filteredExams.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()) : 
          [];
        
        console.log(`✅ ${filter} exams:`, sortedExams);
        setExams(sortedExams);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch ${filter} exams:`, error);
    } finally {
      setRefreshingData(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (!user?.id || dataLoadedRef.current) return;

    const loadData = async () => {
      try {
        setLoading(true);
        dataLoadedRef.current = true;
        
        console.log('🔄 Loading admin dashboard data...');
        
        const [examResult, questionResult, usersResult, statsResult] = await Promise.allSettled([
          examsApi.getAllExams({ page: 1, limit: 100 }),
          questionsApi.getAllQuestions({ page: 1, limit: 100 }),
          usersApi.getAllUsers({ page: 1, limit: 50 }),
          adminApi.getDashboardStats()
        ]);

        // Handle exams result
        if (examResult.status === 'fulfilled') {
          console.log('✅ Admin Exams API Response:', examResult.value);
          const examData = examResult.value as { data: { exams: Exam[] } };
          const examsArray = examData.data?.exams || [];
          const sortedExams = Array.isArray(examsArray) ? 
            examsArray.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()) : 
            [];
          setExams(sortedExams);
        } else {
          console.error('❌ Failed to load exams:', examResult.reason);
          setExams([]);
        }

        // Handle questions result
        if (questionResult.status === 'fulfilled') {
          console.log('Admin Questions API Response:', questionResult.value);
          const questionData = questionResult.value as { data: { questions: Question[] } };
          const questionsArray = questionData.data?.questions || [];
          setQuestions(Array.isArray(questionsArray) ? questionsArray : []);
        } else {
          console.error('Failed to load questions:', questionResult.reason);
          setQuestions([]);
        }

        // Handle users result
        if (usersResult.status === 'fulfilled') {
          console.log('Admin Users API Response:', usersResult.value);
          const userData = usersResult.value as { data: User[] };
          setUsers(Array.isArray(userData.data) ? userData.data : []);
        } else {
          console.error('Failed to load users:', usersResult.reason);
          setUsers([]);
        }

        // Handle admin stats result
        if (statsResult.status === 'fulfilled') {
          console.log('Admin Stats API Response:', statsResult.value);
          const statsData = statsResult.value as { 
            data: { 
              overview: {
                totalUsers: number;
                totalStudents: number;
                totalAdmins: number;
                totalExams: number;
                totalQuestions: number;
                publishedExams: number;
                draftExams: number;
                totalSubmissions: number;
                completedSubmissions: number;
              }
            } 
          };
          const overview = statsData.data?.overview;
          if (overview) {
            setAdminStats({
              totalUsers: overview.totalUsers,
              totalStudents: overview.totalStudents,
              totalAdmins: overview.totalAdmins,
              totalExams: overview.totalExams,
              totalQuestions: overview.totalQuestions,
              publishedExams: overview.publishedExams,
              draftExams: overview.draftExams,
              totalSubmissions: overview.totalSubmissions,
              completedSubmissions: overview.completedSubmissions
            });
          } else {
            setAdminStats(null);
          }
        } else {
          console.error('Failed to load admin stats:', statsResult.reason);
          setAdminStats(null);
        }

      } catch (error) {
        console.error("Error loading admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  return {
    user,
    exams,
    setExams,
    questions,
    users,
    adminStats,
    setAdminStats,
    loading,
    examFilter,
    setExamFilter,
    refreshingData,
    fetchExamsByFilter,
    examsApi,
  };
};
