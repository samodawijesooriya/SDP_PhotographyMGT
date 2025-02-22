import React, { useState, useEffect } from 'react';
import './Events.css'; // We'll create this CSS file

const Events = () => {
  // State to store user events
  const [userEvents, setUserEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated function to fetch user events (replace with actual API call)
  const fetchUserEvents = async () => {
    try {
      // TODO: Replace with actual API endpoint to fetch user events
      const response = await fetch('/api/user-events'); 
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setUserEvents(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setIsLoading(false);
    }
  };

  // Fetch events when component mounts
  useEffect(() => {
    fetchUserEvents();
  }, []);

  // Render events or "No Events" message
  const renderEventContent = () => {
    if (isLoading) {
      return <div className="loading">Loading events...</div>;
    }

    if (userEvents.length === 0) {
      return (
        <div className="no-events">
          <p>No Events to Show</p>
        </div>
      );
    }

    return (
      <div className="events-container">
      <div className="header-section">
          <h1 className="main-title">My Gallery</h1>
          <div className="title-underline"></div>
      </div>
        {userEvents.map((event) => (
          <div key={event.id} className="event-card">
            <h3>{event.title}</h3>
            <p>Date: {event.date}</p>
            <p>Location: {event.location}</p>
            <p>Description: {event.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="events-page">
      <h1>My Events</h1>
      {renderEventContent()}
    </div>
  );
};

export default Events;