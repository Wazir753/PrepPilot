import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mic, Ban, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import StatCard from '../components/analytics/StatCard';
import Spinner from '../components/common/Spinner';
import adminService from '../services/adminService';
import { parseError, formatDate } from '../utils/helpers';
import { staggerContainer, staggerItem } from '../utils/animations';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminService.getUsers({ limit: 50 }),
        adminService.getStats(),
      ]);
      setUsers(usersRes?.items || usersRes || []);
      setStats(statsRes || {});
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBan = async (userId, isBanned) => {
    setActionLoading(userId);
    try {
      if (isBanned) {
        await adminService.unbanUser(userId);
        toast.success('User unbanned');
      } else {
        await adminService.banUser(userId);
        toast.success('User banned');
      }
      await loadData();
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AppLayout showFooter={false}>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <PageContainer title="Admin Panel" subtitle="Manage users and platform statistics">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={stats.total_users || 0} color="primary" />
          <StatCard icon={Mic} label="Total Interviews" value={stats.total_interviews || 0} color="accent" />
          <StatCard icon={Shield} label="Active Today" value={stats.active_today || 0} color="primary" />
        </div>

        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User Management
          </h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
            {users.map((u) => (
              <motion.div
                key={u.id}
                variants={staggerItem}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatar_url} name={u.name} />
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <Badge variant={u.role === 'admin' ? 'accent' : 'default'}>{u.role}</Badge>
                  {u.is_banned && <Badge variant="danger">Banned</Badge>}
                  {!u.is_active && <Badge variant="warning">Inactive</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 hidden sm:block">{formatDate(u.created_at)}</span>
                  {u.role !== 'admin' && (
                    <Button
                      variant={u.is_banned ? 'accent' : 'danger'}
                      size="sm"
                      icon={u.is_banned ? CheckCircle : Ban}
                      loading={actionLoading === u.id}
                      onClick={() => handleBan(u.id, u.is_banned)}
                    >
                      {u.is_banned ? 'Unban' : 'Ban'}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Card>
      </PageContainer>
    </AppLayout>
  );
}

export default AdminPanel;
