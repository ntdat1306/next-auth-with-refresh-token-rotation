import { SVGProps } from 'react';

export function LucideUser(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24' {...props}>
            <g fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1'>
                <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'></path>
                <circle cx='12' cy='7' r='4'></circle>
            </g>
        </svg>
    );
}

export function LucideLock(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24' {...props}>
            <g fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1'>
                <rect width='18' height='11' x='3' y='11' rx='2' ry='2'></rect>
                <path d='M7 11V7a5 5 0 0 1 10 0v4'></path>
            </g>
        </svg>
    );
}
