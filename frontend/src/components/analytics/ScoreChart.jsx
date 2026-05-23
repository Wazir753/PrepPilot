import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import useTheme from '../../hooks/useTheme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function ScoreChart({ labels, data, title = 'Score Trend' }) {
  const { isDark } = useTheme();

  const chartData = {
    labels: labels || [],
    datasets: [
      {
        label: 'Score',
        data: data || [],
        borderColor: '#6C63FF',
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6C63FF',
        pointBorderColor: '#fff',
        pointRadius: 4,
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
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
      },
    },
  };

  return (
    <div className="glass-card p-4 h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}

ScoreChart.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string),
  data: PropTypes.arrayOf(PropTypes.number),
  title: PropTypes.string,
};

export default ScoreChart;
