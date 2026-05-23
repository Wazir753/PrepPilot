import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import PageContainer from '../components/layout/PageContainer';
import StatsGrid from '../components/dashboard/StatsGrid';
import ScoreChart from '../components/analytics/ScoreChart';
import SkillRadarChart from '../components/analytics/RadarChart';
import HeatmapChart from '../components/analytics/HeatmapChart';
import ProgressTimeline from '../components/analytics/ProgressTimeline';
import StatCard from '../components/analytics/StatCard';
import Tabs from '../components/common/Tabs';
import Spinner from '../components/common/Spinner';
import analyticsService from '../services/analyticsService';
import { parseError } from '../utils/helpers';
import { Target, TrendingUp, Brain } from 'lucide-react';

function AnalyticsDashboard() {
  const location = useLocation();
  const interviewId = new URLSearchParams(location.search).get('interview');
  const [overview, setOverview] = useState({});
  const [progress, setProgress] = useState({ labels: [], data: [] });
  const [skills, setSkills] = useState({ labels: [], data: [] });
  const [weaknesses, setWeaknesses] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [interviewAnalytics, setInterviewAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [overviewRes, progressRes, skillsRes, weaknessesRes, timelineRes] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getProgressHistory(),
          analyticsService.getSkillRadar(),
          analyticsService.getWeaknessHeatmap(),
          analyticsService.getTrends(),
        ]);
        setOverview(overviewRes || {});
        setProgress({
          labels: progressRes?.labels || progressRes?.dates || [],
          data: progressRes?.scores || progressRes?.data || [],
        });
        setSkills({
          labels: skillsRes?.labels || [],
          data: skillsRes?.data || [],
        });
        setWeaknesses(weaknessesRes?.items || weaknessesRes || []);
        setTimeline(timelineRes?.events || timelineRes || []);

        if (interviewId) {
          const ia = await analyticsService.getInterviewAnalytics(interviewId);
          setInterviewAnalytics(ia);
        }
      } catch (err) {
        toast.error(parseError(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [interviewId]);

  if (loading) {
    return (
      <AppLayout showFooter={false}>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          <StatsGrid stats={overview} />
          <ScoreChart labels={progress.labels} data={progress.data} title="Score Progress" />
        </div>
      ),
    },
    {
      id: 'skills',
      label: 'Skills',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkillRadarChart labels={skills.labels} data={skills.data} />
          <div className="grid grid-cols-1 gap-4">
            <StatCard icon={Target} label="Technical Score" value={overview.technical_score || 0} suffix="%" color="primary" />
            <StatCard icon={TrendingUp} label="Communication" value={overview.communication_score || 0} suffix="%" color="accent" />
            <StatCard icon={Brain} label="Confidence" value={overview.confidence_score || 0} suffix="%" color="primary" />
          </div>
        </div>
      ),
    },
    {
      id: 'weaknesses',
      label: 'Weaknesses',
      content: <HeatmapChart data={weaknesses} />,
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: (
        <div className="glass-card p-6">
          <ProgressTimeline events={timeline} />
        </div>
      ),
    },
  ];

  return (
    <AppLayout showFooter={false}>
      <PageContainer title="Analytics" subtitle="Track your interview performance over time">
        {interviewAnalytics && (
          <div className="glass-card p-6 mb-6 neon-border">
            <h3 className="font-semibold text-accent mb-2">Latest Interview Results</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-3xl font-bold text-primary">{Math.round(interviewAnalytics.final_score || 0)}</p>
                <p className="text-sm text-gray-400">Overall Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(interviewAnalytics.technical_score || 0)}%</p>
                <p className="text-sm text-gray-400">Technical</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(interviewAnalytics.communication_score || 0)}%</p>
                <p className="text-sm text-gray-400">Communication</p>
              </div>
              <div>
                <p className="text-lg font-bold capitalize">{interviewAnalytics.confidence_level || 'N/A'}</p>
                <p className="text-sm text-gray-400">Confidence</p>
              </div>
            </div>
          </div>
        )}
        <Tabs tabs={tabs} defaultTab="overview" />
      </PageContainer>
    </AppLayout>
  );
}

export default AnalyticsDashboard;
