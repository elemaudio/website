import {
  PlayIcon,
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
    onPlayPause,
    onRestart,
    onShare,
    statusMessage,
  } = props;

  return (
    <div className="h-full flex">
      <div className="flex-1 flex items-center px-5">
        <Button onClick={onPlayPause}>
          <PlayIcon className="h-5 w-5" />
        </Button>
        <Button onClick={onRestart}>
          <ArrowPathIcon className="h-5 w-5" />
        </Button>
        <Button onClick={onShare}>
          <ArrowUpOnSquareIcon className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 flex items-center px-5">
        <div className="flex items-center py-2">
          <CommandLineIcon className="h-5 w-5" />
          <span className="px-2">Ok!</span>
        </div>
      </div>
    </div>
  );
}
