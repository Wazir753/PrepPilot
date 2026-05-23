import React from 'react';
import PropTypes from 'prop-types';
import SkillRadarChart from '../analytics/RadarChart';
import ProgressBar from '../common/ProgressBar';

function SkillOverview({ skills = [], radarLabels, radarData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkillRadarChart labels={radarLabels} data={radarData} title="Your Skills" />
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display font-semibold">Skill Breakdown</h3>
        {skills.length ? (
          skills.map((skill) => (
            <ProgressBar
              key={skill.name}
              value={skill.score}
              label={skill.name}
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm">Complete interviews to see your skill breakdown.</p>
        )}
      </div>
    </div>
  );
}

SkillOverview.propTypes = {
  skills: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string, score: PropTypes.number })
  ),
  radarLabels: PropTypes.arrayOf(PropTypes.string),
  radarData: PropTypes.arrayOf(PropTypes.number),
};

export default SkillOverview;
