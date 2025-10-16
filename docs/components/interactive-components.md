# Interactive Components - Umfrage-spezifische Komponenten

## 🎯 Übersicht

Diese Komponenten sind speziell für die MSQ Survey-Umfrage entwickelt und handhaben alle interaktiven Elemente der 18 Umfrage-Schritte.

## 📋 Komponenten-Übersicht

| Komponente | Verwendung | Steps | Features |
|------------|------------|-------|----------|
| `udg-glass-button-group` | Single/Multi-Select | 1,2,4,6,7,8,13,15,17 | Voice Input, Custom Options |
| `udg-glass-multi-select` | Multi-Select mit Constraints | 8,17 | Min/Max Limits, Custom Options |
| `udg-glass-percentage-table` | Zeitverteilung | 5 | Real-time Validation |
| `udg-glass-smart-multi-select` | AI-Tools Auswahl | 13b | Suggestions, Custom Input |
| `udg-glass-input` | Text-Eingabe | 3,9,11,14,16 | Validation, Auto-focus |
| `udg-glass-guided-input` | Geführte Eingabe | 3,9,11,14,16 | Hints, Examples |
| `udg-glass-document` | Dokument-Anzeige | 18 | Markdown, Formatting |
| `udg-glass-info-message` | Info-Nachrichten | 0,7 | Acknowledgment, Rich Text |

## 🎛️ Detaillierte Komponenten

### 1. UdgGlassButtonGroup

**Verwendung**: Single-Select und Multi-Select Buttons für die meisten Umfrage-Schritte.

#### Props Interface
```typescript
interface UdgGlassButtonGroupProps {
  data: ButtonComponentData;
}

interface ButtonComponentData {
  question?: string;
  options: Array<{
    label: string;
    value: string;
    id?: string;
  }>;
  allowMultiple?: boolean;
  columns?: number;
}
```

#### Verwendung in Steps
- **Step 1** (Agency): `allowMultiple: false, columns: 2`
- **Step 2** (Department): `allowMultiple: false, columns: 2`
- **Step 4** (Job Level): `allowMultiple: false, columns: 1`
- **Step 6** (Work Focus): `allowMultiple: false, columns: 1`
- **Step 7** (Phase Overview): `allowMultiple: false, columns: 1`
- **Step 8** (Phase Selection): `allowMultiple: true, columns: 1`
- **Step 13** (AI Integration): `allowMultiple: false, columns: 1`
- **Step 15** (Collaboration Friction): `allowMultiple: false, columns: 1`
- **Step 17** (Magic Wand): `allowMultiple: true, columns: 1`

#### Features
- **Single-Select Mode**: Sofortige Auswahl und Weiterleitung
- **Multi-Select Mode**: Checkbox-System mit Submit-Button
- **Voice Input**: Automatische Spracherkennung (Debug-Modus)
- **Custom Options**: "Other" Option mit Text-Input
- **Animations**: Staggered Animation der Optionen
- **Visual States**: Hover, Selected, Voice-Matched, Loading

#### Voice Integration
```typescript
// Voice Input Handler
const handleVoiceInput = async () => {
  const transcript = await listen();
  const match = parseButtonChoice(transcript, options);
  
  if (match && match.confidence > 0.7) {
    // High confidence - auto-select
    if (data.allowMultiple) {
      setSelected([...selected, match.value]);
    } else {
      sendResponse(match.value);
    }
  } else if (match) {
    // Low confidence - show confirmation
    setShowConfirmation(true);
  }
};
```

---

### 2. UdgGlassMultiSelect

**Verwendung**: Multi-Select mit Min/Max-Constraints für komplexe Auswahlen.

#### Props Interface
```typescript
interface UdgGlassMultiSelectProps {
  data: MultiSelectComponentData;
}

interface MultiSelectComponentData {
  question: string;
  options: MultiSelectOption[];
  min?: number;
  max?: number;
}

interface MultiSelectOption {
  id: string;
  label: string;
  description?: string;
}
```

#### Verwendung in Steps
- **Step 8** (Phase Selection): `min: 1` - Mindestens eine Phase
- **Step 17** (Magic Wand): `min: 1, max: 3` - 1-3 Automatisierungen

#### Features
- **Constraints**: Min/Max-Auswahl-Limits mit Validierung
- **Custom Options**: Dynamisches Hinzufügen von Optionen
- **Voice Modes**: Batch oder Sequential Voice Input
- **Real-time Validation**: Sofortige Überprüfung der Auswahl
- **Error Handling**: Benutzerfreundliche Fehlermeldungen
- **Progress Tracking**: Anzeige der aktuellen Auswahl

