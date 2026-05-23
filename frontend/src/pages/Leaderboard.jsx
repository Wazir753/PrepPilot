import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Tabs from '../components/common/Tabs';
import Spinner from '../components/common/Spinner';
import useAuth from '../hooks/useAuth';
import leaderboardService from '../services/leaderboardService';
import { parseError } from '../utils/helpers';
import { staggerContainer, staggerItem } from '../utils/animations';

const rankIcons = [Crown, Medal, Trophy];

function LeaderboardList({ entries = [], currentUserId }) {
  if (!entries.length) {
    return <p className="text-gray-500 text-center py-8">No leaderboard data yet.</p>;
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
      {entries.map((entry, i) => {
        const RankIcon = rankIcons[i] || Trophy;
        const isCurrentUser = entry.user_id === currentUserId;
        return (
          <motion.div key={entry.user_id || i} variants={staggerItem}>
            <div
              className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                isCurrentUser ? 'bg-primary/10 border border-primary/30' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="w-8 text-center">
                {i < 3 ? (
                  <RankIcon className={`w-6 h-6 mx-auto ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-orange-400'}`} />
                ) : (
                  <span className="text-gray-500 font-mono">#{i + 1}</span>
                )}
              </div>
              <Avatar src={entry.avatar_url} name={entry.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {entry.name}
                  {isCurrentUser && <Badge variant="primary" className="ml-2">You</Badge>}
                </p>
                <p className="text-xs text-gray-500">{entry.role || 'Candidate'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-accent">{Math.round(entry.score || entry.total_score || 0)}</p>
                <p className="text-xs text-gray-500">{entry.interviews_count || 0} interviews</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function Leaderboard() {
  const { user } = useAuth();
  const [global, setGlobal] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      leaderboardService.getGlobal(),
      leaderboardService.getWeekly(),
    ])
      .then(([g, w]) => {
        setGlobal(g?.entries || g || []);
        setWeekly(w?.entries || w || []);
      })
      .catch((err) => toast.error(parseError(err)))
      .finally(() => setLoading(false));
  }, []);

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
      id: 'global',
      label: 'All Time',
      content: <LeaderboardList entries={global} currentUserId={user?.id} />,
    },
    {
      id: 'weekly',
      label: 'This Week',
      content: <LeaderboardList entries={weekly} currentUserId={user?.id} />,
    },
  ];

  return (
    <AppLayout showFooter={false}>
      <PageContainer title="Leaderboard" subtitle="See how you rank against other candidates">
        <Card>
          <Tabs tabs={tabs} defaultTab="global" />
        </Card>
      </PageContainer>
    </AppLayout>
  );
}

export default Leaderboard;
