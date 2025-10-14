'use client';

import React from 'react';
import type { ComponentConfig } from '../interactive/ComponentRenderer';
import { UdgGlassButtonGroup } from '../interactive/udg-glass-button-group';
import { UdgGlassMultiSelect } from '../interactive/udg-glass-multi-select';
import { UdgGlassInput } from '../interactive/udg-glass-input';
import { UdgGlassDocument } from '../interactive/udg-glass-document';
import { UdgGlassInfoMessage } from '../interactive/udg-glass-info-message';
import { UdgGlassSmartMultiSelect } from '../interactive/udg-glass-smart-multi-select';
import { UdgGlassGuidedInput } from '../interactive/udg-glass-guided-input';
import { GlassPercentageAllocator } from './GlassPercentageAllocator';

interface GlassComponentRendererProps {
  config: ComponentConfig;
  onInteraction?: (data: any) => void;
}

/**
 * Glass-Theme optimierter Component Renderer
 * Verwendet die neue GlassPercentageAllocator statt der Table-Version
 */
export const GlassComponentRenderer: React.FC<GlassComponentRendererProps> = ({
  config,
  onInteraction,
}) => {
  switch (config.type) {
    case 'button-group': {
      const ButtonComponent = UdgGlassButtonGroup as any;
      return (
        <ButtonComponent
          data={{
            question: '',
            options: config.props.options,
            allowMultiple: config.props.multiple,
          }}
          onSelect={(value: any) => {
            config.props.onSelect?.(value);
            onInteraction?.(value);
          }}
        />
      );
    }

    case 'multi-select': {
      const Component = UdgGlassMultiSelect as any;
      return (
        <Component
          data={{
            question: '',
            options: config.props.options.map((opt: any) => ({
              id: opt.value,
              label: opt.label,
            })),
          }}
          onSelect={(values: string[]) => {
            config.props.onSelect?.(values);
            onInteraction?.(values);
          }}
        />
      );
    }

    case 'input': {
      const { placeholder, type = 'text' } = config.props;
      const inputType = type === 'number' ? 'number' : 'text';

      const InputComponent = UdgGlassInput as any;
      return (
        <InputComponent
          data={{
            question: '',
            placeholder: placeholder,
            inputType: inputType as 'text' | 'number' | 'percentage',
          }}
          onSubmit={(value: any) => {
            config.props.onSubmit?.(value);
            onInteraction?.(value);
          }}
        />
      );
    }

    case 'percentage-table': {
      // Verwende die neue Glassmorphism Percentage Allocator!
      const items = config.props.items || config.props.rows;

      if (!items || !Array.isArray(items) || items.length === 0) {
        // Fallback zu Input
        const InputComponent = UdgGlassInput as any;
        return (
          <InputComponent
            data={{
              question: 'Please provide the percentage distribution',
              placeholder: 'Enter your distribution...',
              inputType: 'text',
            }}
            onSubmit={(value: any) => {
              config.props.onSubmit?.(value);
              onInteraction?.(value);
            }}
          />
        );
      }

      // Map items to rows format
      const rows = items.map((item: any, index: number) => ({
        id: item.key || `item-${index}`,
        phase: item.label,
        activity: item.label,
        percentage: 0,
      }));

      return (
        <GlassPercentageAllocator
          data={{
            rows: rows,
          }}
          validation={{
            sumTo: 100,
            required: true,
          }}
        />
      );
    }

    case 'document': {
      const Component = UdgGlassDocument as any;
      return (
        <Component
          data={{
            title: 'Document',
            sections: [
              {
                title: 'Content',
                content: config.props.content,
                type: 'text',
              },
            ],
          }}
        />
      );
    }

    case 'info-message': {
      const { message, requiresAcknowledgement = false } = config.props;
      const Component = UdgGlassInfoMessage as any;
      return (
        <Component
          data={{
            message,
            requiresAcknowledgement
          }}
        />
      );
    }

    case 'smart-multi-select': {
      const props = config.props as any;
      const suggestions = props.suggestions || props.options || [];
      
      // Convert objects to strings if needed
      let suggestionsList = suggestions;
      if (suggestionsList.length > 0 && typeof suggestionsList[0] === 'object') {
        suggestionsList = suggestionsList.map((opt: any) => opt.label || opt.value || opt);
      }

      const Component = UdgGlassSmartMultiSelect as any;
      return (
        <Component
          data={props}
          suggestions={suggestionsList}
        />
      );
    }

    case 'guided-input': {
      const props = config.props as any;
      const Component = UdgGlassGuidedInput as any;
      return (
        <Component
          data={props}
        />
      );
    }

    default:
      return (
        <div className="glass-card p-6 text-center text-gray-600">
          <p>Unbekannter Component-Typ: {(config as any).type}</p>
        </div>
      );
  }
};

