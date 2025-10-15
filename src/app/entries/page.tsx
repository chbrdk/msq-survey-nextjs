'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Users, 
  Building2, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Eye,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import * as XLSX from 'xlsx';

interface SurveyResult {
  userId: string;
  completedAt: string;
  collectedData: {
    greeting_agency?: string;
    department?: string;
    role?: string;
    job_level?: string;
    selected_phases?: string[];
    phase_selection?: string[];
    ai_usage?: string;
    ai_tools_details?: string[];
    [key: string]: any;
  };
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'];

export default function DashboardPage() {
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<SurveyResult | null>(null);
  
  // Filters
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/survey/results');
      const data = await response.json();
      
      if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      setError('Failed to load survey results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter results
  const filteredResults = useMemo(() => {
    let filtered = results;

    // Agency filter
    if (selectedAgency !== 'all') {
      filtered = filtered.filter(r => r.collectedData?.greeting_agency === selectedAgency);
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(r => r.collectedData?.department === selectedDepartment);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => new Date(r.completedAt) >= cutoff);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.collectedData?.role?.toLowerCase().includes(query) ||
        r.collectedData?.department?.toLowerCase().includes(query) ||
        r.collectedData?.greeting_agency?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [results, selectedAgency, selectedDepartment, dateRange, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredResults.length;
    const completed = filteredResults.filter(r => r.collectedData && Object.keys(r.collectedData).length > 5).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Agency distribution
    const agencies = filteredResults.reduce((acc, r) => {
      const agency = r.collectedData?.greeting_agency || 'Unknown';
      acc[agency] = (acc[agency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Department distribution
    const departments = filteredResults.reduce((acc, r) => {
      const dept = r.collectedData?.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // AI Usage
    const aiUsage = filteredResults.reduce((acc, r) => {
      const usage = r.collectedData?.ai_integration || r.collectedData?.ai_usage || 'No response';
      acc[usage] = (acc[usage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Phase distribution
    const phases = filteredResults.reduce((acc, r) => {
      const userPhases = r.collectedData?.selected_phases || r.collectedData?.phase_selection || [];
      // Ensure it's an array
      const phasesArray = Array.isArray(userPhases) ? userPhases : [];
      phasesArray.forEach((phase: string) => {
        acc[phase] = (acc[phase] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      completed,
      completionRate,
      agencies,
      departments,
      aiUsage,
      phases,
      uniqueAgencies: Object.keys(agencies).length,
      uniqueDepartments: Object.keys(departments).length
    };
  }, [filteredResults]);

  // Prepare chart data
  const agencyChartData = Object.entries(stats.agencies).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const departmentChartData = Object.entries(stats.departments).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  const aiUsageChartData = Object.entries(stats.aiUsage).map(([name, value]) => ({
    name,
    value
  }));

  const phaseChartData = Object.entries(stats.phases).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredResults.map(result => {
      const data = result.collectedData || {};
      
      // Format work_type_distribution percentages
      const workDistribution = Array.isArray(data.work_type_distribution) 
        ? data.work_type_distribution.map((item: any) => `${item.phase || item.activity}: ${item.percentage}%`).join(', ')
        : '';
      
      // Format phase_time_allocation percentages
      const phaseAllocation = Array.isArray(data.phase_time_allocation)
        ? data.phase_time_allocation.map((item: any) => `${item.phase}: ${item.percentage}%`).join(', ')
        : '';
      
      // Format phase_activities (nested object)
      const phaseActivities = data.phase_activities 
        ? Object.entries(data.phase_activities).map(([phase, activities]) => {
            if (Array.isArray(activities)) {
              return `${phase}: ${activities.map((a: any) => `${a.phase || a.activity}: ${a.percentage}%`).join('; ')}`;
            }
            return '';
          }).join(' | ')
        : '';
      
      return {
        'User ID': result.userId,
        'Completed At': new Date(result.completedAt).toLocaleString(),
        'Agency': data.greeting_agency || '',
        'Department': data.department || '',
        'Role': data.role || '',
        'Job Level': data.job_level || '',
        'Work Focus': data.primary_focus || '',
        'Work Type Distribution': workDistribution,
        'Selected Phases': (Array.isArray(data.selected_phases) ? data.selected_phases : 
                            Array.isArray(data.phase_selection) ? data.phase_selection : []).join(', '),
        'Phase Time Allocation': phaseAllocation,
        'Phase Activities Breakdown': phaseActivities,
        'Tools Used': (Array.isArray(data.collect_tools) ? data.collect_tools : []).join(', '),
        'AI Usage': data.ai_integration || data.ai_usage || '',
        'AI Tools': (Array.isArray(data.ai_tools_details) ? data.ai_tools_details : []).join(', '),
        'Time Wasters': (Array.isArray(data.time_wasters) ? data.time_wasters : []).join(', '),
        'Collaboration Friction': (Array.isArray(data.collaboration_friction) ? data.collaboration_friction : []).join(', '),
        'Automation Ideas': data.automation_identification?.responses 
          ? data.automation_identification.responses.map((r: any) => `${r.question}: ${r.answer}`).join(' | ')
          : '',
        'Magic Wand Automation': (Array.isArray(data.magic_wand_automation) ? data.magic_wand_automation : []).join(', ')
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Results');
    
    // Auto-size columns
    const maxWidth = 50;
    const colWidths = exportData.reduce((acc: any[], row) => {
      Object.keys(row).forEach((key, idx) => {
        const value = String((row as any)[key] || '');
        acc[idx] = Math.max(acc[idx] || 10, Math.min(value.length + 2, maxWidth));
      });
      return acc;
    }, []);
    ws['!cols'] = colWidths.map(w => ({ wch: w }));
    
    XLSX.writeFile(wb, `msq-survey-results-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Get unique values for filters
  const uniqueAgencies = useMemo(() => {
    const agencies = new Set(results.map(r => r.collectedData?.greeting_agency).filter(Boolean));
    return ['all', ...Array.from(agencies)];
  }, [results]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(results.map(r => r.collectedData?.department).filter(Boolean));
    return ['all', ...Array.from(depts)];
  }, [results]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-rose-50 to-blue-50">
        <div className="ball-loader" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-rose-50 to-blue-50">
        <div className="glass-card p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-rose-50 to-blue-50 p-6">
      <style jsx>{`
        .glass-card::before {
          background: linear-gradient(135deg, rgba(4, 190, 254, 0.2) 0%, rgba(186, 230, 253, 0.2) 100%) !important;
        }
        .glass-card {
          box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.1) !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900">MSQ Survey Dashboard</h1>
              <p className="text-gray-600 font-light mt-1">Workflow Analysis & Insights</p>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600">Total Surveys</p>
                <p className="text-3xl font-light text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600">Completion Rate</p>
                <p className="text-3xl font-light text-gray-900 mt-2">{stats.completionRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600">Agencies</p>
                <p className="text-3xl font-light text-gray-900 mt-2">{stats.uniqueAgencies}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600">Departments</p>
                <p className="text-3xl font-light text-gray-900 mt-2">{stats.uniqueDepartments}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-light text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50"
              />
            </div>

            {/* Agency Filter */}
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50"
            >
              <option value="all">All Agencies</option>
              {uniqueAgencies.filter(a => a !== 'all').map(agency => (
                <option key={agency} value={agency}>{agency}</option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.filter(d => d !== 'all').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {/* Active Filters Badge */}
          {(selectedAgency !== 'all' || selectedDepartment !== 'all' || dateRange !== 'all' || searchQuery) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {filteredResults.length} of {results.length} results
              </span>
              <button
                onClick={() => {
                  setSelectedAgency('all');
                  setSelectedDepartment('all');
                  setDateRange('all');
                  setSearchQuery('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-light"
              >
                Clear Filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agency Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-light text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Agency Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agencyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* AI Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-light text-gray-900 mb-4">AI Tool Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={aiUsageChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {aiUsageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-light text-gray-900 mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Phase Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-light text-gray-900 mb-4">Most Common Phases</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={phaseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Entries Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-light text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Submissions ({filteredResults.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-light text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-light text-gray-600">Agency</th>
                  <th className="text-left py-3 px-4 text-sm font-light text-gray-600">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-light text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-light text-gray-600">AI Usage</th>
                  <th className="text-left py-3 px-4 text-sm font-light text-gray-600">Phases</th>
                  <th className="text-left py-3 px-4 text-sm font-light text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredResults.slice(0, 20).map((result, index) => (
                  <motion.tr
                    key={result.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-light">
                      {result.collectedData?.greeting_agency || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {result.collectedData?.department || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {result.collectedData?.role || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (result.collectedData?.ai_integration || result.collectedData?.ai_usage) === 'active' ? 'bg-green-100 text-green-700' :
                        (result.collectedData?.ai_integration || result.collectedData?.ai_usage) === 'experimental' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {result.collectedData?.ai_integration || result.collectedData?.ai_usage || 'No data'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {(Array.isArray(result.collectedData?.selected_phases) ? result.collectedData.selected_phases : 
                        Array.isArray(result.collectedData?.phase_selection) ? result.collectedData.phase_selection : []).length} selected
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedEntry(result)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredResults.length > 20 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Showing 20 of {filteredResults.length} results
            </p>
          )}
        </motion.div>

      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-4xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light text-gray-900">Survey Details</h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Agency</p>
                <p className="text-lg text-gray-900">{selectedEntry.collectedData?.greeting_agency || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Department</p>
                <p className="text-lg text-gray-900">{selectedEntry.collectedData?.department || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Role</p>
                <p className="text-lg text-gray-900">{selectedEntry.collectedData?.role || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Job Level</p>
                <p className="text-lg text-gray-900">{selectedEntry.collectedData?.job_level || '-'}</p>
              </div>
            </div>

            {/* Work Type Distribution */}
            {Array.isArray(selectedEntry.collectedData?.work_type_distribution) && selectedEntry.collectedData.work_type_distribution.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Work Type Distribution</h3>
                <div className="space-y-2">
                  {selectedEntry.collectedData.work_type_distribution.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                      <span className="text-sm text-gray-700">{item.phase || item.activity}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phase Time Allocation */}
            {Array.isArray(selectedEntry.collectedData?.phase_time_allocation) && selectedEntry.collectedData.phase_time_allocation.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Phase Time Allocation</h3>
                <div className="space-y-2">
                  {selectedEntry.collectedData.phase_time_allocation.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                      <span className="text-sm text-gray-700">{item.phase}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phase Activities */}
            {selectedEntry.collectedData?.phase_activities && Object.keys(selectedEntry.collectedData.phase_activities).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Phase Activities Breakdown</h3>
                {Object.entries(selectedEntry.collectedData.phase_activities).map(([phase, activities]: [string, any]) => (
                  <div key={phase} className="mb-4">
                    <p className="text-sm font-medium text-gray-800 mb-2">{phase}</p>
                    <div className="space-y-1 pl-4">
                      {Array.isArray(activities) && activities.map((activity: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{activity.phase || activity.activity}</span>
                          <span className="text-gray-900 font-medium">{activity.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI Tools */}
            {Array.isArray(selectedEntry.collectedData?.ai_tools_details) && selectedEntry.collectedData.ai_tools_details.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Tools Used</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.collectedData.ai_tools_details.map((tool: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Used */}
            {Array.isArray(selectedEntry.collectedData?.collect_tools) && selectedEntry.collectedData.collect_tools.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tools Used in Workflow</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.collectedData.collect_tools.map((tool: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Time Wasters */}
            {Array.isArray(selectedEntry.collectedData?.time_wasters) && selectedEntry.collectedData.time_wasters.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Time Wasters</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedEntry.collectedData.time_wasters.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Automation Identification */}
            {selectedEntry.collectedData?.automation_identification && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Automation Identification</h3>
                {selectedEntry.collectedData.automation_identification.responses && Array.isArray(selectedEntry.collectedData.automation_identification.responses) ? (
                  <div className="space-y-3">
                    {selectedEntry.collectedData.automation_identification.responses.map((response: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-800 mb-1">{response.question}</p>
                        <p className="text-sm text-gray-600">{response.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No automation identification data</p>
                )}
              </div>
            )}

            {/* Automation Wishes */}
            {Array.isArray(selectedEntry.collectedData?.magic_wand_automation) && selectedEntry.collectedData.magic_wand_automation.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Automation Wishes</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedEntry.collectedData.magic_wand_automation.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Raw Data */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Raw Data (JSON)</h3>
              <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-x-auto">
                {JSON.stringify(selectedEntry.collectedData, null, 2)}
              </pre>
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
