import Link from 'next/link';
import { Callout } from 'nextra/components';


const examples = [
  {
    name: 'N-Band EQ',
    href: '/playground?version=3.0.0&code=JYWwDg9gTgLgBAbwKYBsC+cBmUIjgcgAFUkQBDAVwBNgIB6AY2iXwG4AoduuuAQTgDOoMCiSCkUYGRRwyYEcAZkYtAHZwImWerJQARsBhRdAT0HAAXmIFJ4muAFEAilx56yqqgLgwI2uMCqYBTwQgDmqtIAdK6ucAAqABZimMBQAvBgumQgthJwAETungIFcEgAHmBIDDDeHrJQxmYA7oaJ5WQMHUiqRiZxDRB6AFY18FRIAgySBqphPslYwCgw+b6y8igmUQlLNkyecFnGuWtQccDeMEuBwaHAEdIaAG75LYmKHRtyImY3YmcMUwFFUtTU5QAjgAKYpeAA0cAqqgAlIh2HA4FBbBQoOo4QIotiqBQGEhodCugxEXC0QBeAB86MxmNE8F0YW8dLgAG04VFsEhITSPFQopCALocDEs4BaWGiqKJMgCADyLVUAAUcNVYCZofgwmRAvgUSiZSzGpyosEBIkFZ4okbAijpZbsTBcfjFTATNUokoUChoaoKEHEVFIxyBIiqa6ZWhEcj42hONw4KrcXBJphKKtylVoPANgJlFdMP8lpqUGQTGEcKCqHxNQBJdiVSCwbNIXNh+AITiY9MAMWgiyuBZyIjELRY2M2f0CCwBjicPj8ZGzUAoeBQEAgYF2LdUMvT0EmUHXxxwZIE1yWe4PcFncAoNkWYjCtgAamlPdJhxWJAAGUTAyUhTx4M5EggJsNkwWxum0JtJiYSYNCzKhlDIREPS9Jd-GGMZakg59PiQtogzgPQxD3MhJibQINhXata3rCBGyxXoLwkfBvG-YdgNfSATyHHhAkMKQUEsMsIFUGIxNIlstBMDi4G6Dwv3HbwQTBFQ5MRVSKHwKjVCQJA4L8LI3zEUUuIyXQYFIjZDheQIyQ-OBWLrBsjg2bE6KbIzLwE4DdlVAEoDad9DGfFYUFIgQAGtgDAQQjGNMJEmLPxsU8CQlwU2QBBMME4C-GBf1gCgAKA0DwJAaFUNgpBeGoWgABFsLRAdLTZey4G5MgWmNeAEJgboDToSgaHoABOAA2AB9YCWlBMIOu3EABCWgAGABWJb9rmgAmKIRpeU0OD62xqIoLQhpG2LmsmNrZq6mAyEpJ74GxQldGaAAhe6EKgaEzTdFk8LxZlLQIKgtoEAAuXb8CRu7MCdWwAGFlVUMyUA+r7dpReELRZfAEZ3ZGAEY0YxrGYFxjwCaJ6EadJ8nU0xRNBzgEdAmkbYMMvchAi4-LRdsGCxTgAAJCQZzESZplmMQbmxMQCVIzAxw4y9nGQuARjfdktjMWKNn1uBHzAAiqbwUtwFEIq8ovcHYdZW6CUG3lycxBAfD9JB0dQKI9xaLI70RQVIXRk7dsTxE47gGm4F5uHECD6pQ5QJVHkSKOYywbEU4T3bk-j9OyczwPfRz8o8+qMgkpj0v44AFgruAU5pxFnVUdGAA5q-JqU+cxaH1CFB0EUbqInenaEECyG50cpxGUfwREQBa9fbfwRNU8RDn4x59g0CAA',
  },
  {
    name: 'Sample Sequencing',
    href: '/playground?version=3.2.0&code=JYWwDg9gTgLgBAbwKYBsC+cBmUIjgcgAFUkQBDAVwBNgIB6AY2iXwG4AoTpAD0ljipJMlFPATs4cMgGcAngDsGcAOZIYANWCwKZFADFgKJAGVZ0mKQAUgpoICC1WgBEyMMgEpEEyXCPwoSNKQ8tJIcAC8UgDuZMDwmGoMABaW+HSUNPQAnABsAPoA4iB5ALKoEDQMpvIwSXkADACMeQCsWQBMAHQxAG747hw+vmpw0mTgRgBCFJgJUBHRsfA2FUgOmS5ulmQxcXABQRAhSJ1kUFBkstOzSFCW7gOcQwEwFFDyXkOS+HI1SQBc9Xw-1G4zAUxmc06qhgAGEkmR5PJUJsyJZ6u4ADTeIY-BS1f6NYGgiZIa5QmHwxHIlCoyyNLE4uBoQbM7GSALyQR3TziIZ0OhwOxwABEMFASBFcB6ugoYVqrjgTAoNWkcGAH1CTC5asRVF8EAgYDVGrgtSQTIF+0RqjgAG16tJMXBGo73Ey-GaJQtUJ0QBVLL6aD1AyhOuKQEh7s7fdIeViXRiOJbBQYoOYpCTwWFQgBHOWKW5mhH+FW6+AAagA7KNSHEjoEpFyU6MYC9kkh9TAIHB2tx1TAfnBoMBlBrdMN5Mpah6RtJGj6w2NSXn2pY+V8wK4AQRfgSgeyvlQ3q5aPIQa7D0NpElgJgYCCq1efOZ2zv2s-JHmQXamUMEBGSAgvUzoyigcoXmgf5wAAukyaDOoBjwtgAKkkSAfOaJI5mCRi1vmGEMJ2UjwFhy7yt6ABGFDwOClwasoLaKnEaojmO8gTmAcTJHQx4XOKRyzvA0jtIunTLtmq7rtBW4Eru+IAge0F8aeRwXiB0Hfva0GSABErAaBspAS6UFfLB8GIRKjySC2xgUHgWEwFEPYSXheYFkR6YAIRMi8bwfL6ZBUFQljzs6InWcy7BoEAA',
  },
];

export function InfoPanel({outdatedBrowser}) {
  return (
    <div className="h-full p-4 ">
      <h2 className="text-3xl font-bold">Elementary Playground</h2>
      {outdatedBrowser && (
        <Callout type="error">
          Update your browser to try Elementary. The playground uses <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#importing_modules_using_import_maps" target="_blank" className="underline">import maps</a>, a relatively new browser feature, to run your code.
        </Callout>
      )}
      {!outdatedBrowser && (
        <Callout type="info">
          Note, this page is in beta. Please report any issues, weirdness, or feature requests on
          GitHub or Discord.
        </Callout>
      )}
      <p className="mt-4">
        This playground is a live-editing environment for exploring Elementary and making sound. Start by
        enabling the audio runtime with the play button in the bottom control panel. Afterwards, the runtime
        will automatically update as you edit.
      </p>
      <p className="mt-4">
        As a general guideline, you can write anything you like as long as it's an ES6 module with a default export
        object containing at least a <code className="p-1 bg-gray-200 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-800">render()</code> method. This method will be invoked upon evaluating your code to
        update the running state of the audio runtime.
      </p>
      <p className="mt-4">
        For more information, check out the <Link href="/docs/playground_api" className="text-pink-400 hover:text-pink-500">Playground API Reference</Link>,
        or load some examples:
      </p>
      <ul className="px-6 py-2 list-disc">
        {examples.map(({name, href}) => {
          return (
            <li key={name}>
              <Link href={href} className="text-pink-400 hover:text-pink-500">{name}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
