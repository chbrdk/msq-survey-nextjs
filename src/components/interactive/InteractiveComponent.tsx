'use client';

import type { InteractiveComponent as IComponent } from '@/types';
import { UdgGlassButtonGroup } from './udg-glass-button-group';
import { UdgGlassInput } from './udg-glass-input';
import { UdgGlassPercentageTable } from './udg-glass-percentage-table';
import { UdgGlassMultiSelect } from './udg-glass-multi-select';
import { UdgGlassDocument } from './udg-glass-document';

interface InteractiveComponentProps {
  component: IComponent;
}

export const InteractiveComponent = ({ component }: InteractiveComponentProps) => {
  switch (component.type) {
    case 'buttons':
      return <UdgGlassButtonGroup data={component.data as any} />;

    case 'input':
      return <UdgGlassInput data={component.data as any} validation={component.validation} />;

    case 'table':
      return <UdgGlassPercentageTable data={component.data as any} validation={component.validation} />;

    case 'multi-select':
      return <UdgGlassMultiSelect data={component.data as any} />;

    case 'document':
      return <UdgGlassDocument data={component.data as any} />;

    default:
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-gray-600">
          Unbekannter Component-Typ: {component.type}
        </div>
      );
  }
};


