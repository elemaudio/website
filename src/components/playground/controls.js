import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ArrowUpOnSquareIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';


function Button(props) {
  return (
    <button
      {...props}
      className="flex items-center px-2 py-2 mr-4 border rounded-full hover:border-pink-300 dark:hover:border-pink-400 active:bg-pink-50 dark:active:bg-gray-700">
      {props.children}
    </button>
  );
}

export function Controls(props) {
  const {
    isRunning,
    onPlayPause,
    onRestart,
    onShare,
    statusMessage,
    shareMessage,
  } = props;

  return (
    <div className="h-full flex">
      <div className="flex-0 w-1/2 flex items-center px-5">
        <Button onClick={onPlayPause}>
          {(isRunning
            ? <PauseIcon className="h-5 w-5" />
            : <PlayIcon className="h-5 w-5" />
          )}
        </Button>
        <Button onClick={onRestart}>
          <ArrowPathIcon className="h-5 w-5" />
        </Button>
        <Button onClick={onShare}>
          <ArrowUpOnSquareIcon className="h-5 w-5" />
        </Button>
        {shareMessage && (
          <span className="text-sm text-pink-400">{shareMessage}</span>
        )}
      </div>
      <div className="flex-0 w-1/2 flex items-center px-4">
        <div className="flex items-center py-2 text-gray-700 dark:text-gray-500">
          <CommandLineIcon className="h-5 w-5" />
          <span className="px-2">{statusMessage}</span>
        </div>
      </div>
    </div>
  );
}
