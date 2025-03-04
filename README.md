# Project R3DSYS

## Summary
...

## Overview
The project aims to streamline the scheduling process for employees over at the Malmö University Student Helpdesk, but we plan on adding support for ex: Teaching-Assistants that will be included in version 2.0.

### Problem Solved
The project replaces the current cumbersome method of manually emailing availability to the supervisor and helps automatically generate a schedule template. Employees can then select the slots they are available for, and the supervisor can make assignments from a user-friendly interface. Additionally, the system integrates with Google Calendar to allow workers to sync their schedules to their phones, ensuring that any changes to the schedule are always reflected without manual intervention.

The system also includes robust features like automated database backups, trade request management, handling situations where employees can no longer work their assigned slots, and email notifications for schedule updates and changes.

## Features
- Automatic schedule generation based on employee availability.
- Easy slot selection for employees.
- Neat UI for supervisors to assign slots.
- Integration with Google Calendar via a sync link.
- Future support for booking Teachers and Teaching Assistants.
- Automated Database backups.
- Trade requests.
- Email notifications.

## Versioning

We use [Semantic Versioning](https://semver.org/) for this project. For the available versions, see the [tags on this repository](https://github.com/your-repo/tags).

- **Pre Release (Beta)**: 0.5.0 - Planned February 2025
- **Initial Release**: 1.0.0 - Planned April 2025
- **Next Version**: 2.0.0 - Planned July 2025

## Roadmap

### Version 1.x
- [x]  Automatic schedule generation
- [x]  Google Calendar integration
- [x]  Automated backups
- [x]  Trade request management
- [x]  Notifications for shift changes
- [x]  Notifications for failed login attempts
- [x]  Detailed Logfiles
- [x]  Rate limits
- [x]  Schedule creation using a Template Schema
- [x]  Basic tools for supervisors

### Version 2.0 (Planned)
- [ ]  Support for Teachers and Teaching Assistants
- [ ]  Enhanced scheduling features for multiple roles
- [ ]  Improved UI/UX for slot selection
- [ ]  Advanced tools for supervisors

## Installation

### Prerequisites
- Node.js
- PostgreSQL
- pnpm (package manager)

### Setup Instructions
1. Clone the repository to your local machine.
2. Ensure Node.js and PostgreSQL are installed.
3. Install pnpm globally using npm:
   ```bash
   npm install -g pnpm
   ```
4. Install the dependencies:
   ```bash
   pnpm install
   ```
5. Create a `.env` file in the project root by copying `.env.example` and filling in the appropriate values for your environment.
6. Start the development server:
   ```bash
   pnpm run dev
   ```

## Tech Stack
- **Backend**: Fastify, Node.js
- **Database**: PostgreSQL
- **Frontend**: Vite + React

## Configuration
Copy the `.env.example` files and fill them with your own values to configure the project. The `.env` file must contain relevant environment variables for database connections, authentication, and any other service configurations.

## Usage
To run the project locally, use:
```bash
pnpm run dev
```

## Contributions
Contributions are welcome. To contribute, please send an email to the repository owner at archways@gmx.us to be invited as a contributor.

## License

This project is dual-licensed:

- **Open Source:** For open source projects, this software is licensed under the Mozilla Public License 2.0. See the [LICENSE](LICENSE) file for the full text of the MPL 2.0.

- **Commercial:** For commercial use (e.g., if you wish to integrate this software into proprietary projects without releasing your modifications), a separate commercial license is available. Please contact [archways@gmx.us](mailto:archways@gmx.us) for details.

## Credits

- [archways404](https://github.com/archways404)
- [danielmoradi1](https://github.com/danielmoradi1)
