import { format, formatDistanceToNow, intervalToDuration } from 'date-fns';
import { SCORE_THRESHOLDS } from './constants';

export function formatDate(date, pattern = 'MMM d, yyyy') {
  if (!date) return '';
  return format(new Date(date), pattern);
}

export function formatRelative(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '0:00';
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  const mins = duration.minutes || 0;
  const secs = duration.seconds || 0;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function getScoreLabel(score) {
  if (score >= SCORE_THRESHOLDS.excellent) return { label: 'Excellent', color: 'text-accent' };
  if (score >= SCORE_THRESHOLDS.good) return { label: 'Good', color: 'text-primary' };
  if (score >= SCORE_THRESHOLDS.average) return { label: 'Average', color: 'text-yellow-400' };
  return { label: 'Needs Work', color: 'text-red-400' };
}

export function getScoreColor(score) {
  if (score >= SCORE_THRESHOLDS.excellent) return 'bg-accent';
  if (score >= SCORE_THRESHOLDS.good) return 'bg-primary';
  if (score >= SCORE_THRESHOLDS.average) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function truncate(str, length = 100) {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function parseError(error) {
  if (error.response) {
    const data = error.response.data;
    if (data?.error?.message) return data.error.message;
    if (data?.message) return data.message;
    if (data.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail.map((d) => d.msg || d).join(', ');
      }
      return typeof data.detail === 'string' ? data.detail : data.detail.message || 'Request failed';
    }
    return 'Request failed';
  }
  return error.message || 'Something went wrong';
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function debounce(fn, delay) {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function averageScores(scores) {
  if (!scores || scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
