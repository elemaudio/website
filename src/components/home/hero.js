import React, { useState } from 'react';
import Link from 'next/link';


const defaultClipPath = '17% 75%,35% 24%,44% 8%,8% 15%,1% 64%,95% 15%,54% 82%,42% 97%,30% 80%,3% 95%,5% 42%,75% 5%,58% 99%,81% 41%,35% 51%,2% 19%';


export function Hero() {
  let [clipPath, setClipPath] = useState(defaultClipPath);

  let sq = (x) => x * x;
  let onClick = () => {
    setClipPath(
      Array.from({length: 16})
        .fill(0)
        .map(x => [Math.round(sq(Math.random()) * 100), Math.round(Math.random() * 100)])
        .sort(([x1, y1], [x2, y2]) => x1 < x2 && y1 < y2)
        .map(([x, y]) => `${x}% ${y}%`)
        .join(',')
    );
  };

  let stopProp = (e) => e.stopPropagation();

  return (
    <div className="relative w-full h-full" onClick={onClick}>
      <div className="absolute isolate left-0 top-0 w-full h-full blur-3xl">
        <div
          className="relative w-full h-full bg-gradient-to-br opacity-100 dark:opacity-40 from-fuchsia-300 to-pink-300"
          style={{transition: 'clip-path 1s', clipPath: `polygon(${clipPath}`}} />
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
            <Link
              onClick={stopProp}
              href="/docs"
              className="rounded-md bg-pink-400 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-500" >
              Get started
            </Link>
            <Link
              onClick={stopProp}
              href="/playground"
              className="text-sm font-semibold leading-6 text-gray-900">
              Try now <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
