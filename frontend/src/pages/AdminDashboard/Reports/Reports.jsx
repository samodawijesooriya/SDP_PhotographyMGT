import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, Calendar, TrendingUp, Filter, Download, Eye } from 'lucide-react';
import './Reports.css';

const Reports = () => {
  // Sample data - in a real app, this would come from an API
  const [reportData, setReportData] = useState({
    totalBookings: 247,
    totalPayments: 198,
    totalCustomers: 156,
    totalRevenue: 3526500,
    
    // Monthly data for charts
    monthlyData: [
      { month: 'Jan', bookings: 18, payments: 15, revenue: 275000 },
      { month: 'Feb', bookings: 22, payments: 18, revenue: 310000 },
      { month: 'Mar', bookings: 28, payments: 25, revenue: 425000 },
      { month: 'Apr', bookings: 32, payments: 28, revenue: 482000 },
      { month: 'May', bookings: 37, payments: 34, revenue: 568000 },
      { month: 'Jun', bookings: 42, payments: 38, revenue: 645000 },
      { month: 'Jul', bookings: 45, payments: 40, revenue: 821500 }
    ],
    
    // Payment method breakdown
    paymentMethods: [
      { name: 'Bank Transfer', value: 98 },
      { name: 'Credit Card', value: 56 },
      { name: 'Cash', value: 32 },
      { name: 'PayPal', value: 12 }
    ],
    
    // Recent bookings sample data
    recentBookings: [
      { id: 'BK-2023-01', customerName: 'Samantha Lee', date: '2023-07-10', amount: 45000, status: 'Confirmed' },
      { id: 'BK-2023-02', customerName: 'Raj Patel', date: '2023-07-08', amount: 68000, status: 'Confirmed' },
      { id: 'BK-2023-03', customerName: 'Maria Garcia', date: '2023-07-07', amount: 52500, status: 'Pending' },
      { id: 'BK-2023-04', customerName: 'John Smith', date: '2023-07-05', amount: 37000, status: 'Confirmed' },
      { id: 'BK-2023-05', customerName: 'Liu Wei', date: '2023-07-03', amount: 94000, status: 'Cancelled' }
    ]
  });

  const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(false);

  // This is a placeholder for a real API call
  // In a real application, you would fetch this data from your backend
  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [dateRange]);

  // Format currency
  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // In a real app, you would fetch new data based on the range
  };

  // Render status with appropriate styling
  const renderStatus = (status) => {
    let statusClass = '';
    
    switch(status.toLowerCase()) {
      case 'confirmed':
        statusClass = 'status-confirmed';
        break;
      case 'pending':
        statusClass = 'status-pending';
        break;
      case 'cancelled':
        statusClass = 'status-cancelled';
        break;
      default:
        statusClass = 'status-default';
    }
    
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Business Reports & Analytics</h1>
        <p>Comprehensive overview of your business performance and metrics</p>
      </div>

      <div className="filter-controls">
        <div className="date-filters">
          <button 
            className={`filter-btn ${dateRange === 'week' ? 'active' : ''}`}
            onClick={() => handleDateRangeChange('week')}
          >
            This Week
          </button>
          <button 
            className={`filter-btn ${dateRange === 'month' ? 'active' : ''}`}
            onClick={() => handleDateRangeChange('month')}
          >
            This Month
          </button>
          <button 
            className={`filter-btn ${dateRange === 'quarter' ? 'active' : ''}`}
            onClick={() => handleDateRangeChange('quarter')}
          >
            This Quarter
          </button>
          <button 
            className={`filter-btn ${dateRange === 'year' ? 'active' : ''}`}
            onClick={() => handleDateRangeChange('year')}
          >
            This Year
          </button>
        </div>
        <button className="export-btn">
          <Download size={16} />
          Export Report
        </button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading report data...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="metrics-cards">
            <div className="metric-card">
              <div className="metric-icon booking-icon">
                <Calendar size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Bookings</h3>
                <p className="metric-value">{reportData.totalBookings}</p>
                <p className="metric-change positive">+12% from last month</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon payment-icon">
                <DollarSign size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Payments</h3>
                <p className="metric-value">{reportData.totalPayments}</p>
                <p className="metric-change positive">+8% from last month</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon customer-icon">
                <Users size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Customers</h3>
                <p className="metric-value">{reportData.totalCustomers}</p>
                <p className="metric-change positive">+5% from last month</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon revenue-icon">
                <TrendingUp size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Revenue</h3>
                <p className="metric-value">{formatCurrency(reportData.totalRevenue)}</p>
                <p className="metric-change positive">+15% from last month</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container">
              <h2>Monthly Booking & Payment Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={reportData.monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="payments" 
                    stroke="#10b981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="charts-row">
              <div className="chart-container half-width">
                <h2>Revenue by Month</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={reportData.monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${formatCurrency(value)}`, 'Revenue']}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-container half-width">
                <h2>Payment Methods</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={reportData.paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} payments`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary Tables */}
          <div className="summary-tables">
            <div className="summary-table-container">
              <div className="table-header">
                <h2>Recent Bookings</h2>
                <button className="view-all-btn">
                  <Eye size={16} />
                  View All
                </button>
              </div>
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.customerName}</td>
                      <td>{formatDate(booking.date)}</td>
                      <td className="amount-cell">{formatCurrency(booking.amount)}</td>
                      <td>{renderStatus(booking.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="summary-table-container">
              <div className="table-header">
                <h2>Monthly Summary</h2>
                <button className="view-all-btn">
                  <Eye size={16} />
                  View All
                </button>
              </div>
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Bookings</th>
                    <th>Payments</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthlyData.map((month) => (
                    <tr key={month.month}>
                      <td>{month.month}</td>
                      <td>{month.bookings}</td>
                      <td>{month.payments}</td>
                      <td className="amount-cell">{formatCurrency(month.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;