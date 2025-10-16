# Step Processor - Kern-Verarbeitungslogik

## 🎯 Übersicht

Der **Step Processor** ist das Herzstück des MSQ Survey Systems. Er fungiert als Master Controller und leitet alle Umfrage-Schritte an die entsprechenden Handler weiter.

## 🏗️ Architektur

### Master Switch Pattern

```typescript
export async function processStep(
  stepId: string,
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const stepDef = STEP_DEFINITIONS[stepId];
  
  // Route to appropriate handler based on step type
  if (stepDef.type === 'static') {
    return await handleStaticStep(stepId, userResponse, conversationState);
  } 
  else if (stepDef.type === 'iterative') {
    return await handleIterativeStep(stepId, userResponse, conversationState);
  }
  else if (stepDef.type === 'dynamic') {
    return await handleDynamicStep(stepId, userResponse, conversationState);
  }
}
```

## 📊 Step Types

### 1. Static Steps (11 Steps)

**Direkte Verarbeitung ohne AI-Integration**

```typescript
// Static Step Flow
if (stepDef.type === 'static') {
  result = await handleStaticStep(stepId, userResponse, conversationState);
}
```

**Verarbeitete Steps:**
- Step 0 (Intro)
- Step 1 (Agency)
- Step 2 (Department)
- Step 4 (Job Level)
- Step 5 (Work Distribution)
- Step 6 (Work Focus)
- Step 7 (Phase Overview)
- Step 8 (Phase Selection)
- Step 13b (AI Tools)
- Step 15 (Collaboration)
- Step 17 (Magic Wand)

### 2. Dynamic Steps (5 Steps)

**AI-gestützte Verarbeitung mit OpenAI-Integration**

```typescript
// Dynamic Step Flow
else if (stepDef.type === 'dynamic') {
  switch (stepDef.handler) {
    case 'role-handler':
      result = await handleRoleStep(userResponse, conversationState);
      break;
    case 'tools-handler':
      result = await handleToolsStep(userResponse, conversationState);
      break;
    case 'pain-points-handler':
      result = await handlePainPointsStep(userResponse, conversationState);
      break;
    case 'automation-handler':
      result = await handleAutomationStep(userResponse, conversationState);
      break;
    case 'recap-handler':
      result = await handleRecapStep(userResponse, conversationState);
      break;
    case 'ai-integration-handler':
      result = await handleAiIntegrationStep(userResponse, conversationState);
      break;
  }
}
```

**Verarbeitete Steps:**
- Step 3 (Role) → `role-handler`
- Step 11 (Tools) → `tools-handler`
- Step 14 (Pain Points) → `pain-points-handler`
- Step 16 (Automation) → `automation-handler`
- Step 18 (Recap) → `recap-handler`
- Step 13 (AI Integration) → `ai-integration-handler`

### 3. Iterative Steps (2 Steps)

**Phasen-basierte Iterationen**

```typescript
// Iterative Step Flow
else if (stepDef.type === 'iterative') {
  switch (stepDef.handler) {
    case 'deep-dive-handler':
      result = await handleDeepDiveStep(userResponse, conversationState);
      break;
    case 'map-tools-handler':
      result = await handleMapToolsStep(userResponse, conversationState);
      break;
    case 'phase-allocation-handler':
      result = await handlePhaseAllocationStep(userResponse, conversationState);
      break;
  }
}
```

**Verarbeitete Steps:**
- Step 10 (Deep Dive) → `deep-dive-handler`
- Step 12 (Map Tools) → `map-tools-handler`
- Step 9 (Phase Allocation) → `phase-allocation-handler`

## 🔄 Processing Flow

### 1. Input Validation

```typescript
export async function processStep(
  stepId: string,
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  console.log(`📊 Processing step: ${stepId}`, { userResponse });

  const stepDef = STEP_DEFINITIONS[stepId];
  
  if (!stepDef) {
    throw new Error(`Unknown step: ${stepId}`);
  }

  console.log(`📊 Step definition:`, { type: stepDef.type, handler: stepDef.handler });
}
```

### 2. Handler Selection

