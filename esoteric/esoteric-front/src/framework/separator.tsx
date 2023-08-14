import { ReactNode, useEffect, useRef, useState } from 'react';
import './separator.css'


export function PlainSeparator() {
    return <hr />
}

export function Separator() {
    const [size, setSize] = useState({ width: 0, height: 0 });

    const wrapper = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if ((wrapper.current?.clientWidth !== size.width || wrapper.current.clientHeight !== size.height)) {
            setSize({ width: wrapper.current?.clientWidth ?? 0, height: wrapper.current?.clientHeight ?? 0 })
        }
    }, [wrapper, size.width, size.height])

    const sampleRate = Math.PI / 10;
    var width = 15;
    const height = 3;
    const mid = 20;

    const angularWidth = width / Math.PI;

    var push: ReactNode[] = []
    /* assumes width doesn't change. It doens't look all that bad if it does though */
    const xValues = Array.from({ length: 1 + Math.PI / sampleRate }, (_, index) => (index * sampleRate));
    /* https://github.com/3b1b/manim/blob/master/manimlib/utils/rate_functions.py */
    const unitMap = (x: number) => x ** 3 * (10 * (1 - x) * (1 - x) + 5 * (1 - x) * x + x * x)
    const flatSin = xValues.map((x) => {
        const mappedX = x % (Math.PI * 2);
        var ret = mid;

        if (mappedX > Math.PI) ret += -height * Math.cos(Math.PI * unitMap((x % Math.PI) / Math.PI));
        else ret += height * Math.cos(Math.PI * unitMap(mappedX / Math.PI));

        return ret;
    });

    const sampleCount = Math.ceil(size.width / width);
    width = size.width / sampleCount;

    for (let i = 0; i < 2 * sampleCount; i++) {
        const j = Math.floor(i / 2);

        const iParity = i % 2 === 0;
        const jParity = j % 2 === 0;
        const zParity = iParity !== jParity;

        push.push(
            <path
                key={i}
                stroke={zParity ? "#333333" : "#888888"}
                d={
                    `M ${xValues[0] * angularWidth + j * width}, ${iParity ? 2 * mid - flatSin[0] : flatSin[0]}
                        ${xValues
                        .map((x, i) => `L ${x * angularWidth + j * width}, ${iParity ? 2 * mid - flatSin[i] : flatSin[i]}`)
                        .join('')
                    }`
                }
            />
        )
    }

    return (
        <div className='separator' ref={wrapper}>
            <svg width="100%" height={mid * 2}>
                <g
                    fill='none'
                    strokeWidth="1"
                >
                    {push}

                    {/* more efficient, but has problems with one path always being on top of the other 
                    <path
                        fill="none"
                        stroke="var(--accent4)"
                        strokeWidth="1"
                        d={
                            `M ${xValues[0] * width}, ${2 * mid - flatSin[0]}
                        ${xValues
                                .map((x, i) => `L ${x * width}, ${2 * mid - flatSin[i]}`)
                                .join('')
                            }`
                        }
                    />
                    <path
                        fill="none"
                        stroke="var(--accent2)"
                        strokeWidth="1"
                        d={
                            `M ${xValues[0] * width}, ${flatSin[0]}
                        ${xValues
                                .map((x, i) => `L ${x * width}, ${flatSin[i]}`)
                                .join('')
                            }`
                        }
                    />
                    */}
                </g>

            </svg>
        </div>

    )
}