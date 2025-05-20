import React, { useState, useEffect, useContext } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, Calendar, TrendingUp, Filter, Download, Eye } from 'lucide-react';
import './Reports.css';
import { utils as XLSXUtils, writeFile } from 'xlsx';
import axios from 'axios';
import { StoreContext } from '../../../context/StoreContext';

const Reports = () => {
  // Sample data - in a real app, this would come from an API
  const [reportData, setReportData] = useState({
    totalBookings: 247,
    totalPayments: 198,
    totalCustomers: 156,
    totalRevenue: 3555050,
    
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
  const [exportLoading, setExportLoading] = useState(false);
  const [bookingStats, setBookingStats] = useState([]);
  const [sumaryStats, setSummaryStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const { url } = useContext(StoreContext);
  const fetchBookingStats = async () => {
    try {
      const response = await axios.get(`${url}/api/home/booking-stats`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch booking statistics');
      }
      setBookingStats(response.data);
      
      // Update report data with the real values
      setReportData(prev => ({
        ...prev,
        totalBookings: response.data.totalCount,
        // Placeholder for total payments - since we don't have a direct API for this yet
        totalPayments: Math.round(response.data.confirmedCount * 0.8) // Assuming 80% of confirmed bookings have payments
      }));
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
    }
  }
  const fetchSummaryStats = async () => {
    try {
      const response = await axios.get(`${url}/api/home/sumary-stats`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch summary statistics');
      }
      console.log("Summary stats:", response.data);
      setSummaryStats(response.data);
      
      // Update report data with the real values
      setReportData(prev => ({
        ...prev,
        totalCustomers: response.data.customerCount,
        totalRevenue: response.data.totalRevenue
      }));
    } catch (error) {
      console.error('Error fetching summary statistics:', error);
    }
  }

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

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Format growth percentage with + or - sign
  const formatGrowth = (percentage) => {
    const formattedPercentage = Math.abs(percentage).toFixed(1);
    if (percentage > 0) {
      return `+${formattedPercentage}% from last month`;
    } else if (percentage < 0) {
      return `-${formattedPercentage}% from last month`;
    } else {
      return `0% change from last month`;
    }
  };

  // Render growth with appropriate styling
  const renderGrowth = (percentage) => {
    if (percentage > 0) {
      return <p className="metric-change positive">{formatGrowth(percentage)}</p>;
    } else if (percentage < 0) {
      return <p className="metric-change negative">{formatGrowth(percentage)}</p>;
    } else {
      return <p className="metric-change">{formatGrowth(percentage)}</p>;
    }
  };

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setIsLoading(true);
    
    // Fetch new data based on the range
    Promise.all([
      fetchMonthlyData(),
      fetchRecentBookings(),
      // We could add more data fetching here if we had time-sensitive APIs
    ]).finally(() => {
      setIsLoading(false);
    });
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
  };  // Export data to Excel
  const exportToExcel = async () => {
    try {
      setExportLoading(true);
      
      // Fetch detailed data for the export
      const [bookingsResponse, paymentsResponse] = await Promise.all([
        axios.get(`${url}/api/reports/detailed-bookings`, { params: { range: dateRange } }),
        axios.get(`${url}/api/reports/detailed-payments`, { params: { range: dateRange } })
      ]);
      
      // Create workbook and add worksheets
      const workbook = XLSXUtils.book_new();
      
      // Use fetched data or fall back to previously loaded data
      let bookingsData = [];
      let paymentsData = [];
      
      // Process bookings data
      if (bookingsResponse.status === 200 && bookingsResponse.data.length > 0) {
        bookingsData = bookingsResponse.data.map(booking => ({
          'Booking ID': booking.id,
          'Customer Name': booking.customerName,
          'Email': booking.email,
          'Phone': booking.phone,
          'Booking Date': new Date(booking.date).toLocaleDateString(),
          'Check-in': new Date(booking.checkIn).toLocaleDateString(),
          'Check-out': booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A',
          'Amount': booking.amount || 0,
          'Status': booking.status,
          'Guests': booking.guests || 0
        }));
      } else {
        // Use recentBookings as fallback
        bookingsData = recentBookings.map(booking => ({
          'Booking ID': booking.id,
          'Customer Name': booking.customerName,
          'Booking Date': new Date(booking.date).toLocaleDateString(),
          'Amount': booking.amount,
          'Status': booking.status
        }));
      }
      
      // Process payments data
      if (paymentsResponse.status === 200 && paymentsResponse.data.length > 0) {
        paymentsData = paymentsResponse.data.map(payment => ({
          'Payment ID': payment.id,
          'Booking ID': payment.bookingId,
          'Customer Name': payment.customerName,
          'Date': new Date(payment.date).toLocaleDateString(),
          'Amount': payment.amount,
          'Payment Method': payment.method,
          'Status': payment.status,
          'Reference Number': payment.referenceNo || 'N/A'
        }));
      } else {
        // Generate payments data from bookings (as a placeholder)
        paymentsData = recentBookings
          .filter(booking => booking.status === 'Confirmed')
          .map(booking => ({
            'Payment ID': `PAY-${booking.id}`,
            'Booking ID': booking.id,
            'Customer Name': booking.customerName,
            'Date': new Date(booking.date).toLocaleDateString(),
            'Amount': booking.amount,
            'Payment Method': Math.random() > 0.5 ? 'Bank Transfer' : 'Credit Card',
            'Status': 'Completed',
            'Reference Number': `REF-${Math.floor(Math.random() * 10000000)}`
          }));
      }
      
      // Add summary sheet
      const summaryData = [
        { 'Metric': 'Total Bookings', 'Value': reportData.totalBookings },
        { 'Metric': 'Total Payments', 'Value': reportData.totalPayments },
        { 'Metric': 'Total Customers', 'Value': reportData.totalCustomers },
        { 'Metric': 'Total Revenue', 'Value': reportData.totalRevenue }
      ];
      
      // Add monthly data
      const monthlyData = reportData.monthlyData.map(month => ({
        'Month': month.month,
        'Bookings': month.bookings,
        'Payments': month.payments,
        'Revenue': month.revenue
      }));
      
      // Create worksheets from the data
      const paymentsSheet = XLSXUtils.json_to_sheet(paymentsData);
      const bookingsSheet = XLSXUtils.json_to_sheet(bookingsData);
      const summarySheet = XLSXUtils.json_to_sheet(summaryData);
      const monthlySheet = XLSXUtils.json_to_sheet(monthlyData);
      
      // Add the worksheets to the workbook
      XLSXUtils.book_append_sheet(workbook, summarySheet, 'Summary');
      XLSXUtils.book_append_sheet(workbook, monthlySheet, 'Monthly Data');
      XLSXUtils.book_append_sheet(workbook, bookingsSheet, 'Bookings');
      XLSXUtils.book_append_sheet(workbook, paymentsSheet, 'Payments');
      
      // Get current date for filename
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      
      // Create filename based on date range
      let filename = `Business_Report_${dateRange}_${dateStr}.xlsx`;
      
      // Write the workbook and trigger download
      writeFile(workbook, filename);
      
      setExportLoading(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setExportLoading(false);
      // You could show an error notification here
    }
  };
  useEffect(() => {
      setIsLoading(true);
      Promise.all([
        fetchBookingStats(),
        fetchSummaryStats(),
        fetchRecentBookings(),
        fetchMonthlyData(),
        fetchPaymentMethods()
      ]).finally(() => {
        setIsLoading(false);
      });
    }, [dateRange]);

  // Fetch recent bookings
  const fetchRecentBookings = async () => {
    try {
      const response = await axios.get(`${url}/api/home/new-bookings`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch recent bookings');
      }
      
      // Transform booking data to match the expected format
      const formattedBookings = response.data.map(booking => ({
        id: booking.bookingId,
        customerName: booking.fullName,
        date: booking.eventDate,
        // Estimate amount based on package type or use a placeholder
        amount: Math.floor(Math.random() * 50000) + 30000, // Placeholder until we have real payment data
        status: booking.bookingStatus
      }));
      
      setRecentBookings(formattedBookings);
      
      // Update report data
      setReportData(prev => ({
        ...prev,
        recentBookings: formattedBookings
      }));
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
    }
  };
  // Fetch monthly data for charts
  const fetchMonthlyData = async () => {
    try {
      const response = await axios.get(`${url}/api/reports/monthly-stats`, {
        params: { range: dateRange }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch monthly data');
      }
      
      // If we don't get data from the API, generate synthetic data
      if (response.data && response.data.length > 0) {
        setMonthlyData(response.data);
        
        // Update report data
        setReportData(prev => ({
          ...prev,
          monthlyData: response.data
        }));
      } else {
        // Fallback to synthetic data generation
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Generate data for the last 7 months including current month
        const generatedData = [];
        for (let i = 6; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12; // Ensure we wrap around to previous year
          const bookings = Math.floor(Math.random() * 30) + 15;
          const payments = Math.floor(bookings * 0.8);
          const revenue = payments * (Math.floor(Math.random() * 20000) + 30000);
          
          generatedData.push({
            month: monthNames[monthIndex],
            bookings,
            payments,
            revenue
          });
        }
        
        setMonthlyData(generatedData);
        
        // Update report data
        setReportData(prev => ({
          ...prev,
          monthlyData: generatedData
        }));
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      // Fallback to synthetic data generation
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Generate data for the last 7 months including current month
      const generatedData = [];
      for (let i = 6; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12; // Ensure we wrap around to previous year
        const bookings = Math.floor(Math.random() * 30) + 15;
        const payments = Math.floor(bookings * 0.8);
        const revenue = payments * (Math.floor(Math.random() * 20000) + 30000);
        
        generatedData.push({
          month: monthNames[monthIndex],
          bookings,
          payments,
          revenue
        });
      }
      
      setMonthlyData(generatedData);
      
      // Update report data
      setReportData(prev => ({
        ...prev,
        monthlyData: generatedData
      }));
    }
  };

  // Fetch payment method statistics
  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`${url}/api/reports/payment-methods`);
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch payment methods');
      }
      
      // If we get data from the API, use it
      if (response.data && response.data.length > 0) {
        setPaymentMethods(response.data);
        
        // Update report data
        setReportData(prev => ({
          ...prev,
          paymentMethods: response.data
        }));
      } else {
        // Fallback to placeholder data
        const paymentMethodData = [
          { name: 'Bank Transfer', value: 98 },
          { name: 'Credit Card', value: 56 },
          { name: 'Cash', value: 32 },
          { name: 'PayPal', value: 12 }
        ];
        
        setPaymentMethods(paymentMethodData);
        
        // Update report data
        setReportData(prev => ({
          ...prev,
          paymentMethods: paymentMethodData
        }));
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback to placeholder data
      const paymentMethodData = [
        { name: 'Bank Transfer', value: 98 },
        { name: 'Credit Card', value: 56 },
        { name: 'Cash', value: 32 },
        { name: 'PayPal', value: 12 }
      ];
      
      setPaymentMethods(paymentMethodData);
      
      // Update report data
      setReportData(prev => ({
        ...prev,
        paymentMethods: paymentMethodData
      }));
    }
  };

  // Calculate monthly growth trends
  const calculateMonthlyGrowth = (current, previous) => {
    if (!previous || previous.length < 2) return {};
    
    const currentMonth = current[current.length - 1];
    const previousMonth = current[current.length - 2];
    
    return {
      bookingsGrowth: calculateGrowth(currentMonth.bookings, previousMonth.bookings),
      paymentsGrowth: calculateGrowth(currentMonth.payments, previousMonth.payments),
      revenueGrowth: calculateGrowth(currentMonth.revenue, previousMonth.revenue)
    };
  };

  // Get monthly growth data
  const getMonthlyGrowth = () => {
    if (monthlyData.length >= 2) {
      return calculateMonthlyGrowth(monthlyData);
    }
    
    // Default values if we don't have enough data
    return {
      bookingsGrowth: 12, // placeholder
      paymentsGrowth: 8,  // placeholder
      revenueGrowth: 15   // placeholder
    };
  };

  // Use real growth data when available
  const monthlyGrowth = getMonthlyGrowth();

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
        <button 
          className={`export-btn ${exportLoading ? 'loading' : ''}`} 
          onClick={exportToExcel}
          disabled={exportLoading}
        >
          {exportLoading ? (
            <>
              <div className="btn-spinner"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download size={16} />
              Export to Excel
            </>
          )}
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
                <p className="metric-value">{bookingStats.totalCount || reportData.totalBookings}</p>
                {renderGrowth(monthlyGrowth.bookingsGrowth)} {/* In the future, this could be calculated from real data */}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon payment-icon">
                <DollarSign size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Payments</h3>
                <p className="metric-value">{reportData.totalPayments}</p>
                {renderGrowth(monthlyGrowth.paymentsGrowth)} {/* In the future, this could be calculated from real data */}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon customer-icon">
                <Users size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Customers</h3>
                <p className="metric-value">{sumaryStats.customerCount || reportData.totalCustomers}</p>
                {renderGrowth(5)} {/* In the future, this could be calculated from real data */}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon revenue-icon">
                <TrendingUp size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Revenue</h3>
                <p className="metric-value">{formatCurrency(sumaryStats.totalRevenue || reportData.totalRevenue)}</p>
                {renderGrowth(monthlyGrowth.revenueGrowth)} {/* In the future, this could be calculated from real data */}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container">
              <h2>Monthly Booking & Payment Trends</h2>              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={monthlyData}
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
                <h2>Revenue by Month</h2>                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={monthlyData}
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
                <h2>Payment Methods</h2>                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentMethods.map((entry, index) => (
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
              </div>              <table className="summary-table">
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
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>{booking.customerName}</td>
                        <td>{formatDate(booking.date)}</td>
                        <td className="amount-cell">{formatCurrency(booking.amount)}</td>
                        <td>{renderStatus(booking.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>No recent bookings found</td>
                    </tr>
                  )}
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
              </div>              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Bookings</th>
                    <th>Payments</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month) => (
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