```typescript
let result: StepResponse;

// Static steps
if (stepDef.type === 'static') {
  result = await handleStaticStep(stepId, userResponse, conversationState);
} 
// Iterative steps
else if (stepDef.type === 'iterative') {
  switch (stepDef.handler) {
    case 'deep-dive-handler':
      result = await handleDeepDiveStep(userResponse, conversationState);
      break;
    case 'map-tools-handler':
      result = await handleMapToolsStep(userResponse, conversationState);
      break;
    case 'phase-allocation-handler':
      result = await handlePhaseAllocationStep(userResponse, conversationState);
      break;
    default:
      throw new Error(`Unknown iterative handler: ${stepDef.handler}`);
  }
}
// Dynamic steps
else {
  switch (stepDef.handler) {
    case 'role-handler':
      result = await handleRoleStep(userResponse, conversationState);
      break;
    case 'tools-handler':
      result = await handleToolsStep(userResponse, conversationState);
      break;
    case 'phase-allocation-handler':
      result = await handlePhaseAllocationStep(userResponse, conversationState);
      break;
    case 'pain-points-handler':
      result = await handlePainPointsStep(userResponse, conversationState);
      break;
    case 'automation-handler':
      result = await handleAutomationStep(userResponse, conversationState);
      break;
    case 'recap-handler':
      result = await handleRecapStep(userResponse, conversationState);
      break;
    case 'ai-integration-handler':
      result = await handleAiIntegrationStep(userResponse, conversationState);
      break;
    default:
      throw new Error(`Unknown handler: ${stepDef.handler}`);
  }
}
```

### 3. Post-Processing

```typescript
// Post-processing: If response has no component but nextStep is static, add the component
if (!result.component && result.nextStep) {
  const nextStepDef = STEP_DEFINITIONS[result.nextStep];
  
  if (nextStepDef && nextStepDef.type === 'static') {
    console.log(`🔧 Adding component from next static step: ${result.nextStep}`);
    result.component = nextStepDef.component;
    result.assistantMessage = nextStepDef.question || result.assistantMessage;
  }
}

// Ensure currentPhase is set correctly
if (result.conversationState && !result.conversationState.currentPhase) {
  result.conversationState.currentPhase = getPhaseForStep(result.conversationState.currentStep);
}

return result;
```

## 🧩 Step Definitions Integration

### Step Definition Interface

```typescript
interface StepDefinition {
  type: 'static' | 'dynamic' | 'iterative';
  handler?: string;
  question?: string;
  component?: any;
  nextStep: string;
  iterateOver?: 'selected_phases';
  phaseKey?: string;
}
```

### Step Definition Examples

```typescript
// Static Step
intro: {
  type: 'static',
  question: "Welcome! 👋 Before we start, here's what this survey is all about:",
  component: {
    type: 'info-message',
    props: {
      message: "**Welcome to the MSQ Workflow Survey**...",
      requiresAcknowledgement: true
    }
  },
  nextStep: 'greeting_agency'
}

// Dynamic Step
role: {
  type: 'dynamic',
  handler: 'role-handler',
  nextStep: 'job_level'
}

// Iterative Step
deep_dive_start: {
  type: 'iterative',
  handler: 'deep-dive-handler',
  iterateOver: 'selected_phases',
  nextStep: 'collect_tools'
}
```

## 🔄 State Management

### Conversation State Updates

```typescript
// Update conversation state with collected data
const updatedConversationState = {
  ...conversationState,
  collectedData: {
    ...conversationState.collectedData,
    [stepId]: userResponse
  },
  currentStep: nextStep,
  currentPhase: getPhaseForStep(nextStep)
};
```

### Phase Management

```typescript
// Ensure currentPhase is set correctly
if (result.conversationState && !result.conversationState.currentPhase) {
  result.conversationState.currentPhase = getPhaseForStep(result.conversationState.currentStep);
}
```

## 🎯 Handler Routing Logic

### Static Handler Routing

```typescript
// Static Handler - Direct processing
if (stepDef.type === 'static') {
  // 1. Update collected data
  const updatedCollectedData = userResponse !== null
    ? { ...conversationState.collectedData, [stepId]: userResponse }
    : conversationState.collectedData;
  
  // 2. Get next step
  const nextStepDef = STEP_DEFINITIONS[stepDef.nextStep];
  
  // 3. Handle dynamic next steps
  if (nextStepDef.type === 'dynamic') {
    return await processStep(stepDef.nextStep, null, updatedConversationState);
  }
  
  // 4. Return static response
  return {
    assistantMessage: nextStepDef.question!,
    component: nextStepDef.component,
    nextStep: stepDef.nextStep,
    conversationState: updatedConversationState
  };
}
```

