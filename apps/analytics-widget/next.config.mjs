import nextFederation from '@module-federation/nextjs-mf';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],

  webpack(config, options) {
    config.plugins.push(
      new nextFederation({
        name: 'analytics_widget',
        filename: 'static/chunks/remoteEntry.js',
        exposes: { './Widget': './components/widget.tsx' },
        shared: {},
      }),
    );
    return config;
  },
};
export default nextConfig;
