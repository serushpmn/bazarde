import React from 'react';
import {
  Home,
  Car,
  Smartphone,
  Sofa,
  Wrench,
  Shirt,
  Gamepad2,
  Factory,
  Briefcase,
  Layers,
  Sparkles,
  Tv,
  Watch,
  FolderKanban
} from 'lucide-react';

interface Props {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<Props> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Home':
    case 'real-estate':
      return <Home className={className} />;
    case 'Car':
    case 'vehicles':
      return <Car className={className} />;
    case 'Smartphone':
    case 'digital':
      return <Smartphone className={className} />;
    case 'Sofa':
    case 'home-appliances':
      return <Sofa className={className} />;
    case 'Wrench':
    case 'services':
      return <Wrench className={className} />;
    case 'Shirt':
    case 'personal-goods':
      return <Shirt className={className} />;
    case 'Gamepad2':
    case 'leisure':
      return <Gamepad2 className={className} />;
    case 'Factory':
    case 'industrial':
      return <Factory className={className} />;
    case 'Briefcase':
    case 'jobs':
      return <Briefcase className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    case 'Watch':
      return <Watch className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    default:
      return <Layers className={className} />;
  }
};
