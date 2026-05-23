import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  Mic,
  Code,
  BarChart3,
  Eye,
  Zap,
  Shield,
  ArrowRight,
  Play,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import NeonText from '../components/common/NeonText';
import GlassPanel from '../components/common/GlassPanel';
import { ROUTES } from '../utils/constants';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

const features = [
  { icon: Mic, title: 'Live AI Interviewer', desc: 'GPT-4o powered dynamic questioning that adapts to your responses in real time.' },
  { icon: Eye, title: 'Emotion Analysis', desc: 'Real-time facial emotion and eye contact tracking for confidence insights.' },
  { icon: Code, title: 'Coding Sandboxes', desc: 'Full code execution for Python, JavaScript, Java, C++, and Go.' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Score breakdowns, skill radar charts, and weakness heatmaps.' },
  { icon: Zap, title: 'Adaptive Difficulty', desc: 'AI adjusts question difficulty based on your performance.' },
  { icon: Shield, title: 'Interview Replay', desc: 'Re-watch sessions with synchronized AI feedback.' },
];

function Landing() {
  const history = useHistory();

  return (
    <AppLayout transparentNav showFooter>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-accent mb-6">
              <Rocket className="w-4 h-4" />
              Powered by GPT-4o &amp; Deep Learning
            </div>
            <h1 className="text-5xl sm:text-7xl font-display font-bold mb-6 leading-tight">
              Ace Every Interview.
              <br />
              <NeonText as="span" variant="gradient">Powered by AI.</NeonText>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Practice technical, behavioral, HR, and coding interviews with real-time AI feedback,
              emotion analysis, and comprehensive analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" icon={Play} onClick={() => history.push(ROUTES.REGISTER)}>
                Start Free Practice
              </Button>
              <Button variant="secondary" size="lg" onClick={() => history.push(ROUTES.LOGIN)}>
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-display font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            From live AI interviews to coding challenges and deep analytics — PrepPilot has you covered.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={staggerItem}>
              <GlassPanel glow className="h-full">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="py-24 px-4">
        <GlassPanel glow className="max-w-4xl mx-auto text-center p-12">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to land your dream job?</h2>
          <p className="text-gray-400 mb-8">Join thousands of candidates improving their interview skills daily.</p>
          <Link to={ROUTES.REGISTER}>
            <Button size="lg" icon={ArrowRight}>
              Get Started Free
            </Button>
          </Link>
        </GlassPanel>
      </section>
    </AppLayout>
  );
}

export default Landing;
