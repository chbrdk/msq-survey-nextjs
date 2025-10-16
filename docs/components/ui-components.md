# UI-Komponenten - Glassmorphism Design System

## 🎨 Design-System Übersicht

Das MSQ Survey System verwendet ein **Glassmorphism Design System** mit modernen, glasartigen UI-Elementen. Alle Komponenten folgen einem einheitlichen Design-Prinzip mit Transparenz, Blur-Effekten und sanften Animationen.

## 🧩 Haupt-Komponenten

### 1. GlassContainer (Root Component)

**Datei**: `src/components/glass/GlassContainer.tsx`

Die Haupt-Container-Komponente, die das gesamte UI-Layout verwaltet.

```typescript
interface GlassContainerProps {
  // Automatisch von useChatStore verwaltet
  messages: Message[];
  isLoading: boolean;
  isInitialized: boolean;
  initializeChat: () => Promise<void>;
  resetChat: () => void;
  error: string | null;
}
```

**Features:**
- **Responsive Layout**: Zentrierte Hauptansicht mit fester Breite
- **Particle Background**: Animierte Partikel im Hintergrund
- **Debug Mode**: Voice-Features nur im Debug-Modus aktiviert
- **Auto-Reset**: URL-Parameter `?reset=true` löscht localStorage
- **State Management**: Integration mit Zustand Store

**Layout-Struktur:**
```
GlassContainer
├── ParticleBackground (Hintergrund)
├── GlassHeader (Navigation + Progress)
├── GlassCenteredView (Hauptinhalt)
├── HistoryPanel (Sidebar)
├── BackButton (Navigation)
└── VoiceIndicator (Debug Mode)
```

---

### 2. GlassHeader (Navigation & Progress)

**Datei**: `src/components/glass/GlassHeader.tsx`

Sticky Header mit Logo, Progress-Anzeige und Action-Buttons.

```typescript
interface GlassHeaderProps {
  onHistoryToggle: () => void;
  isHistoryOpen: boolean;
}
```

**Features:**
- **Sticky Positioning**: Fixiert oben mit z-index 50
- **Progress Indicator**: Animierte Fortschrittsanzeige mit Dot
- **Action Buttons**: History, Reset (Debug), Voice Indicator
- **Responsive Design**: Anpassung an verschiedene Bildschirmgrößen
- **Debug Mode**: Zusätzliche Buttons nur im Debug-Modus

**Komponenten:**
- **Logo**: MSQ Logo links oben
- **Progress Bar**: Vertikale Linie mit animiertem Dot
- **History Button**: Toggle für Sidebar
- **Reset Button**: Neustart der Umfrage (Debug)
- **Voice Indicator**: Zeigt aktive Sprachfunktion

---

### 3. GlassCenteredView (Hauptinhalt)

**Datei**: `src/components/glass/GlassCenteredView.tsx`

Zentrale Ansicht für Nachrichten und interaktive Komponenten.

```typescript
interface GlassCenteredViewProps {
  message?: Message;
  isLoading: boolean;
  error: string | null;
}
```

**Features:**
- **Message Display**: Bot-Nachrichten mit Typewriter-Effekt
- **Loading States**: Zentrale Loading-Animation
- **Error Handling**: Benutzerfreundliche Fehleranzeige
- **Voice Integration**: Auto-Speak und Auto-Listen
- **Completion Screen**: Spezielle Ansicht bei Umfrage-Ende
- **Quick Recap**: Zusammenfassung der Antworten

**States:**
1. **Loading**: Ball-Loader mit Text
2. **Error**: Fehlermeldung mit Icon
3. **Message**: Bot-Nachricht + Komponente
4. **Complete**: Abschluss-Screen
5. **Empty**: Initialisierungs-Screen

---

### 4. BackButton (Navigation)

**Datei**: `src/components/glass/BackButton.tsx`

Floating Back-Button für Navigation zur vorherigen Frage.

```typescript
// Keine Props - verwendet useChatStore direkt
```

**Features:**
- **Conditional Display**: Nur sichtbar wenn Navigation möglich
- **Confirmation Dialog**: Bestätigung vor Zurück-Navigation
- **Smooth Animation**: Framer Motion Animationen
- **State Management**: Integration mit Chat Store
- **Accessibility**: Keyboard-navigierbar

**Animation:**
- **Enter**: Slide-in von links
- **Exit**: Slide-out nach links
- **Hover**: Scale-Effekt
- **Tap**: Scale-down Effekt

---

## 🎛️ Interactive Components

### 1. UdgGlassButtonGroup (Single/Multi-Select)

**Datei**: `src/components/interactive/udg-glass-button-group.tsx`

Button-Gruppe für Single- oder Multi-Select-Auswahl.

```typescript
interface UdgGlassButtonGroupProps {
  data: ButtonComponentData;
}

interface ButtonComponentData {
  question?: string;
  options: Array<{ label: string; value: string; id?: string }>;
  allowMultiple?: boolean;
  columns?: number;
}
```

