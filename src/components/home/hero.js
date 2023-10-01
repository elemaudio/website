let clipPath = Array.from({length: 24})
  .fill(0)
  .map(x => [Math.round(Math.sqrt(Math.random()) * 100), Math.round(Math.random() * 100)])
  .sort(([x1, y1], [x2, y2]) => x1 < x2 && y1 < y2)
  .map(([x, y]) => `${x}% ${y}%`)
  .join(',');

export function Hero() {
  return (
    <div className="relative w-full h-full">
      <div className="absolute isolate left-0 top-0 w-full h-full blur-3xl">
        <div className="relative w-full h-full bg-gradient-to-br from-transparent to-pink-300" style={{clipPath: `polygon(${clipPath}`}}/>
      </div>
      <div className="isolate mx-auto max-w-2xl py-48">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200 sm:text-6xl">
            Data to enrich your online business
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet
            fugiat veniam occaecat fugiat aliqua.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-pink-400 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-500" >
              Get started
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
