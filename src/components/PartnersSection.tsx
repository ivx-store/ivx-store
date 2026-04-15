import { motion } from "motion/react";

// Real brand SVG icons as components
const PlayStationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7"><path d="M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.76.814.76 1.505v5.876c2.441 1.193 4.362-.002 4.362-3.153 0-3.237-1.126-4.675-4.438-5.827-1.307-.448-3.728-1.186-5.393-1.502zm5.348 14.455l5.667-1.997c.644-.228.742-.571.219-.763-.522-.193-1.466-.138-2.111.091l-3.775 1.341v-1.932l.218-.075s1.091-.384 2.627-.546c1.536-.164 3.417.095 4.907.678 1.675.49 1.867 1.211 1.444 1.706-.423.494-1.508.912-1.508.912l-7.688 2.779v-2.194zM.39 18.774c-1.045-.385-.766-1.358.734-2.076l4.847-1.784v2.149l-3.49 1.28c-.644.228-.742.571-.219.763.522.193 1.466.138 2.111-.091l1.598-.58v1.818c-.129.025-.263.051-.401.071-1.592.232-3.262-.019-5.18-.55z"/></svg>
);

const XboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7"><path d="M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912C23.056 17.036 24 14.62 24 12c0-4.032-1.992-7.599-5.043-9.773-.562-.252-2.371-.461-3.695 4.4zM8.738 6.627c-1.324-4.861-3.133-4.652-3.695-4.4C2.001 4.401 0 7.968 0 12c0 2.62.944 5.036 2.662 6.539-1.408-2.599 3.576-9.951 6.076-12.912zM12 3.6S9.566.027 7.468.549C9.382-.207 13.836-.672 16.532.549 14.438.027 12 3.6 12 3.6z"/></svg>
);

const SteamIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12.001-5.373 12.001-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/></svg>
);

const NetflixIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7"><path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24H5.398zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/></svg>
);

const PubgIcon = () => (
  <img src="https://www.pngplay.com/wp-content/uploads/11/PUBG-Logo-PNG-Pic-Background.png" alt="PUBG" className="w-6 h-6 md:w-7 md:h-7 object-contain drop-shadow" />
);

const FortniteIcon = () => (
  <img src="https://static.vecteezy.com/system/resources/previews/027/127/477/non_2x/fortnite-logo-fortnite-icon-transparent-free-png.png" alt="Fortnite" className="w-6 h-6 md:w-7 md:h-7 object-contain drop-shadow" />
);

const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>
);

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
);

const platforms = [
  { name: "PlayStation", Icon: PlayStationIcon, color: "text-blue-400", bgColor: "from-blue-500/20 to-blue-700/10", hoverGlow: "hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]" },
  { name: "Xbox", Icon: XboxIcon, color: "text-green-400", bgColor: "from-green-500/20 to-green-700/10", hoverGlow: "hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]" },
  { name: "Steam", Icon: SteamIcon, color: "text-gray-300", bgColor: "from-gray-400/20 to-gray-600/10", hoverGlow: "hover:shadow-[0_0_25px_rgba(156,163,175,0.2)]" },
  { name: "Netflix", Icon: NetflixIcon, color: "text-red-500", bgColor: "from-red-500/20 to-red-700/10", hoverGlow: "hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]" },
  { name: "PUBG", Icon: PubgIcon, color: "text-amber-400", bgColor: "from-amber-500/20 to-amber-700/10", hoverGlow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]" },
  { name: "Fortnite", Icon: FortniteIcon, color: "text-purple-400", bgColor: "from-purple-500/20 to-purple-700/10", hoverGlow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]" },
  { name: "ChatGPT", Icon: OpenAIIcon, color: "text-emerald-400", bgColor: "from-emerald-500/20 to-emerald-700/10", hoverGlow: "hover:shadow-[0_0_25px_rgba(52,211,153,0.2)]" },
  { name: "Spotify", Icon: SpotifyIcon, color: "text-green-400", bgColor: "from-green-400/20 to-green-600/10", hoverGlow: "hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]" },
];

export function PartnersSection() {
  // Duplicate for seamless marquee
  const allPlatforms = [...platforms, ...platforms];

  return (
    <section className="py-16 md:py-24 relative z-10 border-t border-b border-white/5 overflow-hidden" dir="rtl">
      <div className="container mx-auto px-5 md:px-8 relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-arabic font-black text-white mb-4 tracking-tight"
          >
            المنصات التي <span className="text-gray-400">نعمل معها</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-gray-400 font-arabic font-medium"
          >
            ندعم جميع المنصات والخدمات الرئيسية لنلبي كل احتياجاتك.
          </motion.p>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden py-6" dir="ltr">
        <div className="absolute top-0 left-0 w-24 md:w-40 h-full bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 md:w-40 h-full bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

        <div className="flex gap-5 md:gap-8 w-max partners-marquee will-change-transform transform-gpu">
          {allPlatforms.map((platform, idx) => {
            const Icon = platform.Icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-6 py-4 md:px-8 md:py-5 rounded-2xl bg-gradient-to-br ${platform.bgColor} border border-white/5 hover:border-white/20 transition-all duration-300 shrink-0 group ${platform.hoverGlow}`}
              >
                <span className={`${platform.color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon />
                </span>
                <span className="text-sm md:text-base font-bold text-white/80 group-hover:text-white transition-colors whitespace-nowrap">
                  {platform.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
