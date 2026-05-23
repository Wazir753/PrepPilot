import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import useAuth from '../hooks/useAuth';
import userService from '../services/userService';
import { validateProfileForm } from '../utils/validators';
import { SUBSCRIPTION_TIERS } from '../utils/constants';
import { parseError, formatDate } from '../utils/helpers';
import { fadeInUp } from '../utils/animations';

function UserProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', bio: '', target_role: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        target_role: user.target_role || '',
      });
    }
    userService.getStats().then(setStats).catch(() => {});
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = validateProfileForm(form);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setLoading(true);
    try {
      const data = await userService.updateProfile(form);
      updateUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await userService.uploadAvatar(file);
      updateUser({ avatar_url: data.avatar_url });
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const tier = SUBSCRIPTION_TIERS[user?.subscription_tier] || SUBSCRIPTION_TIERS.free;

  return (
    <AppLayout showFooter={false}>
      <PageContainer title="Profile" subtitle="Manage your account settings">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="max-w-2xl mx-auto space-y-6">
          <Card className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar src={user?.avatar_url} name={user?.name} size="xl" />
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-400 flex items-center gap-1 justify-center sm:justify-start">
                <Mail className="w-4 h-4" /> {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant="primary">{tier.label}</Badge>
                <span className="text-xs text-gray-500">Member since {formatDate(user?.created_at)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{stats.total_interviews || 0}</p>
                <p className="text-xs text-gray-500">Interviews</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{Math.round(stats.average_score || 0)}%</p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.best_score || 0}%</p>
                <p className="text-xs text-gray-500">Best Score</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" name="name" icon={User} value={form.name} onChange={handleChange} error={errors.name} />
              <Input label="Target Role" name="target_role" icon={Briefcase} value={form.target_role} onChange={handleChange} placeholder="e.g. Software Engineer" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Tell us about yourself..."
                />
                {errors.bio && <p className="text-sm text-red-400">{errors.bio}</p>}
              </div>
              <Button type="submit" loading={loading}>Save Changes</Button>
            </form>
          </Card>
        </motion.div>
      </PageContainer>
    </AppLayout>
  );
}

export default UserProfile;