#### Voice Modes
```typescript
// Batch Mode (wenige Optionen)
const handleVoiceBatch = async () => {
  const transcript = await listen();
  const matches = parseMultiSelect(transcript, options);
  setSelected(matches.map(m => m.value));
};

// Sequential Mode (viele Optionen)
const handleVoiceSequential = async () => {
  while (true) {
    const transcript = await listen(10000);
    if (isDoneCommand(transcript)) break;
    
    const match = parseButtonChoice(transcript, options);
    if (match) {
      setSelected([...selected, match.value]);
    }
  }
};
```

---

### 3. UdgGlassPercentageTable

**Verwendung**: Prozentuale Zeitverteilung mit Validierung.

#### Props Interface
```typescript
interface UdgGlassPercentageTableProps {
  data: PercentageTableComponentData;
}

interface PercentageTableComponentData {
  question: string;
  items: string[];
  total?: number; // Default: 100
}
```

#### Verwendung in Steps
- **Step 5** (Work Type Distribution): Zeitverteilung auf Kategorien

#### Features
- **Real-time Validation**: Sofortige Überprüfung der Summe
- **Visual Feedback**: Farbkodierung bei Validierung
- **Auto-calculation**: Automatische Berechnung der Summe
- **Error Prevention**: Verhindert ungültige Eingaben
- **Responsive Design**: Anpassung an verschiedene Bildschirmgrößen

#### Validation Logic
```typescript
const validatePercentage = (values: number[], total: number = 100) => {
  const sum = values.reduce((acc, val) => acc + val, 0);
  const isValid = Math.abs(sum - total) < 0.01; // Toleranz für Rundungsfehler
  
  return {
    isValid,
    sum,
    difference: Math.abs(sum - total),
    message: isValid 
      ? `Perfect! Total: ${sum}%`
      : `Total: ${sum}% (${total - sum > 0 ? 'Add' : 'Remove'} ${Math.abs(total - sum)}%)`
  };
};
```

---

### 4. UdgGlassSmartMultiSelect

**Verwendung**: Intelligente Multi-Select mit Vorschlägen für AI-Tools.

#### Props Interface
```typescript
interface UdgGlassSmartMultiSelectProps {
  data: SmartMultiSelectComponentData;
}

interface SmartMultiSelectComponentData {
  question: string;
  suggestions: string[];
  placeholder: string;
  min?: number;
}
```

#### Verwendung in Steps
- **Step 13b** (AI Tools Details): Auswahl von AI-Tools

#### Features
- **Smart Suggestions**: Vordefinierte Optionen
- **Custom Input**: Freie Texteingabe
- **Auto-complete**: Vorschläge während der Eingabe
- **Validation**: Mindestanzahl-Auswahl
- **Voice Input**: Sprachsteuerung für Auswahl

#### Auto-complete Logic
```typescript
const handleInputChange = (value: string) => {
  setInputValue(value);
  
  // Filter suggestions based on input
  const filtered = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase())
  );
  
  setFilteredSuggestions(filtered);
  setShowSuggestions(value.length > 0);
};
```

---

### 5. UdgGlassInput

**Verwendung**: Einfache Text-Eingabe für offene Fragen.

#### Props Interface
```typescript
interface UdgGlassInputProps {
  data: InputComponentData;
}

interface InputComponentData {
  question: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  type?: 'text' | 'email' | 'number';
}
```

#### Verwendung in Steps
- **Step 3** (Role): Freie Rollen-Eingabe
- **Step 9** (Phase Details): Spezifische Phasen-Details
- **Step 11** (Tools Details): Spezifische Tools-Details
- **Step 14** (Pain Points): Spezifische Pain Points
- **Step 16** (Automation Ideas): Spezifische Automatisierungs-Ideen

#### Features
- **Validation**: Real-time Validierung
- **Auto-focus**: Automatischer Fokus bei Anzeige
- **Character Count**: Anzeige der Zeichenanzahl
- **Enter Submit**: Enter-Taste zum Absenden
- **Voice Input**: Sprachsteuerung (Debug-Modus)

---

### 6. UdgGlassGuidedInput

**Verwendung**: Geführte Eingabe mit Hints und Beispielen.

#### Props Interface
```typescript
interface UdgGlassGuidedInputProps {
  data: GuidedInputComponentData;
}

interface GuidedInputComponentData {
  question: string;
  placeholder?: string;
  hints: string[];
  examples: string[];
  maxLength?: number;
  required?: boolean;
}
```

