import React, { useState, useEffect, useRef } from 'react';


export default function ResizingCanvas(props) {
  const ref = useRef();
  const [bounds, setBounds] = useState({
    width: -1,
    height: -1,
  });

  let observer = null;
  let rafToken = null;
  let frameCount = useRef(0);

  useEffect(function() {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');

    observer = new ResizeObserver(function(entries) {
      for (let entry of entries) {
        setBounds({
          width: entry.contentRect.width,
          height: entry.contentRect.width / 1.618 / 2,
        });
      }
    });

    observer.observe(canvas);

    return function() {
      observer.disconnect();
    };
  }, []);

  useEffect(function() {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');

    rafToken = window.requestAnimationFrame(function loop() {
      if (props.onDraw) {
        props.onDraw(ctx, canvas.width, canvas.height, frameCount.current);
      }

      frameCount.current++;
      rafToken = window.requestAnimationFrame(loop);
    });

    return function() {
      window.cancelAnimationFrame(rafToken);
    };
  }, [props.onDraw]);

  useEffect(function() {
    const canvas = ref.current;
    canvas.width = bounds.width;
    canvas.height = bounds.height;
  }, [bounds]);

  const {onDraw, ...other} = props;

  return (
    <canvas {...other} ref={ref} />
  );
}
