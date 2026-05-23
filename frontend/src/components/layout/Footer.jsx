import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Rocket, Github, Twitter, Linkedin } from 'lucide-react';
import { APP_NAME, ROUTES } from '../../utils/constants';

class Footer extends Component {
  render() {
    const year = new Date().getFullYear();
    return (
      <footer className="border-t border-white/5 bg-surface/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-6 h-6 text-primary" />
                <span className="font-display font-bold text-lg gradient-text">{APP_NAME}</span>
              </div>
              <p className="text-gray-400 text-sm max-w-sm">
                Ace every interview with AI-powered practice sessions, real-time feedback, and deep analytics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={ROUTES.DASHBOARD} className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to={ROUTES.INTERVIEW_SETUP} className="hover:text-white transition-colors">Interviews</Link></li>
                <li><Link to={ROUTES.ANALYTICS} className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Connect</h4>
              <div className="flex gap-3">
                <a href="https://github.com" className="p-2 rounded-lg glass hover:bg-white/10 transition-colors" aria-label="GitHub">
                  <Github className="w-5 h-5 text-gray-400" />
                </a>
                <a href="https://twitter.com" className="p-2 rounded-lg glass hover:bg-white/10 transition-colors" aria-label="Twitter">
                  <Twitter className="w-5 h-5 text-gray-400" />
                </a>
                <a href="https://linkedin.com" className="p-2 rounded-lg glass hover:bg-white/10 transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-gray-500">
            &copy; {year} {APP_NAME}. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }
}

Footer.propTypes = {};

export default Footer;
