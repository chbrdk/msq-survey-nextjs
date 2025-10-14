'use client';

import React from 'react';
import { UdgGlassButtonGroup } from './udg-glass-button-group';
import { UdgGlassMultiSelect } from './udg-glass-multi-select';
import { UdgGlassInput } from './udg-glass-input';
import { UdgGlassPercentageTable } from './udg-glass-percentage-table';
import { UdgGlassDocument } from './udg-glass-document';
import { UdgGlassInfoMessage } from './udg-glass-info-message';
import { UdgGlassSmartMultiSelect } from './udg-glass-smart-multi-select';
import { UdgGlassGuidedInput } from './udg-glass-guided-input';

/**
 * Component configuration interfaces based on survey-manifest.json
 */
export interface ButtonGroupConfig {
  type: 'button-group';
  props: {
    options: Array<{
      label: string;
      value: string;
    }>;
    multiple?: boolean;
    columns?: number;
    onSelect?: (value: string | string[]) => void;
  };
}

export interface MultiSelectConfig {
  type: 'multi-select';
  props: {
    options: Array<{
      label: string;
      value: string;
    }>;
    allowOther?: boolean;
    onSelect?: (values: string[]) => void;
  };
}

export interface InputConfig {
  type: 'input';
  props: {
    placeholder: string;
    type?: 'text' | 'number' | 'email';
    multiline?: boolean;
    onSubmit?: (value: string) => void;
  };
}

export interface PercentageTableConfig {
  type: 'percentage-table';
  props: {
    items?: Array<{
      label: string;
      key: string;
      description?: string;
    }>;
    rows?: Array<{
      label: string;
      key: string;
      description?: string;
    }>;
    allowAdjustment?: boolean;
    onSubmit?: (values: Record<string, number>) => void;
  };
}

export interface DocumentConfig {
  type: 'document';
  props: {
    content: string;
    downloadable?: boolean;
  };
}

export interface InfoMessageConfig {
  type: 'info-message';
  props: {
    message: string;
    requiresAcknowledgement?: boolean;
  };
}

export interface SmartMultiSelectConfig {
  type: 'smart-multi-select';
  props: {
    question: string;
    smartSuggestions?: boolean;
    suggestionsSource?: string;
    allowCustomInput?: boolean;
    addYourOwnButton?: boolean;
    suggestions?: string[];
  };
}

export interface GuidedInputConfig {
  type: 'guided-input';
  props: {
    guidedQuestions: string[];
    multiline?: boolean;
  };
}

export type ComponentConfig =
  | ButtonGroupConfig
  | MultiSelectConfig
  | InputConfig
  | PercentageTableConfig
  | DocumentConfig
  | InfoMessageConfig
  | SmartMultiSelectConfig
  | GuidedInputConfig;

interface ComponentRendererProps {
  config: ComponentConfig;
  onInteraction?: (data: any) => void;
}

/**
 * ComponentRenderer - Dynamic component renderer based on manifest configuration
 * 
 * Maps manifest-defined component types to React components and handles their rendering
 * with proper prop validation and error handling.
 */
