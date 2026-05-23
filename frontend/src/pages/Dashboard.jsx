import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import PageContainer from '../components/layout/PageContainer';
import StatsGrid from '../components/dashboard/StatsGrid';
import QuickActions from '../components/dashboard/QuickActions';
import RecentInterviews from '../components/dashboard/RecentInterviews';
import SkillOverview from '../components/dashboard/SkillOverview';
import useAuth from '../hooks/useAuth';
import interviewService from '../services/interviewService';
import analyticsService from '../services/analyticsService';
import userService from '../services/userService';
import { parseError } from '../utils/helpers';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [interviews, setInterviews] = useState([]);
  const [skills, setSkills] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [radarLabels, setRadarLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, interviewsRes, skillsRes] = await Promise.all([
          userService.getStats().catch(() => analyticsService.getOverview()),
          interviewService.getAll({ limit: 5 }),
          analyticsService.getSkillRadar().catch(() => null),
        ]);
        setStats(statsRes || {});
        setInterviews(interviewsRes?.items || interviewsRes || []);
        if (skillsRes) {
          setSkills(skillsRes.skills || []);
          setRadarLabels(skillsRes.labels || []);
          setRadarData(skillsRes.data || []);
        }
      } catch (err) {
        toast.error(parseError(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppLayout showFooter={false}>
      <PageContainer
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Candidate'}`}
        subtitle="Here's your interview practice overview"
      >
        <StatsGrid stats={stats} />
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <QuickActions />
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Interviews</h2>
            <RecentInterviews interviews={interviews} loading={loading} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Skills Overview</h2>
            <SkillOverview skills={skills} radarLabels={radarLabels} radarData={radarData} />
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}

export default Dashboard;
