import { supabase, isSupabaseConfigured } from '../supabase';
import { INITIAL_COMPLAINTS } from '../mockDataService';

export interface AnalyticsSummary {
  totalCount: number;
  openCount: number;
  resolvedCount: number;
  criticalCount: number;
  avgResolutionHours: number;
  categoryDistribution: { name: string; value: number }[];
  wardDistribution: { ward: string; count: number }[];
  monthlyTrends: { month: string; reported: number; resolved: number }[];
}

export async function fetchAuthorityAnalytics(): Promise<AnalyticsSummary> {
  let complaintsList = INITIAL_COMPLAINTS;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`*, categories(name)`);

      if (!error && data && data.length > 0) {
        complaintsList = data.map((item: any) => ({
          id: item.id,
          complaintCode: item.complaint_code,
          citizenId: item.citizen_id,
          categoryId: item.category_id,
          categoryName: item.categories?.name || 'Water Issue',
          severity: item.severity,
          status: item.status,
          address: item.address,
          pincode: item.pincode,
          description: item.description,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching analytics from Supabase:', e);
    }
  }

  const totalCount = complaintsList.length;
  const openCount = complaintsList.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const resolvedCount = complaintsList.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const criticalCount = complaintsList.filter((c) => c.severity === 'Critical').length;

  // Category distribution
  const catMap: Record<string, number> = {};
  complaintsList.forEach((c) => {
    const name = c.categoryName || 'Other';
    catMap[name] = (catMap[name] || 0) + 1;
  });
  const categoryDistribution = Object.keys(catMap).map((key) => ({
    name: key,
    value: catMap[key],
  }));

  // Ward distribution (extracted from address or fallback)
  const wardMap: Record<string, number> = {
    'Ward 14 (Industrial)': 0,
    'Ward 8 (Residential North)': 0,
    'Ward 3 (Central Sector)': 0,
    'Ward 21 (Coastal Belt)': 0,
  };
  complaintsList.forEach((c) => {
    if (c.address?.includes('14')) wardMap['Ward 14 (Industrial)'] += 1;
    else if (c.address?.includes('8')) wardMap['Ward 8 (Residential North)'] += 1;
    else wardMap['Ward 3 (Central Sector)'] += 1;
  });

  const wardDistribution = Object.keys(wardMap).map((k) => ({
    ward: k,
    count: wardMap[k],
  }));

  const monthlyTrends = [
    { month: 'Oct 2025', reported: 18, resolved: 14 },
    { month: 'Nov 2025', reported: 25, resolved: 22 },
    { month: 'Dec 2025', reported: 32, resolved: 29 },
    { month: 'Jan 2026', reported: 28, resolved: 26 },
    { month: 'Feb 2026', reported: 35, resolved: 31 },
    { month: 'Mar 2026', reported: totalCount, resolved: resolvedCount },
  ];

  return {
    totalCount,
    openCount,
    resolvedCount,
    criticalCount,
    avgResolutionHours: 14.5,
    categoryDistribution,
    wardDistribution,
    monthlyTrends,
  };
}
