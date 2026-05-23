import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import GlassPanel from '../components/common/GlassPanel';
import useAuth from '../hooks/useAuth';
import { validateRegisterForm } from '../utils/validators';
import { ROUTES } from '../utils/constants';
import { fadeInUp } from '../utils/animations';

function Register() {
  const history = useHistory();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = validateRegisterForm(form);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success('Account created! Welcome to PrepPilot.');
      history.push(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <motion.div className="w-full max-w-md" variants={fadeInUp} initial="hidden" animate="visible">
          <GlassPanel glow className="p-8">
            <div className="text-center mb-8">
              <Rocket className="w-10 h-10 text-primary mx-auto mb-3" />
              <h1 className="text-2xl font-display font-bold">Create your account</h1>
              <p className="text-gray-400 text-sm mt-1">Start practicing for free</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" name="name" placeholder="John Doe" icon={User} value={form.name} onChange={handleChange} error={errors.name} />
              <Input label="Email" name="email" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={handleChange} error={errors.email} />
              <Input label="Password" name="password" type="password" placeholder="••••••••" icon={Lock} value={form.password} onChange={handleChange} error={errors.password} />
              <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" icon={Lock} value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
              <Button type="submit" className="w-full" loading={loading}>
                Create Account
              </Button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </GlassPanel>
        </motion.div>
      </div>
    </AppLayout>
  );
}

export default Register;
