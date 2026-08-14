import {
  Briefcase,
  Calendar,
  Compass,
  Heart,
  HelpCircle,
  Users,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/lib/topics";

const ICONS: Record<IconName, React.ComponentType<LucideProps>> = {
  Heart,
  Briefcase,
  HelpCircle,
  Calendar,
  Users,
  Compass,
};

export function TopicIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon {...props} />;
}
