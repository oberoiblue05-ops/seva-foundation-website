// Update YOUTUBE_VIDEO_ID to your actual Seva Foundation video ID
const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ";

export default function YouTubeSection() {
  return (
    <section id="our-story" className="bg-[#0F3D22] py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#F5A623]">
            Our Story
          </p>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            See the Change We&apos;re Making
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Watch how your support transforms lives — from the streets of Noida to
            the classrooms of tomorrow.
          </p>
        </div>

        {/* 16:9 embed */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/40"
             style={{ paddingTop: "56.25%" }}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1&color=white`}
            title="Seva Group Foundation — Our Story"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          Subscribe to{" "}
          <a
            href="https://www.youtube.com/@sevagroupfdn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F5A623] underline-offset-2 hover:underline"
          >
            @sevagroupfdn
          </a>{" "}
          on YouTube for more updates.
        </p>
      </div>
    </section>
  );
}
