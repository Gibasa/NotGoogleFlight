# Flight Search Engine ("Not Google Flights")

A modern, performant, and aesthetically refined flight search engine built with the latest React ecosystem.

## 🚀 About the Project

This project is not just a pretty interface; it is a **Full-Stack** (BFF) application that consumes real global aviation data. It demonstrates how to build complex, responsive interfaces that securely and efficiently connect to enterprise APIs.

### Key Features
*   **Real-Time Search**: Connected to the Amadeus API to fetch real flights.
*   **Smart Autocomplete**: Validation and suggestion of cities/airports (IATA codes).
*   **Advanced Filters**:
    *   Price (Double slider for Min/Max).
    *   Stops (Direct, 1 stop, 2+).
    *   Airlines (Dynamic selection).
*   **Premium Design**: Immersive interface with smooth animations, complex gradients, and theme support.
*   **Data Visualization**: Price trend charts and visual route details.

---

## 🛠️ Technical Decisions & Architecture

This project follows a **Backend-for-Frontend (BFF)** architecture using Next.js App Router.

### 1. Core & Framework
*   **Next.js 16 (App Router)**: Chosen for its ability to render Server Components (RSC), ensuring instant initial load and better SEO.
*   **Route Handlers (`/api/`)**: All requests to the Amadeus API pass through our own backend.
    *   *Why?* To protect secret API keys (`AMADEUS_CLIENT_SECRET`) and implement OAuth2 token caching on the server, reducing latency and costs.

### 2. Interface & UX
*   **Tailwind CSS v4**: Used for rapid and performant styling with a custom Design System (`src/app/globals.css`).
*   **Shadcn/UI & Radix UI**: Accessible (keyboard, screen readers) and fully customizable components. The component code lives within the project, allowing for precise adaptations (e.g., Slider with multiple thumbs).
*   **Lucide React**: Consistent and lightweight iconography.

### 3. Data Management
*   **React Query (@tanstack/react-query)**: Manages server state on the client. Responsible for caching, revalidation, and handling `loading`/`error` states in flight search.
*   **Zod**: "Full-Stack" schema validation. Ensures that data sent by the form (e.g., 3-letter IATA codes) and received from the API are in the correct format.

### 4. Integrations
*   **Amadeus Self-Service API (v2)**: Official data source for flights, schedules, and prices.

---

## 📦 How to Run Locally

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/flight-search.git
    cd flight-search
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env.local` file in the root and add your Amadeus credentials:
    ```env
    AMADEUS_CLIENT_ID=your_client_id
    AMADEUS_CLIENT_SECRET=your_client_secret
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000).

---

## 📄 License

This project is open source and available under the [MIT](LICENSE) license.