export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  config,
  onInteraction,
}) => {
  // Don't use state for errors - causes re-render loop
  // Handle errors directly in render

  // Debug logging
  console.log('[ComponentRenderer] Rendering component:', {
    type: config?.type,
    hasOptions: config?.type === 'multi-select' || config?.type === 'button-group' || config?.type === 'smart-multi-select' ? !!(config?.props as any)?.options : 'N/A',
    optionsCount: (config?.props as any)?.options?.length || 0,
    suggestionsCount: (config?.props as any)?.suggestions?.length || 0,
    allowMultiple: (config?.props as any)?.multiple,
    min: (config?.props as any)?.min,
    max: (config?.props as any)?.max,
    question: (config?.props as any)?.question
  });

  if (!config || !config.type) {
    console.error('[ComponentRenderer] Invalid config:', config);
    return (
      <div className="p-4 border border-red-500 bg-red-50 rounded-lg">
        <p className="text-red-700">Invalid component configuration</p>
      </div>
    );
  }

  try {
    switch (config.type) {
      case 'button-group': {
        const { options, multiple = false, columns = 1 } = config.props;

        if (!options || !Array.isArray(options) || options.length === 0) {
          // Fallback: Show as text input
          console.warn('[ComponentRenderer] button-group has no options, falling back to input');
          const InputComponent = UdgGlassInput as any;
          return (
            <InputComponent
              data={{
                question: 'Please provide your answer',
                placeholder: 'Type your response...',
                inputType: 'text',
              }}
              onSubmit={(value: any) => {
                config.props.onSelect?.(value);
                onInteraction?.(value);
              }}
            />
          );
        }

        // Map manifest format to legacy component format
        const ButtonComponent = UdgGlassButtonGroup as any;
        return (
          <ButtonComponent
            data={{
              question: '', // Legacy format
              options: options,
              allowMultiple: multiple,
            }}
            onSelect={(value: any) => {
              config.props.onSelect?.(value);
              onInteraction?.(value);
            }}
            columns={columns}
          />
        );
      }

      case 'multi-select': {
        const { options, min, max } = config.props;

        if (!options || !Array.isArray(options) || options.length === 0) {
          // Fallback: Show as text input instead
          console.warn('[ComponentRenderer] multi-select has no options, falling back to input');
          const InputComponent = UdgGlassInput as any;
          return (
            <InputComponent
              data={{
                question: 'Please provide your answer',
                placeholder: 'Type your response...',
                inputType: 'text',
              }}
              onSubmit={(value: any) => {
                config.props.onSelect?.([value]);
                onInteraction?.([value]);
              }}
            />
          );
        }

        // Map manifest format to legacy component format
        const Component = UdgGlassMultiSelect as any;
        return (
          <Component
            data={{
              question: '', // Legacy format
              options: options.map((opt: any) => ({
                id: opt.value || opt.id || opt.label,
                label: opt.label
              })),
              min: min,
              max: max,
            }}
            onSelect={(values: any) => {
              config.props.onSelect?.(values);
              onInteraction?.(values);
            }}
          />
        );
      }

      case 'input': {
        const { placeholder, type = 'text' } = config.props;

        if (!placeholder) {
          throw new Error('input requires placeholder prop');
        }

        // Map manifest format to legacy component format
        const inputType = type === 'email' ? 'text' : type;
        const InputComponent = UdgGlassInput as any;
        return (
          <InputComponent
            data={{
              question: '', // Legacy components expect this
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
        // Accept both 'items' (manifest) and 'rows' (GPT sometimes uses this)
        const items = config.props.items || config.props.rows;

        if (!items || !Array.isArray(items) || items.length === 0) {
          // Fallback to input
          console.warn('[ComponentRenderer] percentage-table has no items/rows, falling back to input');
          const InputComponent = UdgGlassInput as any;
          return (
            <InputComponent
              data={{
                question: 'Please provide percentages',
                placeholder: 'Type your allocation...',
                inputType: 'text',
              }}
              onSubmit={(value: any) => {
                config.props.onSubmit?.(value);
                onInteraction?.(value);
              }}
            />
          );
        }

        // Map manifest format to legacy component format
        const tableRows = items.map((item: any) => ({
          id: item.key || item.id || item.phase || item.label,
          activity: item.label || item.activity || item.phase,
          phase: item.phase || item.label,
          description: item.description,
          percentage: item.percentage || 0
        }));

        const Component = UdgGlassPercentageTable as any;
        return (
          <Component
            data={{
              question: '', // Legacy format
              title: 'Percentage Allocation',
              rows: tableRows,
            }}
            onSubmit={(values: any) => {
              config.props.onSubmit?.(values);
              onInteraction?.(values);
            }}
          />
        );
      }

      case 'document': {
        const { content } = config.props;

        if (!content) {
          throw new Error('document requires content prop');
        }

        const Component = UdgGlassDocument as any;
        return (
          <Component content={content} downloadable={true} />
        );
      }

      case 'info-message': {
        const { message, requiresAcknowledgement = false } = config.props;

        if (!message) {
          throw new Error('info-message requires message prop');
        }

        const Component = UdgGlassInfoMessage as any;
        return (
          <Component
            data={{
              message,
              requiresAcknowledgement
            }}
            onAcknowledge={(value: any) => {
              onInteraction?.(value);
            }}
          />
        );
      }

      case 'smart-multi-select': {
        const { question, suggestions = [], options = [] } = config.props;

        if (!question) {
          throw new Error('smart-multi-select requires question prop');
        }

        // GPT might return 'options' instead of 'suggestions'
        let suggestionsList = suggestions.length > 0 ? suggestions : options;
        
        // Convert objects to strings if needed (GPT returns [{label, value}])
        if (suggestionsList.length > 0 && typeof suggestionsList[0] === 'object') {
          suggestionsList = suggestionsList.map((opt: any) => opt.label || opt.value || opt);
        }

        const Component = UdgGlassSmartMultiSelect as any;
        return (
          <Component
            data={config.props}
            suggestions={suggestionsList}
            onSelect={(values: any) => {
              onInteraction?.(values);
            }}
          />
        );
      }

      case 'guided-input': {
        const { guidedQuestions } = config.props;

        if (!guidedQuestions || !Array.isArray(guidedQuestions) || guidedQuestions.length === 0) {
          throw new Error('guided-input requires guidedQuestions array prop');
        }

        const Component = UdgGlassGuidedInput as any;
        return (
          <Component
            data={config.props}
            onSubmit={(value: any) => {
              onInteraction?.(value);
            }}
          />
        );
      }

      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = config;
        throw new Error(`Unknown component type: ${(_exhaustive as any).type}`);
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown rendering error';

    console.error('[ComponentRenderer] Error:', errorMessage, config);

    // Fallback error display - no state updates!
    return (
      <div className="p-4 border border-red-500 bg-red-50 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="material-icons text-red-600">error</span>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">
              Component Rendering Error
            </h3>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            <details className="mt-2 text-xs text-red-600">
              <summary className="cursor-pointer">Config Details</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
                {JSON.stringify(config, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }
};

/**
 * Validates component configuration against manifest schema
 */
export const validateComponentConfig = (
  config: any
): config is ComponentConfig => {
  if (!config || typeof config !== 'object') {
    return false;
  }

  if (!config.type || typeof config.type !== 'string') {
    return false;
  }

  if (!config.props || typeof config.props !== 'object') {
    return false;
  }

  // Type-specific validation
  switch (config.type) {
    case 'button-group':
      return (
        Array.isArray(config.props.options) &&
        config.props.options.every(
          (opt: any) =>
            opt &&
            typeof opt === 'object' &&
            typeof opt.label === 'string' &&
            typeof opt.value === 'string'
        )
      );

    case 'multi-select':
      return (
        Array.isArray(config.props.options) &&
        config.props.options.every(
          (opt: any) =>
            opt &&
            typeof opt === 'object' &&
            typeof opt.label === 'string' &&
            typeof opt.value === 'string'
        )
      );

    case 'input':
      return typeof config.props.placeholder === 'string';

    case 'percentage-table':
      return (
        Array.isArray(config.props.items) &&
        config.props.items.every(
          (item: any) =>
            item &&
            typeof item === 'object' &&
            typeof item.label === 'string' &&
            typeof item.key === 'string'
        )
      );

    case 'document':
      return typeof config.props.content === 'string';

    default:
      return false;
  }
};

