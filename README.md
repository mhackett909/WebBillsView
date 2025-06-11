# WebBillsView

WebBillsView is a modern, responsive web application for tracking and managing your personal bills and payments. Built with React and Material UI, it offers a clean and intuitive interface for authenticated users to register, organize, and review their billing history. The frontend securely connects to a Spring Boot API using JWT authentication, and the application is production-ready, deployed on AWS with CloudFront and ECS Fargate.

## Features

- **User Registration & Account Management:** Secure sign-up and profile management with real-time frontend validation that matches backend rules.
- **Advanced Bill Table:** Powerful data table with filtering, sorting, pagination, and customizable columns.
- **State Persistence:** Table filters, pagination, and user preferences are automatically saved using sessionStorage for a seamless user experience.
- **Consistent Validation:** Centralized regex logic ensures consistent validation for emails and passwords both on the frontend and backend.
- **Responsive Design:** Fully responsive UI built with Material-UI for a smooth experience on desktop and mobile devices.
- **API Integration:** Robust handling of backend API responses, including support for DTO wrappers.
- **Date & Filter Management:** Graceful handling of date pickers and input validation for filters.
- **Security:** Secure logout, automatic state clearing on sign-out, and JWT-based authentication.
- **Deployment Ready:** Easily deployable to AWS infrastructure via CloudFront and ECS.

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm (v8 or higher)

### Installation

1. Clone the repository:
   ```powershell
   git clone https://github.com/mhackett909/WebBillsView.git
   cd WebBillsView
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```

### Running the App

Start the development server:
```powershell
npm start
```
The app will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

To build the app for production:
```powershell
npm run build
```
The optimized build will be in the `build/` directory.

## Project Structure

- `src/` - Main source code
  - `components/` - Reusable UI components
  - `pages/` - Page-level components
  - `utils/` - Utility functions (API, regex, etc.)
  - `styles/` - CSS files
- `public/` - Static assets
- `build/` - Production build output

## Customization

- Update backend API URLs and endpoints in `src/utils/BillsApiUtil.js` as needed.
- Adjust validation logic in `src/utils/Regex.js` to match your backend requirements.

## Repository

- [WebBills UI GitHub Repository](https://github.com/mhackett909/WebBillsView/) - Find the latest source code and updates.
- [WebBills GitHub Repository](https://github.com/mhackett909/WebBills/) - Backend repository.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
