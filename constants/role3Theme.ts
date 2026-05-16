// Role3 | Shared theme tokens, type aliases, and UI helpers for the mobile crisis console
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;
export type CrisisCategory =
  | 'Fire'
  | 'Flood'
  | 'Medical'
  | 'Infrastructure'
  | 'Civil Unrest'
  | 'Other';
export type CrisisStatus = 'reported' | 'analyzing' | 'active' | 'resolved';
export type PlanStatus = 'pending' | 'active' | 'resolved';

export const ROLE3_COLORS = {
  background: '#0A0E1A',
  surface: '#111827',
  surfaceMuted: '#182236',
  surfaceSoft: '#1F2937',
  border: '#243042',
  borderStrong: '#324155',
  accent: '#3B82F6',
  accentSoft: '#60A5FA',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textSoft: '#CBD5E1',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  overlay: 'rgba(10, 14, 26, 0.82)',
};

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  1: '#22C55E',
  2: '#84CC16',
  3: '#EAB308',
  4: '#F97316',
  5: '#EF4444',
};

export const CATEGORY_OPTIONS: Array<{
  value: CrisisCategory;
  label: string;
  icon: string;
  helper: string;
}> = [
  { value: 'Fire', label: 'Fire', icon: 'flame-outline', helper: 'Smoke, flames, explosions' },
  { value: 'Flood', label: 'Flood', icon: 'water-outline', helper: 'Urban flooding, stranded vehicles' },
  { value: 'Medical', label: 'Medical', icon: 'medkit-outline', helper: 'Injuries, rescue, ambulance need' },
  { value: 'Infrastructure', label: 'Infrastructure', icon: 'construct-outline', helper: 'Bridge, power, sewer failures' },
  { value: 'Civil Unrest', label: 'Civil Unrest', icon: 'shield-outline', helper: 'Crowd issues, road agitation' },
  { value: 'Other', label: 'Other', icon: 'apps-outline', helper: 'Anything outside known crisis types' },
];

export const CATEGORY_ICON_MAP: Record<CrisisCategory, string> = {
  Fire: 'flame-outline',
  Flood: 'water-outline',
  Medical: 'medkit-outline',
  Infrastructure: 'construct-outline',
  'Civil Unrest': 'shield-outline',
  Other: 'apps-outline',
};

export const getSeverityLabel = (severity: SeverityLevel) => {
  switch (severity) {
    case 1:
      return 'Low';
    case 2:
      return 'Guarded';
    case 3:
      return 'Elevated';
    case 4:
      return 'High';
    case 5:
      return 'Critical';
    default:
      return 'Unknown';
  }
};

export const getSeverityColor = (severity: SeverityLevel) => SEVERITY_COLORS[severity];

export const getPlanStatusTone = (status: PlanStatus) => {
  switch (status) {
    case 'active':
      return {
        backgroundColor: 'rgba(59, 130, 246, 0.18)',
        borderColor: 'rgba(96, 165, 250, 0.45)',
        textColor: ROLE3_COLORS.accentSoft,
        label: 'Active',
      };
    case 'resolved':
      return {
        backgroundColor: 'rgba(34, 197, 94, 0.18)',
        borderColor: 'rgba(74, 222, 128, 0.45)',
        textColor: '#4ADE80',
        label: 'Resolved',
      };
    default:
      return {
        backgroundColor: 'rgba(234, 179, 8, 0.16)',
        borderColor: 'rgba(234, 179, 8, 0.4)',
        textColor: '#FACC15',
        label: 'Pending',
      };
  }
};

export const getCrisisStatusIndex = (status: CrisisStatus) => {
  switch (status) {
    case 'reported':
      return 1;
    case 'analyzing':
      return 2;
    case 'active':
      return 3;
    case 'resolved':
      return 4;
    default:
      return 1;
  }
};

export const formatRelativeTime = (timestamp: string) => {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day ago`;
};

export const formatAddressFallback = (lat: number, lng: number) =>
  `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
