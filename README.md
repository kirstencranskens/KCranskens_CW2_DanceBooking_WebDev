Prism Dance Studio Web Application

This project is a Node.js and Express-based web application developed as part of a Web Application Development coursework. It provides a booking system for a local dance organization (Prism Dance Studio) along with organiser-specific features for managing courses, class lists, and updates.

Features

Public User Functionality
- Information & Course Listing:
  - Visitors (even those not logged in) can view details about the organization and its dance classes including course name, duration (in days or weeks), date, time, location, and price.
- Booking System:
  - Users can book courses and view a booking confirmation page.
  - There is a booking history page where logged‑in users can see their previous bookings.
  - Client-side validation is implemented on the booking form for immediate feedback.

Authentication & Registration
- User Registration:  
  - Users can register using a username, email, and password.
  - The system verifies that all fields are filled and that duplicate email registrations are not allowed.
- Login/Logout: 
  - Registered users can log in using their email (case-insensitive) and password.
  - Users receive appropriate error messages (using flash messages) if credentials are incorrect.

Organiser-Specific Functionality
pre seeded organiser details
email: organiser1@example.com
password: organiserpassword
- Dashboard:  
  - Organisers see an organiser dashboard listing all current courses.
- Course Management: 
  - Organisers can add new courses with full details including duration (with a choice of days or weeks), price (displayed in £), date, time, location (restricted to Studio A–E), and capacity.
  - Courses can be edited and deleted. Deleting a course also cascades to remove any associated bookings.
- Class List: 
  - Organisers can generate a class list for each course, which displays participants’ details.
- User Management: 
  - Organisers have a dedicated user management page where they can see both organiser and regular user accounts.
  - Organisers cannot delete their own account.
  - New organisers can be added via a dedicated form.
- Updates/Blog: 
  - Organisers can post blog-style updates (news about new classes or other information).
  - Updates appear on the homepage in a scrollable container.

Technology Stack

- Node.js & Express: Server-side JavaScript framework for building the application.
- NeDB: A lightweight database used for storing user, course, booking, and update data.
- Mustache Templates: Used for rendering dynamic HTML views.
- Passport: Used for authentication with a local strategy.
- Connect-Flash: For displaying error messages on authentication failure.
- Bootstrap: For styling and responsive design.

Installation & Setup

1. Clone the Repository:

   ```bash
   git clone https://your.repository.url.git
   cd KCranskens_CW2_DanceBooking_WebDev
