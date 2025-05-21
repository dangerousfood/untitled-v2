import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stream Feed",
  description: "TikTok-style Stream Feed",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

async function fetchAvailableStreams() {
  // Simulate an API call to fetch available streams
  return new Promise((resolve) => {
    setTimeout(() => {
      const singleStream = "stream1";
      const duplicatedStreams = [singleStream, singleStream, singleStream];

      resolve(duplicatedStreams);
    }, 3000);
  });
}

export default async function Home() {
  const streams = await fetchAvailableStreams();

  console.log("FETCHED", streams);

  return <div>Stream Feed Here</div>;
  // return <StreamFeed streams={streams} />;
}
