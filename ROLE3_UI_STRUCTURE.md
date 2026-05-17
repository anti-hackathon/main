# Role 3 UI Structure for CIRO

## Scope

This document is only for **Role 3: Mobile App Developer**.

Your responsibility is the **mobile app interface**:

- user crisis reporting
- operations dashboard
- map view
- reasoning feed
- simulation results

Do not take ownership of:

- Antigravity orchestration logic
- backend API design
- database design
- AI prompts

You only need enough backend knowledge to connect the UI correctly.

---

## Current Repo Reality

This repo already has an Expo app with these main mobile files:

- `app/auth.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/dashboard.tsx`
- `app/(tabs)/profile.tsx`
- `components/SimulationMap.tsx`
- `components/AgentTrace.tsx`
- `store/crisisStore.ts`
- `store/agentStore.ts`

So your job is **not** to start from zero.
Your job is to turn the current prototype into a proper Role 3 demo flow.

---

## Best UI Architecture For Your Role

Use this structure for your Role 3 branch.

```text
app/
  auth.tsx
  incident/
    [id].tsx
  simulation/
    [id].tsx
  (tabs)/
    index.tsx
    report.tsx
    operations.tsx
    profile.tsx
    _layout.tsx

components/
  report/
    ReportForm.tsx
    CategoryPicker.tsx
    PhotoPickerCard.tsx
    LocationPickerCard.tsx
  map/
    CrisisMap.tsx
    MapLegend.tsx
    RouteOverlay.tsx
  incident/
    CrisisCard.tsx
    IncidentSummaryCard.tsx
    ActionPlanCard.tsx
    AgentTraceCard.tsx
    SignalSourceCard.tsx
  simulation/
    SimulationStats.tsx
    BeforeAfterToggle.tsx
    OutcomeCard.tsx
    TimelineCard.tsx
  common/
    SectionHeader.tsx
    EmptyState.tsx
    StatusChip.tsx
    MetricCard.tsx
    ScreenShell.tsx

store/
  crisisStore.ts
  agentStore.ts

services/
  mobileApi.ts
  simulationEngine.ts
```

---

## Screen Structure

These are the exact UI screens you should own.

### 1. Auth Screen

Route:

- `app/auth.tsx`

Purpose:

- dispatcher login
- simple entry gate for demo

UI structure:

```text
AuthScreen
  Brand Header
    App title
    Subtitle
  Login Card
    Email input
    Password input
    Login button
    Toggle signup/login
```

Keep it simple.
This is not your judging screen.

---

### 2. Report Crisis Screen

Route:

- `app/(tabs)/report.tsx`

Purpose:

- citizen or dispatcher reports a crisis

UI structure:

```text
ReportScreen
  Screen Header
    Title
    Short helper text
  ReportForm
    Category picker
    Description text area
    Photo picker
    Location selector
    Urgency selector
    Use sample button
    Submit report button
  Submission Result Card
    Status
    Extracted location
    Severity
```

Fields:

- `category`
- `description`
- `photo`
- `location`
- `urgency`

This screen should replace the current raw signal-only flow in `app/(tabs)/dashboard.tsx`.

---

### 3. Operations Dashboard

Route:

- `app/(tabs)/operations.tsx`

Purpose:

- command center summary
- active incident monitoring

UI structure:

```text
OperationsScreen
  Top Header
    CIRO title
    Active incidents count
    System status chip
  Metrics Row
    Active incidents
    Critical incidents
    Pending actions
    Alerts sent
  Active Incidents Section
    Incident summary cards
  Agent Activity Section
    Recent execution logs
  Quick Actions Section
    Open map
    Open simulation
```

This is the executive overview screen.
Judges should understand the system in 5 seconds here.

---

### 4. Crisis Map Screen

Route:

- `app/(tabs)/index.tsx`

Purpose:

- visualize incidents on map
- show pre-response and post-response state

UI structure:

```text
MapScreen
  Header Bar
    Title
    Active crisis count
    Before/after toggle
  Full Map
    Incident markers
    Affected zone overlays
    Route overlays
  Floating Bottom Panel
    Congestion metric
    Blocked routes metric
    ETA metric
    Severity bar
  Floating Incident Sheet
    Selected incident summary
    View detail button
    Run simulation button
```

This screen already partially exists in `app/(tabs)/index.tsx`.
You should improve it, not replace it blindly.

---

### 5. Incident Detail Screen

Route:

- `app/incident/[id].tsx`

Purpose:

- show one incident in depth
- show reasoning and action plan

UI structure:

```text
IncidentDetailScreen
  Incident Hero Card
    Incident type
    Location
    Severity
    Confidence
  Situation Section
    Detected situation summary
    Impact summary
  Signals Section
    Weather signal
    Traffic signal
    Social signal
  Reasoning Section
    Agent trace cards
  Action Plan Section
    Planned actions list
  CTA Footer
    Simulate response button
```

This is one of the most important judging screens because it proves the system is agentic and explainable.

---

### 6. Simulation Screen

Route:

