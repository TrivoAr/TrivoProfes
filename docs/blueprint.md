# **App Name**: Trivo Admin Panel

## Core Features:

- Authentication: Secure the dashboard with NextAuth.js, allowing only admins and professors to log in and access the administrative functions.
- Dashboard Statistics: Display key metrics on the dashboard, including total counts for social outings, teams, academies, registered members, pending payments, and total approved revenue. Only users with 'admin' or 'profe' roles can access.
- Social Outing Management: Enable admins and professors to create, read, update, and delete (CRUD) social outings. This includes managing outing details, setting schedules, and defining participation limits.
- Team Management: Provide CRUD functionalities for managing teams, similar to social outings, with features to set team specifics and manage team schedules.
- Academies Management: Allow admins and professors to manage academy listings, including details such as academy name, type of discipline, location, and membership options.
- Member Management: Implement a system to manage members for social outings, teams, and academies, with functionalities to approve or reject membership requests.
- Payment Management: Enable admins to manage and process payments related to events and academy memberships, including functionalities to approve or reject payment proofs.

## Style Guidelines:

- Primary color: Trivo orange (#C95100) to align with the Trivo brand.
- Background color: Light gray (#F9F9F9) for a clean and modern administrative interface.
- Accent color: Darker orange (#001C3A) to highlight interactive elements and calls to action.
- Font: 'Inter', a sans-serif font for a clean, modern, and easily readable interface, suitable for both headings and body text.
- Responsive layout with a desktop-first approach, ensuring a seamless experience across different screen sizes. Implement a sidebar for navigation and a clean, data-focused main content area.
- Use the 'lucide-react' icon library for consistent and clear icons throughout the dashboard.
- Subtle transitions and loading states to provide feedback to the user and enhance the overall experience.