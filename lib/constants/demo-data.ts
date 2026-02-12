// Top Gun themed demo data for interactive tutorial

export interface DemoClient {
  id: string
  name: string
}

export interface DemoCrew {
  id: string
  name: string
  short: string
  firstName: string
  lastName: string
  avatar: string
}

export interface DemoTaskType {
  id: string
  name: string
  color: string
}

export interface DemoProject {
  id: string
  name: string
  clientName: string
  status: 'rfq' | 'estimated' | 'accepted' | 'inProgress' | 'completed' | 'closed'
  taskType: string
  taskTypeColor: string
  crew?: string
}

export const DEMO_CLIENTS: DemoClient[] = [
  { id: 'client-1', name: 'Miramar Flight Academy' },
]

export const DEMO_CREW: DemoCrew[] = [
  { id: 'crew-1', name: 'Pete "Maverick" Mitchell', short: 'Maverick', firstName: 'Pete', lastName: 'Mitchell', avatar: '/avatars/pete.png' },
  { id: 'crew-2', name: 'Nick "Goose" Bradshaw', short: 'Goose', firstName: 'Nick', lastName: 'Bradshaw', avatar: '/avatars/nick.png' },
  { id: 'crew-3', name: 'Tom "Iceman" Kazansky', short: 'Iceman', firstName: 'Tom', lastName: 'Kazansky', avatar: '/avatars/tom.png' },
  { id: 'crew-4', name: 'Mike "Viper" Metcalf', short: 'Viper', firstName: 'Mike', lastName: 'Metcalf', avatar: '/avatars/mike.png' },
  { id: 'crew-5', name: 'Rick "Jester" Heatherly', short: 'Jester', firstName: 'Rick', lastName: 'Heatherly', avatar: '/avatars/rick.png' },
]

export const DEMO_TASK_TYPES: DemoTaskType[] = [
  { id: 'type-1', name: 'Cleaning', color: '#A5D4A0' },
  { id: 'type-2', name: 'Demolition', color: '#E8945A' },
  { id: 'type-3', name: 'Painting', color: '#7BA4D4' },
  { id: 'type-4', name: 'Sealing', color: '#8EC8E8' },
  { id: 'type-5', name: 'Paving', color: '#B088D4' },
  { id: 'type-6', name: 'Landscaping', color: '#7BC47B' },
  { id: 'type-7', name: 'Installation', color: '#D47B9F' },
  { id: 'type-8', name: 'Pressure Wash', color: '#D4C95A' },
  { id: 'type-9', name: 'Diagnostic', color: '#5AC8D4' },
  { id: 'type-10', name: 'Removal', color: '#E8B45A' },
  { id: 'type-11', name: 'Coating', color: '#5A7BD4' },
  { id: 'type-12', name: 'Planting', color: '#8ED4A0' },
]

export const DEMO_PROJECTS: DemoProject[] = [
  { id: 'proj-1', name: 'Flight Deck Coating', clientName: 'Miramar Flight Academy', status: 'inProgress', taskType: 'Coating', taskTypeColor: '#5A7BD4', crew: 'Maverick' },
  { id: 'proj-2', name: "O'Club Patio Resurface", clientName: "O'Club Bar & Grill", status: 'inProgress', taskType: 'Paving', taskTypeColor: '#B088D4', crew: 'Goose' },
  { id: 'proj-3', name: 'Hangar Siding Repair', clientName: 'Fightertown Hangars LLC', status: 'accepted', taskType: 'Installation', taskTypeColor: '#D47B9F', crew: 'Iceman' },
  { id: 'proj-4', name: "Charlie's Driveway", clientName: 'Charlie Blackwood', status: 'accepted', taskType: 'Sealing', taskTypeColor: '#8EC8E8', crew: 'Viper' },
  { id: 'proj-5', name: 'Runway Crack Repair', clientName: 'Miramar Flight Academy', status: 'rfq', taskType: 'Diagnostic', taskTypeColor: '#5AC8D4' },
  { id: 'proj-6', name: 'Briefing Room Install', clientName: 'Miramar Flight Academy', status: 'estimated', taskType: 'Installation', taskTypeColor: '#D47B9F' },
  { id: 'proj-7', name: 'MIG Detailing', clientName: 'Fightertown Hangars LLC', status: 'completed', taskType: 'Cleaning', taskTypeColor: '#A5D4A0', crew: 'Jester' },
  { id: 'proj-8', name: 'Locker Room Reno', clientName: 'Miramar Flight Academy', status: 'completed', taskType: 'Demolition', taskTypeColor: '#E8945A', crew: 'Maverick' },
]