- `app/simulation/[id].tsx`

Purpose:

- show before vs after impact
- prove decisions helped

UI structure:

```text
SimulationScreen
  Header
    Incident title
    Simulation status
  Before/After Toggle
  Map Comparison Card
    Route before
    Route after
  Outcome Metrics Grid
    Congestion reduced
    ETA reduced
    People alerted
    Units dispatched
  Execution Timeline
    Minute by minute updates
  Outcome Summary Card
    Final result
```

This directly supports the challenge scoring around simulation and impact visualization.

---

### 7. Profile Screen

Route:

- `app/(tabs)/profile.tsx`

Purpose:

- basic operator profile
- not core to judging

UI structure:

```text
ProfileScreen
  Operator Card
  System Connection Card
  Location/Role Card
```

Do not spend much time here.

---

## Best Tab Layout For Role 3

Use this bottom tab structure:

```text
Tabs
  Map
  Report
  Operations
  Profile
```

Recommended route mapping:

- `index.tsx` -> `Map`
- `report.tsx` -> `Report`
- `operations.tsx` -> `Operations`
- `profile.tsx` -> `Profile`

The current `dashboard.tsx` should become `report.tsx` or be replaced by it.

---

## Component Structure Per Screen

### Report Screen Components

```text
ReportForm
  CategoryPicker
  DescriptionInput
  PhotoPickerCard
  LocationPickerCard
  UrgencySelector
  SubmitButton
```

### Map Screen Components

```text
CrisisMap
  CrisisMarker
  AffectedZoneOverlay
  RouteOverlay
MapLegend
SimulationStats
BeforeAfterToggle
SelectedIncidentSheet
```

### Incident Detail Components

```text
IncidentSummaryCard
SignalSourceCard
AgentTraceCard
ActionPlanCard
StatusChip
```

### Simulation Screen Components

```text
SimulationStats
OutcomeCard
TimelineCard
BeforeAfterToggle
RouteOverlay
```

---

## Data Structure You Need In UI

These are the UI-level data blocks your screens need.

### Crisis Card Data

```ts
{
  id: string;
  type: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence_score: number;
  estimated_affected_people: number;
  affected_area_km2: number;
  reasoning: string;
  coordinates?: { lat: number; lng: number };
}
```

### Agent Trace Data

```ts
{
  agentName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  inputSummary?: string;
  outputSummary?: string;
  reasoning?: string[];
  rawJson?: unknown;
}
```

### Response Plan Data

```ts
{
  crisis_id: string;
  priority: string;
  actions: {
    action_id: string;
    type: string;
    description: string;
    responsible_agency: string;
    estimated_time_minutes: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
  alternate_routes: {
    from: string;
    to: string;
    via: string;
    estimated_delay_reduction: number;
  }[];
}
```

### Simulation Result Data

```ts
{
  congestion_reduction_pct: number;
  response_time_minutes: number;
  people_notified: number;
  routes_updated: number;
}
```

---

## Best Role 3 Build Order

Build your UI in this order.

### Step 1

Fix the tab structure.

Target:

- `Map`
- `Report`
- `Operations`
- `Profile`

### Step 2

Turn the current signal screen into a real report screen.

Target:

- category
- description
- location
- urgency
- sample data shortcut

### Step 3

Improve the map screen.

Target:

- better header
- selected incident card
- visible before/after state

### Step 4

Add incident detail screen.

Target:

- detected situation
- reasoning feed
- action plan

### Step 5

Add simulation screen.

Target:

- outcome metrics
- route change display
- execution timeline

### Step 6

Polish and connect to live backend responses.

Target:

- loading states
- empty states
- error states

---

## What You Should Touch In The Repo

Main Role 3 files:

- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/dashboard.tsx`
- `app/(tabs)/profile.tsx`
- `app/auth.tsx`
- `components/SimulationMap.tsx`
- `components/AgentTrace.tsx`
- `components/CrisisCard.tsx`
- `store/crisisStore.ts`
- `store/agentStore.ts`
- `services/claudeAgent.ts`

New files you will likely add:

- `app/(tabs)/report.tsx`
- `app/(tabs)/operations.tsx`
- `app/incident/[id].tsx`
- `app/simulation/[id].tsx`
- new reusable UI components under `components/`

---

## What You Should Not Own

Avoid spending time inside:

- `backend/`
- `server/src/orchestrator.ts`
- AI prompt engineering files
- Firebase admin server setup

Only touch those if the UI is blocked.

---

## Demo Flow Your UI Must Support

Your final UI should support this clean demo story:

1. Open app and log in.
2. Submit a flood report from the report screen.
3. See the incident appear on the map.
4. Open the incident detail page.
5. Show reasoning trace and planned actions.
6. Open simulation screen.
7. Show before vs after metrics and map change.

If your UI does this smoothly, your Role 3 work is strong.

---

## First Concrete Branch Goal

Your first clean Role 3 milestone should be:

`Report screen -> map update -> incident detail -> simulation view`

That single chain is enough to make your branch valuable and demo-ready.
