import {
  Home2,
  Profile2User,
  Calendar1,
  TaskSquare,
  Profile,
} from 'iconsax-react-nativejs';

type Props = { color: string; size?: number };

export function HomeTabIcon({ color, size = 24 }: Props) {
  return <Home2 color={color} size={size} variant="Bold" />;
}

export function StudentsTabIcon({ color, size = 24 }: Props) {
  return <Profile2User color={color} size={size} variant="Bold" />;
}

export function RoutineTabIcon({ color, size = 24 }: Props) {
  return <Calendar1 color={color} size={size} variant="Bold" />;
}

export function ExamsTabIcon({ color, size = 24 }: Props) {
  return <TaskSquare color={color} size={size} variant="Bold" />;
}

export function ProfileTabIcon({ color, size = 24 }: Props) {
  return <Profile color={color} size={size} variant="Bold" />;
}