### Dynamic Handler Routing

```typescript
// Dynamic Handler - AI-powered processing
else if (stepDef.type === 'dynamic') {
  switch (stepDef.handler) {
    case 'role-handler':
      return await handleRoleStep(userResponse, conversationState);
    case 'tools-handler':
      return await handleToolsStep(userResponse, conversationState);
    // ... other handlers
  }
}
```

### Iterative Handler Routing

```typescript
// Iterative Handler - Phase-based processing
else if (stepDef.type === 'iterative') {
  switch (stepDef.handler) {
    case 'deep-dive-handler':
      return await handleDeepDiveStep(userResponse, conversationState);
    case 'map-tools-handler':
      return await handleMapToolsStep(userResponse, conversationState);
    // ... other handlers
  }
}
```

## 🔧 Error Handling

### Error Types

```typescript
// Unknown step error
if (!stepDef) {
  throw new Error(`Unknown step: ${stepId}`);
}

// Unknown handler error
default:
  throw new Error(`Unknown handler: ${stepDef.handler}`);
```

### Error Recovery

```typescript
try {
  const result = await processStep(stepId, userResponse, conversationState);
  return result;
} catch (error) {
  console.error(`Error processing step ${stepId}:`, error);
  
  // Return error response
  return {
    assistantMessage: "Sorry, something went wrong. Please try again.",
    component: {
      type: 'info-message',
      props: {
        message: "An error occurred. Please refresh and try again.",
        type: 'error'
      }
    },
    nextStep: conversationState.currentStep,
    conversationState: conversationState
  };
}
```

## 📊 Logging & Debugging

### Debug Logging

```typescript
console.log(`📊 Processing step: ${stepId}`, { userResponse });
console.log(`📊 Step definition:`, { type: stepDef.type, handler: stepDef.handler });
console.log(`🔧 Adding component from next static step: ${result.nextStep}`);
```

### Performance Monitoring

```typescript
const startTime = Date.now();
const result = await processStep(stepId, userResponse, conversationState);
const duration = Date.now() - startTime;

if (duration > 5000) {
  console.warn(`Slow step processing: ${stepId} took ${duration}ms`);
}
```

## 🔄 Recursive Processing

### Dynamic Step Chaining

```typescript
// If next step is dynamic, process it directly
if (nextStepDef.type === 'dynamic') {
  console.log(`🔄 Next step is dynamic (${stepDef.nextStep}), processing it now...`);
  
  const dynamicConversationState = {
    ...updatedConversationState,
    currentStep: stepDef.nextStep
  };
  
  // Call processStep recursively to handle the dynamic step
  return await processStep(stepDef.nextStep, null, dynamicConversationState);
}
```

### Iterative Step Chaining

```typescript
// If all phases completed, move to next step
if (allPhasesCompleted) {
  return await processStep('next_step', null, conversationState);
} else {
  // Continue with current iteration
  return {
    assistantMessage: `Processing ${nextPhase}...`,
    component: nextPhaseComponent,
    nextStep: currentStep,
    conversationState: updatedConversationState
  };
}
```

## 🎯 Performance Optimizations

### Handler Caching

```typescript
// Cache handler instances
const handlerCache = new Map();

const getHandler = (handlerName: string) => {
  if (!handlerCache.has(handlerName)) {
    const handler = require(`../handlers/${handlerName}`);
    handlerCache.set(handlerName, handler);
  }
  return handlerCache.get(handlerName);
};
```

### Lazy Loading

```typescript
// Lazy load handlers
const handleDynamicStep = async (stepId: string, userResponse: any, conversationState: ConversationState) => {
  const stepDef = STEP_DEFINITIONS[stepId];
  const handler = await import(`../handlers/${stepDef.handler}`);
  return await handler[`handle${stepDef.handler.charAt(0).toUpperCase() + stepDef.handler.slice(1)}`](userResponse, conversationState);
};
```

---

**Nächste Schritte**: Siehe [OpenAI Integration](openai-integration.md) für detaillierte Dokumentation der AI-Service-Integration.