#### Features
- **Hints**: Kontextuelle Hinweise
- **Examples**: Beispiele für Eingaben
- **Progressive Disclosure**: Hints werden schrittweise angezeigt
- **Validation**: Erweiterte Validierung mit Hints
- **Voice Input**: Sprachsteuerung mit Bestätigung

---

### 7. UdgGlassDocument

**Verwendung**: Anzeige von formatierten Dokumenten und Zusammenfassungen.

#### Props Interface
```typescript
interface UdgGlassDocumentProps {
  data: DocumentComponentData;
}

interface DocumentComponentData {
  title: string;
  content: string;
  format: 'markdown' | 'html' | 'text';
  actions?: Array<{
    label: string;
    action: () => void;
    variant: 'primary' | 'secondary';
  }>;
}
```

#### Verwendung in Steps
- **Step 18** (Quick Recap): Zusammenfassung der Antworten

#### Features
- **Markdown Support**: Rendering von Markdown-Inhalten
- **HTML Support**: Sichere HTML-Darstellung
- **Actions**: Call-to-Action Buttons
- **Responsive**: Anpassung an verschiedene Bildschirmgrößen
- **Print Support**: Druck-optimierte Darstellung

---

### 8. UdgGlassInfoMessage

**Verwendung**: Informative Nachrichten mit Acknowledgment.

#### Props Interface
```typescript
interface UdgGlassInfoMessageProps {
  data: InfoMessageComponentData;
}

interface InfoMessageComponentData {
  message: string;
  requiresAcknowledgement?: boolean;
  type?: 'info' | 'warning' | 'success' | 'error';
}
```

#### Verwendung in Steps
- **Step 0** (Intro): Willkommensnachricht
- **Step 7** (Phase Overview): Kontext vor Phasen-Auswahl

#### Features
- **Rich Text**: Markdown-Formatierung
- **Acknowledgment**: Bestätigung erforderlich
- **Type Variants**: Verschiedene Nachrichtentypen
- **Animation**: Smooth Ein-/Ausblenden
- **Accessibility**: Screen Reader optimiert

---

## 🎨 Design-Patterns

### Glassmorphism-Effekte

```css
/* Base Glass Effect */
.glass-component {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

/* Selected State */
.glass-component-selected {
  background: linear-gradient(135deg, 
    rgba(186, 230, 253, 0.4) 0%, 
    rgba(254, 243, 242, 0.4) 50%, 
    rgba(219, 234, 254, 0.4) 100%);
  border: 1px solid rgba(96, 165, 250, 0.3);
}

/* Hover State */
.glass-component:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
}
```

### Animation-Patterns

```typescript
// Staggered Animation
const staggerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.08,
      type: 'spring',
      stiffness: 200,
      damping: 20
    }
  })
};

// Hover Animation
const hoverVariants = {
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};
```

### State Management

```typescript
// Component State Pattern
const [selected, setSelected] = useState<string[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [showConfirmation, setShowConfirmation] = useState(false);

// State Updates
const handleSelection = (value: string) => {
  setError(null);
  if (selected.includes(value)) {
    setSelected(selected.filter(v => v !== value));
  } else {
    setSelected([...selected, value]);
  }
};
```

## 🔧 Integration mit Survey-System

### Step Definition Integration

```typescript
// Step Definition Example
const stepDefinition = {
  type: 'static',
  question: "Which agency do you work for?",
  component: {
    type: 'button-group',
    props: {
      options: agencies.map(a => ({ label: a, value: a })),
      allowMultiple: false,
      columns: 2
    }
  },
  nextStep: 'department'
};
```

### Component Rendering

```typescript
// Component Renderer
const renderComponent = (config: ComponentConfig) => {
  switch (config.type) {
    case 'button-group':
      return <UdgGlassButtonGroup data={config.props} />;
    case 'multi-select':
      return <UdgGlassMultiSelect data={config.props} />;
    case 'percentage-table':
      return <UdgGlassPercentageTable data={config.props} />;
    // ... other components
  }
};
```

### Validation Integration

```typescript
// Validation Pattern
const validateResponse = (value: any, component: ComponentConfig) => {
  switch (component.type) {
    case 'button-group':
      return validateButtonGroup(value, component.props);
    case 'multi-select':
      return validateMultiSelect(value, component.props);
    case 'percentage-table':
      return validatePercentageTable(value, component.props);
    // ... other validations
  }
};
```

---

**Nächste Schritte**: Siehe [State Management](state-management.md) für detaillierte Dokumentation des Zustand-Managements.