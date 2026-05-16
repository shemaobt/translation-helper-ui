import {
  Activity, AlertCircle, AlertTriangle, ArrowRight, ArrowUp, BookOpen, Bug, Camera,
  Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Compass,
  Copy, GitCompare, Globe, Home, Inbox, Info, Key, Languages, Loader, Lock, LogOut,
  Mail, Menu, MessageCircle, MessagesSquare, Mic, MicOff, MicVocal, MoreHorizontal,
  PanelLeft, Paperclip, Pencil, Plus, RefreshCw, Search, Settings, Shield, Sliders,
  Sparkles, Trash2, Upload, User, Users, Volume2, Wand2, X,
} from 'lucide-react';
import type { CSSProperties } from 'react';

const map = {
  activity: Activity,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'book-open': BookOpen,
  bug: Bug,
  camera: Camera,
  check: Check,
  'check-circle': CheckCircle,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  clock: Clock,
  compass: Compass,
  copy: Copy,
  'git-compare': GitCompare,
  globe: Globe,
  home: Home,
  inbox: Inbox,
  info: Info,
  key: Key,
  languages: Languages,
  loader: Loader,
  lock: Lock,
  'log-out': LogOut,
  mail: Mail,
  menu: Menu,
  'message-circle': MessageCircle,
  'messages-square': MessagesSquare,
  mic: Mic,
  'mic-off': MicOff,
  'mic-vocal': MicVocal,
  'more-horizontal': MoreHorizontal,
  'panel-left': PanelLeft,
  paperclip: Paperclip,
  pencil: Pencil,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  settings: Settings,
  shield: Shield,
  sliders: Sliders,
  sparkles: Sparkles,
  trash: Trash2,
  upload: Upload,
  user: User,
  users: Users,
  'volume-2': Volume2,
  wand: Wand2,
  x: X,
} as const;

export type IconName = keyof typeof map;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
}

export function Icon({ name, size = 16, strokeWidth = 1.75, style, className }: IconProps) {
  const Cmp = map[name];
  return <Cmp size={size} strokeWidth={strokeWidth} style={style} className={className} />;
}
