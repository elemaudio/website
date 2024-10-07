import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ArrowUpOnSquareIcon,
  CommandLineIcon,
  ArrowRightOnRectangleIcon,
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
    toggleInfoPanel
  } = props;

  return (
    <div className="flex h-full">
      <div className="flex items-center w-1/2 px-5 flex-0">
        <Button onClick={onPlayPause}>
          {(isRunning
            ? <PauseIcon className="w-5 h-5" />
            : <PlayIcon className="w-5 h-5" />
          )}
        </Button>
        <Button onClick={onRestart}>
          <ArrowPathIcon className="w-5 h-5" />
        </Button>
        <Button onClick={onShare}>
          <ArrowUpOnSquareIcon className="w-5 h-5" />
        </Button>
        <Button onClick={toggleInfoPanel}>
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
        </Button>
        {shareMessage && (
          <span className="text-sm text-pink-400">{shareMessage}</span>
        )}
      </div>
      <div className="flex items-center w-1/2 px-4 flex-0 max-w-1/2">
        <div className="flex items-center flex-1 max-w-full py-2 text-gray-700 dark:text-gray-500">
          <CommandLineIcon className="w-5 h-5" />
          <span className="flex-1 px-2 truncate">{statusMessage}</span>
        </div>
      </div>
    </div>
  );
}
