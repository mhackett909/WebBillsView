# WebBillsView

A modern React/MUI web application for managing user registration, account management, and bill data with advanced filtering and state persistence.

## Features

- User registration and account management with frontend validation matching backend regex for passwords and emails
- Centralized regex validation logic
- Data table with advanced filtering, pagination, column visibility, and sorting
- Persistent table state (filters, pagination, column visibility, sort) using sessionStorage
- Responsive UI with Material-UI (MUI)
- API response handling for backend DTO wrappers
- Graceful handling of date pickers and filter validation
- Secure logout and filter clearing with state reset

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
