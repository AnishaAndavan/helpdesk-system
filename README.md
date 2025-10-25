# Service Tickets for Software Installations for a Corporate Company

## 📘 Project Concept
This project is designed to manage service requests and software installations within a corporate environment.  
It allows **employees** to submit tickets for assistance, **administrators** to assign tickets to technicians, and **technicians** to update and manage their assigned tickets.  
The system helps streamline communication between departments and track the lifecycle of service requests efficiently.

---

## 🚀 Features Implemented in the Current Version

### 👩‍💻 Employee Features
- Employees can create new service tickets for software installation or related issues.  
- Each ticket includes a **subject, description, and priority level**.  
- Employees can view their own submitted tickets along with their status and creation date.

### 🧑‍🔧 Technician Features
- Technicians can log in to view only the tickets assigned to them.  
- A **dashboard** displays:
  - Total assigned tickets  
  - Open tickets  
  - In Progress tickets  
  - Resolved tickets  
- Technicians can update ticket status directly from the interface using a dropdown (Open / In Progress / Resolved).  
- Dashboard statistics automatically update when statuses change.  
- The “My Tickets” table includes **employee name and email** for direct communication.

### 👨‍💼 Admin Features
- Admin can view **all tickets** in the system.  
- Admin can **assign tickets to technicians** through the interface.  
- The **Assign button** automatically disables if a ticket is already assigned, in progress, or resolved — preventing duplicate or mistaken assignments.  
- Backend validation ensures that reassignments or invalid assignments are blocked.  

### 🧭 General Features
- Secure login with token authentication (stored in `localStorage`).  
- Responsive sidebar navigation for Dashboard, My Tickets, Reports, and Settings.  
- Logout button clears session and redirects to the login page.  
- Error handling for missing tokens or expired sessions.  

---
## 🌱 Future Improvements

- **Service Type Field**  
  Add an optional category for each ticket (e.g., Software Installation, License Renewal, Troubleshooting).  

- **Location and Department Tracking**  
  Include office location or department to better route requests.  

- **Audit History**  
  Maintain a log of all status updates and reassignments for each ticket.  

- **Notifications**  
  Email or in-app notifications to technicians and employees when tickets are assigned or updated.  

- **Advanced Reporting**  
  Graphical reports for admin users — monthly tickets resolved, technician performance, etc.  

- **Role-Based Access Control (RBAC)**  
  Stronger security to ensure only authorized roles can access certain routes.  

---


