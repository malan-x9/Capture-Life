import Image from "next/image";

const GALLERY_IMAGES = [
  { src: "/photo1.jpeg", alt: "Bride and groom sharing a joyful moment during a traditional ceremony", size: 200 },
  { src: "/photo2.jpeg", alt: "Couple walking barefoot along the shoreline", size: 176 },
  { src: "/photo3.jpeg", alt: "Family portrait at golden hour with child raised in the air", size: 152 },
  { src: "/photo4.jpeg", alt: "Bride's henna and jewelry detail during preparation", size: 128 },
  { src: "/photo5.jpeg", alt: "Couple embracing in a garden setting", size: 152 },
  { src: "/photo6.jpeg", alt: "Candlelit cake-cutting moments collage", size: 176 },
  { src: "/photo7.jpeg", alt: "Couple showered with flower petals during a traditional ceremony", size: 200 },
];

export default function Home() {
  return (
    <>
      <main className="min-h-screen w-full bg-[#eeedeb] ">
        <section className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-16 md:px-12 md:py-20">
          <h1 className="font-serif text-[34px] leading-tight text-black sm:text-[42px] md:text-[55px] lg:text-[66px]">
            Capturing your wedding&apos;s <span className="text-[#dd492f]">magic</span>,
            <br />
            <span className="relative inline-block">
              one moment at a time
              <svg
                viewBox="0 0 600 20"
                className="absolute -bottom-1 left-0 w-full text-[#241A14] sm:-bottom-2"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 10 Q150 18 300 10 T598 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto font-sans mt-6 max-w-xl px-2 text-base text-[#5B5148] sm:mt-8 sm:text-lg">
            Capturing the love, joy, and magic of your wedding day, preserving
            timeless memories to cherish forever
          </p>

          {/* Gallery strip */}
          <div className="mt-8 flex items-center justify-start gap-3 overflow-x-auto px-4 pb-2 sm:mt-10 sm:justify-center sm:gap-4 md:gap-5 md:overflow-visible md:px-0">
            {GALLERY_IMAGES.map((image) => {
              const width = `clamp(64px, ${((image.size / 1400) * 90).toFixed(2)}vw, ${image.size}px)`;
              return (
                <div
                  key={image.src}
                  style={{ width, aspectRatio: "2.7 / 4" }}
                  className="relative shrink-0 overflow-hidden rounded-2xl bg-[#E4DDCF] shadow-xl shadow-black/15 ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 sm:rounded-3xl"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 768px) 200px, 45vw"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="mt-8 font-sans rounded-full bg-[#dd492f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B44834] sm:mt-10 sm:px-6 sm:py-3 sm:text-base"
          >
            Get 50% off in this winter
          </button>
        </section>
      </main>
    </>
  );
}