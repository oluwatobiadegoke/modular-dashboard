# Modular Dashboard

This project is a modular dashboard application built with a web-first approach, designed to be easily scalable and maintainable. The architecture is based on micro-frontends, allowing for independent development and deployment of individual widgets.

## 1. Architecture and Modular Design

The project follows a monorepo architecture managed by `pnpm` workspaces. The core of the application is the `dashboard-shell`, which acts as a host or container for the different widgets. Each widget is a separate Next.js application, and they are dynamically loaded into the dashboard shell at runtime.

This modular design offers several advantages:

*   **Independent Development:** Teams can work on different widgets in isolation, without affecting other parts of the application.
*   **Independent Deployment:** Widgets can be deployed independently, allowing for faster release cycles.
*   **Scalability:** New widgets can be added to the dashboard without requiring changes to the core application.
*   **Technology Agnostic (in theory):** While the current implementation uses Next.js for all widgets, the micro-frontend architecture allows for the possibility of using different technologies for different widgets in the future.

## 2. Frameworks and Rationale

*   **Next.js:** A React framework that provides a great developer experience and performance features like server-side rendering and static site generation. It's used for both the `dashboard-shell` and the individual widgets.
*   **React:** The core UI library for building the user interface.
*   **Module Federation:** This is the key technology that enables the micro-frontend architecture. We use the `@module-federation/nextjs-mf` plugin to allow the `dashboard-shell` to dynamically load widgets from other Next.js applications.
*   **TypeScript:** For static typing, which helps in building more robust and maintainable code.
*   **Tailwind CSS:** A utility-first CSS framework that allows for rapid UI development.
*   **@repo/ui:** A shared UI library within the monorepo that contains common components. This ensures a consistent look and feel across the different widgets.

## 3. Communication Flow Between Widgets

Widgets communicate with each other through a shared event bus. A `tiny-emitter` instance is created in the `dashboard-shell` and passed down to each widget as a prop.

*   **Emitting Events:** Widgets can emit events to the event bus to notify other widgets of changes or user interactions. For example, the `analytics-widget` emits an `analytics:broadcast` event when its data is refreshed.
*   **Listening to Events:** Widgets can subscribe to events on the event bus to react to changes in other widgets. For example, the `notes-widget` listens to the `analytics:broadcast` event and displays a new note when the event is received.

This decoupled communication mechanism allows widgets to interact with each other without having direct dependencies on each other.

## 4. Mobile Consistency

Currently, the application is web-first. However, the architecture is designed to be scalable to mobile platforms like React Native or Flutter/Kotlin. Here's a possible strategy for achieving mobile parity:

*   **Shared Business Logic:** The business logic for each widget can be extracted into a separate, framework-agnostic package. This logic can then be shared between the web and mobile implementations.
*   **Shared UI Components:** The `@repo/ui` library can be extended to support mobile by using a cross-platform component library like `react-native-web` or by creating a separate set of mobile-specific components.
*   **Platform-Specific Views:** For each widget, we would create a mobile-specific view that consumes the shared business logic and UI components.
*   **Native Shell:** A native mobile application (built with React Native or Flutter/Kotlin) would serve as the shell for the mobile widgets. This shell would be responsible for loading and displaying the widgets, similar to how the `dashboard-shell` does for the web.

## 5. CI/CD Strategy

A CI/CD pipeline for this monorepo would be set up to automate the testing, building, and deployment of the applications. Here's a possible strategy:

*   **Continuous Integration (CI):**
    *   On every push to a feature branch, the CI pipeline would run linting, unit tests, and integration tests for the changed packages.
    *   Using `pnpm`'s filtering capabilities, we can ensure that we only test the affected packages.
    *   A successful CI run would be a prerequisite for merging a pull request into the main branch.
*   **Continuous Deployment (CD):**
    *   On every merge to the main branch, the CD pipeline would build the changed applications and deploy them to a staging environment.
    *   After successful deployment to staging, a manual or automated approval process would trigger the deployment to the production environment.
    *   Each widget and the `dashboard-shell` would be deployed as separate applications.

## 6. How to Add a New Widget

1.  **Create a new Next.js application:**
    *   Inside the `apps` directory, create a new directory for your widget (e.g., `my-new-widget`).
    *   Set up a new Next.js application in this directory. You can use `pnpm create next-app` for this.
    *   Make sure to use the same versions of React, Next.js, and other key dependencies as the other widgets.

2.  **Configure Module Federation:**
    *   In the `next.config.mjs` of your new widget, configure the `nextFederation` plugin to expose your widget component.
        ```javascript
        // apps/my-new-widget/next.config.mjs
        import nextFederation from '@module-federation/nextjs-mf';

        /** @type {import('next').NextConfig} */
        const nextConfig = {
          transpilePackages: ['@repo/ui'],

          webpack(config, options) {
            config.plugins.push(
              new nextFederation({
                name: 'my_new_widget',
                filename: 'static/chunks/remoteEntry.js',
                exposes: {
                  './Widget': './components/widget.tsx',
                },
                shared: {},
              }),
            );
            return config;
          },
        };
        export default nextConfig;
        ```
    *   Choose a unique port for your widget and update the `dev` script in your `package.json`.

3.  **Create the widget component:**
    *   In the `components` directory of your new widget, create a `widget.tsx` file. This will be the main component for your widget.
    *   The component will receive the `eventBus` as a prop, which you can use to communicate with other widgets.

4.  **Add the widget to the dashboard shell:**
    *   In the `next.config.mjs` of the `dashboard-shell`, add your new widget to the `remotes` object.
        ```javascript
        // apps/dashboard-shell/next.config.mjs
        // ...
        remotes: {
          notes_widget: remoteUrl('notes_widget', 3001, options.isServer),
          analytics_widget: remoteUrl(
            'analytics_widget',
            3002,
            options.isServer,
          ),
          ai_chat: remoteUrl('ai_chat', 3003, options.isServer),
          my_new_widget: remoteUrl('my_new_widget', 3004, options.isServer), // Add your new widget here
        },
        // ...
        ```
    *   In the `index.tsx` of the `dashboard-shell`, import and render your new widget.
        ```javascript
        // apps/dashboard-shell/pages/index.tsx
        // ...
        const MyNewWidget = dynamic(() => import('my_new_widget/Widget'), {
          ssr: false,
        });
        // ...
        // Then, in the JSX:
        <Card>
          <CardHeader>
            <CardTitle>My New Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p>Loading...</p>}>
              <MyNewWidget eventBus={eventBus} />
            </Suspense>
          </CardContent>
        </Card>
        // ...
        ```

5.  **Start the development servers:**
    *   Run `pnpm dev` from the root of the monorepo to start the `dashboard-shell` and all the widgets.
    *   You should now see your new widget in the dashboard.
