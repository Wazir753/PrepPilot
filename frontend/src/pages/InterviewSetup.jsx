import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import useInterview from '../hooks/useInterview';
import { INTERVIEW_TYPES, DIFFICULTY_LEVELS, TARGET_ROLES } from '../utils/constants';
import { validateInterviewSetup } from '../utils/validators';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';
import { Cpu, Users, Briefcase, Code } from 'lucide-react';

const typeIcons = { technical: Cpu, behavioral: Users, hr: Briefcase, coding: Code };

function InterviewSetup() {
  const history = useHistory();
  const { startInterview, loading } = useInterview();
  const [form, setForm] = useState({
    role: '',
    interviewType: 'technical',
    difficulty: 'medium',
  });
  const [errors, setErrors] = useState({});

  const handleStart = async () => {
    const result = validateInterviewSetup({
      role: form.role,
      interviewType: form.interviewType,
      difficulty: form.difficulty,
    });
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    try {
      const { data } = await startInterview({
        role: form.role,
        interview_type: form.interviewType,
        difficulty: form.difficulty,
      });
      toast.success('Interview started!');
      if (form.interviewType === 'coding') {
        history.push(`/interview/coding/${data.id}`);
      } else {
        history.push(`/interview/live/${data.id}`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AppLayout showFooter={false}>
      <PageContainer title="Setup Interview" subtitle="Configure your AI-powered practice session">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl mx-auto space-y-6">
          <motion.div variants={staggerItem}>
            <Card>
              <h3 className="font-semibold mb-4">Interview Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {INTERVIEW_TYPES.map((type) => {
                  const Icon = typeIcons[type.value];
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, interviewType: type.value }))}
                      className={`p-4 rounded-xl border transition-all text-left ${
                        form.interviewType === type.value
                          ? 'border-primary bg-primary/10 shadow-neon'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-primary mb-2" />
                      <p className="font-medium">{type.label}</p>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="space-y-4">
              <Select
                label="Target Role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                options={[{ value: '', label: 'Select a role...' }, ...TARGET_ROLES.map((r) => ({ value: r, label: r }))]}
                error={errors.role}
              />
              <Input
                label="Or enter custom role"
                placeholder="e.g. Senior React Developer"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTY_LEVELS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, difficulty: d.value }))}
                      className={`flex-1 py-2 rounded-xl border transition-all ${
                        form.difficulty === d.value ? 'border-primary bg-primary/10' : 'border-white/10'
                      }`}
                    >
                      <Badge variant={form.difficulty === d.value ? 'primary' : 'default'}>{d.label}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Button className="w-full" size="lg" loading={loading} onClick={handleStart}>
              Start Interview
            </Button>
          </motion.div>
        </motion.div>
      </PageContainer>
    </AppLayout>
  );
}

export default InterviewSetup;
