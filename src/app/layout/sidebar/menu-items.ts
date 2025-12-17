export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  defaultSelected?: string;
  children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', icon: 'home', route: '/dashboard' },
  {
    label: 'Maps',
    icon: 'map',
    route: '/maps',
    defaultSelected: '/maps/tourist',
    children: [
      { label: 'ព្រំដែន', icon: 'public', route: '/maps/border' },
      { label: 'Tourist Map', icon: 'place', route: '/maps/tourist' },
      { label: 'Hotel Map', icon: 'hotel', route: '/maps/hotel' },
      { label: 'Weather Map', icon: 'wb_sunny', route: '/maps/weather' }
    ]
  },
  { 
    label: 'Politics', 
    icon: 'gavel', 
    route: '/politics' 
  }
];
