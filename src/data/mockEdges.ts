export interface EdgeNode {
  id: string;
  label: string;
  region: string;
  city: string;
  country: string;
  latencyMs: number;
  bandwidthGbps: number;
  healthy: boolean;
  baseUrl: string;
}

export const MOCK_EDGES: EdgeNode[] = [
  {
    id: 'edge_mum1',
    label: 'Mumbai Primary',
    region: 'ap-south-1',
    city: 'Mumbai',
    country: 'IN',
    latencyMs: 12,
    bandwidthGbps: 40,
    healthy: true,
    baseUrl: 'https://cdn1.mum.dhobiflix.in',
  },
  {
    id: 'edge_mum2',
    label: 'Mumbai Secondary',
    region: 'ap-south-1',
    city: 'Mumbai',
    country: 'IN',
    latencyMs: 15,
    bandwidthGbps: 20,
    healthy: true,
    baseUrl: 'https://cdn2.mum.dhobiflix.in',
  },
  {
    id: 'edge_hyd1',
    label: 'Hyderabad',
    region: 'ap-south-2',
    city: 'Hyderabad',
    country: 'IN',
    latencyMs: 28,
    bandwidthGbps: 20,
    healthy: true,
    baseUrl: 'https://cdn1.hyd.dhobiflix.in',
  },
  {
    id: 'edge_sgp1',
    label: 'Singapore',
    region: 'ap-southeast-1',
    city: 'Singapore',
    country: 'SG',
    latencyMs: 65,
    bandwidthGbps: 100,
    healthy: true,
    baseUrl: 'https://cdn1.sgp.dhobiflix.in',
  },
  {
    id: 'edge_dub1',
    label: 'Dublin',
    region: 'eu-west-1',
    city: 'Dublin',
    country: 'IE',
    latencyMs: 140,
    bandwidthGbps: 100,
    healthy: true,
    baseUrl: 'https://cdn1.dub.dhobiflix.in',
  },
  {
    id: 'edge_iad1',
    label: 'Ashburn',
    region: 'us-east-1',
    city: 'Ashburn',
    country: 'US',
    latencyMs: 175,
    bandwidthGbps: 100,
    healthy: true,
    baseUrl: 'https://cdn1.iad.dhobiflix.in',
  },
  {
    id: 'edge_pdx1',
    label: 'Portland',
    region: 'us-west-2',
    city: 'Portland',
    country: 'US',
    latencyMs: 210,
    bandwidthGbps: 40,
    healthy: false,
    baseUrl: 'https://cdn1.pdx.dhobiflix.in',
  },
];

export function getHealthyEdges(): EdgeNode[] {
  return MOCK_EDGES.filter((e) => e.healthy);
}

export function getBestEdge(): EdgeNode {
  const healthy = getHealthyEdges();
  if (healthy.length === 0) throw new Error('No healthy edge nodes available');
  return healthy.reduce((best, curr) => (curr.latencyMs < best.latencyMs ? curr : best));
}

export function getEdgeById(id: string): EdgeNode | undefined {
  return MOCK_EDGES.find((e) => e.id === id);
}
