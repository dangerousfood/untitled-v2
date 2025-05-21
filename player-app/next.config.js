/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    // Determine the correct HLS stream host based on environment
    // In Docker, services can reference each other by name
    // When running separately, we need to use localhost
    const rtmpHost = process.env.NEXT_PUBLIC_RTMP_HOST || "localhost";
    const rtmpPort = process.env.NEXT_PUBLIC_RTMP_PORT || "8080";

    console.log(`Using RTMP server at ${rtmpHost}:${rtmpPort} for HLS streams`);

    return [
      {
        source: "/hls/:path*",
        destination: `http://${rtmpHost}:${rtmpPort}/hls/:path*`,
      },
      {
        source: "/stat",
        destination: `http://${rtmpHost}:${rtmpPort}/stat`,
      },
    ];
  },
};
