import Link from 'next/link';
import { Callout } from 'nextra/components';


export function InfoPanel({outdatedBrowser}) {
  return (
    <div className="p-4 h-full overflow-y-scroll">
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
        object containing at least a <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded-md border border-gray-300 dark:border-gray-800">render()</code> method. This method will be invoked upon evaluating your code to
        update the running state of the audio runtime.
      </p>
      <p className="mt-4">
        For more information, check out the <Link href="/docs/playground_api" className="text-pink-400 hover:text-pink-500">Playground API Reference</Link>,
        or load some examples:
      </p>
      <ul className="list-disc px-6 py-2">
        <li><Link href="#" className="text-pink-400 hover:text-pink-500">Example 1</Link></li>
        <li><Link href="#" className="text-pink-400 hover:text-pink-500">Example 2</Link></li>
        <li><Link href="#" className="text-pink-400 hover:text-pink-500">Example 3</Link></li>
        <li><Link href="#" className="text-pink-400 hover:text-pink-500">Example 4</Link></li>
      </ul>
    </div>
  );
}
