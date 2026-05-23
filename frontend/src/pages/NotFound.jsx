import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import NeonText from '../components/common/NeonText';
import { ROUTES } from '../utils/constants';
import { fadeInUp } from '../utils/animations';

function NotFound() {
  return (
    <AppLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div
          className="text-center"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <NeonText as="h1" className="text-8xl font-display mb-4">404</NeonText>
          <h2 className="text-2xl font-display font-bold mb-2">Page Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={ROUTES.HOME}>
              <Button icon={Home}>Go Home</Button>
            </Link>
            <Button variant="secondary" icon={ArrowLeft} onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

export default NotFound;
