import nextFederation from '@module-federation/nextjs-mf';

const remoteUrl = (appName, port, isServer) =>
  `${appName}@http://localhost:${port}/_next/static/${
    isServer ? 'ssr' : 'chunks'
  }/remoteEntry.js`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],

  webpack(config, options) {
    config.plugins.push(
      new nextFederation({
        name: 'dashboard_shell',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          notes_widget: remoteUrl('notes_widget', 3001, options.isServer),
          analytics_widget: remoteUrl(
            'analytics_widget',
            3002,
            options.isServer,
          ),
          ai_chat: remoteUrl('ai_chat', 3003, options.isServer),
        },
        shared: { '@repo/ui/button': {}, '@repo/ui/card': {} },
      }),
    );
    return config;
  },
};
export default nextConfig;
