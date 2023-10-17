import React, { useEffect } from 'react';
import { animated, useSpring } from '@react-spring/web'
import toast from 'react-hot-toast';

interface RingProgressProps {
  code?: string;
}

const RingProgress: React.FC<RingProgressProps> = ({
  code = 'code',
}) => {
  const [lastCode, setLastCode] = React.useState(code)
  

  const { offset } = useSpring({
    from: { offset: Math.PI * 2 * 100 },
    to: { offset: 0 },
    config: { duration: 0 },
    loop: true,
    onStart(result, ctrl, item) {
      const nextTime = Math.ceil(Date.now() / 1000 / 30) * 30 * 1000;
      const timeDiff = nextTime - Date.now();
      ctrl.set({ offset: (Math.PI * 2 * 110 / 30 / 1000 * timeDiff) })
    },
    onRest(result, ctrl, item) {
      const nextTime = Math.ceil(Date.now() / 1000 / 30) * 30 * 1000;
      const timeDiff = nextTime - Date.now();
      ctrl.set({ offset: (Math.PI * 2 * 110 / 30 / 1000 * timeDiff) })
    },
  });

  // 双击复制文本，并提示
  const copyText = (text: string) => {
    const input = document.createElement('input');
    input.setAttribute('readonly', 'readonly');
    input.setAttribute('value', text);
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, 9999);
    if (document.execCommand('copy')) {
      document.execCommand('copy');
      toast('复制成功!', {
        icon: '✅',
        style: {
          borderRadius: '10px',
          color: '#0099CC',
        },
      });
    }
    document.body.removeChild(input);
  };

  return (
    <>
      <svg 
        onDoubleClick={() => {
          copyText(code);
        }}
        width="320" 
        height="320" 
        className="osvg"
      >
        <animated.circle
          style={{
            strokeDasharray: `${Math.PI * 2 * 110}`,
            strokeDashoffset: offset,
            filter: 'drop-shadow(0 0 10px rgba(86, 165, 255,0.3)) blur(.5px)',
          }}
          className="oround"
          cx="160"
          cy="160"
          r="110"
          fill="transparent"
          strokeWidth="8"
          stroke="#1896fb"
        >
        </animated.circle>
        <text
          x="160"
          y="160"
          fontSize="26"
          fill="#1896fb"
          textAnchor="middle"
          alignmentBaseline="middle"
          style={{
            userSelect: 'none',
            cursor: 'pointer',
            filter: 'drop-shadow(0 0 8px rgba(86, 165, 255,0.3)) blur(.5px)',  
            // 文字间距
            letterSpacing: '5px',
          }}
        >
          {code}
        </text>
        <text
          x="160"
          y="190"
          fontSize="14"
          fill="#999999"
          textAnchor="middle"
          alignmentBaseline="middle"
          style={{
            userSelect: 'none',
            cursor: 'pointer',
            filter: 'drop-shadow(0 0 8px rgba(86, 165, 255,0.3))',  
            // 文字间距
            letterSpacing: '3px',
        }}
        >
          双击复制
        </text>
      </svg>
      {/* <Toaster
        position="top-center"
        reverseOrder={false}
      /> */}
    </>
  );
};

export default RingProgress;