**Features:**
- **Single/Multi-Select**: Konfigurierbar über `allowMultiple`
- **Voice Input**: Sprachsteuerung im Debug-Modus
- **Custom Options**: "Other" Option mit Text-Input
- **Animations**: Staggered Animation der Optionen
- **Visual Feedback**: Hover, Selected, Voice-Matched States
- **Responsive**: Anpassung an verschiedene Bildschirmgrößen

**Interactions:**
- **Click**: Sofortige Auswahl bei Single-Select
- **Multi-Select**: Checkbox-System mit Submit-Button
- **Voice**: Automatische Erkennung und Bestätigung
- **Custom**: Text-Input für "Other" Optionen

---

### 2. UdgGlassMultiSelect (Multi-Select mit Constraints)

**Datei**: `src/components/interactive/udg-glass-multi-select.tsx`

Erweiterte Multi-Select-Komponente mit Min/Max-Constraints.

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

**Features:**
- **Constraints**: Min/Max-Auswahl-Limits
- **Custom Options**: Dynamisches Hinzufügen von Optionen
- **Voice Modes**: Batch oder Sequential Voice Input
- **Validation**: Echtzeit-Validierung der Auswahl
- **Error Handling**: Benutzerfreundliche Fehlermeldungen
- **Progress Tracking**: Anzeige der aktuellen Auswahl

**Voice Modes:**
- **Batch**: Alle Auswahlen auf einmal sprechen
- **Sequential**: Einzeln sprechen, "done" zum Beenden

---

### 3. UdgGlassPercentageTable (Zeitverteilung)

**Datei**: `src/components/interactive/udg-glass-percentage-table.tsx`

Tabelle für Prozentuale Zeitverteilung mit Validierung.

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

**Features:**
- **Real-time Validation**: Sofortige Überprüfung der Summe
- **Visual Feedback**: Farbkodierung bei Validierung
- **Auto-calculation**: Automatische Berechnung der Summe
- **Error Prevention**: Verhindert ungültige Eingaben
- **Responsive Design**: Anpassung an verschiedene Bildschirmgrößen

---

### 4. UdgGlassSmartMultiSelect (AI-Tools)

**Datei**: `src/components/interactive/udg-glass-smart-multi-select.tsx`

Intelligente Multi-Select mit Vorschlägen und Custom-Input.

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

**Features:**
- **Smart Suggestions**: Vordefinierte Optionen
- **Custom Input**: Freie Texteingabe
- **Auto-complete**: Vorschläge während der Eingabe
- **Validation**: Mindestanzahl-Auswahl
- **Voice Input**: Sprachsteuerung für Auswahl

---

## 🎨 Design-Tokens

### Farben

```css
/* Primary Colors */
--primary-50: #f0f9ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;

/* Gray Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-700: #374151;
--gray-900: #111827;

/* Status Colors */
--green-50: #f0fdf4;
--green-600: #16a34a;
--red-50: #fef2f2;
--red-600: #dc2626;
```

### Glassmorphism-Effekte

```css
/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

/* Glass Button */
.glass-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

/* Glass Gradient Border */
.glass-gradient-border {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Animationen

```css
/* Hover Effects */
.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* Loading Animation */
@keyframes ball-loader {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Voice Listening */
.voice-listening {
  animation: pulse 1s infinite;
}

/* Gradient Animation */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

## 🎭 Animation-System

### Framer Motion Integration

```typescript
// Page Transitions
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 1.1, y: -20 }}
  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
>

// Staggered Animations
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ 
    delay: index * 0.08,
    type: 'spring',
    stiffness: 200,
    damping: 20
  }}
>

// Hover Animations
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

### CSS-Animationen

```css
/* Typewriter Effect */
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

/* Pulse Effect */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Gradient Shift */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Mobile Optimierungen

- **Touch Targets**: Mindestens 44px für Touch-Interaktionen
- **Swipe Gestures**: Unterstützung für Touch-Navigation
- **Viewport**: Optimiert für verschiedene Bildschirmgrößen
- **Performance**: Reduzierte Animationen auf mobilen Geräten

## ♿ Accessibility

### ARIA-Labels

```typescript
// Button Accessibility
<button
  aria-label="Go back one step"
  title="Go back one step"
  role="button"
>

// Form Accessibility
<div role="group" aria-labelledby="question-label">
  <label id="question-label">{question}</label>
  {/* Options */}
</div>
```

### Keyboard Navigation

- **Tab Order**: Logische Tab-Reihenfolge
- **Enter/Space**: Aktivierung von Buttons
- **Escape**: Schließen von Modals
- **Arrow Keys**: Navigation in Listen

### Screen Reader Support

- **Semantic HTML**: Korrekte HTML-Semantik
- **ARIA Attributes**: Beschreibende Attribute
- **Live Regions**: Dynamische Inhalte-Updates
- **Focus Management**: Sichtbarer Fokus-Indikator

---

**Nächste Schritte**: Siehe [Interactive Components](interactive-components.md) für detaillierte Dokumentation der Umfrage-spezifischen Komponenten.