import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'todo' | 'in-progress' | 'completed';
  tags: string[];
  deadline: Date;
  hoursLogged: number;
  priority: 'low' | 'medium' | 'high';
}

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  contributionPercentage: number;
  tasksCompleted: number;
  hoursLogged: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  members: ProjectMember[];
  tasks: Task[];
  phases: string[];
  currentPhase: string;
  deadline: Date;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addTask: (projectId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  loadProjects: () => Promise<void>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load projects from Supabase with simplified query to avoid RLS recursion
  const loadProjects = async () => {
    if (!user) {
      setProjects([]);
      return;
    }

    setIsLoading(true);
    try {
      // First, get projects where user is creator
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id);

      if (ownedError) {
        console.error('Error loading owned projects:', ownedError);
        setProjects(getMockProjects());
        return;
      }

      // Then get projects where user is a member
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error loading member projects:', memberError);
      }

      const memberProjectIds = (memberProjects || []).map(m => m.project_id);
      let memberProjectsData = [];

      if (memberProjectIds.length > 0) {
        const { data: memberProjectsResult, error: memberProjectsError } = await supabase
          .from('projects')
          .select('*')
          .in('id', memberProjectIds);

        if (memberProjectsError) {
          console.error('Error loading member project details:', memberProjectsError);
        } else {
          memberProjectsData = memberProjectsResult || [];
        }
      }

      // Combine owned and member projects
      const allProjects = [...(ownedProjects || []), ...memberProjectsData];
      const uniqueProjects = allProjects.filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      );

      // Load members and tasks for each project separately
      const projectsWithDetails = await Promise.all(
        uniqueProjects.map(async (project) => {
          // Load members
          const { data: members } = await supabase
            .from('project_members')
            .select('*')
            .eq('project_id', project.id);

          // Load tasks
          const { data: tasks } = await supabase
            .from('project_tasks')
            .select('*')
            .eq('project_id', project.id);

          return {
            id: project.id,
            title: project.title,
            description: project.description || '',
            createdBy: project.created_by,
            members: (members || []).map((member: any) => ({
              id: member.id,
              name: member.name,
              email: member.email,
              role: member.role,
              avatar: member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`,
              contributionPercentage: member.contribution_percentage || 0,
              tasksCompleted: member.tasks_completed || 0,
              hoursLogged: member.hours_logged || 0
            })),
            tasks: (tasks || []).map((task: any) => ({
              id: task.id,
              title: task.title,
              description: task.description || '',
              assignedTo: task.assigned_to || '',
              status: task.status,
              tags: Array.isArray(task.tags) ? task.tags : [],
              deadline: new Date(task.deadline || Date.now()),
              hoursLogged: task.hours_logged || 0,
              priority: task.priority
            })),
            phases: Array.isArray(project.phases) ? project.phases : ['Planning', 'Design', 'Development', 'Testing', 'Deployment'],
            currentPhase: project.current_phase || 'Planning',
            deadline: new Date(project.deadline || Date.now()),
            status: project.status,
            createdAt: new Date(project.created_at)
          };
        })
      );

      setProjects(projectsWithDetails);
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fall back to mock data for development
      setProjects(getMockProjects());
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data fallback for development
  const getMockProjects = (): Project[] => [
    {
      id: '1',
      title: 'E-commerce Mobile Application',
      description: 'Developing a full-stack mobile application for online shopping with React Native and Node.js',
      createdBy: user?.id || '1',
      members: [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@university.edu',
          role: 'Frontend Developer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
          contributionPercentage: 35,
          tasksCompleted: 8,
          hoursLogged: 42
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@university.edu',
          role: 'Backend Developer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
          contributionPercentage: 28,
          tasksCompleted: 6,
          hoursLogged: 38
        },
        {
          id: '3',
          name: 'Charlie Brown',
          email: 'charlie@university.edu',
          role: 'UI/UX Designer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
          contributionPercentage: 25,
          tasksCompleted: 5,
          hoursLogged: 35
        },
        {
          id: '4',
          name: 'Diana Prince',
          email: 'diana@university.edu',
          role: 'QA Tester',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
          contributionPercentage: 12,
          tasksCompleted: 2,
          hoursLogged: 15
        }
      ],
      tasks: [
        {
          id: '1',
          title: 'Design user authentication flow',
          description: 'Create wireframes and mockups for login/signup pages',
          assignedTo: '3',
          status: 'completed',
          tags: ['UI', 'Design'],
          deadline: new Date('2024-12-15'),
          hoursLogged: 8,
          priority: 'high'
        },
        {
          id: '2',
          title: 'Implement user authentication API',
          description: 'Create backend endpoints for user registration and login',
          assignedTo: '2',
          status: 'in-progress',
          tags: ['Backend', 'API'],
          deadline: new Date('2024-12-20'),
          hoursLogged: 12,
          priority: 'high'
        },
        {
          id: '3',
          title: 'Build product catalog interface',
          description: 'Develop the main product browsing and search functionality',
          assignedTo: '1',
          status: 'in-progress',
          tags: ['Frontend', 'UI'],
          deadline: new Date('2024-12-25'),
          hoursLogged: 15,
          priority: 'medium'
        },
        {
          id: '4',
          title: 'Write test cases for authentication',
          description: 'Create comprehensive test suite for user authentication',
          assignedTo: '4',
          status: 'todo',
          tags: ['Testing', 'QA'],
          deadline: new Date('2024-12-30'),
          hoursLogged: 0,
          priority: 'medium'
        }
      ],
      phases: ['Planning', 'Design', 'Development', 'Testing', 'Deployment'],
      currentPhase: 'Development',
      deadline: new Date('2025-01-15'),
      status: 'active',
      createdAt: new Date('2024-11-01')
    }
  ];

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          created_by: user.id,
          phases: projectData.phases,
          current_phase: projectData.currentPhase,
          deadline: projectData.deadline.toISOString(),
          status: projectData.status
        })
        .select()
        .single();

      if (error) throw error;

      // Add project members
      if (projectData.members.length > 0) {
        const membersToInsert = projectData.members.map(member => ({
          project_id: project.id,
          user_id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          avatar: member.avatar,
          contribution_percentage: member.contributionPercentage,
          tasks_completed: member.tasksCompleted,
          hours_logged: member.hoursLogged
        }));

        await supabase.from('project_members').insert(membersToInsert);
      }

      // Reload projects to get the updated list
      await loadProjects();
    } catch (error) {
      console.error('Error adding project:', error);
      // Fall back to local state update for development
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      setProjects(prev => [...prev, newProject]);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: updates.title,
          description: updates.description,
          phases: updates.phases,
          current_phase: updates.currentPhase,
          deadline: updates.deadline?.toISOString(),
          status: updates.status
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProjects(prev => prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      ));
    } catch (error) {
      console.error('Error updating project:', error);
      // Fall back to local state update
      setProjects(prev => prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      ));
    }
  };

  const addTask = async (projectId: string, taskData: Omit<Task, 'id'>) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .insert({
          project_id: projectId,
          title: taskData.title,
          description: taskData.description,
          assigned_to: taskData.assignedTo,
          status: taskData.status,
          tags: taskData.tags,
          deadline: taskData.deadline.toISOString(),
          hours_logged: taskData.hoursLogged,
          priority: taskData.priority
        });

      if (error) throw error;

      // Reload projects to get the updated tasks
      await loadProjects();
    } catch (error) {
      console.error('Error adding task:', error);
      // Fall back to local state update
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString()
      };
      
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, tasks: [...project.tasks, newTask] }
          : project
      ));
    }
  };

  const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({
          title: updates.title,
          description: updates.description,
          assigned_to: updates.assignedTo,
          status: updates.status,
          tags: updates.tags,
          deadline: updates.deadline?.toISOString(),
          hours_logged: updates.hoursLogged,
          priority: updates.priority
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? {
              ...project,
              tasks: project.tasks.map(task => 
                task.id === taskId ? { ...task, ...updates } : task
              )
            }
          : project
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      // Fall back to local state update
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? {
              ...project,
              tasks: project.tasks.map(task => 
                task.id === taskId ? { ...task, ...updates } : task
              )
            }
          : project
      ));
    }
  };

  // Load projects when user changes
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
    }
  }, [user?.id]);

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      setCurrentProject,
      addProject,
      updateProject,
      addTask,
      updateTask,
      loadProjects,
      isLoading
    }}>
      {children}
    </ProjectContext.Provider>
  );
};