import {
  PlayIcon,
  ArrowPathIcon,
  MinusCircleIcon,
  XCircleIcon,
  SpeakerXMarkIcon,
  ArrowUpOnSquareIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';


function Button(props) {
  return (
    <button
      {...props}
      className="flex items-center px-2 py-2 mr-4 border rounded-full">
      {props.children}
    </button>
  );
}


export function Controls() {
  return (
    <div className="h-full flex">
      <div className="flex-1 flex items-center">
        <Button className="items-center px-2 py-2">
          <PlayIcon className="h-5 w-5" />
        </Button>
        <Button className="items-center px-2 py-2 mr-2">
          <SpeakerXMarkIcon className="h-5 w-5" />
        </Button>
        <Button className="items-center px-2 py-2">
          <ArrowUpOnSquareIcon className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 flex items-center">
      </div>
      <div>
      </div>
    </div>
  );
}
