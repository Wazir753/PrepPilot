import React from 'react';
import PropTypes from 'prop-types';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import useTheme from '../../hooks/useTheme';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function SkillRadarChart({ labels, data, title = 'Skill Radar' }) {
  const { isDark } = useTheme();

  const chartData = {
    labels: labels || ['Technical', 'Communication', 'Problem Solving', 'Confidence', 'Structure'],
    datasets: [
      {
        label: 'Skills',
        data: data || [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(0, 212, 170, 0.2)',
        borderColor: '#00D4AA',
        borderWidth: 2,
        pointBackgroundColor: '#00D4AA',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: !!title,
        text: title,
        color: isDark ? '#fff' : '#0A0A0F',
        font: { family: 'Space Grotesk', size: 14 },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false, stepSize: 20 },
        grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        angleLines: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        pointLabels: { color: isDark ? '#9ca3af' : '#6b7280', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="glass-card p-4 h-72">
      <Radar data={chartData} options={options} />
    </div>
  );
}

SkillRadarChart.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string),
  data: PropTypes.arrayOf(PropTypes.number),
  title: PropTypes.string,
};

export default SkillRadarChart;
